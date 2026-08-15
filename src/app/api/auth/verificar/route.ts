// src/app/api/auth/verificar/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { enviarAlertaCadastro } from "@/lib/discord"
import { z } from "zod"

const verificarSchema = z.object({
  email: z.string().email("E-mail inválido").transform((val) => val.toLowerCase().trim()),
  codigo: z.string().length(6, "O código deve conter exatamente 6 dígitos").transform((val) => val.replace(/\D/g, "").trim()),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = verificarSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, codigo } = parsed.data
    const emailNormalizado = email.toLowerCase().trim()

    const usuario = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
      include: { empresa: true },
    })

    if (!usuario) {
      return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 })
    }

    if (usuario.emailVerificado) {
      return NextResponse.json(
        { message: "Seu e-mail já foi verificado anteriormente! Você já pode fazer login." },
        { status: 200 }
      )
    }

    if (!usuario.codigoVerificacao || usuario.codigoVerificacao !== codigo) {
      return NextResponse.json(
        { message: "Código de verificação incorreto. Verifique o código e tente novamente." },
        { status: 400 }
      )
    }

    const agora = new Date()
    if (usuario.codigoValidoAte && usuario.codigoValidoAte < agora) {
      return NextResponse.json(
        { message: "Este código expirou (limite de 15 min). Clique abaixo para solicitar um novo código." },
        { status: 400 }
      )
    }

    // Atualizar Usuário como Verificado
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        emailVerificado: true,
        codigoVerificacao: null,
        codigoValidoAte: null,
      },
    })

    // Disparar Alerta no Discord (Canal #cadastros-saas)
    if (usuario.empresa) {
      await enviarAlertaCadastro(
        usuario.empresa.nomeFantasia,
        usuario.nome,
        usuario.email,
        usuario.empresa.telefone || "Não informado",
        usuario.empresa.trialVenceEm || new Date(agora.getTime() + 14 * 24 * 60 * 60 * 1000)
      )
    }

    return NextResponse.json({
      message: "E-mail verificado com sucesso! Sua conta Trial está ativa.",
    })
  } catch (error) {
    console.error("Erro na verificação de código:", error)
    return NextResponse.json({ message: "Erro interno no servidor." }, { status: 500 })
  }
}
