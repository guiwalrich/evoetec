import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { esqueciSenhaSchema } from "@/validators/auth"
import crypto from "crypto"
import { enviarEmailRecuperacaoSenha } from "@/lib/mail"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = esqueciSenhaSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: "E-mail inválido." },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    })

    // Mesmo se o usuário não existir, por segurança não revelamos
    if (!usuario || usuario.deletedAt) {
      return NextResponse.json({ message: "Se o e-mail existir, enviamos as instruções." })
    }

    // Gerar Token de Reset com expiração em 1 hora
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpires = new Date(Date.now() + 3600000)

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    })

    // Disparar e-mail via Resend
    await enviarEmailRecuperacaoSenha(email, resetToken)

    return NextResponse.json({ message: "Se o e-mail existir, enviamos as instruções." })
  } catch (error) {
    console.error("Erro na recuperação de senha:", error)
    return NextResponse.json(
      { message: "Erro interno no servidor." },
      { status: 500 }
    )
  }
}
