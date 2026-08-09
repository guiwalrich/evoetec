// prisma/seed.ts
import "dotenv/config"
import { PrismaClient, Role } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const connectionString = process.env.DATABASE_URL || "postgresql://usuario:senha@localhost:5432/solutec_erp?schema=public"
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Iniciando o Seed do Evo Etec ERP...")

  const agora = new Date()
  const trialVenceEm = new Date()
  trialVenceEm.setDate(agora.getDate() + 14)

  // 1. Criar Empresa de Exemplo / Homologação
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
  console.log(`✅ Empresa criada/atualizada: ${empresa.nomeFantasia} (ID: ${empresa.id})`)

  // 2. Senha Hash para Testes (admin123)
  const senhaHash = await bcrypt.hash("admin123", 10)

  // 3. Criar Usuário Admin Lucas Oliveira
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
      role: Role.ADMIN,
      empresaId: empresa.id,
    },
  })
  console.log(`✅ Usuário Lucas Oliveira criado/atualizado: ${lucas.email} (Senha: admin123)`)

  // 4. Criar Usuário Admin Solutec
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
      role: Role.ADMIN,
      empresaId: empresa.id,
    },
  })
  console.log(`✅ Usuário Admin Solutec criado/atualizado: ${admin.email} (Senha: admin123)`)
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o Seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
