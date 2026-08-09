// src/app/api/financeiro/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withTenant } from "@/lib/tenant"
import { contaFinanceiraSchema } from "@/validators/financeiro"
import { TipoConta, StatusConta } from "@prisma/client"

// GET: Listar contas financeiras com métricas de fluxo de caixa
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const busca = searchParams.get("busca") || ""
    const tipo = searchParams.get("tipo") as TipoConta | null
    const status = searchParams.get("status") as StatusConta | null
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const tenant = withTenant(session.user.empresaId)

    const where = tenant.whereTenant({
      ...(tipo ? { tipo } : {}),
      ...(status ? { status } : {}),
      ...(busca
        ? {
            OR: [
              { descricao: { contains: busca, mode: "insensitive" } },
            ],
          }
        : {}),
    })

    const [contas, total, agregados] = await Promise.all([
      prisma.contaFinanceira.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataVencimento: "desc" },
        include: {
          venda: { select: { numero: true } },
          ordemServico: { select: { numero: true } },
          fornecedor: { select: { nome: true } },
        },
      }),
      prisma.contaFinanceira.count({ where }),
      prisma.contaFinanceira.groupBy({
        by: ["tipo", "status"],
        where: tenant.whereTenant(),
        _sum: { valor: true },
      }),
    ])

    // Calcular Métricas Gerais do Fluxo de Caixa
    let receitaPaga = 0
    let despesaPaga = 0
    let receitaPendente = 0
    let despesaPendente = 0

    agregados.forEach((group) => {
      const valor = Number(group._sum.valor || 0)
      if (group.tipo === "RECEITA") {
        if (group.status === "PAGO") receitaPaga += valor
        else if (group.status === "PENDENTE") receitaPendente += valor
      } else if (group.tipo === "DESPESA") {
        if (group.status === "PAGO") despesaPaga += valor
        else if (group.status === "PENDENTE") despesaPendente += valor
      }
    })

    const saldoAtual = receitaPaga - despesaPaga

    return NextResponse.json({
      data: contas,
      resumo: {
        receitaPaga,
        despesaPaga,
        saldoAtual,
        receitaPendente,
        despesaPendente,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar contas financeiras:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}

// POST: Criar novo lançamento financeiro manual
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = contaFinanceiraSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const tenant = withTenant(session.user.empresaId)
    const data = parsed.data

    const conta = await prisma.contaFinanceira.create({
      data: tenant.dataTenant({
        descricao: data.descricao,
        valor: data.valor,
        tipo: data.tipo,
        categoria: data.categoria,
        dataVencimento: new Date(data.dataVencimento),
        dataPagamento: data.dataPagamento ? new Date(data.dataPagamento) : null,
        status: data.status,
        vendaId: data.vendaId || null,
        ordemServicoId: data.ordemServicoId || null,
        fornecedorId: data.fornecedorId || null,
      }),
    })

    return NextResponse.json(conta, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar lançamento financeiro:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
