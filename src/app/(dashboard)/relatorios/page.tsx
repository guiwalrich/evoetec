// src/app/(dashboard)/relatorios/page.tsx
"use client"

import { useState, useEffect } from "react"
import {
  BarChart3,
  DollarSign,
  ClipboardList,
  AlertTriangle,
  ShoppingBag,
  Loader2,
  Printer
} from "lucide-react"

interface DadosRelatorio {
  vendas: {
    totalFaturado: number
    quantidade: number
  }
  ordensServico: {
    totalFaturado: number
    quantidade: number
    porStatus: Array<{ status: string; _count: number }>
  }
  estoqueCritico: Array<{
    id: string
    nome: string
    quantidadeEstoque: number
    estoqueMinimo: number
  }>
  topProdutos: Array<{
    nome: string
    quantidadeTotal: number
    valorTotal: number
  }>
}

export default function RelatoriosPage() {
  const [dados, setDados] = useState<DadosRelatorio | null>(null)
  const [loading, setLoading] = useState(true)

  // Estado do filtro por mês/ano (Padrão: Mês atual YYYY-MM)
  const dataAtual = new Date()
  const mesAtualStr = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, "0")}`
  const [mesAno, setMesAno] = useState<string>(mesAtualStr)

  useEffect(() => {
    async function carregarRelatorios() {
      setLoading(true)
      try {
        let url = "/api/relatorios"
        if (mesAno) {
          const [ano, mes] = mesAno.split("-")
          url = `/api/relatorios?mes=${parseInt(mes, 10)}&ano=${ano}`
        }
        const res = await fetch(url)
        if (res.ok) {
          const json = await res.json()
          setDados(json)
        }
      } catch (err) {
        console.error("Erro ao carregar relatórios:", err)
      } finally {
        setLoading(false)
      }
    }
    carregarRelatorios()
  }, [mesAno])

  if (loading && !dados) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 mb-2" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header com Filtro por Mês/Ano */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
            <span>Relatórios & Inteligência Gerencial</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-light">
            Análise consolidada de desempenho comercial, assistência e estoque
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-zinc-200/80 rounded-full px-4 py-2 shadow-sm">
            <label className="text-xs font-semibold text-zinc-500">Mês:</label>
            <input
              type="month"
              value={mesAno}
              onChange={(e) => setMesAno(e.target.value)}
              className="bg-transparent border-none text-xs text-zinc-900 focus:outline-none cursor-pointer font-medium"
            />
            {mesAno && (
              <button
                onClick={() => setMesAno("")}
                className="text-[11px] text-zinc-600 hover:text-black font-medium ml-1"
                title="Ver todo o período"
              >
                Geral
              </button>
            )}
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-semibold px-5 py-3 rounded-full shadow-md transition-all text-xs shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4" strokeWidth={1.5} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Visão de Faturamento Geral Soft UI Yin-Yang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {/* Card Destaque Preto */}
        <div className="bg-[#18181b] text-white rounded-[32px] p-6 sm:p-8 border border-zinc-800 flex flex-col justify-between hover:scale-[1.01] transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Faturamento de Vendas (PDV)
            </span>
            <div className="w-12 h-12 rounded-full bg-zinc-800 text-white flex items-center justify-center">
              <DollarSign className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-white block">
            R$ {dados?.vendas.totalFaturado.toFixed(2)}
          </span>
          <span className="text-xs text-zinc-400 mt-1 block font-light">
            {dados?.vendas.quantidade} vendas concluídas
          </span>
        </div>

        {/* Card Branco */}
        <div className="bg-white text-zinc-900 rounded-[32px] p-6 sm:p-8 border border-zinc-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:scale-[1.01] transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Faturamento de Serviços (OS)
            </span>
            <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center border border-zinc-200">
              <ClipboardList className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-zinc-900 block">
            R$ {dados?.ordensServico.totalFaturado.toFixed(2)}
          </span>
          <span className="text-xs text-zinc-500 mt-1 block font-light">
            {dados?.ordensServico.quantidade} ordens de serviço registradas
          </span>
        </div>
      </div>

      {/* Grid Secundário Soft UI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Top Produtos */}
        <div className="bg-white text-zinc-900 rounded-[32px] p-6 sm:p-8 border border-zinc-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-100 pb-4">
            <ShoppingBag className="w-4 h-4 text-zinc-700" strokeWidth={1.5} />
            <span>Top Produtos Mais Vendidos</span>
          </h3>
          <div className="space-y-3">
            {dados?.topProdutos.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 font-light">Sem histórico de vendas suficiente.</p>
            ) : (
              dados?.topProdutos.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm">
                  <div>
                    <span className="font-bold text-zinc-900 block">{item.nome}</span>
                    <span className="text-xs text-zinc-500 font-light">{item.quantidadeTotal} unidades vendidas</span>
                  </div>
                  <span className="font-extrabold text-zinc-900">R$ {Number(item.valorTotal).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Estoque Crítico */}
        <div className="bg-white text-zinc-900 rounded-[32px] p-6 sm:p-8 border border-zinc-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-100 pb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600" strokeWidth={1.5} />
            <span>Itens em Alerta de Estoque Crítico</span>
          </h3>
          <div className="space-y-3">
            {dados?.estoqueCritico.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 font-light">Todos os produtos estão com estoque saudável!</p>
            ) : (
              dados?.estoqueCritico.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-sm">
                  <span className="font-bold text-amber-900">{item.nome}</span>
                  <span className="text-xs font-bold text-amber-700">
                    Estoque: {item.quantidadeEstoque} un. (Mín: {item.estoqueMinimo})
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
