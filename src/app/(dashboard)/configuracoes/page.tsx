// src/app/(dashboard)/configuracoes/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { mascararCpfCnpj, mascararTelefone } from "@/lib/utils"
import { buscarCnpj } from "@/lib/integrations/brasilapi"
import { buscarCep } from "@/lib/integrations/viacep"
import { Settings, Building2, Save, Loader2, AlertCircle, CheckCircle2, Copy, User } from "lucide-react"

const USER_AVATARS = Array.from({ length: 16 }, (_, i) => i + 1)

export default function ConfiguracoesPage() {
  const { data: session, update: updateSession } = useSession()
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [salvandoAvatar, setSalvandoAvatar] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null)
  const [avatarMensagem, setAvatarMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null)

  const [nomeFantasia, setNomeFantasia] = useState("")
  const [razaoSocial, setRazaoSocial] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [telefone, setTelefone] = useState("")
  const [cep, setCep] = useState("")
  const [endereco, setEndereco] = useState("")
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(1)

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

  const handleCepChange = async (valor: string) => {
    const limpo = valor.replace(/\D/g, "")
    let formatado = limpo
    if (limpo.length <= 8) {
      if (limpo.length > 5) formatado = `${limpo.slice(0, 5)}-${limpo.slice(5)}`
      setCep(formatado)
    }

    if (limpo.length === 8) {
      setBuscandoCep(true)
      const info = await buscarCep(limpo)
      if (info) {
        setEndereco(info.enderecoCompleto)
      }
      setBuscandoCep(false)
    }
  }

  useEffect(() => {
    async function carregarDados() {
      try {
        const resEmpresa = await fetch("/api/empresa")
        if (resEmpresa.ok) {
          const json = await resEmpresa.json()
          setNomeFantasia(json.nomeFantasia || "")
          setRazaoSocial(json.razaoSocial || "")
          setCnpj(json.cnpj ? mascararCpfCnpj(json.cnpj) : "")
          setTelefone(json.telefone ? mascararTelefone(json.telefone) : "")
          setEndereco(json.endereco || "")
        }

        const resAvatar = await fetch("/api/usuario/avatar")
        if (resAvatar.ok) {
          const json = await resAvatar.json()
          if (json.avatarId) setSelectedAvatar(json.avatarId)
        }
      } catch (err) {
        console.error("Erro ao carregar configurações:", err)
      } finally {
        setLoading(false)
      }
    }
    carregarDados()
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

  const handleSalvarAvatar = async () => {
    setAvatarMensagem(null)
    setSalvandoAvatar(true)
    try {
      const res = await fetch("/api/usuario/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarId: selectedAvatar }),
      })

      if (res.ok) {
        setAvatarMensagem({ tipo: "sucesso", texto: "Avatar Pixel Art alterado e salvo com sucesso no banco de dados!" })
        if (updateSession) {
          await updateSession({ avatarId: selectedAvatar })
        }
        setTimeout(() => {
          window.location.reload()
        }, 600)
      } else {
        const json = await res.json()
        setAvatarMensagem({ tipo: "erro", texto: json.message || "Erro ao atualizar avatar." })
      }
    } catch {
      setAvatarMensagem({ tipo: "erro", texto: "Falha ao conectar com o servidor." })
    } finally {
      setSalvandoAvatar(false)
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
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
          <Settings className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
          <span>Configurações do Perfil & Empresa</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1 font-light">
          Altere seu avatar pixel art e os dados institucionais da sua assistência técnica
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SELETOR DE AVATAR PIXEL ART PARA USUÁRIOS EXISTENTES */}
      {/* ========================================================================= */}
      <div className="bg-white border border-zinc-100/90 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <User className="w-5 h-5 text-zinc-700" strokeWidth={1.5} />
            <span>Seu Avatar Pixel Art (Bancada)</span>
          </h3>
          <span className="text-xs font-mono font-semibold text-zinc-500">
            Avatar #{selectedAvatar} Selecionado
          </span>
        </div>

        {avatarMensagem && (
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium ${
              avatarMensagem.tipo === "sucesso"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {avatarMensagem.tipo === "sucesso" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            )}
            <span>{avatarMensagem.texto}</span>
          </div>
        )}

        <p className="text-xs text-zinc-500 font-normal">
          Escolha entre os 16 avatares em pixel art para ser exibido no seu perfil, dashboard e ordem de serviço:
        </p>

        {/* Grade de 16 Avatares */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3 pt-1">
          {USER_AVATARS.map((num) => {
            const isSelected = selectedAvatar === num
            return (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedAvatar(num)}
                className={`p-2.5 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-lg scale-105"
                    : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800 hover:scale-105"
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-300 bg-zinc-200 shrink-0">
                  <img
                    src={`/assets/avatars/avatar_${num}.png`}
                    alt={`Avatar ${num}`}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <span className="text-[9px] font-mono font-bold">#{num.toString().padStart(2, "0")}</span>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSalvarAvatar}
            disabled={salvandoAvatar}
            className="px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {salvandoAvatar ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando Avatar...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Avatar no Perfil</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card do Link Público do Catálogo */}
      <div className="bg-white border border-zinc-100/90 rounded-[32px] p-6 sm:p-8 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="text-sm font-bold text-zinc-900">Link Público do Catálogo</h3>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            readOnly
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/catalogo?empresaId=${(session?.user as any)?.empresaId || ""}`}
            className="w-full bg-zinc-50 border border-zinc-200/80 rounded-full px-5 py-3 text-sm text-zinc-800 font-medium"
          />
          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}/catalogo?empresaId=${(session?.user as any)?.empresaId || ""}`
              navigator.clipboard.writeText(url)
              alert("Link exclusivo do seu catálogo copiado com sucesso!")
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
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">CNPJ / CPF</label>
            <input
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(mascararCpfCnpj(e.target.value))}
              onBlur={handleBlurCnpj}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2 flex items-center justify-between">
              <span>Buscar por CEP</span>
              {buscandoCep && <span className="text-[10px] text-zinc-500 font-mono animate-pulse">Buscando...</span>}
            </label>
            <input
              type="text"
              value={cep}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
              className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Endereço Completo (Rua, Número, Bairro, Cidade - UF)</label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, Número, Bairro, Cidade - UF"
              className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-100">
          <button
            type="submit"
            disabled={salvando}
            className="px-8 py-3.5 rounded-full bg-black hover:bg-zinc-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {salvando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={1.5} />
                <span>Salvar Alterações da Empresa</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
