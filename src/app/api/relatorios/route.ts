// src/app/api/relatorios/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Resolve empresaId da sessão ou busca no banco como fallback
    let empresaId = (session.user as any).empresaId
    if (!empresaId && session.user.id) {
      const userDb = await prisma.usuario.findUnique({
        where: { id: session.user.id },
        select: { empresaId: true }
      })
      empresaId = userDb?.empresaId
    }

    if (!empresaId) {
      const primeiraEmpresa = await prisma.empresa.findFirst({
        select: { id: true }
      })
      empresaId = primeiraEmpresa?.id
    }

    if (!empresaId) {
      return NextResponse.json({
        empresa: null,
        vendas: { totalFaturado: 0, quantidade: 0 },
        ordensServico: { totalFaturado: 0, quantidade: 0, porStatus: [] },
        estoqueCritico: [],
        topProdutos: []
      })
    }

    const { searchParams } = new URL(req.url)
    const mesParam = searchParams.get("mes")
    const anoParam = searchParams.get("ano")

    let filtroDataVenda: any = {}
    let filtroDataOS: any = {}

    if (mesParam && anoParam && mesParam !== "todos") {
      const mes = parseInt(mesParam, 10)
      const ano = parseInt(anoParam, 10)

      if (!isNaN(mes) && !isNaN(ano) && mes >= 1 && mes <= 12) {
        const inicioMes = new Date(ano, mes - 1, 1, 0, 0, 0)
        const fimMes = new Date(ano, mes, 0, 23, 59, 59, 999)

        filtroDataVenda = { gte: inicioMes, lte: fimMes }
        filtroDataOS = { gte: inicioMes, lte: fimMes }
      }
    }

    // Execução segura de cada consulta com fallbacks individuais
    const [
      totalVendasRes,
      totalOSRes,
      osPorStatusRes,
      produtosEstoqueRes,
      topProdutosRes,
      empresaInfoRes
    ] = await Promise.allSettled([
      // 1. Total de Vendas
      prisma.venda.aggregate({
        where: {
          empresaId,
          deletedAt: null,
          status: "CONCLUIDA",
          ...(filtroDataVenda.gte ? { dataVenda: filtroDataVenda } : {})
        },
        _sum: { valorTotal: true },
        _count: true,
      }),

      // 2. Total de OS
      prisma.ordemServico.aggregate({
        where: {
          empresaId,
          deletedAt: null,
          ...(filtroDataOS.gte ? { createdAt: filtroDataOS } : {})
        },
        _sum: { valorTotal: true },
        _count: true,
      }),

      // 3. OS Agrupadas por Status
      prisma.ordemServico.groupBy({
        by: ["status"],
        where: {
          empresaId,
          deletedAt: null,
          ...(filtroDataOS.gte ? { createdAt: filtroDataOS } : {})
        },
        _count: true,
      }),

      // 4. Produtos com estoque critico
      prisma.produto.findMany({
        where: {
          empresaId,
          deletedAt: null,
          status: "ATIVO",
        },
        orderBy: { quantidadeEstoque: "asc" },
        take: 10,
        select: {
          id: true,
          nome: true,
          quantidadeEstoque: true,
          estoqueMinimo: true,
        },
      }),

      // 5. Top produtos vendidos
      prisma.vendaItem.groupBy({
        by: ["produtoId"],
        where: {
          venda: {
            empresaId,
            deletedAt: null,
            ...(filtroDataVenda.gte ? { dataVenda: filtroDataVenda } : {})
          }
        },
        _sum: { quantidade: true, valorTotal: true },
        orderBy: { _sum: { quantidade: "desc" } },
        take: 5,
      }),

      // 6. Dados da empresa
      prisma.empresa.findUnique({
        where: { id: empresaId },
        select: { nomeFantasia: true, cnpj: true, telefone: true, endereco: true },
      })
    ])

    // Processamento do resultado do Promise.allSettled
    const totalVendas = totalVendasRes.status === "fulfilled" ? totalVendasRes.value : { _sum: { valorTotal: 0 }, _count: 0 }
    const totalOS = totalOSRes.status === "fulfilled" ? totalOSRes.value : { _sum: { valorTotal: 0 }, _count: 0 }
    const osPorStatus = osPorStatusRes.status === "fulfilled" ? osPorStatusRes.value : []
    const produtosEstoque = produtosEstoqueRes.status === "fulfilled" ? produtosEstoqueRes.value : []
    const topProdutosRaw = topProdutosRes.status === "fulfilled" ? topProdutosRes.value : []
    const empresaInfo = empresaInfoRes.status === "fulfilled" ? empresaInfoRes.value : null

    // Buscar nomes dos top produtos
    const topProdutosIds = topProdutosRaw.map((p) => p.produtoId).filter(Boolean)
    let detalhesProdutos: Array<{ id: string; nome: string }> = []
    if (topProdutosIds.length > 0) {
      try {
        detalhesProdutos = await prisma.produto.findMany({
          where: { id: { in: topProdutosIds } },
          select: { id: true, nome: true }
        })
      } catch (err) {
        console.error("Erro ao buscar detalhes de produtos:", err)
      }
    }

    const topProdutosFormatados = topProdutosRaw.map((item) => {
      const prod = detalhesProdutos.find((d) => d.id === item.produtoId)
      return {
        nome: prod?.nome || "Produto da Venda",
        quantidadeTotal: Number(item._sum?.quantidade || 0),
        valorTotal: Number(item._sum?.valorTotal || 0),
      }
    })

    const estoqueCritico = produtosEstoque.filter(
      (p) => p.quantidadeEstoque <= p.estoqueMinimo
    )

    return NextResponse.json({
      empresa: empresaInfo,
      vendas: {
        totalFaturado: Number(totalVendas._sum?.valorTotal || 0),
        quantidade: totalVendas._count || 0,
      },
      ordensServico: {
        totalFaturado: Number(totalOS._sum?.valorTotal || 0),
        quantidade: totalOS._count || 0,
        porStatus: osPorStatus.map(st => ({ status: st.status, _count: st._count })),
      },
      estoqueCritico,
      topProdutos: topProdutosFormatados,
    })
  } catch (error) {
    console.error("Erro crítico na API de relatórios:", error)
    // Retorna payload padrão zerado ao invés de 500 para evitar que a UI quebre
    return NextResponse.json({
      empresa: null,
      vendas: { totalFaturado: 0, quantidade: 0 },
      ordensServico: { totalFaturado: 0, quantidade: 0, porStatus: [] },
      estoqueCritico: [],
      topProdutos: []
    })
  }
}
