// src/app/(auth)/registro/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, Loader2, CheckCircle, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react"

export default function RegistroPage() {
  const router = useRouter()
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
      setErro("Preencha todos os campos obrigatórios corretamente. A senha deve ter no mínimo 6 caracteres.")
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
    <div className="min-h-screen w-full bg-black text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-white selection:text-black">
      {/* Luz Radial de Fundo */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 70%)"
        }}
      />

      {/* Grid de Fundo */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: "linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)",
          backgroundSize: "64px 64px"
        }}
      />

      <div className="w-full max-w-lg bg-zinc-900/60 border border-white/10 backdrop-blur-2xl rounded-[32px] p-8 sm:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative z-10 space-y-8 my-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block hover:scale-105 transition-transform">
            <img
              src="/assets/wrldevotec.webp"
              alt="Evo Etec Logo"
              width={80}
              height={80}
              className="object-contain w-20 h-20 mx-auto block"
            />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Teste Grátis por 14 Dias<span className="text-emerald-400">.</span>
            </h1>
            <p className="text-xs text-zinc-400 font-light">
              Sem cartão de crédito. Crie sua conta e receba o código de ativação.
            </p>
          </div>
        </div>

        {erro && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da Assistência */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5 ml-3">
              Nome da Assistência Técnica *
            </label>
            <input
              type="text"
              required
              value={nomeEmpresa}
              onChange={(e) => setNomeEmpresa(e.target.value)}
              placeholder="Ex: Solutec Cell Assistência"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-full px-5 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-all shadow-sm"
            />
          </div>

          {/* Nome do Responsável */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5 ml-3">
              Seu Nome Completo *
            </label>
            <input
              type="text"
              required
              value={nomeResponsavel}
              onChange={(e) => setNomeResponsavel(e.target.value)}
              placeholder="Ex: Lucas Henrique"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-full px-5 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-all shadow-sm"
            />
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5 ml-3">
              E-mail Comercial (para receber o código) *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@assistencia.com"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-full px-5 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-all shadow-sm"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5 ml-3">
              WhatsApp Comercial
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => handleWhatsappChange(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-full px-5 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-all shadow-sm"
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5 ml-3">
              Senha de Acesso (mín. 6 caracteres) *
            </label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-full pl-5 pr-12 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-zinc-200 text-black text-sm font-extrabold py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-[1.01] disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Criando Conta Trial...</span>
              </>
            ) : (
              <>
                <span>Cadastrar & Receber Código</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/5 space-y-2">
          <p className="text-xs text-zinc-400">
            Já possui uma conta?{" "}
            <Link href="/login" className="text-white font-bold hover:underline">
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
