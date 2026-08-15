// src/app/(auth)/registro/page.tsx
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, Loader2, ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle2, User } from "lucide-react"

const USER_AVATARS = Array.from({ length: 16 }, (_, i) => i + 1)

function RegistroFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const initialAvatar = Number(searchParams?.get("avatar")) || 1
  const [selectedAvatar, setSelectedAvatar] = useState<number>(initialAvatar)

  const [nomeEmpresa, setNomeEmpresa] = useState("")
  const [nomeResponsavel, setNomeResponsavel] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [senha, setSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  // Mascara simples para WhatsApp
  const handleWhatsappChange = (val: string) => {
    const limpo = val.replace(/\D/g, "")
    if (limpo.length <= 11) {
      let formatado = limpo
      if (limpo.length > 2) formatado = `(${limpo.slice(0, 2)}) ${limpo.slice(2)}`
      if (limpo.length > 7) formatado = `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`
      setWhatsapp(formatado)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    setLoading(true)

    if (!nomeEmpresa.trim() || !nomeResponsavel.trim() || !email.trim() || senha.length < 6) {
      setErro("Preencha todos os campos obrigatórios. A senha deve ter no mínimo 6 caracteres.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeEmpresa: nomeEmpresa.trim(),
          nomeResponsavel: nomeResponsavel.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim() || null,
          senha,
          avatarId: selectedAvatar,
        }),
      })

      const json = await res.json()

      if (res.ok) {
        router.push(`/verificar-email?email=${encodeURIComponent(email.trim())}`)
      } else {
        setErro(json.message || "Ocorreu um erro ao realizar o cadastro. Tente novamente.")
      }
    } catch {
      setErro("Falha de conexão com o servidor. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#e8e8ec] text-zinc-900 selection:bg-zinc-900 selection:text-white font-sans antialiased py-8 px-4 sm:px-6 flex items-center justify-center">
      
      <div className="w-full max-w-2xl space-y-6">

        {/* LOGO DA MARCA */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block hover:scale-105 transition-transform">
            <img
              src="/assets/wrldevotec.webp"
              alt="Evo Etec Logo"
              className="w-12 h-12 object-contain mx-auto block"
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
            Evo Etec ERP
          </h1>
          <p className="text-xs text-zinc-500 font-normal">
            Plataforma Completa para Assistências Técnicas
          </p>
        </div>

        {/* CONTAINER PRINCIPAL DO FORMULÁRIO (MATCHING LANDING PAGE STYLING) */}
        <div className="bg-white rounded-[36px] p-6 sm:p-10 border-4 border-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] space-y-8">

          {/* TAB SWITCHER DUAL (REGISTRO vs LOGIN) */}
          <div className="flex bg-zinc-100 p-1.5 rounded-full border border-zinc-200 text-xs font-semibold">
            <button
              type="button"
              className="flex-1 py-2.5 rounded-full bg-zinc-900 text-white font-bold shadow-sm transition-all text-center"
            >
              Criar Conta Trial (14 Dias)
            </button>
            <Link
              href="/login"
              className="flex-1 py-2.5 rounded-full text-zinc-600 hover:text-zinc-900 transition-all text-center"
            >
              Já Tenho Conta (Entrar)
            </Link>
          </div>

          {/* MENSSAGEM DE ERRO */}
          {erro && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          {/* FORMULÁRIO DE CADASTRO */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* SEÇÃO 1: DADOS DA ASSISTÊNCIA */}
            <div className="space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
                1. Dados da Sua Loja / Assistência
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 block">Nome da Assistência *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Conserta Smart Centro"
                    value={nomeEmpresa}
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200/90 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 block">Nome do Responsável *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lucas Silva"
                    value={nomeResponsavel}
                    onChange={(e) => setNomeResponsavel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200/90 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: DADOS DE ACESSO */}
            <div className="space-y-4 pt-2 border-t border-zinc-100">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
                2. Acesso ao Sistema
              </span>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 block">E-mail Comercial *</label>
                    <input
                      type="email"
                      required
                      placeholder="seunome@sualoja.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200/90 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 block">WhatsApp (Opcional)</label>
                    <input
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={whatsapp}
                      onChange={(e) => handleWhatsappChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200/90 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 block">Senha de Acesso *</label>
                  <div className="relative">
                    <input
                      type={mostrarSenha ? "text" : "password"}
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200/90 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                    >
                      {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: SELEÇÃO DO AVATAR PIXEL ART DA EQUIPE */}
            <div className="space-y-3 pt-2 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
                  3. Escolha seu Avatar de Perfil
                </span>
                <span className="text-[11px] font-mono text-zinc-500 font-semibold">
                  Avatar #{selectedAvatar}
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {USER_AVATARS.map((num) => {
                  const isSelected = selectedAvatar === num
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSelectedAvatar(num)}
                      className={`p-1.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                        isSelected 
                          ? "bg-zinc-900 border-zinc-900 shadow-md scale-105" 
                          : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-300 bg-zinc-200">
                        <img
                          src={`/assets/avatars/avatar_${num}.png`}
                          alt={`Avatar ${num}`}
                          className="w-full h-full object-cover"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* BOTÃO DE SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Criando Conta Trial...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Trial Grátis de 14 Dias</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* AVISO DE TRIAL TRANSPARENTE */}
            <div className="text-center text-[11px] text-zinc-500 font-mono space-y-1">
              <p>Ativação imediata via código enviado por e-mail.</p>
              <p>Sem necessidade de cartão de crédito.</p>
            </div>

          </form>

        </div>

        {/* FOOTER DA PÁGINA DE AUTENTICAÇÃO */}
        <div className="text-center text-[11px] text-zinc-500 font-mono">
          <Link href="/" className="hover:text-zinc-900 transition-colors">
            ← Voltar para a Página Inicial
          </Link>
        </div>

      </div>

    </div>
  )
}

export default function RegistroPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#e8e8ec] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-800" />
      </div>
    }>
      <RegistroFormContent />
    </Suspense>
  )
}
