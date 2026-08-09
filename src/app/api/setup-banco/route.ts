// src/app/api/setup-banco/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const agora = new Date()
    const trialVenceEm = new Date()
    trialVenceEm.setDate(agora.getDate() + 14)

    // 1. Criar/Garantir Empresa
    const empresa = await prisma.empresa.upsert({
      where: { cnpj: "00000000000191" },
      update: {
        statusAssinatura: "TRIAL",
        trialIniciadoEm: agora,
        trialVenceEm: trialVenceEm,
      },
      create: {
        nomeFantasia: "Assistência Oliveira Tech",
        razaoSocial: "Oliveira Tecnologia LTDA",
        cnpj: "00000000000191",
        telefone: "(11) 99999-8888",
        endereco: "Rua da Assistência, 100 - Centro",
        statusAssinatura: "TRIAL",
        trialIniciadoEm: agora,
        trialVenceEm: trialVenceEm,
      },
    })

    // 2. Hash da Senha de Teste (admin123)
    const senhaHash = await bcrypt.hash("admin123", 10)

    // 3. Criar/Garantir Usuário Lucas Oliveira
    const lucas = await prisma.usuario.upsert({
      where: { email: "loliveira1862@gmail.com" },
      update: {
        senha: senhaHash,
        empresaId: empresa.id,
        deletedAt: null,
      },
      create: {
        nome: "Lucas Oliveira",
        email: "loliveira1862@gmail.com",
        senha: senhaHash,
        role: "ADMIN",
        empresaId: empresa.id,
      },
    })

    // 4. Criar/Garantir Usuário Admin Solutec
    const admin = await prisma.usuario.upsert({
      where: { email: "admin@solutec.com" },
      update: {
        senha: senhaHash,
        empresaId: empresa.id,
        deletedAt: null,
      },
      create: {
        nome: "Administrador Evo Etec",
        email: "admin@solutec.com",
        senha: senhaHash,
        role: "ADMIN",
        empresaId: empresa.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Banco de dados em nuvem inicializado com sucesso!",
      empresa: empresa.nomeFantasia,
      trialVenceEm: trialVenceEm.toLocaleDateString("pt-BR"),
      usuariosCadastrados: [
        { email: lucas.email, senhaPadrao: "admin123" },
        { email: admin.email, senhaPadrao: "admin123" },
      ],
    })
  } catch (error: any) {
    console.error("Erro ao inicializar banco de dados:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Falha ao inicializar o banco de dados",
        error: error.message || String(error),
      },
      { status: 500 }
    )
  }
}
