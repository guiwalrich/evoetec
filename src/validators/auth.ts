// src/validators/auth.ts
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
})

export const esqueciSenhaSchema = z.object({
  email: z.string().email("E-mail inválido"),
})

export const redefinirSenhaSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  senha: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
  confirmarSenha: z.string().min(6, "Confirmação de senha é obrigatória"),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
})

export type LoginInput = z.infer<typeof loginSchema>
export type EsqueciSenhaInput = z.infer<typeof esqueciSenhaSchema>
export type RedefinirSenhaInput = z.infer<typeof redefinirSenhaSchema>
