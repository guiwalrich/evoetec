// src/app/api/vendas/[id]/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withTenant } from "@/lib/tenant"

// GET: Buscar detalhes da venda (para comprovante/PDF)
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

    const venda = await prisma.venda.findFirst({
      where: tenant.whereTenant({ id }),
      include: {
        cliente: true,
        vendedor: { select: { id: true, nome: true } },
        itens: { include: { produto: true } },
        pagamentos: true,
      },
    })

    if (!venda) {
      return NextResponse.json({ message: "Venda não encontrada" }, { status: 404 })
    }

    return NextResponse.json(venda)
  } catch (error) {
    console.error("Erro ao buscar detalhes da venda:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
