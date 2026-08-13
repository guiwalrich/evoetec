// src/app/api/empresa/checar-assinatura/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendDiscordNotification } from "@/lib/discord"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.empresaId) {
      return NextResponse.json({ statusAssinatura: "BLOQUEADO", gracePeriod: false }, { status: 401 })
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
      return NextResponse.json({ statusAssinatura: "BLOQUEADO", gracePeriod: false }, { status: 404 })
    }

    const agora = new Date()
    let statusAtual: string = empresa.statusAssinatura
    let gracePeriod = false
    const vencimento = empresa.trialVenceEm || agora

    // Lógica de carência de 48h após o vencimento
    if (vencimento && agora > vencimento) {
      const diffMs = agora.getTime() - new Date(vencimento).getTime()
      const horas = diffMs / (1000 * 60 * 60)

      if (horas <= 48) {
        // Carência de 48h – permite acesso, mas ativa gracePeriod flag
        gracePeriod = true
        statusAtual = "CARENCIA"
      } else {
        // Bloqueio definitivo
        statusAtual = "BLOQUEADO"
        if (empresa.statusAssinatura !== "BLOQUEADO") {
          await prisma.empresa.update({
            where: { id: empresaId },
            data: { statusAssinatura: "BLOQUEADO" },
          })

          await sendDiscordNotification(
            "🚨 Assinatura Bloqueada - Carência Expirada",
            `A empresa **${empresa.nomeFantasia}** excedeu o período de carência de 48h e foi bloqueada.`,
            15158332
          )
        }
      }
    }

    return NextResponse.json({
      statusAssinatura: statusAtual,
      gracePeriod,
      vencimento: vencimento.toISOString(),
      trialVenceEm: empresa.trialVenceEm,
      trialIniciadoEm: empresa.trialIniciadoEm,
    })
  } catch (error) {
    console.error("Erro ao checar assinatura:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
