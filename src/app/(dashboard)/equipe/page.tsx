// src/app/(dashboard)/equipe/page.tsx
"use client"

import { useState, useEffect } from "react"
import {
  UserCheck,
  Plus,
  Trash2,
  Shield,
  Wrench,
  ShoppingCart,
  Mail,
  Loader2,
  X,
  AlertCircle
} from "lucide-react"

interface MembroEquipe {
  id: string
  nome: string
  email: string
  role: "ADMIN" | "TECNICO" | "VENDEDOR"
  createdAt: string
  _count: {
    ordensServicoTecnico: number
    vendasVendedor: number
  }
}

const roleBadges: Record<string, { label: string; style: string; icon: any }> = {
  ADMIN: { label: "Administrador", style: "bg-black text-white border-black", icon: Shield },
  TECNICO: { label: "Técnico", style: "bg-zinc-100 text-zinc-800 border-zinc-200", icon: Wrench },
  VENDEDOR: { label: "Vendedor", style: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: ShoppingCart },
}

export default function EquipePage() {
  const [membros, setMembros] = useState<MembroEquipe[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState("")

  // Form State
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [role, setRole] = useState<"ADMIN" | "TECNICO" | "VENDEDOR">("TECNICO")

  const carregarEquipe = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/equipe")
      if (res.ok) {
        const json = await res.json()
        setMembros(json)
      }
    } catch (err) {
      console.error("Erro ao carregar equipe:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarEquipe()
  }, [])

  const abrirModalNovo = () => {
    setNome("")
    setEmail("")
    setSenha("")
    setRole("TECNICO")
    setErroForm("")
    setModalOpen(true)
  }

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroForm("")
    setSalvando(true)

    try {
      const res = await fetch("/api/equipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, role }),
      })

      if (res.ok) {
        setModalOpen(false)
        carregarEquipe()
      } else {
        const json = await res.json()
        setErroForm(json.message || "Erro ao cadastrar membro.")
      }
    } catch {
      setErroForm("Falha na conexão.")
    } finally {
      setSalvando(false)
    }
  }

  const handleDeletar = async (id: string, nomeMembro: string) => {
    if (!confirm(`Deseja realmente desativar o usuário "${nomeMembro}"?`)) return

    try {
      const res = await fetch(`/api/equipe/${id}`, { method: "DELETE" })
      if (res.ok) {
        carregarEquipe()
      } else {
        const json = await res.json()
        alert(json.message || "Erro ao desativar usuário.")
      }
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
            <UserCheck className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
            <span>Gestão de Equipe</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-light">
            Controle de técnicos, vendedores e administradores do sistema ({membros.length} ativos)
          </p>
        </div>

        <button
          onClick={abrirModalNovo}
          className="inline-flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-semibold px-5 py-3 rounded-full shadow-md transition-all text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          <span>Novo Colaborador</span>
        </button>
      </div>

      {/* Grid de Membros Soft UI */}
      {loading ? (
        <div className="py-20 text-center text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-zinc-900" strokeWidth={1.5} />
          <span>Carregando membros da equipe...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {membros.map((m) => {
            const badge = roleBadges[m.role] || roleBadges.TECNICO
            const IconRole = badge.icon
            return (
              <div
                key={m.id}
                className="bg-white border border-zinc-100/90 rounded-[32px] p-6 flex flex-col justify-between space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:scale-[1.01] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.style}`}
                    >
                      <IconRole className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{badge.label}</span>
                    </span>
                    <button
                      onClick={() => handleDeletar(m.id, m.nome)}
                      className="text-zinc-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                      title="Desativar Membro"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">{m.nome}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                      <span>{m.email}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                  {m.role === "TECNICO" && (
                    <span>OS Atendidas: <strong className="text-zinc-900 font-bold">{m._count.ordensServicoTecnico}</strong></span>
                  )}
                  {m.role === "VENDEDOR" && (
                    <span>Vendas Realizadas: <strong className="text-zinc-900 font-bold">{m._count.vendasVendedor}</strong></span>
                  )}
                  {m.role === "ADMIN" && <span>Acesso Total ao Sistema</span>}
                  <span className="text-[11px] text-zinc-400 font-light">
                    Desde {new Date(m.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Soft UI */}
      {modalOpen && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-100 rounded-[32px] w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <h3 className="text-lg font-bold text-zinc-900">Novo Colaborador</h3>
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
                <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos Técnico"
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">E-mail de Acesso *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos@assistencia.com"
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Senha Inicial *</label>
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Cargo / Função *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "ADMIN" | "TECNICO" | "VENDEDOR")}
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                >
                  <option value="TECNICO">Técnico de Manutenção</option>
                  <option value="VENDEDOR">Vendedor / Atendente</option>
                  <option value="ADMIN">Administrador (Acesso Total)</option>
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
