// src/app/(dashboard)/ordens-servico/nova/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ClipboardList,
  ArrowLeft,
  User,
  Smartphone,
  Wrench,
  DollarSign,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  ShieldCheck
} from "lucide-react"

interface Cliente {
  id: string
  nome: string
  telefone: string | null
}

interface PagamentoItem {
  formaPagamento: string
  valor: number
}

const formasPagamentoList = [
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "PIX", label: "PIX" },
  { value: "CARTAO_CREDITO", label: "Cartão de Crédito" },
  { value: "CARTAO_DEBITO", label: "Cartão de Débito" },
  { value: "BOLETO", label: "Boleto" },
]

export default function NovaOrdemServicoPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loadingClientes, setLoadingClientes] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState("")

  // Form States
  const [clienteId, setClienteId] = useState("")
  const [dispositivo, setDispositivo] = useState("")
  const [marca, setMarca] = useState("")
  const [modelo, setModelo] = useState("")
  const [imei, setImei] = useState("")
  const [defeitoRelatado, setDefeitoRelatado] = useState("")
  const [diagnostico, setDiagnostico] = useState("")
  const [valorServico, setValorServico] = useState<number>(0)
  const [valorPecas, setValorPecas] = useState<number>(0)
  const [garantiaDias, setGarantiaDias] = useState<number>(90)
  const [observacoes, setObservacoes] = useState("")

  // Pagamentos Fracionados
  const [pagamentos, setPagamentos] = useState<PagamentoItem[]>([])
  const [formaAtual, setFormaAtual] = useState("PIX")
  const [valorAtual, setValorAtual] = useState<number>(0)

  useEffect(() => {
    async function buscarClientes() {
      try {
        const res = await fetch("/api/clientes?limit=100")
        const json = await res.json()
        if (res.ok) setClientes(json.data)
      } catch (err) {
        console.error("Erro ao buscar clientes:", err)
      } finally {
        setLoadingClientes(false)
      }
    }
    buscarClientes()
  }, [])

  const valorTotal = Number(valorServico || 0) + Number(valorPecas || 0)

  const adicionarPagamento = () => {
    if (valorAtual <= 0) return
    setPagamentos([...pagamentos, { formaPagamento: formaAtual, valor: valorAtual }])
    setValorAtual(0)
  }

  const removerPagamento = (index: number) => {
    setPagamentos(pagamentos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroForm("")

    if (!clienteId) {
      setErroForm("Por favor, selecione um cliente.")
      return
    }

    setSalvando(true)

    const payload = {
      clienteId,
      dispositivo,
      marca,
      modelo,
      imei,
      defeitoRelatado,
      diagnostico,
      valorServico: Number(valorServico),
      valorPecas: Number(valorPecas),
      garantiaDias: Number(garantiaDias),
      observacoes,
      pagamentos,
    }

    try {
      const res = await fetch("/api/ordens-servico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const osCriada = await res.json()
        router.push(`/ordens-servico/${osCriada.id}`)
      } else {
        const json = await res.json()
        setErroForm(json.message || "Erro ao criar Ordem de Serviço.")
      }
    } catch {
      setErroForm("Falha na requisição com o servidor.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/ordens-servico"
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-blue-500" />
            <span>Nova Ordem de Serviço</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Preencha os dados do aparelho e problema relatado pelo cliente
          </p>
        </div>
      </div>

      {erroForm && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{erroForm}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloco 1: Seleção de Cliente */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-5 h-5 text-blue-500" />
            <span>Cliente</span>
          </h3>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Selecione o Cliente *
            </label>
            {loadingClientes ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span>Carregando clientes...</span>
              </div>
            ) : (
              <select
                required
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Escolha um cliente cadastrado --</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} {c.telefone ? `(${c.telefone})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Bloco 2: Dados do Aparelho */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Smartphone className="w-5 h-5 text-blue-500" />
            <span>Dados do Aparelho</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tipo de Dispositivo *
              </label>
              <input
                type="text"
                required
                value={dispositivo}
                onChange={(e) => setDispositivo(e.target.value)}
                placeholder="Ex: Smartphone, Tablet, Notebook"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Marca / Fabricante
              </label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ex: Apple, Samsung, Motorola"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Modelo do Aparelho
              </label>
              <input
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ex: iPhone 13 Pro, Galaxy S22"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                IMEI / Nº de Série
              </label>
              <input
                type="text"
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                placeholder="IMEI de 15 dígitos ou Nº de Série"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Defeito Relatado pelo Cliente *
            </label>
            <textarea
              required
              rows={3}
              value={defeitoRelatado}
              onChange={(e) => setDefeitoRelatado(e.target.value)}
              placeholder="Descreva detalhadamente o problema informado pelo cliente..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Diagnóstico / Laudo Técnico Inicial
            </label>
            <textarea
              rows={2}
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              placeholder="Constatações prévias do técnico..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Bloco 3: Valores e Garantia */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <span>Valores e Garantia</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mão de Obra / Serviço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valorServico}
                onChange={(e) => setValorServico(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Valor das Peças (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valorPecas}
                onChange={(e) => setValorPecas(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Garantia (Dias)
              </label>
              <input
                type="number"
                min="0"
                value={garantiaDias}
                onChange={(e) => setGarantiaDias(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">Valor Total Calculado:</span>
            <span className="text-xl font-bold text-emerald-400">
              R$ {valorTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Bloco 4: Pagamentos Fracionados */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Wrench className="w-5 h-5 text-blue-500" />
            <span>Pagamento Dividido (Opcional)</span>
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={formaAtual}
              onChange={(e) => setFormaAtual(e.target.value)}
              className="w-full sm:w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
            >
              {formasPagamentoList.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              min="0"
              value={valorAtual}
              onChange={(e) => setValorAtual(parseFloat(e.target.value) || 0)}
              placeholder="Valor em R$"
              className="w-full sm:w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
            />
            <button
              type="button"
              onClick={adicionarPagamento}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>

          {pagamentos.length > 0 && (
            <div className="space-y-2 pt-2">
              {pagamentos.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm"
                >
                  <span className="text-slate-300 font-medium">{p.formaPagamento}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-400 font-bold">R$ {p.valor.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => removerPagamento(idx)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/ordens-servico"
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={salvando}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {salvando ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            <span>Salvar e Abrir Ordem de Serviço</span>
          </button>
        </div>
      </form>
    </div>
  )
}
