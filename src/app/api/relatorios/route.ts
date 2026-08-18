// src/app/api/relatorios/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withTenant } from "@/lib/tenant"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const tenant = withTenant(session.user.empresaId)

    const { searchParams } = new URL(req.url)
    const mesParam = searchParams.get("mes")
    const anoParam = searchParams.get("ano")

    let dataFiltroVenda = {}
    let dataFiltroOS = {}
    let dataFiltroVendaItem = {}

    if (mesParam && anoParam && mesParam !== "todos") {
      const mes = parseInt(mesParam, 10)
      const ano = parseInt(anoParam, 10)

      if (!isNaN(mes) && !isNaN(ano)) {
        const inicioMes = new Date(ano, mes - 1, 1, 0, 0, 0)
        const fimMes = new Date(ano, mes, 0, 23, 59, 59, 999)

        dataFiltroVenda = { dataVenda: { gte: inicioMes, lte: fimMes } }
        dataFiltroOS = { createdAt: { gte: inicioMes, lte: fimMes } }
        dataFiltroVendaItem = { venda: { dataVenda: { gte: inicioMes, lte: fimMes } } }
      }
    }

    const [
      totalVendas,
      totalOS,
      osPorStatus,
      produtosEstoqueCritico,
      topProdutos,
    ] = await Promise.all([
      // Total de Vendas no período
      prisma.venda.aggregate({
        where: tenant.whereTenant({ status: "CONCLUIDA", ...dataFiltroVenda }),
        _sum: { valorTotal: true },
        _count: true,
      }),
      // Total de OS no período
      prisma.ordemServico.aggregate({
        where: tenant.whereTenant({ ...dataFiltroOS }),
        _sum: { valorTotal: true },
        _count: true,
      }),
      // OS Agrupadas por Status no período
      prisma.ordemServico.groupBy({
        by: ["status"],
        where: tenant.whereTenant({ ...dataFiltroOS }),
        _count: true,
      }),
      // Produtos com estoque baixo
      prisma.produto.findMany({
        where: tenant.whereTenant({
          status: "ATIVO",
        }),
        orderBy: { quantidadeEstoque: "asc" },
        take: 5,
        select: {
          id: true,
          nome: true,
          quantidadeEstoque: true,
          estoqueMinimo: true,
        },
      }),
      // Produtos mais vendidos nas VendaItems no período
      prisma.vendaItem.groupBy({
        by: ["produtoId"],
        where: {
          ...dataFiltroVendaItem,
        },
        _sum: { quantidade: true, valorTotal: true },
        orderBy: { _sum: { quantidade: "desc" } },
        take: 5,
      }),
    ])

    // Buscar nomes dos top produtos
    const topProdutosIds = topProdutos.map((p) => p.produtoId)
    const detalhesProdutos = await prisma.produto.findMany({
      where: { id: { in: topProdutosIds } },
      select: { id: true, nome: true },
    })

    const topProdutosFormatados = topProdutos.map((item) => {
      const prod = detalhesProdutos.find((d) => d.id === item.produtoId)
      return {
        nome: prod?.nome || "Produto Desconhecido",
        quantidadeTotal: item._sum.quantidade || 0,
        valorTotal: item._sum.valorTotal || 0,
      }
    })

    // Buscar dados da empresa para o cabeçalho oficial do relatório
    const empresaInfo = await prisma.empresa.findUnique({
      where: { id: session.user.empresaId },
      select: { nomeFantasia: true, cnpj: true, telefone: true, endereco: true },
    })

    return NextResponse.json({
      empresa: empresaInfo,
      vendas: {
        totalFaturado: Number(totalVendas._sum.valorTotal || 0),
        quantidade: totalVendas._count,
      },
      ordensServico: {
        totalFaturado: Number(totalOS._sum.valorTotal || 0),
        quantidade: totalOS._count,
        porStatus: osPorStatus,
      },
      estoqueCritico: produtosEstoqueCritico.filter(
        (p) => p.quantidadeEstoque <= p.estoqueMinimo
      ),
      topProdutos: topProdutosFormatados,
    })
  } catch (error) {
    console.error("Erro ao gerar relatórios:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
