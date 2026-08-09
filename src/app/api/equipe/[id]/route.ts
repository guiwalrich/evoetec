// src/app/api/equipe/[id]/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withTenant } from "@/lib/tenant"

// DELETE: Soft delete de membro da equipe
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Apenas administradores podem desativar membros da equipe." },
        { status: 403 }
      )
    }

    const { id } = await params
    const tenant = withTenant(session.user.empresaId)

    // Não permitir deletar a si mesmo
    if (id === session.user.id) {
      return NextResponse.json(
        { message: "Você não pode desativar seu próprio usuário." },
        { status: 400 }
      )
    }

    const membro = await prisma.usuario.findFirst({
      where: tenant.whereTenant({ id }),
    })

    if (!membro) {
      return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 })
    }

    await prisma.usuario.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "Membro da equipe desativado com sucesso." })
  } catch (error) {
    console.error("Erro ao deletar membro da equipe:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
