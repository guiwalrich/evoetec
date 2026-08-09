// src/app/api/catalogo/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Listagem pública de produtos ativos (não exige autenticação)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const busca = searchParams.get("busca") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    const where = {
      status: "ATIVO" as const,
      deletedAt: null,
      ...(busca
        ? {
            OR: [
              { nome: { contains: busca, mode: "insensitive" as const } },
              { descricao: { contains: busca, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    const [produtos, total, empresa] = await Promise.all([
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
    ])

    return NextResponse.json({
      data: produtos,
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
