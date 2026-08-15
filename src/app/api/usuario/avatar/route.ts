// src/app/api/usuario/avatar/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateAvatarSchema = z.object({
  avatarId: z.number().min(1).max(16),
})

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 })
    }

    const body = await req.json()
    const parsed = updateAvatarSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ message: "Avatar inválido (deve ser entre 1 e 16)." }, { status: 400 })
    }

    const { avatarId } = parsed.data

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: session.user.id },
      data: { avatarId },
    })

    return NextResponse.json({
      message: "Avatar Pixel Art atualizado com sucesso!",
      avatarId: usuarioAtualizado.avatarId,
    })
  } catch (error) {
    console.error("Erro ao atualizar avatar do usuário:", error)
    return NextResponse.json({ message: "Erro interno ao atualizar avatar." }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { id: true, nome: true, email: true, avatarId: true },
    })

    return NextResponse.json({ avatarId: usuario?.avatarId || 1 })
  } catch (error) {
    console.error("Erro ao buscar avatar do usuário:", error)
    return NextResponse.json({ message: "Erro interno no servidor." }, { status: 500 })
  }
}
