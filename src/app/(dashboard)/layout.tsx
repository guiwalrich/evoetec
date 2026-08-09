// src/app/(dashboard)/layout.tsx
"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { NextAuthProvider } from "@/components/providers/NextAuthProvider"
import { AssinaturaGuard } from "@/components/layout/AssinaturaGuard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <NextAuthProvider>
      <AssinaturaGuard>
        <div className="min-h-screen bg-[#f4f4f6] bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:24px_24px] p-3 sm:p-6 text-zinc-900 font-sans selection:bg-black selection:text-white flex items-center justify-center">
          {/* Shell Flutuante Monochromatic Glassmorphism (Soft UI 40px) */}
          <div className="w-full max-w-[1600px] min-h-[calc(100vh-3rem)] bg-white/50 backdrop-blur-2xl border border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.05)] rounded-[40px] flex overflow-hidden relative">
            {/* Sidebar Flutuante */}
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            {/* Conteúdo Principal */}
            <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
              <Header setMobileOpen={setMobileOpen} />
              <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </div>
      </AssinaturaGuard>
    </NextAuthProvider>
  )
}
