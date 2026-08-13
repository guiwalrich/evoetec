// src/validators/produto.ts
import { z } from "zod"
import { StatusProduto } from "@prisma/client"

export const produtoSchema = z.object({
  nome: z.string().min(2, "Nome do produto é obrigatório"),
  descricao: z.string().optional().nullable(),
  codigoBarras: z.string().optional().nullable(),
  precoCompra: z.number().min(0, "Preço de compra deve ser maior ou igual a zero"),
  precoVenda: z.number().positive("Preço de venda deve ser maior que zero"),
  quantidadeEstoque: z.number().int().min(0).default(0),
  estoqueMinimo: z.number().int().min(0).default(1),
  status: z.nativeEnum(StatusProduto).default(StatusProduto.ATIVO),
  imagemUrl: z.string().optional().nullable(),
  categoriaId: z.string().optional().nullable(),
  categoriaNome: z.string().optional().nullable(),
  fornecedorId: z.string().optional().nullable(),
})

export type ProdutoInput = z.infer<typeof produtoSchema>
