// src/lib/mail.ts
import { Resend } from "resend"

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function enviarEmailRecuperacaoSenha(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const link = `${baseUrl}/redefinir-senha?token=${token}`

  if (resend) {
    try {
      await resend.emails.send({
        from: "Evo Etec ERP <nao-responder@evoetecerp.com.br>",
        to: email,
        subject: "Recuperação de Senha - Evo Etec ERP",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Recuperação de Senha — Evo Etec ERP</h2>
            <p>Você solicitou a redefinição da sua senha de acesso ao sistema.</p>
            <p>Clique no link abaixo para criar uma nova senha:</p>
            <p style="margin: 20px 0;">
              <a href="${link}" style="background-color: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                Redefinir Minha Senha
              </a>
            </p>
            <p style="font-size: 12px; color: #666;">Se você não solicitou este e-mail, pode ignorá-lo com segurança.</p>
          </div>
        `,
      })
      console.log(`[Resend] E-mail enviado para ${email}`)
    } catch (err) {
      console.error("[Resend Error] Falha ao enviar e-mail de recuperação:", err)
    }
  } else {
    console.log(`[Simulação de Email Dev] Para: ${email} | Link: ${link}`)
  }
}
