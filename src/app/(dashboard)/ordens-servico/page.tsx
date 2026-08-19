// src/app/(dashboard)/ordens-servico/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ClipboardList,
  Search,
  Plus,
  Eye,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Clock,
  Wrench,
  XCircle,
  AlertCircle
} from "lucide-react"

interface OrdemServico {
  id: string
  numero: string
  dispositivo: string
  marca: string | null
  modelo: string | null
  defeitoRelatado: string
  valorTotal: number
  status: string
  createdAt: string
  cliente: {
    nome: string
    telefone: string | null
  }
  tecnico: {
    nome: string
  } | null
}

const statusBadges: Record<string, { label: string; style: string; darkStyle: string; icon: any }> = {
  ABERTA: { label: "Aberta", style: "bg-zinc-100 text-zinc-700 border-zinc-200", darkStyle: "dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700", icon: Clock },
  EM_ANALISE: { label: "Em Análise", style: "bg-amber-50 text-amber-700 border-amber-200", darkStyle: "dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800", icon: AlertCircle },
  AGUARDANDO_PECA: { label: "Aguardando Peça", style: "bg-purple-50 text-purple-700 border-purple-200", darkStyle: "dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800", icon: Clock },
  EM_REPARO: { label: "Em Reparo", style: "bg-indigo-50 text-indigo-700 border-indigo-200", darkStyle: "dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800", icon: Wrench },
  AGUARDANDO_RETIRADA: { label: "Aguardando Retirada", style: "bg-cyan-50 text-cyan-700 border-cyan-200", darkStyle: "dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800", icon: Clock },
  CONCLUIDA: { label: "Concluída", style: "bg-black text-white border-black", darkStyle: "dark:bg-white dark:text-black dark:border-white", icon: CheckCircle2 },
  CANCELADA: { label: "Cancelada", style: "bg-red-50 text-red-700 border-red-200", darkStyle: "dark:bg-red-950/30 dark:text-red-400 dark:border-red-800", icon: XCircle },
}

import RemoveButton from "@/components/ordens/RemoveButton"

export default function OrdensServicoPage() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<string>("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const carregarOrdens = useCallback(async () => {
    setLoading(true)
    try {
      const url = `/api/ordens-servico?busca=${encodeURIComponent(busca)}&status=${statusFiltro}&page=${page}&limit=10`
      const res = await fetch(url)
      const json = await res.json()
      if (res.ok) {
        setOrdens(json.data)
        setTotalPages(json.pagination.totalPages)
        setTotal(json.pagination.total)
      }
    } catch (err) {
      console.error("Erro ao carregar Ordens de Serviço:", err)
    } finally {
      setLoading(false)
    }
  }, [busca, statusFiltro, page])

  useEffect(() => {
    carregarOrdens()
  }, [carregarOrdens])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-zinc-900 dark:text-white" strokeWidth={1.5} />
            <span>Ordens de Serviço</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-light">
            Acompanhe a demanda e o progresso dos reparos ({total} registradas)
          </p>
        </div>

        <a
          href="/ordens-servico/nova"
          className="inline-flex items-center justify-center gap-2 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-semibold px-5 py-3 rounded-full shadow-md transition-all text-xs"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          <span>Nova Ordem de Serviço</span>
        </a>
      </div>

      {/* Filtros e Busca Pílula */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100/90 dark:border-zinc-800 rounded-[32px] p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-colors duration-200">
        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 rounded-full px-5 py-2.5">
          <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
          <input
            type="text"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              setPage(1)
            }}
            placeholder="Buscar por número da OS, cliente, aparelho, marca ou IMEI..."
            className="bg-transparent border-none text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none w-full"
          />
        </div>

        {/* Tabs de Status Pílula */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => { setStatusFiltro(""); setPage(1); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 ${
              statusFiltro === ""
                ? "bg-black dark:bg-white text-white dark:text-black shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            Todos os Status
          </button>
          {Object.keys(statusBadges).map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFiltro(st); setPage(1); }}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 ${
                statusFiltro === st
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {statusBadges[st].label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100/90 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Nº OS</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Dispositivo</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Valor Total</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-900 dark:text-white" strokeWidth={1.5} />
                    <span>Carregando Ordens de Serviço...</span>
                  </td>
                </tr>
              ) : ordens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500">
                    Nenhuma Ordem de Serviço encontrada.
                  </td>
                </tr>
              ) : (
                ordens.map((os) => {
                  const badge = statusBadges[os.status] || statusBadges.ABERTA
                  const IconStatus = badge.icon
                  return (
                    <tr key={os.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">
                        {os.numero}
                        <span className="block text-[11px] text-zinc-400 dark:text-zinc-500 font-light mt-0.5">
                          {new Date(os.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-zinc-900 dark:text-white block">{os.cliente.nome}</span>
                        {os.cliente.telefone && (
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 block font-light">{os.cliente.telefone}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
                          <Smartphone className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" strokeWidth={1.5} />
                          <span>{os.dispositivo}</span>
                        </div>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 block font-light mt-0.5">
                          {[os.marca, os.modelo].filter(Boolean).join(" - ") || "Sem modelo registrado"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.style} ${badge.darkStyle}`}
                        >
                          <IconStatus className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-zinc-900 dark:text-white">
                        R$ {Number(os.valorTotal).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 flex items-center justify-end">
                        <a
                          href={`/ordens-servico/${os.id}`}
                          className="p-2 rounded-full text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors inline-block"
                          title="Ver Detalhes"
                        >
                          <Eye className="w-4 h-4" strokeWidth={1.5} />
                        </a>
                        <RemoveButton ordemId={os.id} numeroOS={os.numero} onSuccess={carregarOrdens} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Página {page} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50 transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50 transition-all shadow-sm"
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
