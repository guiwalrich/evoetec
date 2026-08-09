// src/app/api/dashboard/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withTenant } from "@/lib/tenant"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const tenant = withTenant(session.user.empresaId)

    const [
      osAbertas,
      clientesAtivos,
      receitaMensal,
      pecasEstoque,
      ultimasOS,
      ultimasVendas,
    ] = await Promise.all([
      // 1. OS Abertas (não concluídas e nem canceladas)
      prisma.ordemServico.count({
        where: tenant.whereTenant({
          status: { notIn: ["CONCLUIDA", "CANCELADA"] },
        }),
      }),

      // 2. Clientes Cadastrados
      prisma.cliente.count({
        where: tenant.whereTenant(),
      }),

      // 3. Receita Realizada (Contas Financeiras pagas do tipo RECEITA)
      prisma.contaFinanceira.aggregate({
        where: tenant.whereTenant({
          tipo: "RECEITA",
          status: "PAGO",
        }),
        _sum: { valor: true },
      }),

      // 4. Quantidade de Peças em Estoque
      prisma.produto.aggregate({
        where: tenant.whereTenant({
          status: "ATIVO",
        }),
        _sum: { quantidadeEstoque: true },
      }),

      // 5. Últimas OSs para a tabela rápida
      prisma.ordemServico.findMany({
        where: tenant.whereTenant(),
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          numero: true,
          dispositivo: true,
          status: true,
          valorTotal: true,
          createdAt: true,
          cliente: { select: { nome: true } },
        },
      }),

      // 6. Últimas Vendas do PDV
      prisma.venda.findMany({
        where: tenant.whereTenant({ status: "CONCLUIDA" }),
        take: 5,
        orderBy: { dataVenda: "desc" },
        select: {
          id: true,
          numero: true,
          valorTotal: true,
          dataVenda: true,
          cliente: { select: { nome: true } },
        },
      }),
    ])

    return NextResponse.json({
      metrics: {
        osAbertas,
        clientesAtivos,
        receitaTotal: Number(receitaMensal._sum.valor || 0),
        pecasEstoque: Number(pecasEstoque._sum.quantidadeEstoque || 0),
      },
      ultimasOS,
      ultimasVendas,
    })
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
