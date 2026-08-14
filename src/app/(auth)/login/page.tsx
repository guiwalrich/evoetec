// src/app/(auth)/login/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const canvas = document.getElementById("particles-canvas") as HTMLCanvasElement
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number }> = []
    const particleCount = 45

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 1,
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)"

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()

        // Desenhar linhas de conexão entre partículas próximas
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 120) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(0, 0, 0, ${0.25 - dist / 1000})`
            ctx.lineWidth = 0.6
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        email,
        senha,
        redirect: false,
      })

      if (res?.error) {
        if (res.error.includes("EmailNotVerified")) {
          setErro("E-mail não verificado. Redirecionando para tela de verificação...")
          setTimeout(() => {
            router.push(`/verificar-email?email=${encodeURIComponent(email)}`)
          }, 1200)
        } else {
          setErro("Credenciais inválidas. Verifique e-mail e senha.")
        }
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setErro("Ocorreu um erro ao tentar fazer login. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#f4f4f6] text-zinc-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-black selection:text-white">
      {/* Canvas de Partículas Flutuantes Soft Glass */}
      <canvas id="particles-canvas" className="absolute inset-0 pointer-events-none z-0" />

      {/* Luz Ambiental de Fundo (Soft Glass Glow) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-zinc-200/50 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-zinc-300/30 rounded-full blur-[140px] pointer-events-none" />

      {/* Container Central Flutuante Soft UI Glassmorphism */}
      <div className="w-full max-w-md bg-white/70 border border-white/80 backdrop-blur-2xl rounded-[32px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative z-10 space-y-8">
        {/* Logo + Título */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center min-h-[96px] min-w-[96px]">
            <img
              src="/assets/wrldevotec.webp"
              alt="Evo Etec Logo"
              width={96}
              height={96}
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.style.display = "none"
              }}
              className="object-contain w-24 h-24 hover:scale-105 transition-transform drop-shadow-md mx-auto block"
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 font-sans">
              Bem-vindo de volta!
            </h1>
            <p className="text-xs text-zinc-500 font-light tracking-wide">
              Acesse sua conta no <span className="text-zinc-900 font-medium">Evo Etec ERP</span>
            </p>
          </div>
        </div>

        {erro && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-center gap-3 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span>{erro}</span>
          </div>
        )}

        {/* Formulário Soft UI de Alta Precisão */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5 ml-3">
              E-mail de Acesso
            </label>
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@assistencia.com"
              className="w-full bg-white border border-zinc-200/80 rounded-full px-5 py-3.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-800 transition-all shadow-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 ml-3">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Senha
              </label>
              <Link
                href="/esqueci-senha"
                className="text-xs text-zinc-500 hover:text-black transition-colors font-light"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                required
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white border border-zinc-200/80 rounded-full px-5 py-3.5 pr-12 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-800 transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800 transition-colors"
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-zinc-800 text-white font-semibold py-3.5 rounded-full text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" strokeWidth={1.5} />
                <span>Entrando...</span>
              </>
            ) : (
              <span>Entrar no Sistema</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-zinc-100">
          <span className="text-[11px] text-zinc-400 font-light">
            Evo Etec ERP © 2026 — Gestão Minimalista
          </span>
        </div>
      </div>
    </div>
  )
}
