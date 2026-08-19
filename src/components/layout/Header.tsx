// src/components/layout/Header.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Menu, User, Bell, AlertTriangle, ClipboardList, DollarSign, Loader2, Check, Sun, Moon } from "lucide-react"

interface HeaderProps {
  setMobileOpen: (open: boolean) => void
}

interface NotificacaoItem {
  id: string
  tipo: "ESTOQUE" | "OS" | "FINANCEIRO"
  titulo: string
  mensagem: string
  href: string
  prioridade: string
}

export function Header({ setMobileOpen }: HeaderProps) {
  const { data: session } = useSession()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("light")
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("app_theme") as "dark" | "light" | null
    if (saved) {
      setTheme(saved)
      if (saved === "dark") document.documentElement.classList.add("dark")
      else document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    localStorage.setItem("app_theme", nextTheme)
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const carregarNotificacoes = async () => {
    setLoadingNotifs(true)
    try {
      const res = await fetch("/api/notificacoes")
      if (res.ok) {
        const json = await res.json()
        setNotificacoes(json.notificacoes || [])
      }
    } catch (err) {
      console.error("Erro ao buscar notificações:", err)
    } finally {
      setLoadingNotifs(false)
    }
  }

  useEffect(() => {
    carregarNotificacoes()
    // Polling a cada 60 segundos
    const interval = setInterval(carregarNotificacoes, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fechar popover ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "ESTOQUE":
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" strokeWidth={1.5} />
      case "OS":
        return <ClipboardList className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0" strokeWidth={1.5} />
      case "FINANCEIRO":
        return <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.5} />
      default:
        return <Bell className="w-4 h-4 text-zinc-600 dark:text-zinc-400 shrink-0" strokeWidth={1.5} />
    }
  }

  return (
    <header className="h-16 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between transition-colors duration-200">
      {/* Botão de Menu Mobile & Indicador de Status */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Menu className="w-6 h-6" strokeWidth={1.5} />
        </button>
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-xs text-zinc-700 dark:text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-zinc-500 dark:text-zinc-400">Servidor:</span>
          <span className="font-semibold text-zinc-900 dark:text-white">Online (Latência 12ms)</span>
        </div>
      </div>

      {/* Perfil, Tema e Notificações */}
      <div className="flex items-center gap-2 sm:gap-3 relative" ref={popoverRef}>
        {/* Botão de Alternância de Tema Global (Dark / Light) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title={theme === "dark" ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
          ) : (
            <Moon className="w-5 h-5 text-zinc-700" strokeWidth={1.5} />
          )}
        </button>

        {/* Sininho Interativo com Contador Real */}
        <button
          onClick={() => {
            setPopoverOpen(!popoverOpen)
            if (!popoverOpen) carregarNotificacoes()
          }}
          className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative cursor-pointer"
          title="Notificações e Avisos"
        >
          <Bell className="w-5 h-5" strokeWidth={1.5} />
          {notificacoes.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-sm">
              {notificacoes.length > 9 ? "9+" : notificacoes.length}
            </span>
          )}
        </button>

        {/* Dropdown Popover de Notificações */}
        {popoverOpen && (
          <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-100/90 dark:border-zinc-800 rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-5 z-50 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-zinc-900 dark:text-white" strokeWidth={1.5} />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Avisos do Sistema</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {notificacoes.length} alertas
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 divide-y divide-zinc-100/80 dark:divide-zinc-800 pr-1">
              {loadingNotifs ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-900 dark:text-white" strokeWidth={1.5} />
                  <span>Atualizando avisos...</span>
                </div>
              ) : notificacoes.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-400 font-light flex flex-col items-center gap-2">
                  <Check className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />
                  <span>Nenhum alerta pendente. Tudo rodando perfeitamente!</span>
                </div>
              ) : (
                notificacoes.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setPopoverOpen(false)}
                    className="pt-2.5 first:pt-0 flex items-start gap-3 p-2 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors block"
                  >
                    <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 mt-0.5">
                      {getIcon(item.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-xs font-bold text-zinc-900 dark:text-white leading-snug">
                        {item.titulo}
                      </span>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-light leading-normal line-clamp-2 mt-0.5">
                        {item.mensagem}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <button
                onClick={carregarNotificacoes}
                className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white font-medium text-[11px] transition-colors"
              >
                Atualizar Lista
              </button>
              <button
                onClick={() => setPopoverOpen(false)}
                className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-[11px]"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 overflow-hidden flex items-center justify-center shadow-sm shrink-0">
            <img 
              src={`/assets/avatars/avatar_${(session?.user as any)?.avatarId || 1}.png`}
              alt="Avatar Pixel Art"
              className="w-full h-full object-cover"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <div className="hidden md:block text-left">
            <span className="block text-sm font-bold text-zinc-900 dark:text-white leading-tight">
              {session?.user?.name || "Usuário Evo Etec"}
            </span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {session?.user?.role || "ADMIN"}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
