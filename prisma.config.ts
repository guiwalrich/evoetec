import { defineConfig } from "prisma/config";

// Tenta carregar .env em ambiente local se disponível
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv/config");
} catch {
  // Em produção (Render/Vercel), process.env já é injetado pelo ambiente
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
