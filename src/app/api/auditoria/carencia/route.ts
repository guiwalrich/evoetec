// src/app/api/auditoria/carencia/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendAudit } from "@/lib/discordAudit"

export async function POST() {
  try {
    const session = await auth()
    let nomeEmpresa = "Desconhecida"
    let vencimentoStr = new Date().toLocaleDateString("pt-BR")
    let carenciaAteStr = new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleDateString("pt-BR")

    if (session?.user?.empresaId) {
      const empresa = await prisma.empresa.findUnique({
        where: { id: session.user.empresaId },
        select: { nomeFantasia: true, trialVenceEm: true },
      })
      if (empresa) {
        nomeEmpresa = empresa.nomeFantasia || "Desconhecida"
        if (empresa.trialVenceEm) {
          const venc = new Date(empresa.trialVenceEm)
          const carencia = new Date(venc.getTime() + 48 * 60 * 60 * 1000)
          vencimentoStr = venc.toLocaleDateString("pt-BR")
          carenciaAteStr = carencia.toLocaleDateString("pt-BR")
        }
      }
    }

    const embed = {
      title: "⚠️ PLANO VENCIDO — CARÊNCIA ATIVA",
      color: 0xffa500,
      fields: [
        { name: "🏢 Empresa", value: nomeEmpresa, inline: true },
        { name: "📅 Vencimento", value: vencimentoStr, inline: true },
        { name: "⏳ Carência até", value: carenciaAteStr, inline: true },
      ],
      timestamp: new Date().toISOString(),
    }

    await sendAudit(embed)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erro no webhook de auditoria de carência:", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
