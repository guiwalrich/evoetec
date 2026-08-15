// scratch/seed_dono.ts
import { prisma } from "../src/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  const email = "dono@evoetec.com.br"
  const senhaPura = "dono123456"
  const senhaHash = await bcrypt.hash(senhaPura, 10)

  // 1. Criar ou buscar empresa do dono
  let empresa = await prisma.empresa.findFirst({
    where: { nomeFantasia: "Assistência Técnica Evo Etec (Dono)" },
  })

  if (!empresa) {
    empresa = await prisma.empresa.create({
      data: {
        nomeFantasia: "Assistência Técnica Evo Etec (Dono)",
        razaoSocial: "Evo Etec Gestão & Tecnologia LTDA",
        cnpj: "00.000.000/0001-99",
        telefone: "(11) 99999-9999",
        endereco: "Av. Paulista, 1000 - São Paulo, SP",
        statusAssinatura: "ATIVO",
      },
    })
    console.log("Empresa criada com sucesso:", empresa.id)
  }

  // 2. Criar ou atualizar usuário Dono
  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: {
      nome: "Dono Evo Etec",
      senha: senhaHash,
      role: "ADMIN",
      emailVerificado: true,
      avatarId: 1,
      empresaId: empresa.id,
    },
    create: {
      nome: "Dono Evo Etec",
      email,
      senha: senhaHash,
      role: "ADMIN",
      emailVerificado: true,
      avatarId: 1,
      empresaId: empresa.id,
    },
  })

  console.log("-----------------------------------------")
  console.log("✅ CREDENCIAL DE DONO CRIADA COM SUCESSO!")
  console.log("E-mail: ", usuario.email)
  console.log("Senha:  ", senhaPura)
  console.log("Empresa:", empresa.nomeFantasia)
  console.log("Status: ", empresa.statusAssinatura)
  console.log("-----------------------------------------")
}

main()
  .catch((e) => {
    console.error("Erro ao criar credencial:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
