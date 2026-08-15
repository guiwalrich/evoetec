// src/app/(auth)/verificar-email/page.tsx
"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, Loader2, CheckCircle2, Mail, RefreshCw, ArrowLeft, ShieldCheck } from "lucide-react"

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
        setSucesso("E-mail verificado com sucesso! Ativando Trial de 14 dias...")
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
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
    <div className="min-h-screen w-full bg-[#e8e8ec] text-zinc-900 selection:bg-zinc-900 selection:text-white font-sans antialiased py-8 px-4 sm:px-6 flex items-center justify-center">
      
      <div className="w-full max-w-md space-y-6 text-center">

        {/* LOGO */}
        <div className="space-y-2">
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
            Verificação de E-mail para Ativação do Trial
          </p>
        </div>

        {/* CONTAINER DO CÓDIGO DE VERIFICAÇÃO */}
        <div className="bg-white rounded-[36px] p-6 sm:p-8 border-4 border-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] space-y-6">

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-900 mx-auto">
              <Mail className="w-6 h-6 text-zinc-900" />
            </div>
            <h2 className="text-xl font-extrabold text-zinc-900">
              Digite o Código de 6 Dígitos
            </h2>
            <p className="text-xs text-zinc-500 font-normal leading-relaxed">
              Enviamos um código de confirmação para:<br />
              <strong className="text-zinc-900 font-bold">{emailInput || "seu e-mail"}</strong>
            </p>
          </div>

          {/* CAIXA DE AVISO VISUAL ANTI-SPAM */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left leading-relaxed flex items-start gap-3">
            <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Aviso Importante:</strong> Não encontrou na caixa de entrada? Verifique também sua pasta de <strong>SPAM</strong> ou <strong>Lixo Eletrônico</strong>.
            </div>
          </div>

          {erro && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-center gap-2 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{sucesso}</span>
            </div>
          )}

          {/* INPUT DOS 6 DÍGITOS */}
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
                  className="w-11 h-14 sm:w-12 sm:h-14 bg-zinc-50 border border-zinc-200 rounded-xl text-center text-xl font-extrabold font-mono text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all shadow-2xs"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || codigo.join("").length !== 6}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Confirmar & Ativar Trial de 14 Dias</span>
              )}
            </button>
          </form>

          {/* TIMER DE REENVIO 60s */}
          <div className="pt-2 border-t border-zinc-100 space-y-3">
            <button
              type="button"
              onClick={handleReenviarCodigo}
              disabled={cooldown > 0 || reenviando}
              className="text-xs text-zinc-600 hover:text-zinc-900 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50 font-semibold"
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
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para a tela de login</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#e8e8ec] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-800" />
      </div>
    }>
      <VerificarEmailContent />
    </Suspense>
  )
}
