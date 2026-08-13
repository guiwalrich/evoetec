// src/lib/discordAudit.ts
export async function sendAudit(embed: any) {
  const url = process.env.DISCORD_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_AUDITORIA_URL
  if (!url) return
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    })
  } catch (err) {
    console.error("Erro ao enviar audit do Discord:", err)
  }
}
