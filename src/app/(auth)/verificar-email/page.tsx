// src/app/(auth)/verificar-email/page.tsx
"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, Loader2, CheckCircle2, Mail, RefreshCw, ArrowLeft } from "lucide-react"

function VerificarEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams?.get("email") || ""

  const [codigo, setCodigo] = useState(["", "", "", "", "", ""])
  const [emailInput, setEmailInput] = useState(emailParam)
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [loading, setLoading] = useState(false)
  const [reenviando, setReenviando] = useState(false)
  const [cooldown, setCooldown] = useState(60)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  // Atualizar emailInput quando emailParam mudar
  useEffect(() => {
    if (emailParam) setEmailInput(emailParam)
  }, [emailParam])

  // Timer de Cooldown 60s
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  // Manipular entrada dos 6 dígitos
  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, "")
    if (!char) {
      const novocodigo = [...codigo]
      novocodigo[index] = ""
      setCodigo(novocodigo)
      return
    }

    const novocodigo = [...codigo]
    novocodigo[index] = char.slice(-1)
    setCodigo(novocodigo)

    // Pular para o próximo input automaticamente
    if (index < 5 && char) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codigo[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pastedData.length > 0) {
      const novocodigo = [...codigo]
      for (let i = 0; i < 6; i++) {
        novocodigo[i] = pastedData[i] || ""
      }
      setCodigo(novocodigo)
      const focusIndex = Math.min(pastedData.length, 5)
      inputsRef.current[focusIndex]?.focus()
    }
  }

  const handleVerificar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErro("")
    setSucesso("")

    const codigoCompleto = codigo.join("")
    if (codigoCompleto.length !== 6) {
      setErro("Por favor, informe os 6 dígitos do código de verificação.")
      return
    }

    if (!emailInput.trim()) {
      setErro("Informe o e-mail cadastrado.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          codigo: codigoCompleto,
        }),
      })

      const json = await res.json()

      if (res.ok) {
        setSucesso("E-mail verificado com sucesso! Redirecionando para o login...")
        setTimeout(() => {
          router.push("/login")
        }, 1500)
      } else {
        setErro(json.message || "Código inválido ou expirado.")
      }
    } catch {
      setErro("Falha na conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleReenviarCodigo = async () => {
    if (cooldown > 0 || reenviando) return
    setErro("")
    setSucesso("")
    setReenviando(true)

    try {
      const res = await fetch("/api/auth/reenviar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      })

      const json = await res.json()

      if (res.ok) {
        setSucesso("Novo código de 6 dígitos enviado! Verifique seu e-mail.")
        setCooldown(60)
      } else {
        setErro(json.message || "Erro ao reenviar código.")
      }
    } catch {
      setErro("Erro na conexão ao reenviar código.")
    } finally {
      setReenviando(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-zinc-900/60 border border-white/10 backdrop-blur-2xl rounded-[32px] p-8 sm:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative z-10 space-y-8 my-8 text-center">
      {/* Header */}
      <div className="space-y-3">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white mx-auto">
          <Mail className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Verifique seu E-mail<span className="text-emerald-400">.</span>
        </h1>
        <p className="text-xs text-zinc-400 font-light leading-relaxed">
          Enviamos um código de 6 dígitos para o e-mail: <br />
          <strong className="text-white">{emailInput || "seu e-mail"}</strong>
        </p>
      </div>

      {/* Caixa de Aviso Importante SPAM */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-left leading-relaxed flex items-start gap-3">
        <span className="text-base shrink-0">📩</span>
        <div>
          <strong>Aviso Importante:</strong> Não encontrou o código na caixa de entrada? Verifique sua pasta de <strong>SPAM</strong> ou <strong>Lixo Eletrônico</strong>.
        </div>
      </div>

      {erro && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center gap-2 text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {sucesso && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{sucesso}</span>
        </div>
      )}

      {/* Formulário dos 6 Dígitos */}
      <form onSubmit={handleVerificar} className="space-y-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {codigo.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputsRef.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-11 h-14 sm:w-12 sm:h-14 bg-zinc-950 border border-zinc-800 rounded-2xl text-center text-xl font-bold font-mono text-white focus:outline-none focus:border-emerald-400 transition-all shadow-sm"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || codigo.join("").length !== 6}
          className="w-full bg-white hover:bg-zinc-200 text-black text-sm font-extrabold py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-40"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verificando Código...</span>
            </>
          ) : (
            <span>Confirmar & Ativar Trial</span>
          )}
        </button>
      </form>

      {/* Reenvio e Voltar */}
      <div className="space-y-4 pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={handleReenviarCodigo}
          disabled={cooldown > 0 || reenviando}
          className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {reenviando ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          {cooldown > 0 ? (
            <span>Reenviar código em {cooldown}s</span>
          ) : (
            <span>Reenviar novo código de 6 dígitos</span>
          )}
        </button>

        <div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para a tela de login</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerificarEmailPage() {
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

      <Suspense fallback={
        <div className="text-center text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-white" />
        </div>
      }>
        <VerificarEmailContent />
      </Suspense>
    </div>
  )
}
