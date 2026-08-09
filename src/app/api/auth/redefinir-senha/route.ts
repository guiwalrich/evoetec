// src/app/api/auth/redefinir-senha/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { redefinirSenhaSchema } from "@/validators/auth"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = redefinirSenhaSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { token, senha } = parsed.data

    const usuario = await prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(),
        },
        deletedAt: null,
      },
    })

    if (!usuario) {
      return NextResponse.json(
        { message: "Token inválido ou expirado." },
        { status: 400 }
      )
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senha: senhaHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    })

    return NextResponse.json({ message: "Senha redefinida com sucesso!" })
  } catch (error) {
    console.error("Erro ao redefinir senha:", error)
    return NextResponse.json(
      { message: "Erro interno no servidor." },
      { status: 500 }
    )
  }
}
