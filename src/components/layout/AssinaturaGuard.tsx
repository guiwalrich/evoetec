// src/components/layout/AssinaturaGuard.tsx
"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import GracePeriodBanner from "@/components/layout/GracePeriodBanner"

export function AssinaturaGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [gracePeriod, setGracePeriod] = useState(false)
  const [vencimento, setVencimento] = useState<string>("")

  useEffect(() => {
    // Não executa checagem se já estiver na página de assinatura
    if (pathname === "/assinatura") {
      setLoading(false)
      return
    }

    async function verificar() {
      try {
        const res = await fetch("/api/empresa/checar-assinatura")
        if (res.ok) {
          const json = await res.json()
          if (
            json.statusAssinatura === "BLOQUEADO" ||
            json.statusAssinatura === "AGUARDANDO_PAGAMENTO"
          ) {
            router.push("/assinatura")
            return
          }

          if (json.gracePeriod && json.vencimento) {
            setGracePeriod(true)
            setVencimento(json.vencimento)
          }
        }
      } catch (err) {
        console.error("Erro ao verificar status da assinatura:", err)
      } finally {
        setLoading(false)
      }
    }

    verificar()
  }, [pathname, router])

  if (loading && pathname !== "/assinatura") {
    return (
      <div className="min-h-screen bg-[#111113] text-zinc-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <>
      {gracePeriod && vencimento && <GracePeriodBanner vencimento={vencimento} />}
      {children}
    </>
  )
}
