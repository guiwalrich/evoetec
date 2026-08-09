// src/app/api/notificacoes/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.empresaId) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const empresaId = session.user.empresaId

    // 1. Produtos com Estoque Crítico
    const produtosEstoqueBaixo = await prisma.produto.findMany({
      where: {
        empresaId,
        deletedAt: null,
        status: "ATIVO",
      },
      select: {
        id: true,
        nome: true,
        quantidadeEstoque: true,
        estoqueMinimo: true,
      },
    })

    const alertasEstoque = produtosEstoqueBaixo
      .filter((p) => p.quantidadeEstoque <= p.estoqueMinimo)
      .map((p) => ({
        id: `estoque-${p.id}`,
        tipo: "ESTOQUE",
        titulo: "Estoque Baixo",
        mensagem: `O produto "${p.nome}" está com apenas ${p.quantidadeEstoque} un. em estoque (Mínimo: ${p.estoqueMinimo}).`,
        href: "/produtos",
        prioridade: "ALTA",
      }))

    // 2. OS Abertas ou Aguardando Peça
    const osPendentes = await prisma.ordemServico.findMany({
      where: {
        empresaId,
        deletedAt: null,
        status: { in: ["ABERTA", "AGUARDANDO_PECA"] },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        numero: true,
        dispositivo: true,
        status: true,
        cliente: { select: { nome: true } },
      },
    })

    const alertasOS = osPendentes.map((os) => ({
      id: `os-${os.id}`,
      tipo: "OS",
      titulo: os.status === "AGUARDANDO_PECA" ? "OS Aguardando Peça" : "Nova OS Aberta",
      mensagem: `OS #${os.numero} (${os.dispositivo}) do cliente ${os.cliente.nome}.`,
      href: `/ordens-servico/${os.id}`,
      prioridade: "MEDIA",
    }))

    // 3. Contas Financeiras Pendentes
    const contasPendentes = await prisma.contaFinanceira.findMany({
      where: {
        empresaId,
        deletedAt: null,
        status: "PENDENTE",
      },
      take: 5,
      orderBy: { dataVencimento: "asc" },
      select: {
        id: true,
        descricao: true,
        valor: true,
        dataVencimento: true,
      },
    })

    const alertasFinanceiros = contasPendentes.map((c) => ({
      id: `financeiro-${c.id}`,
      tipo: "FINANCEIRO",
      titulo: "Conta a Vencer/Pendente",
      mensagem: `Lançamento "${c.descricao}" de R$ ${Number(c.valor).toFixed(2)} vence em ${new Date(c.dataVencimento).toLocaleDateString("pt-BR")}.`,
      href: "/financeiro",
      prioridade: "MEDIA",
    }))

    const todas = [...alertasEstoque, ...alertasOS, ...alertasFinanceiros]

    return NextResponse.json({
      total: todas.length,
      notificacoes: todas,
    })
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
