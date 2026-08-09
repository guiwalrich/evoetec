// src/validators/fornecedor.ts
import { z } from "zod"

export const fornecedorSchema = z.object({
  nome: z.string().min(2, "Nome do fornecedor é obrigatório"),
  cpfCnpj: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  endereco: z.string().optional().nullable(),
})

export type FornecedorInput = z.infer<typeof fornecedorSchema>
