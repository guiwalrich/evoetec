// src/app/api/catalogo/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Listagem pública de produtos ativos ordenados por categoria (não exige autenticação)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const busca = searchParams.get("busca") || ""
    const categoriaId = searchParams.get("categoriaId") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    const where = {
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

    const [produtos, total, empresa, categorias] = await Promise.all([
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
      prisma.empresa.findFirst({
        select: {
          nomeFantasia: true,
          telefone: true,
          endereco: true,
        },
      }),
      prisma.categoria.findMany({
        where: { deletedAt: null },
        orderBy: { ordem: "asc" },
        select: {
          id: true,
          nome: true,
          _count: {
            select: {
              produtos: {
                where: { status: "ATIVO", deletedAt: null },
              },
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      data: produtos,
      categorias,
      empresa: empresa || { nomeFantasia: "EVO ETEC", telefone: null, endereco: null },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao carregar catálogo público:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
