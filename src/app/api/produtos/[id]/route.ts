// src/app/api/produtos/[id]/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withTenant } from "@/lib/tenant"
import { produtoSchema } from "@/validators/produto"

// PUT: Atualizar produto
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
    const parsed = produtoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const tenant = withTenant(session.user.empresaId)

    const produtoExistente = await prisma.produto.findFirst({
      where: tenant.whereTenant({ id }),
    })

    if (!produtoExistente) {
      return NextResponse.json({ message: "Produto não encontrado" }, { status: 404 })
    }

    const data = parsed.data
    let finalCategoriaId = data.categoriaId

    // Lógica para processar Categoria por Nome
    if (data.categoriaNome && data.categoriaNome.trim()) {
      const nomeLimpo = data.categoriaNome.trim()
      // 1. Procurar categoria existente (Ignorando case-sensitive)
      const categoriaExistente = await prisma.categoria.findFirst({
        where: tenant.whereTenant({
          nome: { equals: nomeLimpo, mode: "insensitive" },
          deletedAt: null,
        }),
      })

      if (categoriaExistente) {
        finalCategoriaId = categoriaExistente.id
      } else {
        // 2. Criar nova categoria caso não exista
        const novaCategoria = await prisma.categoria.create({
          data: tenant.dataTenant({
            nome: nomeLimpo,
            ordem: 0,
          }),
        })
        finalCategoriaId = novaCategoria.id
      }
    }

    const { categoriaNome, ...prismaData } = data

    const produto = await prisma.produto.update({
      where: { id },
      data: {
        ...prismaData,
        categoriaId: finalCategoriaId || null,
      },
    })

    return NextResponse.json(produto)
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}

// DELETE: Soft delete do produto
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

    const produtoExistente = await prisma.produto.findFirst({
      where: tenant.whereTenant({ id }),
    })

    if (!produtoExistente) {
      return NextResponse.json({ message: "Produto não encontrado" }, { status: 404 })
    }

    await prisma.produto.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "Produto removido com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar produto:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
