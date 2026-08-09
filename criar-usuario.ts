// criar-usuario.ts
import "dotenv/config"
import { prisma } from "./src/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  console.log("🌱 Iniciando criação do usuário de homologação Lucas Oliveira...")

  // 1. Criar Empresa de Testes
  const empresa = await prisma.empresa.upsert({
    where: { cnpj: "11111111000199" },
    update: {
      statusAssinatura: "TRIAL",
      trialIniciadoEm: new Date(),
      trialVenceEm: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    create: {
      nomeFantasia: "Assistência Oliveira Tech",
      cnpj: "11111111000199",
      statusAssinatura: "TRIAL",
      trialIniciadoEm: new Date(),
      trialVenceEm: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 dias
    },
  })

  // 2. Criar Senha Hash (lucas123)
  const senhaHash = await bcrypt.hash("lucas123", 10)

  // 3. Criar Usuário do Lucas
  const usuario = await prisma.usuario.upsert({
    where: { email: "loliveira1862@gmail.com" },
    update: {
      nome: "Lucas Oliveira",
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

  console.log("==========================================")
  console.log("✅ USUÁRIO CRIADO COM SUCESSO NO BANCO!")
  console.log("==========================================")
  console.log(`Empresa: ${empresa.nomeFantasia} (ID: ${empresa.id})`)
  console.log(`Status Assinatura: ${empresa.statusAssinatura}`)
  console.log(`Trial Vence Em: ${empresa.trialVenceEm?.toLocaleDateString("pt-BR")}`)
  console.log(`Usuário: ${usuario.nome}`)
  console.log(`E-mail: ${usuario.email}`)
  console.log(`Senha Temporária: lucas123`)
  console.log("==========================================")
}

main()
  .catch((err) => {
    console.error("❌ Erro ao criar usuário:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
