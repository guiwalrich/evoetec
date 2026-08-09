// src/app/api/clientes/[id]/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withTenant } from "@/lib/tenant"
import { clienteSchema } from "@/validators/cliente"

// PUT: Atualizar cliente
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
    const parsed = clienteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const tenant = withTenant(session.user.empresaId)

    // Garantir que o cliente pertence à empresa e não foi apagado
    const clienteExistente = await prisma.cliente.findFirst({
      where: tenant.whereTenant({ id }),
    })

    if (!clienteExistente) {
      return NextResponse.json({ message: "Cliente não encontrado" }, { status: 404 })
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(cliente)
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}

// DELETE: Soft delete de cliente
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

    const clienteExistente = await prisma.cliente.findFirst({
      where: tenant.whereTenant({ id }),
    })

    if (!clienteExistente) {
      return NextResponse.json({ message: "Cliente não encontrado" }, { status: 404 })
    }

    // Soft delete: apenas preenche deletedAt
    await prisma.cliente.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "Cliente removido com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar cliente:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
