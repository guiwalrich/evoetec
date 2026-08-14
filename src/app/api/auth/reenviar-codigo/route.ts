// src/app/api/auth/reenviar-codigo/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import { z } from "zod"

const resend = new Resend(process.env.RESEND_API_KEY)

const reenviarSchema = z.object({
  email: z.string().email("E-mail inválido"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = reenviarSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email } = parsed.data
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
        { message: "Seu e-mail já está verificado! Faça login no sistema." },
        { status: 400 }
      )
    }

    const agora = new Date()

    // 1. Checar Cooldown de 60 segundos
    if (usuario.ultimoEnvioCodigoAt) {
      const segundosDecorridos = (agora.getTime() - usuario.ultimoEnvioCodigoAt.getTime()) / 1000
      if (segundosDecorridos < 60) {
        const resta = Math.ceil(60 - segundosDecorridos)
        return NextResponse.json(
          { message: `Aguarde ${resta} segundo(s) antes de solicitar um novo código.` },
          { status: 429 }
        )
      }
    }

    // 2. Gerar novo código e expiração (15 min)
    const novoCodigo = Math.floor(100000 + Math.random() * 900000).toString()
    const codigoValidoAte = new Date(agora.getTime() + 15 * 60 * 1000)

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        codigoVerificacao: novoCodigo,
        codigoValidoAte,
        ultimoEnvioCodigoAt: agora,
      },
    })

    // 3. Enviar e-mail via Resend
    try {
      await resend.emails.send({
        from: "Evo Etec ERP <nao-responder@resend.dev>",
        to: [emailNormalizado],
        subject: `Novo código de verificação Evo Etec: ${novoCodigo}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000000; color: #ffffff; padding: 40px 20px; text-align: center;">
            <div style="max-width: 480px; margin: 0 auto; background-color: #09090b; border: 1px solid #27272a; border-radius: 24px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
              <h1 style="font-size: 24px; font-weight: 800; tracking: -0.05em; margin-bottom: 8px; color: #ffffff;">Evo Etec ERP</h1>
              <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 24px;">Você solicitou um novo código de verificação.</p>
              
              <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                <span style="font-size: 12px; text-transform: uppercase; tracking: 0.1em; color: #a1a1aa; display: block; margin-bottom: 8px;">Novo Código de Verificação</span>
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #ffffff; font-family: monospace;">${novoCodigo}</span>
              </div>
              
              <p style="font-size: 12px; color: #71717a; margin-bottom: 0;">Válido por <strong>15 minutos</strong>.</p>
            </div>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error("Erro ao reenviar e-mail via Resend:", emailErr)
    }

    return NextResponse.json({
      message: "Um novo código de 6 dígitos foi enviado para o seu e-mail!",
    })
  } catch (error) {
    console.error("Erro ao reenviar código:", error)
    return NextResponse.json({ message: "Erro interno no servidor." }, { status: 500 })
  }
}
