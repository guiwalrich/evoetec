// src/app/api/equipe/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withTenant } from "@/lib/tenant"
import { membroEquipeSchema } from "@/validators/equipe"
import bcrypt from "bcryptjs"

// GET: Listar colaboradores da empresa
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const tenant = withTenant(session.user.empresaId)

    const membros = await prisma.usuario.findMany({
      where: tenant.whereTenant(),
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            ordensServicoTecnico: true,
            vendasVendedor: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(membros)
  } catch (error) {
    console.error("Erro ao listar equipe:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}

// POST: Cadastrar novo colaborador na empresa
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Apenas administradores podem cadastrar colaboradores." },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = membroEquipeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { nome, email, senha, role } = parsed.data

    // Verificar e-mail duplicado
    const emailExistente = await prisma.usuario.findUnique({ where: { email } })
    if (emailExistente) {
      return NextResponse.json(
        { message: "Este e-mail já está em uso por outro usuário." },
        { status: 400 }
      )
    }

    const senhaHash = await bcrypt.hash(senha, 10)
    const tenant = withTenant(session.user.empresaId)

    const novoMembro = await prisma.usuario.create({
      data: tenant.dataTenant({
        nome,
        email,
        senha: senhaHash,
        role,
      }),
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(novoMembro, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar membro da equipe:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
