// src/app/catalogo/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Search, Smartphone, MessageCircle, ChevronLeft, ChevronRight, Loader2, CheckCircle2, MapPin } from "lucide-react"

interface ProdutoCatalogo {
  id: string
  nome: string
  descricao: string | null
  precoVenda: number
  quantidadeEstoque: number
  imagemUrl: string | null
}

interface EmpresaInfo {
  nomeFantasia: string
  telefone: string | null
  endereco: string | null
}

export default function CatalogoPage() {
  const [produtos, setProdutos] = useState<ProdutoCatalogo[]>([])
  const [empresa, setEmpresa] = useState<EmpresaInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const carregarProdutos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/catalogo?busca=${encodeURIComponent(busca)}&page=${page}&limit=12`)
      const json = await res.json()
      if (res.ok && json) {
        setProdutos(Array.isArray(json.data) ? json.data : [])
        setEmpresa(json.empresa || { nomeFantasia: "EVO ETEC", telefone: null, endereco: null })
        setTotalPages(json.pagination?.totalPages || 1)
      } else {
        setProdutos([])
      }
    } catch (err) {
      console.error("Erro ao carregar catálogo:", err)
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }, [busca, page])

  useEffect(() => {
    carregarProdutos()
  }, [carregarProdutos])

  const abrirWhatsApp = (nomeProduto: string) => {
    const phone = empresa?.telefone ? empresa.telefone.replace(/\D/g, "") : ""
    const mensagem = encodeURIComponent(`Olá! Gostaria de mais informações sobre o produto: ${nomeProduto}`)
    window.open(`https://wa.me/${phone ? `55${phone}` : ""}?text=${mensagem}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-[#f4f4f6] text-zinc-900 selection:bg-black selection:text-white font-sans">
      {/* Topbar do Catálogo Evo Etec Soft UI */}
      <header className="border-b border-zinc-200/80 bg-white/70 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 flex items-center justify-center shrink-0">
              <Image
                src="/assets/wrldevotec.png"
                alt="Evo Etec Logo"
                width={56}
                height={56}
                className="object-contain w-14 h-14 hover:scale-105 transition-transform drop-shadow-sm"
                priority
              />
            </div>
            <div>
              <span className="font-extrabold text-zinc-900 tracking-wider block leading-tight text-sm font-sans">
                {empresa?.nomeFantasia || "EVO ETEC"}
              </span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest block">
                Catálogo Online de Produtos & Peças
              </span>
            </div>
          </div>

          <a
            href="/login"
            className="text-xs font-semibold text-white px-5 py-2.5 rounded-full bg-black hover:bg-zinc-800 transition-all shadow-md"
          >
            Área Restrita
          </a>
        </div>
      </header>

      {/* Hero Banner Soft UI */}
      <div className="border-b border-zinc-200/80 bg-gradient-to-b from-white via-[#f4f4f6] to-[#f4f4f6] py-12 px-4 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center space-y-4 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Acessórios e Peças a Pronta Entrega
          </h1>
          
          {empresa?.endereco && (
            <div className="inline-flex items-center gap-2 text-xs text-zinc-600 bg-white border border-zinc-200 px-4 py-1.5 rounded-full shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-zinc-700" strokeWidth={1.5} />
              <span>{empresa.endereco}</span>
            </div>
          )}

          {/* Campo de Busca Pílula */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-5 w-5 h-5 text-zinc-400" strokeWidth={1.5} />
              <input
                type="text"
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value)
                  setPage(1)
                }}
                placeholder="O que você está procurando? (Ex: Carregador, Capa, Película...)"
                className="w-full bg-white border border-zinc-200/90 rounded-full py-3.5 pl-13 pr-6 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-800 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="py-20 text-center text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-zinc-900" strokeWidth={1.5} />
            <span>Carregando produtos disponíveis...</span>
          </div>
        ) : produtos.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">
            Nenhum produto disponível no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {produtos.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-zinc-100/90 rounded-[32px] p-5 flex flex-col justify-between hover:scale-[1.01] transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] group"
              >
                <div>
                  <div className="w-full h-44 rounded-[24px] bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden mb-4 relative">
                    {p.imagemUrl ? (
                      <img
                        src={p.imagemUrl}
                        alt={p.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Smartphone className="w-10 h-10 text-zinc-300" strokeWidth={1.5} />
                    )}
                  </div>

                  <h3 className="font-bold text-zinc-900 text-base leading-snug group-hover:text-black transition-colors">
                    {p.nome}
                  </h3>

                  {p.descricao && (
                    <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed font-light">
                      {p.descricao}
                    </p>
                  )}
                </div>

                <div className="pt-6 mt-4 border-t border-zinc-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                        Preço
                      </span>
                      <span className="text-xl font-extrabold text-zinc-900">
                        R$ {Number(p.precoVenda).toFixed(2)}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} /> Em Estoque
                    </span>
                  </div>

                  <button
                    onClick={() => abrirWhatsApp(p.nome)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-full py-3 shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                    <span>Tenho Interesse</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2.5 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <span className="text-sm text-zinc-600 font-medium px-2">
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2.5 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 py-8 text-center text-xs text-zinc-400 font-light">
        EVO ETEC ERP © 2026 — Catálogo Online de Produtos.
      </footer>
    </div>
  )
}
