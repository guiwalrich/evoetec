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
  cliente: { nome: string } | null
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
    <div className="max-w-3xl mx-auto space-y-6">
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
          className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-4 py-2.5 rounded-xl transition-all text-sm"
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
              <span className="font-bold text-white">R$ {Number(item.valorTotal).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Formas de Pagamento */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Forma(s) de Pagamento
          </span>
          {venda.pagamentos.map((p, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
              <span>{p.formaPagamento}</span>
              <span className="font-bold text-emerald-400">R$ {Number(p.valor).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Totais */}
        <div className="pt-4 border-t border-slate-800 text-right space-y-1">
          <div className="text-xs text-slate-400">Subtotal: R$ {Number(venda.subtotal).toFixed(2)}</div>
          {Number(venda.desconto) > 0 && (
            <div className="text-xs text-emerald-400">Desconto: -R$ {Number(venda.desconto).toFixed(2)}</div>
          )}
          <div className="text-xl font-extrabold text-white pt-2">
            Total Pago: R$ {Number(venda.valorTotal).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}
