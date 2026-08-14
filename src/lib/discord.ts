// src/lib/discord.ts
export async function sendDiscordNotification(title: string, message: string, color: number = 3447003) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl || webhookUrl.includes("SEU_ID")) {
    console.warn("DISCORD_WEBHOOK_URL não configurado ou contendo valor padrão.");
    return;
  }
  const payload = {
    embeds: [
      {
        title: title,
        description: message,
        color: color,
        timestamp: new Date().toISOString(),
      }
    ]
  };
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Erro ao enviar notificação para o Discord:", error);
  }
}

export async function enviarAlertaCadastro(
  empresa: string,
  responsavel: string,
  email: string,
  whatsapp: string,
  trialAte: Date
) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_CADASTROS_URL || process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl.includes("SEU_ID")) return;

  const embed = {
    title: "🎉 NOVO TESTE VERIFICADO (TRIAL 14 DIAS)!",
    color: 0x10b981, // Verde Esmeralda
    fields: [
      { name: "🏢 Assistência", value: empresa, inline: true },
      { name: "👤 Responsável", value: responsavel, inline: true },
      { name: "📧 E-mail", value: `${email} (Verificado ✅)`, inline: false },
      { name: "📞 WhatsApp", value: whatsapp || "Não informado", inline: true },
      { name: "📅 Trial Válido Até", value: trialAte.toLocaleDateString("pt-BR"), inline: true },
    ],
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (err) {
    console.error("Erro ao enviar alerta de cadastro para o Discord:", err);
  }
}
