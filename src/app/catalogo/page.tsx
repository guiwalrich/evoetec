// src/app/catalogo/page.tsx
"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Smartphone, MessageCircle, ChevronLeft, ChevronRight, Loader2, CheckCircle2, MapPin } from "lucide-react"

interface CategoriaItem {
  id: string
  nome: string
  _count: {
    produtos: number
  }
}

interface ProdutoCatalogo {
  id: string
  nome: string
  descricao: string | null
  precoVenda: number
  quantidadeEstoque: number
  imagemUrl: string | null
  categoriaId: string | null
  categoria?: {
    id: string
    nome: string
  } | null
}

interface EmpresaInfo {
  nomeFantasia: string
  telefone: string | null
  endereco: string | null
}

function CatalogoContent() {
  const searchParams = useSearchParams()
  const empresaIdParam = searchParams?.get("empresaId") || ""

  const [produtos, setProdutos] = useState<ProdutoCatalogo[]>([])
  const [categorias, setCategorias] = useState<CategoriaItem[]>([])
  const [selectedCat, setSelectedCat] = useState<string>("ALL")
  const [empresa, setEmpresa] = useState<EmpresaInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProdutos, setTotalProdutos] = useState(0)

  const carregarProdutos = useCallback(async () => {
    setLoading(true)
    try {
      const url = `/api/catalogo?empresaId=${encodeURIComponent(empresaIdParam)}&busca=${encodeURIComponent(busca)}&categoriaId=${selectedCat}&page=${page}&limit=12`
      const res = await fetch(url)
      const json = await res.json()
      if (res.ok && json) {
        setProdutos(Array.isArray(json.data) ? json.data : [])
        setCategorias(Array.isArray(json.categorias) ? json.categorias : [])
        setEmpresa(json.empresa || { nomeFantasia: "Evo Etec ERP", telefone: null, endereco: null })
        setTotalPages(json.pagination?.totalPages || 1)
        setTotalProdutos(json.pagination?.total || 0)
      } else {
        setProdutos([])
      }
    } catch (err) {
      console.error("Erro ao carregar catálogo:", err)
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }, [empresaIdParam, busca, selectedCat, page])

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
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <img
                src="/assets/wrldevotec.webp"
                alt="Evo Etec Logo"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = "/wrldevotec.webp"
                }}
                className="object-contain w-12 h-12 hover:scale-105 transition-transform drop-shadow-sm"
              />
            </div>
            <div>
              <span className="font-extrabold text-zinc-900 tracking-wider block leading-tight text-sm font-sans">
                {empresa?.nomeFantasia || "Evo Etec ERP"}
              </span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest block">
                Catálogo Digital da Loja
              </span>
            </div>
          </div>

          {empresa?.telefone && (
            <a
              href={`https://wa.me/55${empresa.telefone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp da Assistência</span>
            </a>
          )}
        </div>
      </header>

      {/* Hero Header do Catálogo da Assistência */}
      <div className="bg-zinc-900 text-white py-10 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {empresa?.nomeFantasia || "Catálogo de Produtos & Peças"}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-light mt-1">
                Confira nossos produtos, acessórios e peças disponíveis em estoque para entrega imediata.
              </p>
            </div>
            {empresa?.endereco && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-800/80 px-4 py-2 rounded-2xl border border-zinc-700/80">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{empresa.endereco}</span>
              </div>
            )}
          </div>

          {/* Barra de Pesquisa */}
          <div className="pt-2 max-w-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar por produto, acessório ou peça..."
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-11 pr-4 py-3 bg-zinc-800/90 border border-zinc-700 rounded-2xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white transition-all shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categorias Pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCat("ALL")
              setPage(1)
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCat === "ALL"
                ? "bg-zinc-900 text-white shadow-md"
                : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
            }`}
          >
            Todos os Produtos ({totalProdutos})
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCat(cat.id)
                setPage(1)
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCat === cat.id
                  ? "bg-zinc-900 text-white shadow-md"
                  : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
              }`}
            >
              {cat.nome} ({cat._count.produtos})
            </button>
          ))}
        </div>
      </div>

      {/* Grade de Produtos */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-900 mb-2" />
            <span className="text-xs">Carregando catálogo da assistência...</span>
          </div>
        ) : produtos.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 border border-zinc-200/80 text-center space-y-3">
            <Smartphone className="w-10 h-10 text-zinc-400 mx-auto" strokeWidth={1.5} />
            <h3 className="text-base font-bold text-zinc-900">Nenhum produto encontrado</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Não encontramos nenhum item cadastrado nesta categoria ou com os termos pesquisados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {produtos.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-[28px] p-5 border border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-full h-44 rounded-2xl bg-zinc-100 border border-zinc-200/60 overflow-hidden relative flex items-center justify-center">
                    {prod.imagemUrl ? (
                      <img
                        src={prod.imagemUrl}
                        alt={prod.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Smartphone className="w-12 h-12 text-zinc-300" strokeWidth={1.5} />
                    )}
                    {prod.quantidadeEstoque <= 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Esgotado
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">
                      {prod.categoria?.nome || "Geral"}
                    </span>
                    <h4 className="font-extrabold text-sm text-zinc-900 line-clamp-1 group-hover:text-zinc-700">
                      {prod.nome}
                    </h4>
                    {prod.descricao && (
                      <p className="text-xs text-zinc-500 font-light line-clamp-2 leading-relaxed">
                        {prod.descricao}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-mono">Preço</span>
                    <span className="text-base font-extrabold text-zinc-900 font-mono">
                      R$ {prod.precoVenda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button
                    onClick={() => abrirWhatsApp(prod.nome)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 cursor-pointer shrink-0"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Pedir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-8">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2.5 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-zinc-600 font-mono">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2.5 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    }>
      <CatalogoContent />
    </Suspense>
  )
}
