// src/app/api/empresa/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id: session.user.empresaId },
    })

    return NextResponse.json(empresa)
  } catch (error) {
    console.error("Erro ao buscar dados da empresa:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { nomeFantasia, razaoSocial, cnpj, telefone, endereco } = body

    const empresa = await prisma.empresa.update({
      where: { id: session.user.empresaId },
      data: {
        nomeFantasia,
        razaoSocial,
        cnpj,
        telefone,
        endereco,
      },
    })

    return NextResponse.json(empresa)
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error)
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 })
  }
}
