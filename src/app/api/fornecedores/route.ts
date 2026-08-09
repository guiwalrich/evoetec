// src/app/api/fornecedores/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withTenant } from "@/lib/tenant"
import { fornecedorSchema } from "@/validators/fornecedor"

// GET: Listar fornecedores com busca e paginação
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
              { nome: { contains: busca, mode: "insensitive" } },
              { cpfCnpj: { contains: busca, mode: "insensitive" } },
              { telefone: { contains: busca, mode: "insensitive" } },
              { email: { contains: busca, mode: "insensitive" } },
            ],
          }
        : {}),
    })

    const [fornecedores, total] = await Promise.all([
      prisma.fornecedor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.fornecedor.count({ where }),
    ])

    return NextResponse.json({
      data: fornecedores,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar fornecedores:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}

// POST: Criar novo fornecedor
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = fornecedorSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const tenant = withTenant(session.user.empresaId)

    const fornecedor = await prisma.fornecedor.create({
      data: tenant.dataTenant(parsed.data),
    })

    return NextResponse.json(fornecedor, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar fornecedor:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
