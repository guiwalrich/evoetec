// src/app/(dashboard)/configuracoes/page.tsx
"use client"

import { useState, useEffect } from "react"
import { mascararCpfCnpj, mascararTelefone } from "@/lib/utils"
import { buscarCnpj } from "@/lib/integrations/brasilapi"
import { buscarCep } from "@/lib/integrations/viacep"
import { Settings, Building2, Save, Loader2, AlertCircle, CheckCircle2, Copy } from "lucide-react"

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null)

  const [nomeFantasia, setNomeFantasia] = useState("")
  const [razaoSocial, setRazaoSocial] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [telefone, setTelefone] = useState("")
  const [endereco, setEndereco] = useState("")

  const handleBlurCnpj = async () => {
    const clean = cnpj.replace(/\D/g, "")
    if (clean.length === 14) {
      const info = await buscarCnpj(clean)
      if (info) {
        if (info.razaoSocial) setRazaoSocial(info.razaoSocial)
        if (info.nomeFantasia) setNomeFantasia(info.nomeFantasia)
        if (info.telefone) setTelefone(mascararTelefone(info.telefone))
        if (info.enderecoCompleto) setEndereco(info.enderecoCompleto)
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

  useEffect(() => {
    async function carregarEmpresa() {
      try {
        const res = await fetch("/api/empresa")
        if (res.ok) {
          const json = await res.json()
          setNomeFantasia(json.nomeFantasia || "")
          setRazaoSocial(json.razaoSocial || "")
          setCnpj(json.cnpj ? mascararCpfCnpj(json.cnpj) : "")
          setTelefone(json.telefone ? mascararTelefone(json.telefone) : "")
          setEndereco(json.endereco || "")
        }
      } catch (err) {
        console.error("Erro ao carregar dados da empresa:", err)
      } finally {
        setLoading(false)
      }
    }
    carregarEmpresa()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensagem(null)
    setSalvando(true)

    try {
      const res = await fetch("/api/empresa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeFantasia,
          razaoSocial,
          cnpj,
          telefone,
          endereco,
        }),
      })

      if (res.ok) {
        setMensagem({ tipo: "sucesso", texto: "Dados da assistência técnica atualizados com sucesso!" })
      } else {
        const json = await res.json()
        setMensagem({ tipo: "erro", texto: json.message || "Erro ao salvar dados." })
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Falha na requisição." })
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 mb-2" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
          <Settings className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
          <span>Configurações da Empresa</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1 font-light">
          Atualize as informações institucionais e de contato da sua assistência técnica
        </p>
      </div>

      {/* Card do Link Público do Catálogo Soft UI */}
      <div className="bg-white border border-zinc-100/90 rounded-[32px] p-6 sm:p-8 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="text-sm font-bold text-zinc-900">Link Público do Catálogo</h3>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            readOnly
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/catalogo`}
            className="w-full bg-zinc-50 border border-zinc-200/80 rounded-full px-5 py-3 text-sm text-zinc-800 font-medium"
          />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/catalogo`)
              alert("Link do catálogo copiado com sucesso!")
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-black hover:bg-zinc-800 text-white text-xs font-semibold shrink-0 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Copy className="w-4 h-4" strokeWidth={1.5} />
            <span>Copiar Link</span>
          </button>
        </div>
      </div>

      {mensagem && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium ${
            mensagem.tipo === "sucesso"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {mensagem.tipo === "sucesso" ? <CheckCircle2 className="w-5 h-5 shrink-0" strokeWidth={1.5} /> : <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={1.5} />}
          <span>{mensagem.texto}</span>
        </div>
      )}

      {/* Formulário Soft UI */}
      <form onSubmit={handleSubmit} className="bg-white border border-zinc-100/90 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-4">
          <Building2 className="w-5 h-5 text-zinc-700" strokeWidth={1.5} />
          <span>Dados Institucionais</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Nome Fantasia *</label>
            <input
              type="text"
              required
              value={nomeFantasia}
              onChange={(e) => setNomeFantasia(e.target.value)}
              className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Razão Social</label>
            <input
              type="text"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">CNPJ</label>
            <input
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(mascararCpfCnpj(e.target.value))}
              onBlur={handleBlurCnpj}
              placeholder="00.000.000/0001-00 (Busca automática)"
              className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Telefone / WhatsApp</label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
              className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Endereço da Loja ou CEP</label>
          <input
            type="text"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            onBlur={(e) => handleBlurCep(e.target.value)}
            placeholder="Bipe/digite CEP ou informe o Endereço completo"
            className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
          />
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-zinc-100">
          <button
            type="submit"
            disabled={salvando}
            className="px-6 py-3 rounded-full bg-black hover:bg-zinc-800 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
          >
            {salvando ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : <Save className="w-4 h-4" strokeWidth={1.5} />}
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>
    </div>
  )
}
