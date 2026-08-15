// src/app/(auth)/login/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { AlertCircle, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

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
        setErro("Credenciais inválidas. Verifique seu e-mail e senha.")
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
    <div className="min-h-screen w-full bg-[#e8e8ec] text-zinc-900 selection:bg-zinc-900 selection:text-white font-sans antialiased py-8 px-4 sm:px-6 flex items-center justify-center">
      
      <div className="w-full max-w-md space-y-6">

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
            Acesse a Bancada da Sua Assistência
          </p>
        </div>

        {/* CONTAINER PRINCIPAL DO FORMULÁRIO */}
        <div className="bg-white rounded-[36px] p-6 sm:p-8 border-4 border-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] space-y-6">

          {/* TAB SWITCHER DUAL (LOGIN vs REGISTRO) */}
          <div className="flex bg-zinc-100 p-1.5 rounded-full border border-zinc-200 text-xs font-semibold">
            <button
              type="button"
              className="flex-1 py-2.5 rounded-full bg-zinc-900 text-white font-bold shadow-sm transition-all text-center"
            >
              Já Tenho Conta (Entrar)
            </button>
            <Link
              href="/registro"
              className="flex-1 py-2.5 rounded-full text-zinc-600 hover:text-zinc-900 transition-all text-center"
            >
              Criar Conta Trial
            </Link>
          </div>

          {/* MENSSAGEM DE ERRO */}
          {erro && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          {/* FORMULÁRIO DE LOGIN */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 block">E-mail Cadastrado</label>
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700 block">Senha</label>
                <Link href="/esqueci-senha" className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  required
                  placeholder="Sua senha de acesso"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] disabled:opacity-50 pt-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Entrando no Sistema...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

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
