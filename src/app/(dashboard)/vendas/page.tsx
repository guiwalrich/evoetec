// src/app/(dashboard)/vendas/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ShoppingCart,
  Search,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react"

interface VendaItem {
  id: string
  numero: string
  valorTotal: number
  dataVenda: string
  cliente: { nome: string } | null
  vendedor: { nome: string } | null
}

export default function VendasPage() {
  const [vendas, setVendas] = useState<VendaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const carregarVendas = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/vendas?busca=${encodeURIComponent(busca)}&page=${page}&limit=10`)
      const json = await res.json()
      if (res.ok) {
        setVendas(json.data)
        setTotalPages(json.pagination.totalPages)
        setTotal(json.pagination.total)
      }
    } catch (err) {
      console.error("Erro ao carregar vendas:", err)
    } finally {
      setLoading(false)
    }
  }, [busca, page])

  useEffect(() => {
    carregarVendas()
  }, [carregarVendas])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
            <span>Histórico de Vendas (PDV)</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-light">
            Registro completo de vendas do PDV ({total} realizadas)
          </p>
        </div>

        <a
          href="/vendas/nova"
          className="inline-flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-semibold px-5 py-3 rounded-full shadow-md transition-all text-xs"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          <span>Nova Venda (PDV)</span>
        </a>
      </div>

      {/* Busca Pílula */}
      <div className="bg-white border border-zinc-200/80 rounded-full p-2 pl-5 flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <Search className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
        <input
          type="text"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value)
            setPage(1)
          }}
          placeholder="Buscar por número da venda ou nome do cliente..."
          className="bg-transparent border-none text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none w-full"
        />
      </div>

      {/* Tabela Soft UI */}
      <div className="bg-white border border-zinc-100/90 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-700">
            <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4">Nº Venda</th>
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">Valor Total</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-900" strokeWidth={1.5} />
                    <span>Carregando vendas...</span>
                  </td>
                </tr>
              ) : vendas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    Nenhuma venda registrada.
                  </td>
                </tr>
              ) : (
                vendas.map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900">Venda #{v.numero}</td>
                    <td className="px-6 py-4 text-zinc-500 text-xs font-light">
                      {new Date(v.dataVenda).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-zinc-900 font-medium">
                      {v.cliente?.nome || "Cliente Avulso (Balcão)"}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs font-light">
                      {v.vendedor?.nome || "Sistema"}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-zinc-900">
                      R$ {Number(v.valorTotal).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`/vendas/${v.id}`}
                        className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors inline-block"
                        title="Ver Cupom"
                      >
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              Página {page} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
