// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

function getDbConnectionString(): string {
  const url = process.env.DATABASE_URL
  if (!url || url.includes("usuario:senha")) {
    // Tenta fallback para variavel do Neon se definida
    return process.env.POSTGRES_URL || "postgresql://neondb_owner:npg_sfT0eguqEK8l@ep-broad-violet-ayjldmv7-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"
  }
  return url
}

const connectionString = getDbConnectionString()
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

