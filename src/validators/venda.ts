// src/validators/venda.ts
import { z } from "zod"
import { FormaPagamento, StatusVenda } from "@prisma/client"

export const vendaItemSchema = z.object({
  produtoId: z.string().min(1, "Produto é obrigatório"),
  quantidade: z.number().int().positive("Quantidade deve ser maior que zero"),
  valorUnitario: z.number().positive("Valor unitário inválido"),
  desconto: z.number().min(0).default(0),
})

export const vendaPagamentoSchema = z.object({
  formaPagamento: z.nativeEnum(FormaPagamento),
  valor: z.number().positive("Valor do pagamento inválido"),
  parcelas: z.number().int().min(1).max(12).default(1),
})

export const vendaSchema = z.object({
  clienteId: z.string().optional().nullable(),
  desconto: z.number().min(0).default(0),
  status: z.nativeEnum(StatusVenda).default(StatusVenda.CONCLUIDA),
  itens: z.array(vendaItemSchema).min(1, "A venda deve conter pelo menos 1 item"),
  pagamentos: z.array(vendaPagamentoSchema).min(1, "A venda deve conter pelo menos 1 forma de pagamento"),
})

export type VendaInput = z.infer<typeof vendaSchema>
