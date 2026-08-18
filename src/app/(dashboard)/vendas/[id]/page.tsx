// src/app/(dashboard)/vendas/[id]/page.tsx
"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Printer,
  Loader2,
  CheckCircle2
} from "lucide-react"

interface VendaDetalhe {
  id: string
  numero: string
  subtotal: number
  desconto: number
  valorTotal: number
  dataVenda: string
  empresa?: {
    nomeFantasia: string
    cnpj?: string | null
    telefone?: string | null
    endereco?: string | null
  }
  cliente: { nome: string; cpfCnpj?: string | null } | null
  vendedor: { nome: string } | null
  itens: Array<{
    id: string
    quantidade: number
    valorUnitario: number
    valorTotal: number
    produto: { nome: string }
  }>
  pagamentos: Array<{
    formaPagamento: string
    valor: number
  }>
}

export default function DetalheVendaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [venda, setVenda] = useState<VendaDetalhe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarVenda() {
      try {
        const res = await fetch(`/api/vendas/${id}`)
        if (res.ok) {
          const json = await res.json()
          setVenda(json)
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes da venda:", err)
      } finally {
        setLoading(false)
      }
    }
    carregarVenda()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
      </div>
    )
  }

  if (!venda) {
    return (
      <div className="text-center py-12 text-slate-400">
        Venda não encontrada.
      </div>
    )
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* 📄 COMPROVANTE OFICIAL DE IMPRESSÃO DE VENDA (CUPOM DE BALCÃO)            */}
      {/* ========================================================================= */}
      <div className="hidden print:block font-sans text-black p-4 max-w-2xl mx-auto space-y-4 bg-white">
        {/* Cabeçalho da Loja */}
        <div className="text-center border-b border-zinc-900 pb-3">
          <img src="/assets/wrldevotec.webp" alt="Logo Loja" className="w-10 h-10 object-contain mx-auto mb-1" />
          <h1 className="text-base font-black uppercase text-black">
            {venda.empresa?.nomeFantasia || "Evo Etec ERP - Assistência Técnica"}
          </h1>
          {venda.empresa?.cnpj && <p className="text-[10px] text-zinc-700 font-mono">CNPJ: {venda.empresa.cnpj}</p>}
          {venda.empresa?.telefone && <p className="text-[10px] text-zinc-700">Tel: {venda.empresa.telefone}</p>}
          {venda.empresa?.endereco && <p className="text-[10px] text-zinc-700">{venda.empresa.endereco}</p>}
        </div>

        {/* Informações do Comprovante */}
        <div className="border-b border-zinc-300 pb-2 text-xs flex justify-between">
          <div>
            <p><strong>Comprovante Nº:</strong> <span className="font-mono font-bold">{venda.numero}</span></p>
            <p><strong>Cliente:</strong> {venda.cliente?.nome || "Consumidor Final"}</p>
          </div>
          <div className="text-right">
            <p><strong>Data:</strong> {new Date(venda.dataVenda).toLocaleString("pt-BR")}</p>
            <p><strong>Vendedor:</strong> {venda.vendedor?.nome || "Balcão"}</p>
          </div>
        </div>

        {/* Tabela de Itens */}
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-900 text-[10px] uppercase text-zinc-600">
              <th className="py-1">Item / Produto</th>
              <th className="py-1 text-center">Qtd</th>
              <th className="py-1 text-right">Unitário</th>
              <th className="py-1 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-[11px]">
            {venda.itens.map((item) => (
              <tr key={item.id}>
                <td className="py-1.5 font-medium">{item.produto.nome}</td>
                <td className="py-1.5 text-center font-mono">{item.quantidade}</td>
                <td className="py-1.5 text-right font-mono">R$ {Number(item.valorUnitario).toFixed(2)}</td>
                <td className="py-1.5 text-right font-mono font-bold">R$ {Number(item.valorTotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totais e Pagamentos */}
        <div className="border-t-2 border-zinc-900 pt-3 text-xs space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-mono">R$ {Number(venda.subtotal).toFixed(2)}</span>
          </div>
          {Number(venda.desconto) > 0 && (
            <div className="flex justify-between text-red-700">
              <span>Desconto Aplicado:</span>
              <span className="font-mono">- R$ {Number(venda.desconto).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black pt-1 border-t border-zinc-300">
            <span>VALOR TOTAL PAGO:</span>
            <span className="font-mono font-black text-black">R$ {Number(venda.valorTotal).toFixed(2)}</span>
          </div>
        </div>

        {/* Rodapé do Comprovante */}
        <div className="text-center text-[10px] text-zinc-500 pt-4 border-t border-zinc-200">
          <p>Obrigado pela preferência!</p>
          <p className="font-mono">Evo Etec ERP — Sistema de Gestão para Assistências Técnicas</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 💻 INTERFACE DE TELA (PRINT:HIDDEN)                                      */}
      {/* ========================================================================= */}
      <div className="max-w-3xl mx-auto space-y-6 print:hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/vendas"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span>{venda.numero}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Concluída
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Realizada em {new Date(venda.dataVenda).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-4 py-2.5 rounded-xl transition-all text-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Cupom</span>
          </button>
        </div>

        {/* Card do Comprovante de Venda */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4 text-center">
            <h2 className="text-lg font-bold text-white">Evo Etec ERP — Comprovante de Venda</h2>
            <p className="text-xs text-slate-400 mt-1">Venda Nº {venda.numero}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-500 block">Cliente:</span>
              <span className="font-semibold text-white">{venda.cliente?.nome || "Cliente Não Identificado"}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Vendedor:</span>
              <span className="font-semibold text-white">{venda.vendedor?.nome || "Sistema"}</span>
            </div>
          </div>

          {/* Tabela de Itens */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-2">
              Itens da Venda
            </span>
            {venda.itens.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-800/40">
                <div>
                  <span className="text-white font-medium block">{item.produto.nome}</span>
                  <span className="text-xs text-slate-400">
                    {item.quantidade}x R$ {Number(item.valorUnitario).toFixed(2)}
                  </span>
                </div>
                <span className="font-bold text-white font-mono">
                  R$ {Number(item.valorTotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Valores Totais */}
          <div className="pt-4 border-t border-slate-800 space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span>R$ {Number(venda.subtotal).toFixed(2)}</span>
            </div>
            {Number(venda.desconto) > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Desconto:</span>
                <span>- R$ {Number(venda.desconto).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-white pt-2 border-t border-slate-800">
              <span>Valor Total Pago:</span>
              <span className="text-emerald-400">R$ {Number(venda.valorTotal).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
