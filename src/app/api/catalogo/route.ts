// src/app/api/catalogo/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET: Listagem pública multi-tenant de produtos ativos por empresa/assistência técnica
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const session = await auth()

    // 1. Prioridade do empresaId: Query Param > Sessão do Usuário Logado
    let empresaId = searchParams.get("empresaId")
    if (!empresaId && session?.user?.empresaId) {
      empresaId = session.user.empresaId
    }

    // Se ainda não tiver empresaId, buscar a primeira empresa cadastrada no banco como fallback
    if (!empresaId) {
      const primeiraEmpresa = await prisma.empresa.findFirst({
        orderBy: { createdAt: "asc" },
        select: { id: true },
      })
      empresaId = primeiraEmpresa?.id || null
    }

    if (!empresaId) {
      return NextResponse.json({
        data: [],
        categorias: [],
        empresa: { nomeFantasia: "Evo Etec ERP", telefone: null, endereco: null },
        pagination: { total: 0, page: 1, limit: 12, totalPages: 0 },
      })
    }

    const busca = searchParams.get("busca") || ""
    const categoriaId = searchParams.get("categoriaId") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    const where = {
      empresaId,
      status: "ATIVO" as const,
      deletedAt: null,
      ...(categoriaId && categoriaId !== "ALL" ? { categoriaId } : {}),
      ...(busca
        ? {
            OR: [
              { nome: { contains: busca, mode: "insensitive" as const } },
              { descricao: { contains: busca, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    const [produtos, total, empresaInfo, categorias] = await Promise.all([
      prisma.produto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: "asc" },
        select: {
          id: true,
          nome: true,
          descricao: true,
          precoVenda: true,
          quantidadeEstoque: true,
          imagemUrl: true,
          categoriaId: true,
          categoria: { select: { id: true, nome: true } },
        },
      }),
      prisma.produto.count({ where }),
      prisma.empresa.findUnique({
        where: { id: empresaId },
        select: {
          id: true,
          nomeFantasia: true,
          telefone: true,
          endereco: true,
        },
      }),
      prisma.categoria.findMany({
        where: { empresaId, deletedAt: null },
        orderBy: { ordem: "asc" },
        select: {
          id: true,
          nome: true,
          _count: {
            select: {
              produtos: {
                where: { empresaId, status: "ATIVO", deletedAt: null },
              },
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      data: produtos,
      categorias,
      empresa: empresaInfo || { nomeFantasia: "Evo Etec ERP", telefone: null, endereco: null },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao carregar catálogo público multi-tenant:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
