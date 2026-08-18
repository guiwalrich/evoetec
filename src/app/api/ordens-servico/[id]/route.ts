// src/app/api/ordens-servico/[id]/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withTenant } from "@/lib/tenant"
import { ordemServicoSchema } from "@/validators/ordem-servico"

// GET: Buscar detalhes completos de uma OS
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const tenant = withTenant(session.user.empresaId)

    const os = await prisma.ordemServico.findFirst({
      where: tenant.whereTenant({ id }),
      include: {
        empresa: true,
        cliente: true,
        tecnico: { select: { id: true, nome: true, email: true } },
        itens: { include: { produto: true } },
        historicos: {
          include: { usuario: { select: { nome: true } } },
          orderBy: { criadoEm: "desc" },
        },
        imagens: true,
        pagamentos: true,
      },
    })

    if (!os) {
      return NextResponse.json({ message: "Ordem de Serviço não encontrada" }, { status: 404 })
    }

    return NextResponse.json(os)
  } catch (error) {
    console.error("Erro ao buscar detalhes da OS:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}

// PUT: Atualizar OS e registrar mudança de status no Histórico
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const parsed = ordemServicoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const tenant = withTenant(session.user.empresaId)
    const data = parsed.data

    const osExistente = await prisma.ordemServico.findFirst({
      where: tenant.whereTenant({ id }),
    })

    if (!osExistente) {
      return NextResponse.json({ message: "Ordem de Serviço não encontrada" }, { status: 404 })
    }

    const valorTotal = data.valorServico + data.valorPecas
    const statusMudou = osExistente.status !== data.status

    const osAtualizada = await prisma.$transaction(async (tx) => {
      const os = await tx.ordemServico.update({
        where: { id },
        data: {
          clienteId: data.clienteId,
          tecnicoId: data.tecnicoId || null,
          dispositivo: data.dispositivo,
          marca: data.marca || null,
          modelo: data.modelo || null,
          imei: data.imei || null,
          defeitoRelatado: data.defeitoRelatado,
          diagnostico: data.diagnostico || null,
          solucao: data.solucao || null,
          valorServico: data.valorServico,
          valorPecas: data.valorPecas,
          valorTotal,
          status: data.status,
          garantiaDias: data.garantiaDias,
          observacoes: data.observacoes || null,
          ...(data.status === "CONCLUIDA" && !osExistente.dataConclusao
            ? { dataConclusao: new Date() }
            : {}),
        },
      })

      // Se o status mudou, insere no Histórico
      if (statusMudou) {
        await tx.oSHistorico.create({
          data: {
            ordemServicoId: id,
            usuarioId: session.user.id,
            statusAnterior: osExistente.status,
            statusNovo: data.status,
            observacao: `Status alterado de ${osExistente.status} para ${data.status}.`,
          },
        })
      }

      return os
    })

    return NextResponse.json(osAtualizada)
  } catch (error) {
    console.error("Erro ao atualizar Ordem de Serviço:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}

// DELETE: Soft Delete da OS
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const tenant = withTenant(session.user.empresaId)

    const osExistente = await prisma.ordemServico.findFirst({
      where: tenant.whereTenant({ id }),
    })

    if (!osExistente) {
      return NextResponse.json({ message: "Ordem de Serviço não encontrada" }, { status: 404 })
    }

    await prisma.ordemServico.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "Ordem de Serviço excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir OS:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
