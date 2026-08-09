// src/app/(dashboard)/fornecedores/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { mascararCpfCnpj, mascararTelefone } from "@/lib/utils"
import { buscarCnpj } from "@/lib/integrations/brasilapi"
import { buscarCep } from "@/lib/integrations/viacep"
import {
  Truck,
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  AlertCircle
} from "lucide-react"

interface Fornecedor {
  id: string
  nome: string
  cpfCnpj: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
  createdAt: string
}

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Modal States
  const [modalOpen, setModalOpen] = useState(false)
  const [fornecedorEdicao, setFornecedorEdicao] = useState<Fornecedor | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState("")

  // Form State
  const [nome, setNome] = useState("")
  const [cpfCnpj, setCpfCnpj] = useState("")
  const [telefone, setTelefone] = useState("")
  const [email, setEmail] = useState("")
  const [endereco, setEndereco] = useState("")

  const carregarFornecedores = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/fornecedores?busca=${encodeURIComponent(busca)}&page=${page}&limit=10`)
      const json = await res.json()
      if (res.ok) {
        setFornecedores(json.data)
        setTotalPages(json.pagination.totalPages)
        setTotal(json.pagination.total)
      }
    } catch (err) {
      console.error("Erro ao carregar fornecedores:", err)
    } finally {
      setLoading(false)
    }
  }, [busca, page])

  useEffect(() => {
    carregarFornecedores()
  }, [carregarFornecedores])

  const abrirModalNovo = () => {
    setFornecedorEdicao(null)
    setNome("")
    setCpfCnpj("")
    setTelefone("")
    setEmail("")
    setEndereco("")
    setErroForm("")
    setModalOpen(true)
  }

  const abrirModalEditar = (f: Fornecedor) => {
    setFornecedorEdicao(f)
    setNome(f.nome)
    setCpfCnpj(f.cpfCnpj || "")
    setTelefone(f.telefone || "")
    setEmail(f.email || "")
    setEndereco(f.endereco || "")
    setErroForm("")
    setModalOpen(true)
  }

  const handleBlurCpfCnpj = async () => {
    const clean = cpfCnpj.replace(/\D/g, "")
    if (clean.length === 14) {
      const info = await buscarCnpj(clean)
      if (info) {
        if (info.nomeFantasia && !nome) setNome(info.nomeFantasia)
        if (info.telefone && !telefone) setTelefone(mascararTelefone(info.telefone))
        if (info.enderecoCompleto && !endereco) setEndereco(info.enderecoCompleto)
      }
    }
  }

  const handleBlurCep = async (valorEndereco: string) => {
    const clean = valorEndereco.replace(/\D/g, "")
    if (clean.length === 8) {
      const info = await buscarCep(clean)
      if (info) {
        setEndereco(info.enderecoCompleto)
      }
    }
  }

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroForm("")
    setSalvando(true)

    const payload = { nome, cpfCnpj, telefone, email, endereco }

    try {
      const url = fornecedorEdicao ? `/api/fornecedores/${fornecedorEdicao.id}` : "/api/fornecedores"
      const method = fornecedorEdicao ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setModalOpen(false)
        carregarFornecedores()
      } else {
        const json = await res.json()
        setErroForm(json.message || "Erro ao salvar fornecedor.")
      }
    } catch {
      setErroForm("Falha na conexão.")
    } finally {
      setSalvando(false)
    }
  }

  const handleDeletar = async (id: string, nomeFornecedor: string) => {
    if (!confirm(`Deseja realmente remover o fornecedor "${nomeFornecedor}"?`)) return

    try {
      const res = await fetch(`/api/fornecedores/${id}`, { method: "DELETE" })
      if (res.ok) carregarFornecedores()
      else alert("Erro ao excluir fornecedor.")
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
            <Truck className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
            <span>Base de Fornecedores</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-light">
            Gerencie os distribuidores e fornecedores de peças ({total} cadastrados)
          </p>
        </div>

        <button
          onClick={abrirModalNovo}
          className="inline-flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-semibold px-5 py-3 rounded-full shadow-md transition-all text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          <span>Novo Fornecedor</span>
        </button>
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
          placeholder="Buscar fornecedor por nome, CNPJ, telefone ou e-mail..."
          className="bg-transparent border-none text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none w-full"
        />
      </div>

      {/* Tabela Soft UI */}
      <div className="bg-white border border-zinc-100/90 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-700">
            <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4">Fornecedor</th>
                <th className="px-6 py-4">CNPJ / CPF</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Endereço</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-900" strokeWidth={1.5} />
                    <span>Carregando fornecedores...</span>
                  </td>
                </tr>
              ) : fornecedores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                    Nenhum fornecedor encontrado.
                  </td>
                </tr>
              ) : (
                fornecedores.map((f) => (
                  <tr key={f.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900">{f.nome}</td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">{f.cpfCnpj || "-"}</td>
                    <td className="px-6 py-4 space-y-1">
                      {f.telefone && (
                        <div className="flex items-center gap-2 text-xs text-zinc-700">
                          <Phone className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                          <span>{f.telefone}</span>
                        </div>
                      )}
                      {f.email && (
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                          <span>{f.email}</span>
                        </div>
                      )}
                      {!f.telefone && !f.email && "-"}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">
                      {f.endereco ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={1.5} />
                          <span className="truncate max-w-xs">{f.endereco}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => abrirModalEditar(f)}
                        className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => handleDeletar(f.id, f.nome)}
                        className="p-2 rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
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

      {/* Modal Soft UI */}
      {modalOpen && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-100 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <h3 className="text-lg font-bold text-zinc-900">
                {fornecedorEdicao ? "Editar Fornecedor" : "Novo Fornecedor"}
              </h3>
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
                <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">
                  Nome do Fornecedor / Razão Social *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Distribuidora de Peças Express"
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">CNPJ ou CPF</label>
                  <input
                    type="text"
                    value={cpfCnpj}
                    onChange={(e) => setCpfCnpj(mascararCpfCnpj(e.target.value))}
                    onBlur={handleBlurCpfCnpj}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
                    placeholder="(11) 98888-7777"
                    className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">E-mail de Contato</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendas@fornecedor.com"
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Endereço Completo ou CEP</label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  onBlur={(e) => handleBlurCep(e.target.value)}
                  placeholder="Bipe/digite CEP ou informe o Endereço (Rua, Número, Cidade, Estado)"
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                />
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
                  <span>{fornecedorEdicao ? "Atualizar" : "Cadastrar"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
