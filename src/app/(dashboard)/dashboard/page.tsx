// src/app/(dashboard)/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { 
  ClipboardList, 
  Users, 
  DollarSign, 
  PackageCheck, 
  Loader2, 
  ArrowRight, 
  ShoppingCart,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Plus,
  HelpCircle,
  MessageSquare,
} from "lucide-react"

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

export default function ReferenceStyleDashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const avatarId = (session?.user as any)?.avatarId || 1
  const userName = session?.user?.name || "Técnico"

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
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" strokeWidth={1.5} />
      </div>
    )
  }

  const metrics = data?.metrics || {
    osAbertas: 0,
    clientesAtivos: 0,
    receitaTotal: 0,
    pecasEstoque: 0,
  }

  const ultimasOS = data?.ultimasOS || []

  return (
    <div className="space-y-8 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. SEÇÃO DE SAUDAÇÃO COM O AVATAR PIXEL ART DO USUÁRIO (MODELO REFERÊNCIA) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Card do Usuário com o Avatar em Destaque */}
        <div className="lg:col-span-8 bg-white rounded-[32px] p-6 sm:p-8 border border-zinc-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="space-y-4 text-center sm:text-left z-10">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                Olá, sou o {userName}!
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 font-normal mt-1 leading-relaxed">
                Como posso ajudar a bancada da sua assistência hoje?
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
              <Link
                href="/ordens-servico/nova"
                className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-5 py-3 rounded-full transition-all flex items-center gap-2 shadow-sm hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Ordem de Serviço</span>
              </Link>
              <Link
                href="/ordens-servico"
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold px-5 py-3 rounded-full transition-all border border-zinc-200"
              >
                Ver Todas as OS
              </Link>
            </div>
          </div>

          {/* Destaque do Avatar Pixel Art do Usuário no Card */}
          <div className="relative shrink-0 z-10">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-zinc-100 border-4 border-zinc-200/80 overflow-hidden shadow-md flex items-center justify-center p-2">
              <img
                src={`/assets/avatars/avatar_${avatarId}.png`}
                alt={`Avatar Pixel Art ${avatarId}`}
                className="w-full h-full object-cover"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <span className="absolute bottom-1 right-1 bg-emerald-500 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shadow-2xs border border-white">
              Bancada #01
            </span>
          </div>

        </div>

        {/* Métrica Rápida Superior Direita (Modelo Referência: Jobs Completed / Jobs Inprogress) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          
          <div className="bg-white rounded-[28px] p-6 border border-zinc-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
            <span className="text-zinc-400 font-mono text-[10px] uppercase font-bold">OS Abertas</span>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                {metrics.osAbertas.toString().padStart(2, "0")}
              </div>
              <span className="text-[11px] text-amber-600 font-semibold mt-1 block">Em bancada</span>
            </div>
          </div>

          <div className="bg-white rounded-[28px] p-6 border border-zinc-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
            <span className="text-zinc-400 font-mono text-[10px] uppercase font-bold">Clientes Ativos</span>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                {metrics.clientesAtivos.toString().padStart(2, "0")}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Base cadastrada</span>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. CONTEÚDO PRINCIPAL (LISTA DE REPAROS + ESTATÍSTICAS DA BANCADA) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Coluna Esquerda: Aparelhos em Bancada (Modelo Referência: Projects Completed List) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-zinc-900 tracking-tight">
              Últimas Ordens de Serviço
            </h2>
            <Link href="/ordens-servico" className="text-xs text-zinc-500 hover:text-zinc-900 font-semibold transition-colors">
              Ver todas →
            </Link>
          </div>

          <div className="space-y-3">
            {ultimasOS.length === 0 ? (
              <div className="bg-white rounded-[24px] p-8 border border-zinc-200/80 text-center text-xs text-zinc-500">
                Nenhuma Ordem de Serviço aberta no momento. Clique acima para iniciar o primeiro atendimento!
              </div>
            ) : (
              ultimasOS.map((os) => (
                <div 
                  key={os.id} 
                  className="bg-white rounded-[24px] p-5 border border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-mono text-xs font-bold shrink-0 border border-zinc-200">
                      OS
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-zinc-900">
                        {os.dispositivo}
                      </div>
                      <div className="text-xs text-zinc-500 font-normal">
                        Cliente: {os.cliente?.nome || "Não informado"} · #{os.numero}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-100">
                    <span className="text-xs font-extrabold text-emerald-600 font-mono">
                      R$ {os.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <Link
                      href={`/ordens-servico/${os.id}`}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-2xs hover:scale-105"
                    >
                      Ver Ordem
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Coluna Direita: Estatísticas & Bloco de Suporte (Modelo Referência: My Statistics & Work With Me) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card Estatísticas */}
          <div className="bg-white rounded-[32px] p-6 border border-zinc-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-900">Resumo Financeiro</h3>
              <span className="text-[10px] font-mono text-zinc-400">Tempo Real</span>
            </div>

            <div className="space-y-3">
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Faturamento Total Liquidados</span>
                <div className="text-2xl font-extrabold text-emerald-600 font-mono">
                  R$ {metrics.receitaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Peças Cadastradas</span>
                <div className="text-xl font-extrabold text-zinc-900 font-mono">
                  {metrics.pecasEstoque} itens em estoque
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
