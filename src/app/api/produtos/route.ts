// src/app/api/produtos/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withTenant } from "@/lib/tenant"
import { produtoSchema } from "@/validators/produto"
import { StatusProduto } from "@prisma/client"

// GET: Listar produtos com busca, filtro de status e paginação
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const busca = searchParams.get("busca") || ""
    const status = searchParams.get("status") as StatusProduto | null
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const tenant = withTenant(session.user.empresaId)

    const where = tenant.whereTenant({
      ...(status ? { status } : {}),
      ...(busca
        ? {
            OR: [
              { nome: { contains: busca, mode: "insensitive" } },
              { codigoBarras: { contains: busca, mode: "insensitive" } },
              { descricao: { contains: busca, mode: "insensitive" } },
            ],
          }
        : {}),
    })

    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          fornecedor: { select: { id: true, nome: true } },
          categoria: { select: { id: true, nome: true } },
        },
      }),
      prisma.produto.count({ where }),
    ])

    return NextResponse.json({
      data: produtos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar produtos:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}

// POST: Criar novo produto / peça
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = produtoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const tenant = withTenant(session.user.empresaId)

    const produto = await prisma.produto.create({
      data: tenant.dataTenant(parsed.data),
    })

    return NextResponse.json(produto, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
