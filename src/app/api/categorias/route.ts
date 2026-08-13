// src/app/api/categorias/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withTenant } from "@/lib/tenant"

// GET: Listar todas as categorias da empresa ordenada por ordem asc
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.empresaId) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const tenant = withTenant(session.user.empresaId)
    const categorias = await prisma.categoria.findMany({
      where: tenant.whereTenant({ deletedAt: null }),
      orderBy: { ordem: "asc" },
      select: {
        id: true,
        nome: true,
        ordem: true,
        _count: {
          select: { produtos: { where: tenant.whereTenant({ status: "ATIVO", deletedAt: null }) } },
        },
      },
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error("Erro ao listar categorias:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}

// POST: Criar nova categoria
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.empresaId) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { nome, ordem } = body

    if (!nome) {
      return NextResponse.json({ message: "Nome da categoria é obrigatório" }, { status: 400 })
    }

    const tenant = withTenant(session.user.empresaId)
    const categoria = await prisma.categoria.create({
      data: tenant.dataTenant({
        nome,
        ordem: Number(ordem) || 0,
      }),
    })

    return NextResponse.json(categoria, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar categoria:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
