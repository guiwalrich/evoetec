// src/validators/cliente.ts
import { z } from "zod"

export const clienteSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  cpfCnpj: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  endereco: z.string().optional().nullable(),
})

export type ClienteInput = z.infer<typeof clienteSchema>
