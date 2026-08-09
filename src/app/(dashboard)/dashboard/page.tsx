// src/app/(dashboard)/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ClipboardList, Users, DollarSign, PackageCheck, Loader2, ArrowRight, ShoppingCart } from "lucide-react"

interface DashboardData {
  metrics: {
    osAbertas: number
    clientesAtivos: number
    receitaTotal: number
    pecasEstoque: number
  }
  ultimasOS: Array<{
    id: string
    numero: string
    dispositivo: string
    status: string
    valorTotal: number
    createdAt: string
    cliente: { nome: string }
  }>
  ultimasVendas: Array<{
    id: string
    numero: string
    valorTotal: number
    dataVenda: string
    cliente: { nome: string } | null
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const res = await fetch("/api/dashboard")
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error("Erro ao carregar métricas do dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    carregarDashboard()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 mb-2" strokeWidth={1.5} />
      </div>
    )
  }

  const metrics = data?.metrics || {
    osAbertas: 0,
    clientesAtivos: 0,
    receitaTotal: 0,
    pecasEstoque: 0,
  }

  return (
    <div className="space-y-8">
      {/* Header da Página */}
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight font-sans">
          Visão Geral
        </h1>
        <p className="text-sm text-zinc-500 mt-1 font-light">
          Bem-vindo ao <span className="text-zinc-900 font-semibold">Evo Etec ERP</span>. Acompanhe a demanda e o desempenho da sua assistência em tempo real.
        </p>
      </div>

      {/* Cards de Métricas Principais (Soft UI Glassmorphism Yin-Yang Contrast) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Card 1: Receita Total (Card Destaque Preto Yin-Yang) */}
        <div className="bg-[#18181b] text-white rounded-[32px] p-6 flex items-center justify-between border border-zinc-800 transition-all hover:scale-[1.01]">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 block mb-1">
              Receita Total
            </span>
            <span className="text-3xl font-extrabold text-white tracking-tight block">
              R$ {metrics.receitaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-zinc-400 font-light block mt-1">
              Vendas e serviços liquidados
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shrink-0">
            <DollarSign className="w-6 h-6" strokeWidth={1.5} />
          </div>
        </div>

        {/* Card 2: OS Abertas (Card Branco Soft Shadow) */}
        <div className="bg-white text-zinc-900 rounded-[32px] p-6 flex items-center justify-between border border-zinc-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:scale-[1.01]">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 block mb-1">
              OS Abertas
            </span>
            <span className="text-3xl font-extrabold text-zinc-900 tracking-tight block">
              {metrics.osAbertas}
            </span>
            <span className="text-[11px] text-zinc-500 font-light block mt-1">
              Aguardando atendimento
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-800 shrink-0">
            <ClipboardList className="w-6 h-6" strokeWidth={1.5} />
          </div>
        </div>

        {/* Card 3: Clientes Ativos (Card Branco Soft Shadow) */}
        <div className="bg-white text-zinc-900 rounded-[32px] p-6 flex items-center justify-between border border-zinc-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:scale-[1.01]">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 block mb-1">
              Clientes Ativos
            </span>
            <span className="text-3xl font-extrabold text-zinc-900 tracking-tight block">
              {metrics.clientesAtivos}
            </span>
            <span className="text-[11px] text-zinc-500 font-light block mt-1">
              Cadastrados no sistema
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-800 shrink-0">
            <Users className="w-6 h-6" strokeWidth={1.5} />
          </div>
        </div>

        {/* Card 4: Peças em Estoque (Card Branco Soft Shadow) */}
        <div className="bg-white text-zinc-900 rounded-[32px] p-6 flex items-center justify-between border border-zinc-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:scale-[1.01]">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 block mb-1">
              Peças em Estoque
            </span>
            <span className="text-3xl font-extrabold text-zinc-900 tracking-tight block">
              {metrics.pecasEstoque}
            </span>
            <span className="text-[11px] text-zinc-500 font-light block mt-1">
              Unidades no estoque
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-800 shrink-0">
            <PackageCheck className="w-6 h-6" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Grid de Atividades Recentes com Espaçamento Generoso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Painel: Últimas OS */}
        <div className="bg-white text-zinc-900 rounded-[32px] p-6 sm:p-8 border border-zinc-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2.5">
              <ClipboardList className="w-5 h-5 text-zinc-700" strokeWidth={1.5} />
              <span>Ordens de Serviço Recentes</span>
            </h3>
            <Link
              href="/ordens-servico"
              className="text-xs text-zinc-500 hover:text-black font-semibold flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full hover:bg-zinc-100"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100">
            {data?.ultimasOS.length === 0 ? (
              <p className="text-sm text-zinc-400 py-6 text-center font-light">Nenhuma OS registrada ainda.</p>
            ) : (
              data?.ultimasOS.map((os) => {
                const isConcluido = os.status.toUpperCase().includes("CONCLU") || os.status.toUpperCase().includes("ENTREGUE")
                return (
                  <div key={os.id} className="py-3.5 flex items-center justify-between text-sm hover:bg-zinc-50 transition-all rounded-2xl px-3">
                    <div>
                      <Link
                        href={`/ordens-servico/${os.id}`}
                        className="font-bold text-zinc-900 hover:text-black block"
                      >
                        {os.numero} — {os.dispositivo}
                      </Link>
                      <span className="text-xs text-zinc-500 block font-light mt-0.5">Cliente: {os.cliente.nome}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[11px] px-3 py-1 rounded-full font-medium inline-block mb-1 ${
                        isConcluido
                          ? "bg-black text-white"
                          : "bg-zinc-100 text-zinc-600 border border-zinc-200/80"
                      }`}>
                        {os.status}
                      </span>
                      <span className="text-xs font-bold text-zinc-900 block">
                        R$ {Number(os.valorTotal).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Painel: Últimas Vendas (PDV) */}
        <div className="bg-white text-zinc-900 rounded-[32px] p-6 sm:p-8 border border-zinc-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2.5">
              <ShoppingCart className="w-5 h-5 text-zinc-700" strokeWidth={1.5} />
              <span>Vendas Recentes (PDV)</span>
            </h3>
            <Link
              href="/vendas"
              className="text-xs text-zinc-500 hover:text-black font-semibold flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full hover:bg-zinc-100"
            >
              Ver histórico <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100">
            {data?.ultimasVendas.length === 0 ? (
              <p className="text-sm text-zinc-400 py-6 text-center font-light">Nenhuma venda registrada ainda.</p>
            ) : (
              data?.ultimasVendas.map((v) => (
                <div key={v.id} className="py-3.5 flex items-center justify-between text-sm hover:bg-zinc-50 transition-all rounded-2xl px-3">
                  <div>
                    <Link href={`/vendas/${v.id}`} className="font-bold text-zinc-900 hover:text-black block">
                      Venda #{v.numero}
                    </Link>
                    <span className="text-xs text-zinc-500 block font-light mt-0.5">
                      {v.cliente?.nome || "Cliente Avulso (Balcão)"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-zinc-900 block">
                      R$ {Number(v.valorTotal).toFixed(2)}
                    </span>
                    <span className="text-[11px] text-zinc-400 block font-light mt-0.5">
                      {new Date(v.dataVenda).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
