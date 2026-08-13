// src/app/api/suporte/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Payload = {
  assunto: string
  descricao: string
}

type CacheEntry = {
  lastSent: number // timestamp em ms
}

const cooldownMap = new Map<string, CacheEntry>() // email → última chamada

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }

    const body: Payload = await req.json()
    const { assunto, descricao } = body

    if (!assunto || !descricao || descricao.trim().length < 10) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
    }

    // ---------- Anti‑spam ----------
    const now = Date.now()
    const entry = cooldownMap.get(session.user.email)
    if (entry && now - entry.lastSent < 5 * 60 * 1000) {
      const secs = Math.ceil((5 * 60 * 1000 - (now - entry.lastSent)) / 1000)
      return NextResponse.json(
        { error: `Aguarde ${secs}s antes de enviar outro chamado` },
        { status: 429 }
      )
    }

    // Buscar dados atualizados da empresa do usuário
    let nomeEmpresa = "Desconhecida"
    if (session.user.empresaId) {
      const empresa = await prisma.empresa.findUnique({
        where: { id: session.user.empresaId },
        select: { nomeFantasia: true },
      })
      if (empresa?.nomeFantasia) {
        nomeEmpresa = empresa.nomeFantasia
      }
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_SUPORTE_URL
    if (!webhookUrl) {
      console.error("DISCORD_WEBHOOK_SUPORTE_URL não configurado")
      return NextResponse.json({ error: "Configuração ausente" }, { status: 500 })
    }

    const embed = {
      title: "🆘 CHAMADO DE SUPORTE",
      color: 0xffa500,
      fields: [
        { name: "🏢 Empresa", value: nomeEmpresa, inline: true },
        { name: "👤 Usuário", value: `${session.user.name ?? "Anon"} (${session.user.email})`, inline: true },
        { name: "📌 Assunto", value: assunto, inline: true },
        { name: "🕐 Data", value: new Date().toLocaleString("pt-BR"), inline: true },
        { name: "💬 Descrição", value: descricao },
      ],
      timestamp: new Date().toISOString(),
    }

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    })

    // registra o timestamp para cooldown
    cooldownMap.set(session.user.email, { lastSent: now })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Erro ao enviar webhook de suporte:", err)
    return NextResponse.json({ error: "Falha ao comunicar com o Discord" }, { status: 500 })
  }
}
