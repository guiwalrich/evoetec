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
  empresa?: {
    nomeFantasia: string
    cnpj?: string | null
    telefone?: string | null
    endereco?: string | null
  }
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
        const json = await res.json().catch(() => null)
        if (json) {
          setDados({
            empresa: json.empresa || undefined,
            vendas: {
              totalFaturado: Number(json.vendas?.totalFaturado || 0),
              quantidade: Number(json.vendas?.quantidade || 0),
            },
            ordensServico: {
              totalFaturado: Number(json.ordensServico?.totalFaturado || 0),
              quantidade: Number(json.ordensServico?.quantidade || 0),
              porStatus: json.ordensServico?.porStatus || [],
            },
            estoqueCritico: json.estoqueCritico || [],
            topProdutos: json.topProdutos || [],
          })
        } else {
          setDados({
            empresa: undefined,
            vendas: { totalFaturado: 0, quantidade: 0 },
            ordensServico: { totalFaturado: 0, quantidade: 0, porStatus: [] },
            estoqueCritico: [],
            topProdutos: []
          })
        }
      } catch (err) {
        console.error("Erro ao carregar relatórios:", err)
        setDados(null)
      } finally {
        setLoading(false)
      }
    }
    carregarRelatorios()
  }, [mesAno])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" strokeWidth={1.5} />
        <p className="text-xs text-zinc-500 font-mono">Carregando inteligência gerencial...</p>
      </div>
    )
  }

  if (!dados) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-400 gap-3 text-center">
        <p className="text-sm font-semibold text-zinc-700">Não foi possível carregar os relatórios.</p>
        <button
          onClick={() => setMesAno((prev) => prev ? `${prev}` : mesAtualStr)}
          className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-full hover:bg-zinc-800 transition-all cursor-pointer"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  const faturamentoTotal = Number(dados?.vendas?.totalFaturado || 0) + Number(dados?.ordensServico?.totalFaturado || 0)

  return (
    <>
      {/* ========================================================================= */}
      {/* 📄 MODELO OFICIAL DE IMPRESSÃO A4 (RELATÓRIO EXECUTIVO MENSAL)            */}
      {/* ========================================================================= */}
      <div className="hidden print:block font-sans text-black p-4 max-w-4xl mx-auto space-y-6 bg-white">
        {/* Cabeçalho da Empresa */}
        <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-4">
          <div className="flex items-center gap-4">
            <img src="/assets/wrldevotec.webp" alt="Logo Empresa" className="w-14 h-14 object-contain" />
            <div>
              <h1 className="text-xl font-extrabold uppercase tracking-tight text-black">
                {dados?.empresa?.nomeFantasia || "Evo Etec ERP - Assistência Técnica"}
              </h1>
              {dados?.empresa?.cnpj && <p className="text-xs text-zinc-700 font-mono">CNPJ: {dados.empresa.cnpj}</p>}
              {dados?.empresa?.telefone && <p className="text-xs text-zinc-700">Tel: {dados.empresa.telefone}</p>}
              {dados?.empresa?.endereco && <p className="text-xs text-zinc-700">{dados.empresa.endereco}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest block font-mono">
              RELATÓRIO MENSAL GERENCIAL
            </h2>
            <span className="text-sm font-black text-black block mt-0.5">
              {mesAno ? `Período: ${mesAno}` : "Visão Geral Consolidada"}
            </span>
            <span className="text-[10px] text-zinc-500 block">
              Emissão: {new Date().toLocaleString("pt-BR")}
            </span>
          </div>
        </div>

        {/* Resumo Consolidado / DRE */}
        <div className="border border-zinc-900 rounded-lg p-4 bg-zinc-50 space-y-3">
          <span className="font-extrabold text-xs uppercase tracking-wider text-black block border-b border-zinc-300 pb-2">
            1. RESUMO EXECUTIVO DO FATURAMENTO
          </span>
          <div className="grid grid-cols-3 gap-4 text-xs text-center">
            <div className="border-r border-zinc-300 pr-2">
              <span className="text-zinc-600 block">Faturamento em Vendas (PDV)</span>
              <strong className="text-base font-black text-black">R$ {Number(dados?.vendas?.totalFaturado || 0).toFixed(2)}</strong>
              <span className="text-[10px] text-zinc-500 block">({dados?.vendas?.quantidade || 0} vendas)</span>
            </div>
            <div className="border-r border-zinc-300 pr-2">
              <span className="text-zinc-600 block">Faturamento em Serviços (OS)</span>
              <strong className="text-base font-black text-black">R$ {Number(dados?.ordensServico?.totalFaturado || 0).toFixed(2)}</strong>
              <span className="text-[10px] text-zinc-500 block">({dados?.ordensServico?.quantidade || 0} ordens de serviço)</span>
            </div>
            <div>
              <span className="text-zinc-600 block font-semibold">Faturamento Bruto Consolidado</span>
              <strong className="text-lg font-black text-emerald-800">R$ {Number(faturamentoTotal || 0).toFixed(2)}</strong>
              <span className="text-[10px] text-zinc-500 block">(Receita Total Líquida)</span>
            </div>
          </div>
        </div>

        {/* Tabelas Lado a Lado */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          {/* Top Produtos */}
          <div className="border border-zinc-300 rounded-lg p-4 space-y-3">
            <span className="font-extrabold text-xs uppercase tracking-wider text-black block border-b border-zinc-200 pb-1">
              2. PRODUTOS MAIS VENDIDOS
            </span>
            {!dados?.topProdutos || dados.topProdutos.length === 0 ? (
              <p className="text-zinc-500 text-[11px]">Nenhum produto registrado no período.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-300 text-[10px] uppercase text-zinc-600">
                    <th className="py-1">Produto</th>
                    <th className="py-1 text-center">Qtd</th>
                    <th className="py-1 text-right">Total (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-[11px]">
                  {dados.topProdutos.map((p, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 font-medium">{p.nome}</td>
                      <td className="py-1.5 text-center font-mono">{p.quantidadeTotal}</td>
                      <td className="py-1.5 text-right font-mono font-bold">R$ {Number(p.valorTotal || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* OS Por Status */}
          <div className="border border-zinc-300 rounded-lg p-4 space-y-3">
            <span className="font-extrabold text-xs uppercase tracking-wider text-black block border-b border-zinc-200 pb-1">
              3. ESTATÍSTICAS DE OS POR STATUS
            </span>
            {!dados?.ordensServico?.porStatus || dados.ordensServico.porStatus.length === 0 ? (
              <p className="text-zinc-500 text-[11px]">Nenhuma Ordem de Serviço cadastrada.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-300 text-[10px] uppercase text-zinc-600">
                    <th className="py-1">Status da OS</th>
                    <th className="py-1 text-right">Quantidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-[11px]">
                  {dados.ordensServico.porStatus.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 font-medium uppercase">{item.status}</td>
                      <td className="py-1.5 text-right font-mono font-bold">{item._count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Estoque Crítico */}
        {dados?.estoqueCritico && dados.estoqueCritico.length > 0 && (
          <div className="border border-red-300 rounded-lg p-4 space-y-3 bg-red-50/20 text-xs">
            <span className="font-extrabold text-xs uppercase tracking-wider text-red-900 block border-b border-red-200 pb-1">
              4. ITENS COM ESTOQUE CRÍTICO / REPOSIÇÃO NECESSÁRIA
            </span>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-red-200 text-[10px] uppercase text-red-800">
                  <th className="py-1">Produto / Peça</th>
                  <th className="py-1 text-center">Estoque Atual</th>
                  <th className="py-1 text-right">Estoque Mínimo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-200 text-[11px]">
                {dados.estoqueCritico.map((p) => (
                  <tr key={p.id}>
                    <td className="py-1.5 font-medium text-zinc-900">{p.nome}</td>
                    <td className="py-1.5 text-center font-mono font-bold text-red-700">{p.quantidadeEstoque} un</td>
                    <td className="py-1.5 text-right font-mono text-zinc-600">{p.estoqueMinimo} un</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Assinatura do Gerente */}
        <div className="pt-10 border-t border-zinc-300 text-center">
          <div className="max-w-xs mx-auto border-t border-zinc-800 pt-1">
            <span className="font-bold text-xs text-zinc-900 block">
              {dados?.empresa?.nomeFantasia || "Gerência Responsável"}
            </span>
            <span className="text-[10px] text-zinc-500 uppercase block">
              Visto / Assinatura do Administrador
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 💻 INTERFACE INTERATIVA DO DASHBOARD (PRINT:HIDDEN)                        */}
      {/* ========================================================================= */}
      <div className="space-y-8 print:hidden page-fade-in">
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
            {/* Input Mês/Ano */}
            <div className="bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 flex items-center gap-2 shadow-sm">
              <span className="text-xs font-semibold text-zinc-600">Filtrar por Mês:</span>
              <input
                type="month"
                value={mesAno}
                onChange={(e) => setMesAno(e.target.value)}
                className="bg-transparent border-none text-xs text-zinc-900 focus:outline-none cursor-pointer font-medium"
              />
              {mesAno && (
                <button
                  onClick={() => setMesAno("")}
                  className="text-[11px] text-zinc-600 hover:text-black font-medium ml-1 cursor-pointer"
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
              <span>Imprimir Relatório</span>
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
              R$ {Number(dados?.vendas?.totalFaturado || 0).toFixed(2)}
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
              R$ {Number(dados?.ordensServico?.totalFaturado || 0).toFixed(2)}
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
              {!dados?.topProdutos || dados.topProdutos.length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center">Nenhum produto registrado no período.</p>
              ) : (
                dados.topProdutos.map((prod, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs"
                  >
                    <div>
                      <span className="font-bold text-zinc-900 block">{prod.nome}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {prod.quantidadeTotal} unidades vendidas
                      </span>
                    </div>
                    <span className="font-extrabold text-zinc-900 font-mono">
                      R$ {Number(prod.valorTotal || 0).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Status das OS */}
          <div className="bg-white text-zinc-900 rounded-[32px] p-6 sm:p-8 border border-zinc-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-100 pb-4">
              <ClipboardList className="w-4 h-4 text-zinc-700" strokeWidth={1.5} />
              <span>Estatísticas de OS por Status</span>
            </h3>
            <div className="space-y-3">
              {!dados?.ordensServico?.porStatus || dados.ordensServico.porStatus.length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center">Nenhuma OS registrada no período.</p>
              ) : (
                dados.ordensServico.porStatus.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs"
                  >
                    <span className="font-semibold text-zinc-700 uppercase tracking-wider">{item.status}</span>
                    <span className="font-bold text-zinc-900 bg-white px-3 py-1 rounded-full border border-zinc-200 font-mono">
                      {item._count} OS
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Estoque Crítico */}
        <div className="bg-white text-zinc-900 rounded-[32px] p-6 sm:p-8 border border-zinc-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-100 pb-4">
            <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={1.5} />
            <span>Alerta de Estoque Crítico</span>
          </h3>

          {!dados?.estoqueCritico || dados.estoqueCritico.length === 0 ? (
            <p className="text-xs text-zinc-500 py-2">
              Nenhum produto com estoque abaixo do limite mínimo. Excelente gestão!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dados.estoqueCritico.map((prod) => (
                <div
                  key={prod.id}
                  className="p-4 rounded-2xl bg-red-50/50 border border-red-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-zinc-900 block">{prod.nome}</span>
                    <span className="text-[10px] text-red-600 font-medium">Estoque Mínimo: {prod.estoqueMinimo} un</span>
                  </div>
                  <span className="font-extrabold text-red-700 bg-white px-3 py-1 rounded-full border border-red-200 font-mono">
                    {prod.quantidadeEstoque} un
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
