// src/app/api/ordens-servico/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withTenant } from "@/lib/tenant"
import { ordemServicoSchema } from "@/validators/ordem-servico"
import { StatusOS } from "@prisma/client"

// GET: Listar Ordens de Serviço com filtros, busca e paginação
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const busca = searchParams.get("busca") || ""
    const status = searchParams.get("status") as StatusOS | null
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const tenant = withTenant(session.user.empresaId)

    const where = tenant.whereTenant({
      ...(status ? { status } : {}),
      ...(busca
        ? {
            OR: [
              { numero: { contains: busca, mode: "insensitive" } },
              { dispositivo: { contains: busca, mode: "insensitive" } },
              { marca: { contains: busca, mode: "insensitive" } },
              { modelo: { contains: busca, mode: "insensitive" } },
              { imei: { contains: busca, mode: "insensitive" } },
              { cliente: { nome: { contains: busca, mode: "insensitive" } } },
            ],
          }
        : {}),
    })

    const [ordens, total] = await Promise.all([
      prisma.ordemServico.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          cliente: { select: { id: true, nome: true, telefone: true, email: true } },
          tecnico: { select: { id: true, nome: true } },
          pagamentos: true,
          historicos: {
            orderBy: { criadoEm: "desc" },
            take: 1,
          },
        },
      }),
      prisma.ordemServico.count({ where }),
    ])

    return NextResponse.json({
      data: ordens,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar ordens de serviço:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}

// POST: Criar nova Ordem de Serviço
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = ordemServicoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const tenant = withTenant(session.user.empresaId)
    const data = parsed.data

    // Gerar Número da OS Único (ex: OS-2026-0001)
    const count = await prisma.ordemServico.count({
      where: { empresaId: session.user.empresaId },
    })

    const anoAtual = new Date().getFullYear()
    const numeroOS = `OS-${anoAtual}-${String(count + 1).padStart(4, "0")}`

    // Cálculo do valor total
    const valorTotal = data.valorServico + data.valorPecas

    // Cálculo da garantia
    const garantiaAte = new Date()
    garantiaAte.setDate(garantiaAte.getDate() + data.garantiaDias)

    const os = await prisma.$transaction(async (tx) => {
      // 1. Criar a OS
      const novaOS = await tx.ordemServico.create({
        data: tenant.dataTenant({
          numero: numeroOS,
          clienteId: data.clienteId,
          tecnicoId: data.tecnicoId || null,
          dispositivo: data.dispositivo,
          marca: data.marca || null,
          modelo: data.modelo || null,
          imei: data.imei || null,
          defeitoRelatado: data.defeitoRelatado,
          diagnostico: data.diagnostico || null,
          solucao: data.solucao || null,
          valorServico: data.valorServico,
          valorPecas: data.valorPecas,
          valorTotal,
          status: data.status,
          garantiaDias: data.garantiaDias,
          garantiaAte,
          observacoes: data.observacoes || null,
        }),
      })

      // 2. Registrar Histórico Inicial
      await tx.oSHistorico.create({
        data: {
          ordemServicoId: novaOS.id,
          usuarioId: session.user.id,
          statusAnterior: null,
          statusNovo: data.status,
          observacao: "Ordem de Serviço criada no sistema.",
        },
      })

      // 3. Registrar Pagamentos se houver e criar lançamentos na CONTA_FINANCEIRA
      if (data.pagamentos && data.pagamentos.length > 0) {
        await tx.oSPagamento.createMany({
          data: data.pagamentos.map((p) => ({
            ordemServicoId: novaOS.id,
            formaPagamento: p.formaPagamento,
            valor: p.valor,
          })),
        })

        for (const pag of data.pagamentos) {
          const numParcelas = (pag.formaPagamento === "CARTAO_CREDITO" && pag.parcelas) ? pag.parcelas : 1
          const valorParcela = pag.valor / numParcelas

          for (let i = 0; i < numParcelas; i++) {
            const dataVencimento = new Date()
            dataVencimento.setDate(dataVencimento.getDate() + (i * 30))

            await tx.contaFinanceira.create({
              data: tenant.dataTenant({
                descricao: numParcelas > 1
                  ? `OS ${numeroOS} - Parcela ${i + 1}/${numParcelas}`
                  : `Receita referente à OS ${numeroOS}`,
                valor: valorParcela,
                tipo: "RECEITA",
                categoria: "SERVICO",
                dataVencimento,
                dataPagamento: i === 0 ? new Date() : null,
                status: i === 0 ? "PAGO" : "PENDENTE",
                ordemServicoId: novaOS.id,
              }),
            })
          }
        }
      }

      return novaOS
    })

    return NextResponse.json(os, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar Ordem de Serviço:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
