// src/validators/financeiro.ts
import { z } from "zod"
import { TipoConta, CategoriaConta, StatusConta } from "@prisma/client"

export const contaFinanceiraSchema = z.object({
  descricao: z.string().min(2, "Descrição é obrigatória"),
  valor: z.number().positive("Valor deve ser maior que zero"),
  tipo: z.nativeEnum(TipoConta),
  categoria: z.nativeEnum(CategoriaConta),
  dataVencimento: z.string().min(1, "Data de vencimento é obrigatória"),
  dataPagamento: z.string().optional().nullable(),
  status: z.nativeEnum(StatusConta).default(StatusConta.PENDENTE),
  vendaId: z.string().optional().nullable(),
  ordemServicoId: z.string().optional().nullable(),
  fornecedorId: z.string().optional().nullable(),
})

export type ContaFinanceiraInput = z.infer<typeof contaFinanceiraSchema>
