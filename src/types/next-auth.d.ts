// src/types/next-auth.d.ts
import { Role } from "@prisma/client"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      empresaId: string
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
    empresaId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    empresaId: string
  }
}
