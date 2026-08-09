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
