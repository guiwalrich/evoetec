// src/app/api/empresa/feedback-trial/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendDiscordNotification } from "@/lib/discord"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.empresaId) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { mensagem } = await req.json()
    if (!mensagem || typeof mensagem !== "string") {
      return NextResponse.json({ message: "Mensagem inválida" }, { status: 400 })
    }

    const empresaId = session.user.empresaId
    const empresa = await prisma.empresa.update({
      where: { id: empresaId },
      data: { feedbackEnviado: true },
      select: { nomeFantasia: true, telefone: true },
    })

    // Envia para o Discord
    await sendDiscordNotification(
      "💬 Novo Feedback de Usuário (Trial)",
      `**Empresa:** ${empresa.nomeFantasia}\n**Telefone:** ${empresa.telefone || "Não informado"}\n**Mensagem:**\n"${mensagem}"`,
      3447003 // Azul
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao registrar feedback:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
