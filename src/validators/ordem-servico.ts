// src/validators/ordem-servico.ts
import { z } from "zod"
import { StatusOS, FormaPagamento } from "@prisma/client"

export const osPagamentoSchema = z.object({
  formaPagamento: z.nativeEnum(FormaPagamento),
  valor: z.number().positive("Valor deve ser maior que zero"),
  parcelas: z.number().int().min(1).max(12).default(1),
})

export const ordemServicoSchema = z.object({
  clienteId: z.string().min(1, "Cliente é obrigatório"),
  tecnicoId: z.string().optional().nullable(),
  dispositivo: z.string().min(1, "Dispositivo é obrigatório (ex: Celular, Tablet)"),
  marca: z.string().optional().nullable(),
  modelo: z.string().optional().nullable(),
  imei: z.string().optional().nullable(),
  defeitoRelatado: z.string().min(3, "Defeito relatado é obrigatório"),
  diagnostico: z.string().optional().nullable(),
  solucao: z.string().optional().nullable(),
  valorServico: z.number().min(0, "Valor do serviço inválido").default(0),
  valorPecas: z.number().min(0, "Valor das peças inválido").default(0),
  status: z.nativeEnum(StatusOS).default(StatusOS.ABERTA),
  garantiaDias: z.number().int().min(0).default(90),
  observacoes: z.string().optional().nullable(),
  pagamentos: z.array(osPagamentoSchema).optional(),
})

export type OrdemServicoInput = z.infer<typeof ordemServicoSchema>
