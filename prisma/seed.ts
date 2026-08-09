// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const connectionString = process.env.DATABASE_URL || "postgresql://usuario:senha@localhost:5432/solutec_erp?schema=public"
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Iniciando o Seed do Solutec ERP...")

  // 1. Criar Empresa de Exemplo
  const empresa = await prisma.empresa.upsert({
    where: { cnpj: "00000000000191" },
    update: {},
    create: {
      nomeFantasia: "Assistência Solutec Tech",
      razaoSocial: "Solutec Tecnologia LTDA",
      cnpj: "00000000000191",
      telefone: "(11) 99999-8888",
      endereco: "Rua da Assistência, 100 - Centro",
    },
  })
  console.log(`✅ Empresa criada/encontrada: ${empresa.nomeFantasia} (ID: ${empresa.id})`)

  // 2. Criar Usuário Admin Padrão
  const senhaHash = await bcrypt.hash("admin123", 10)
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@solutec.com" },
    update: {},
    create: {
      nome: "Administrador Solutec",
      email: "admin@solutec.com",
      senha: senhaHash,
      role: Role.ADMIN,
      empresaId: empresa.id,
    },
  })
  console.log(`✅ Usuário Admin criado: ${admin.email} (Senha: admin123)`)
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o Seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
