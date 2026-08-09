// src/app/api/empresa/checar-assinatura/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendDiscordNotification } from "@/lib/discord"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.empresaId) {
      return NextResponse.json({ statusAssinatura: "BLOQUEADO" }, { status: 401 })
    }

    const empresaId = session.user.empresaId
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: {
        id: true,
        nomeFantasia: true,
        statusAssinatura: true,
        trialVenceEm: true,
        trialIniciadoEm: true,
      },
    })

    if (!empresa) {
      return NextResponse.json({ statusAssinatura: "BLOQUEADO" }, { status: 404 })
    }

    const agora = new Date()
    let statusAtual = empresa.statusAssinatura

    // Se o trial venceu, atualiza para BLOQUEADO automaticamente
    if (empresa.statusAssinatura === "TRIAL" && empresa.trialVenceEm && agora > empresa.trialVenceEm) {
      statusAtual = "BLOQUEADO"
      await prisma.empresa.update({
        where: { id: empresaId },
        data: { statusAssinatura: "BLOQUEADO" },
      })

      // Notifica no Discord
      await sendDiscordNotification(
        "🚨 Período de Trial Expirado",
        `A empresa **${empresa.nomeFantasia}** teve o período de teste expirado e foi bloqueada automaticamente.`,
        15158332 // Vermelho
      )
    }

    return NextResponse.json({
      statusAssinatura: statusAtual,
      trialVenceEm: empresa.trialVenceEm,
      trialIniciadoEm: empresa.trialIniciadoEm,
    })
  } catch (error) {
    console.error("Erro ao checar assinatura:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
