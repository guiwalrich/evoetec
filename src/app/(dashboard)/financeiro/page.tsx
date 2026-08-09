// src/app/(dashboard)/financeiro/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Search,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2
} from "lucide-react"

interface FornecedorSelect {
  id: string
  nome: string
}

interface ContaFinanceira {
  id: string
  descricao: string
  valor: number
  tipo: "RECEITA" | "DESPESA"
  categoria: string
  dataVencimento: string
  dataPagamento: string | null
  status: "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO"
  venda: { numero: string } | null
  ordemServico: { numero: string } | null
  fornecedor: { nome: string } | null
}

interface ResumoFinanceiro {
  receitaPaga: number
  despesaPaga: number
  saldoAtual: number
  receitaPendente: number
  despesaPendente: number
}

const categoriasList = [
  { value: "ALUGUEL", label: "Aluguel" },
  { value: "SALARIO", label: "Salários" },
  { value: "FORNECEDOR", label: "Peças / Fornecedor" },
  { value: "SERVICO", label: "Serviços Terceirizados" },
  { value: "VENDA", label: "Venda de Produtos" },
  { value: "OUTROS", label: "Outros" },
]

export default function FinanceiroPage() {
  const [contas, setContas] = useState<ContaFinanceira[]>([])
  const [fornecedores, setFornecedores] = useState<FornecedorSelect[]>([])
  const [resumo, setResumo] = useState<ResumoFinanceiro>({
    receitaPaga: 0,
    despesaPaga: 0,
    saldoAtual: 0,
    receitaPendente: 0,
    despesaPendente: 0,
  })
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState<string>("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Modal States
  const [modalOpen, setModalOpen] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState("")

  // Form State
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState<number>(0)
  const [tipo, setTipo] = useState<"RECEITA" | "DESPESA">("DESPESA")
  const [categoria, setCategoria] = useState("ALUGUEL")
  const [dataVencimento, setDataVencimento] = useState("")
  const [status, setStatus] = useState<"PENDENTE" | "PAGO">("PAGO")
  const [fornecedorId, setFornecedorId] = useState("")

  const carregarFinanceiro = useCallback(async () => {
    setLoading(true)
    try {
      const url = `/api/financeiro?busca=${encodeURIComponent(busca)}&tipo=${tipoFiltro}&page=${page}&limit=10`
      const res = await fetch(url)
      const json = await res.json()
      if (res.ok) {
        setContas(json.data)
        setResumo(json.resumo)
        setTotalPages(json.pagination.totalPages)
        setTotal(json.pagination.total)
      }
    } catch (err) {
      console.error("Erro ao carregar módulo financeiro:", err)
    } finally {
      setLoading(false)
    }
  }, [busca, tipoFiltro, page])

  useEffect(() => {
    carregarFinanceiro()
  }, [carregarFinanceiro])

  useEffect(() => {
    async function carregarFornecedores() {
      try {
        const res = await fetch("/api/fornecedores?limit=100")
        const json = await res.json()
        if (res.ok) setFornecedores(json.data)
      } catch (err) {
        console.error("Erro ao carregar fornecedores:", err)
      }
    }
    carregarFornecedores()
  }, [])

  const abrirModalNovo = () => {
    setDescricao("")
    setValor(0)
    setTipo("DESPESA")
    setCategoria("ALUGUEL")
    setDataVencimento(new Date().toISOString().split("T")[0])
    setStatus("PAGO")
    setFornecedorId("")
    setErroForm("")
    setModalOpen(true)
  }

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroForm("")
    setSalvando(true)

    const payload = {
      descricao,
      valor: Number(valor),
      tipo,
      categoria,
      dataVencimento,
      dataPagamento: status === "PAGO" ? new Date().toISOString() : null,
      status,
      fornecedorId: fornecedorId || null,
    }

    try {
      const res = await fetch("/api/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setModalOpen(false)
        carregarFinanceiro()
      } else {
        const json = await res.json()
        setErroForm(json.message || "Erro ao salvar lançamento.")
      }
    } catch {
      setErroForm("Falha na conexão.")
    } finally {
      setSalvando(false)
    }
  }

  const handleDarBaixa = async (id: string) => {
    try {
      const res = await fetch(`/api/financeiro/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PAGO",
          dataPagamento: new Date().toISOString(),
        }),
      })
      if (res.ok) {
        carregarFinanceiro()
      } else {
        alert("Erro ao dar baixa no lançamento.")
      }
    } catch {
      alert("Falha na requisição.")
    }
  }

  const handleDeletar = async (id: string, desc: string) => {
    if (!confirm(`Deseja realmente remover o lançamento "${desc}"?`)) return

    try {
      const res = await fetch(`/api/financeiro/${id}`, { method: "DELETE" })
      if (res.ok) carregarFinanceiro()
      else alert("Erro ao excluir lançamento.")
    } catch {
      alert("Falha na requisição.")
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            <DollarSign className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
            <span>Gestão Financeira & Fluxo de Caixa</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-light">
            Controle de receitas, despesas, contas a pagar e balanço geral ({total} lançamentos)
          </p>
        </div>

        <button
          onClick={abrirModalNovo}
          className="inline-flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-semibold px-5 py-3 rounded-full shadow-md transition-all text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* Cards de Métricas Financeiras Soft UI Yin-Yang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Card Destaque Preto: Saldo Líquido */}
        <div className="bg-[#18181b] text-white rounded-[32px] p-6 border border-zinc-800 flex flex-col justify-between hover:scale-[1.01] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Saldo Líquido
            </span>
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center">
              <Wallet className="w-5 h-5" strokeWidth={1.5} />
            </div>
          </div>
          <span
            className={`text-3xl font-extrabold block ${
              resumo.saldoAtual >= 0 ? "text-white" : "text-red-400"
            }`}
          >
            R$ {resumo.saldoAtual.toFixed(2)}
          </span>
          <span className="text-xs text-zinc-400 mt-1 block font-light">Receitas - Despesas Pagas</span>
        </div>

        {/* Card Branco: Receitas Realizadas */}
        <div className="bg-white text-zinc-900 rounded-[32px] p-6 border border-zinc-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:scale-[1.01] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Receitas Realizadas
            </span>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" strokeWidth={1.5} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-emerald-600 block">
            R$ {resumo.receitaPaga.toFixed(2)}
          </span>
          <span className="text-xs text-zinc-400 mt-1 block font-light">Total de entradas no caixa</span>
        </div>

        {/* Card Branco: Despesas Pagas */}
        <div className="bg-white text-zinc-900 rounded-[32px] p-6 border border-zinc-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:scale-[1.01] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Despesas Pagas
            </span>
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" strokeWidth={1.5} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-red-600 block">
            R$ {resumo.despesaPaga.toFixed(2)}
          </span>
          <span className="text-xs text-zinc-400 mt-1 block font-light">Total de saídas do caixa</span>
        </div>

        {/* Card Branco: Contas Pendentes */}
        <div className="bg-white text-zinc-900 rounded-[32px] p-6 border border-zinc-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:scale-[1.01] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Contas Pendentes
            </span>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5" strokeWidth={1.5} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-amber-600 block">
            R$ {resumo.despesaPendente.toFixed(2)}
          </span>
          <span className="text-xs text-zinc-400 mt-1 block font-light">A pagar / vencer</span>
        </div>
      </div>

      {/* Busca e Filtros Pílulas */}
      <div className="bg-white border border-zinc-100/90 rounded-[32px] p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200/80 rounded-full px-5 py-2.5 w-full sm:w-96">
          <Search className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
          <input
            type="text"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              setPage(1)
            }}
            placeholder="Buscar por descrição..."
            className="bg-transparent border-none text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setTipoFiltro(""); setPage(1); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              tipoFiltro === "" ? "bg-black text-white shadow-sm" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => { setTipoFiltro("RECEITA"); setPage(1); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              tipoFiltro === "RECEITA" ? "bg-black text-white shadow-sm" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Receitas
          </button>
          <button
            onClick={() => { setTipoFiltro("DESPESA"); setPage(1); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              tipoFiltro === "DESPESA" ? "bg-black text-white shadow-sm" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Despesas
          </button>
        </div>
      </div>

      {/* Tabela Soft UI */}
      <div className="bg-white border border-zinc-100/90 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-700">
            <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-900" strokeWidth={1.5} />
                    <span>Carregando lançamentos...</span>
                  </td>
                </tr>
              ) : contas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    Nenhum lançamento financeiro encontrado.
                  </td>
                </tr>
              ) : (
                contas.map((c) => {
                  const isReceita = c.tipo === "RECEITA"
                  return (
                    <tr key={c.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-zinc-900">
                        {c.descricao}
                        {c.venda && (
                          <span className="text-xs text-zinc-400 block font-normal mt-0.5">Origem: Venda {c.venda.numero}</span>
                        )}
                        {c.ordemServico && (
                          <span className="text-xs text-zinc-400 block font-normal mt-0.5">Origem: OS {c.ordemServico.numero}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">{c.categoria}</td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {new Date(c.dataVencimento).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                            c.status === "PAGO"
                              ? "bg-black text-white"
                              : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 font-extrabold ${
                          isReceita ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {isReceita ? "+" : "-"} R$ {Number(c.valor).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        {c.status === "PENDENTE" && (
                          <button
                            onClick={() => handleDarBaixa(c.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-all cursor-pointer"
                            title="Dar baixa / Pagar"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span>Dar Baixa</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletar(c.id, c.descricao)}
                          className="p-2 rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  )
                })
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

      {/* Modal Soft UI */}
      {modalOpen && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-100 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <h3 className="text-lg font-bold text-zinc-900">Novo Lançamento Financeiro</h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-900 p-1">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {erroForm && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>{erroForm}</span>
              </div>
            )}

            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Descrição *</label>
                <input
                  type="text"
                  required
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Aluguel do mês, Pagamento Fornecedor X"
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Tipo *</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as "RECEITA" | "DESPESA")}
                    className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                  >
                    <option value="DESPESA">Despesa (Saída)</option>
                    <option value="RECEITA">Receita (Entrada)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={valor}
                    onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Categoria *</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                  >
                    {categoriasList.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Data Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Status Inicial *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "PENDENTE" | "PAGO")}
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                >
                  <option value="PAGO">PAGO (Quitado)</option>
                  <option value="PENDENTE">PENDENTE (A Vencer / Pagar)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2.5 rounded-full bg-black hover:bg-zinc-800 text-white text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {salvando ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : null}
                  <span>Cadastrar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
