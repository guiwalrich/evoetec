// src/app/api/ordens-servico/[id]/remover/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Função utilitária para enviar embed ao Discord (auditoria de remoção de OS)
async function sendOsRemovalAudit(embed: any) {
  const url =
    process.env.DISCORD_WEBHOOK_OS_REMOVE_URL ||
    process.env.DISCORD_WEBHOOK_AUDITORIA_URL ||
    process.env.DISCORD_WEBHOOK_URL
  if (!url) {
    console.warn("DISCORD_WEBHOOK_OS_REMOVE_URL não configurado")
    return
  }
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    })
  } catch (err) {
    console.error("Erro ao enviar auditoria do Discord:", err)
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const role = (session.user.role || "").toUpperCase()
    if (!role.includes("ADMIN")) {
      return NextResponse.json({ error: "Permissão insuficiente" }, { status: 403 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const os = await prisma.ordemServico.findFirst({
      where: {
        id,
        ...(session.user.empresaId ? { empresaId: session.user.empresaId } : {}),
      },
      include: {
        contasFinanceiras: true,
        empresa: { select: { nomeFantasia: true } },
      },
    })

    if (!os) {
      return NextResponse.json({ error: "OS não encontrada" }, { status: 404 })
    }

    // Regras de status permitido
    const permitido = ["ABERTA", "CANCELADA"]
    if (!permitido.includes(os.status)) {
      return NextResponse.json(
        { error: `OS no status ${os.status} não pode ser removida` },
        { status: 400 }
      )
    }

    // Verifica contas financeiras vinculadas
    if (os.contasFinanceiras?.length) {
      const temPagas = os.contasFinanceiras.some((c) => c.status === "PAGO")
      if (temPagas) {
        return NextResponse.json(
          { error: "Esta OS possui contas financeiras pagas e não pode ser removida." },
          { status: 400 }
        )
      }

      // Soft-delete das contas pendentes
      await prisma.contaFinanceira.updateMany({
        where: { ordemServicoId: os.id, status: "PENDENTE" },
        data: { deletedAt: new Date() },
      })
    }

    // Soft-delete da OS
    await prisma.ordemServico.update({
      where: { id: os.id },
      data: { deletedAt: new Date() },
    })

    // Auditoria no Discord
    const nomeEmpresa = os.empresa?.nomeFantasia || session.user.empresaId || "Desconhecida"
    const embed = {
      title: "🗑️ OS REMOVIDA",
      color: 0xff4444,
      fields: [
        { name: "🏢 Empresa", value: nomeEmpresa, inline: true },
        { name: "🔢 OS Nº", value: os.numero ? `#${os.numero}` : String(os.id), inline: true },
        {
          name: "👤 Removida por",
          value: `${session.user.name ?? "Anon"} (${session.user.email})`,
          inline: true,
        },
        { name: "🕐 Data", value: new Date().toLocaleString("pt-BR"), inline: true },
      ],
      timestamp: new Date().toISOString(),
    }
    await sendOsRemovalAudit(embed)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro ao remover OS:", error)
    return NextResponse.json(
      { error: error.message || "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
