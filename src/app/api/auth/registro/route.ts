// src/app/api/auth/registro/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Resend } from "resend"
import { z } from "zod"

const resend = new Resend(process.env.RESEND_API_KEY)

const DISPOSABLE_DOMAINS = [
  "tempmail.com", "mailinator.com", "10minutemail.com", 
  "guerrillamail.com", "dispostable.com", "trashmail.com", 
  "yopmail.com", "temp-mail.org", "fakeinbox.com"
]

const registroSchema = z.object({
  nomeEmpresa: z.string()
    .min(2, "Nome da assistência é obrigatório")
    .max(100, "Nome da assistência muito longo")
    .transform((val) => val.replace(/<[^>]*>?/gm, "").trim()),
  nomeResponsavel: z.string()
    .min(2, "Nome do responsável é obrigatório")
    .max(100, "Nome do responsável muito longo")
    .transform((val) => val.replace(/<[^>]*>?/gm, "").trim()),
  email: z.string()
    .email("E-mail inválido")
    .max(150, "E-mail muito longo")
    .transform((val) => val.toLowerCase().trim()),
  whatsapp: z.string()
    .optional()
    .nullable()
    .transform((val) => (val ? val.replace(/<[^>]*>?/gm, "").trim() : null)),
  senha: z.string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha muito longa"),
  avatarId: z.number().optional().default(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = registroSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { nomeEmpresa, nomeResponsavel, email, whatsapp, senha, avatarId } = parsed.data
    const emailNormalizado = email.toLowerCase().trim()

    // 1. Checar se domínio de e-mail é descartável
    const domain = emailNormalizado.split("@")[1]
    if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
      return NextResponse.json(
        { message: "E-mails temporários/descartáveis não são permitidos para o Trial." },
        { status: 400 }
      )
    }

    // 2. Verificar se e-mail já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    })

    if (usuarioExistente) {
      return NextResponse.json(
        { message: "Este e-mail já está cadastrado. Faça login para acessar." },
        { status: 400 }
      )
    }

    // 3. Hash da senha e geração do código de 6 dígitos
    const senhaHash = await bcrypt.hash(senha, 10)
    const codigoVerificacao = Math.floor(100000 + Math.random() * 900000).toString()
    const agora = new Date()
    const codigoValidoAte = new Date(agora.getTime() + 15 * 60 * 1000) // 15 minutos
    const trialVenceEm = new Date(agora.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 dias

    // 4. Transação: Criar Empresa + Criar Usuário Admin (Trial)
    const resultado = await prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.create({
        data: {
          nomeFantasia: nomeEmpresa,
          telefone: whatsapp || null,
          statusAssinatura: "TRIAL",
          trialIniciadoEm: agora,
          trialVenceEm: trialVenceEm,
        },
      })

      const usuario = await tx.usuario.create({
        data: {
          nome: nomeResponsavel,
          email: emailNormalizado,
          senha: senhaHash,
          avatarId: avatarId || 1,
          role: "ADMIN",
          emailVerificado: false,
          codigoVerificacao,
          codigoValidoAte,
          ultimoEnvioCodigoAt: agora,
          empresaId: empresa.id,
        },
      })

      return { empresa, usuario }
    })

    // 5. Enviar e-mail de verificação via Resend
    try {
      await resend.emails.send({
        from: "Evo Etec ERP <nao-responder@resend.dev>",
        to: [emailNormalizado],
        subject: `Seu código de acesso ao Evo Etec: ${codigoVerificacao}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000000; color: #ffffff; padding: 40px 20px; text-align: center;">
            <div style="max-width: 480px; margin: 0 auto; background-color: #09090b; border: 1px solid #27272a; border-radius: 24px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
              <h1 style="font-size: 24px; font-weight: 800; tracking: -0.05em; margin-bottom: 8px; color: #ffffff;">Evo Etec ERP</h1>
              <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 24px;">Olá, <strong>${nomeResponsavel}</strong>! Bem-vindo ao Trial de 14 dias da <strong>${nomeEmpresa}</strong>.</p>
              
              <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                <span style="font-size: 12px; text-transform: uppercase; tracking: 0.1em; color: #a1a1aa; display: block; margin-bottom: 8px;">Seu Código de Verificação</span>
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #ffffff; font-family: monospace;">${codigoVerificacao}</span>
              </div>
              
              <p style="font-size: 12px; color: #71717a; margin-bottom: 0;">Este código é válido por <strong>15 minutos</strong>. Se você não solicitou este cadastro, ignore este e-mail.</p>
            </div>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error("Erro ao disparar e-mail via Resend:", emailErr)
    }

    return NextResponse.json(
      {
        message: "Cadastro realizado com sucesso! Verifique seu e-mail para ativar sua conta.",
        email: emailNormalizado,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro no cadastro de Trial:", error)
    return NextResponse.json({ message: "Erro interno no servidor." }, { status: 500 })
  }
}
