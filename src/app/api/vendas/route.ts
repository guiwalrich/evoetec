// src/app/api/vendas/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withTenant } from "@/lib/tenant"
import { vendaSchema } from "@/validators/venda"
import { TipoConta, CategoriaConta, StatusConta } from "@prisma/client"

// GET: Listar vendas com busca e paginação
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const busca = searchParams.get("busca") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const tenant = withTenant(session.user.empresaId)

    const where = tenant.whereTenant({
      ...(busca
        ? {
            OR: [
              { numero: { contains: busca, mode: "insensitive" } },
              { cliente: { nome: { contains: busca, mode: "insensitive" } } },
            ],
          }
        : {}),
    })

    const [vendas, total] = await Promise.all([
      prisma.venda.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          cliente: { select: { id: true, nome: true, telefone: true } },
          vendedor: { select: { id: true, nome: true } },
          pagamentos: true,
        },
      }),
      prisma.venda.count({ where }),
    ])

    return NextResponse.json({
      data: vendas,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar vendas:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}

// POST: Criar Venda (PDV) com baixa automática de estoque e lançamento financeiro
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = vendaSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const tenant = withTenant(session.user.empresaId)
    const data = parsed.data

    // 1. Gerar Número Único de Venda (ex: VEN-2026-0001)
    const count = await prisma.venda.count({
      where: { empresaId: session.user.empresaId },
    })

    const anoAtual = new Date().getFullYear()
    const numeroVenda = `VEN-${anoAtual}-${String(count + 1).padStart(4, "0")}`

    // 2. Calcular Totais
    const subtotal = data.itens.reduce(
      (acc, item) => acc + item.quantidade * item.valorUnitario - item.desconto,
      0
    )
    const valorTotal = Math.max(0, subtotal - data.desconto)

    // 3. Transação Atômica no Banco
    const venda = await prisma.$transaction(async (tx) => {
      // 3.1. Criar Registro de Venda
      const novaVenda = await tx.venda.create({
        data: tenant.dataTenant({
          numero: numeroVenda,
          clienteId: data.clienteId || null,
          vendedorId: session.user.id,
          subtotal,
          desconto: data.desconto,
          valorTotal,
          status: data.status,
        }),
      })

      // 3.2. Inserir Itens e Dar Baixa no Estoque
      for (const item of data.itens) {
        const itemValorTotal = item.quantidade * item.valorUnitario - item.desconto

        await tx.vendaItem.create({
          data: {
            vendaId: novaVenda.id,
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            desconto: item.desconto,
            valorTotal: itemValorTotal,
          },
        })

        // Decrementar quantidade no estoque de produtos
        await tx.produto.update({
          where: { id: item.produtoId },
          data: {
            quantidadeEstoque: {
              decrement: item.quantidade,
            },
          },
        })
      }

      // 3.3. Inserir Formas de Pagamento Fracionado
      await tx.vendaPagamento.createMany({
        data: data.pagamentos.map((p) => ({
          vendaId: novaVenda.id,
          formaPagamento: p.formaPagamento,
          valor: p.valor,
        })),
      })

      // 3.4. Criar Lançamentos Financeiros Automáticos em CONTA_FINANCEIRA (Com Desdobramento de Parcelas)
      for (const pag of data.pagamentos) {
        const numParcelas = (pag.formaPagamento === "CARTAO_CREDITO" && pag.parcelas) ? pag.parcelas : 1
        const valorParcela = pag.valor / numParcelas

        for (let i = 0; i < numParcelas; i++) {
          const dataVencimento = new Date()
          dataVencimento.setDate(dataVencimento.getDate() + (i * 30))

          await tx.contaFinanceira.create({
            data: tenant.dataTenant({
              descricao: numParcelas > 1
                ? `Venda ${numeroVenda} - Parcela ${i + 1}/${numParcelas}`
                : `Receita referente à Venda ${numeroVenda}`,
              valor: valorParcela,
              tipo: TipoConta.RECEITA,
              categoria: CategoriaConta.VENDA,
              dataVencimento,
              dataPagamento: i === 0 ? new Date() : null,
              status: i === 0 ? StatusConta.PAGO : StatusConta.PENDENTE,
              vendaId: novaVenda.id,
            }),
          })
        }
      }

      return novaVenda
    })

    return NextResponse.json(venda, { status: 201 })
  } catch (error) {
    console.error("Erro ao realizar venda:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
