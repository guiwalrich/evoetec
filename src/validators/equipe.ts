// src/validators/equipe.ts
import { z } from "zod"
import { Role } from "@prisma/client"

export const membroEquipeSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  role: z.nativeEnum(Role).default(Role.TECNICO),
})

export type MembroEquipeInput = z.infer<typeof membroEquipeSchema>
