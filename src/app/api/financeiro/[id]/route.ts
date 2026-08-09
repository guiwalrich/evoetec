// src/app/api/financeiro/[id]/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withTenant } from "@/lib/tenant"
import { contaFinanceiraSchema } from "@/validators/financeiro"

// PUT: Atualizar lançamento ou dar baixa (Marcar como PAGO)
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
    const parsed = contaFinanceiraSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const tenant = withTenant(session.user.empresaId)
    const data = parsed.data

    const contaExistente = await prisma.contaFinanceira.findFirst({
      where: tenant.whereTenant({ id }),
    })

    if (!contaExistente) {
      return NextResponse.json({ message: "Lançamento não encontrado" }, { status: 404 })
    }

    const conta = await prisma.contaFinanceira.update({
      where: { id },
      data: {
        descricao: data.descricao,
        valor: data.valor,
        tipo: data.tipo,
        categoria: data.categoria,
        dataVencimento: new Date(data.dataVencimento),
        dataPagamento: data.dataPagamento ? new Date(data.dataPagamento) : null,
        status: data.status,
        fornecedorId: data.fornecedorId || null,
      },
    })

    return NextResponse.json(conta)
  } catch (error) {
    console.error("Erro ao atualizar lançamento financeiro:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}

// DELETE: Soft delete de lançamento financeiro
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

    const contaExistente = await prisma.contaFinanceira.findFirst({
      where: tenant.whereTenant({ id }),
    })

    if (!contaExistente) {
      return NextResponse.json({ message: "Lançamento não encontrado" }, { status: 404 })
    }

    await prisma.contaFinanceira.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "Lançamento removido com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar lançamento financeiro:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
