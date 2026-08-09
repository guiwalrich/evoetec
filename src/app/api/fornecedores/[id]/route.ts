// src/app/api/fornecedores/[id]/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withTenant } from "@/lib/tenant"
import { fornecedorSchema } from "@/validators/fornecedor"

// PUT: Atualizar fornecedor
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const parsed = fornecedorSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const tenant = withTenant(session.user.empresaId)

    const fornecedorExistente = await prisma.fornecedor.findFirst({
      where: tenant.whereTenant({ id }),
    })

    if (!fornecedorExistente) {
      return NextResponse.json({ message: "Fornecedor não encontrado" }, { status: 404 })
    }

    const fornecedor = await prisma.fornecedor.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(fornecedor)
  } catch (error) {
    console.error("Erro ao atualizar fornecedor:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}

// DELETE: Soft delete do fornecedor
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const tenant = withTenant(session.user.empresaId)

    const fornecedorExistente = await prisma.fornecedor.findFirst({
      where: tenant.whereTenant({ id }),
    })

    if (!fornecedorExistente) {
      return NextResponse.json({ message: "Fornecedor não encontrado" }, { status: 404 })
    }

    await prisma.fornecedor.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "Fornecedor removido com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar fornecedor:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
