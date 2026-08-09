// src/components/layout/Sidebar.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Package,
  Truck,
  ShoppingCart,
  DollarSign,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  X
} from "lucide-react"

interface SidebarProps {
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
}

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Ordens de Serviço", href: "/ordens-servico", icon: ClipboardList },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Produtos & Peças", href: "/produtos", icon: Package },
  { name: "Fornecedores", href: "/fornecedores", icon: Truck },
  { name: "Vendas (PDV)", href: "/vendas", icon: ShoppingCart },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  { name: "Equipe", href: "/equipe", icon: UserCheck },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
  { name: "Ver Catálogo Online", href: "/catalogo", icon: ExternalLink, external: true },
]

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay para Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen?.(false)}
          className="fixed inset-0 bg-[#111113]/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container Soft UI Glass (Branco Fluido) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white/90 backdrop-blur-2xl border-r border-zinc-200/80 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header da Sidebar com a Logo Oficial EVO ETEC */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-zinc-100">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <img
                src="/assets/wrldevotec.png"
                alt="Evo Etec Logo"
                className="object-contain w-12 h-12 hover:scale-105 transition-transform drop-shadow-sm"
              />
            </div>
            <div>
              <span className="font-extrabold text-zinc-900 tracking-wider block leading-tight text-sm font-sans">
                EVO ETEC
              </span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest block">
                ERP ASSISTÊNCIA
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen?.(false)}
            className="lg:hidden text-zinc-400 hover:text-zinc-900 p-1"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Menu de Navegação Minimalista */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-200">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))
            const Icon = item.icon

            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-full text-xs font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200/60 transition-all mt-4"
                >
                  <Icon className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                  <span>{item.name}</span>
                </a>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen?.(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-black text-white shadow-md"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-500"}`} strokeWidth={1.5} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Botão de Logout */}
        <div className="p-4 border-t border-zinc-100">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>
    </>
  )
}
