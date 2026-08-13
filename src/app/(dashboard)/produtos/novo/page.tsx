// src/app/(dashboard)/produtos/novo/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Package,
  ArrowLeft,
  Loader2,
  Upload,
  ImageIcon,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Tag,
  Truck
} from "lucide-react"

interface CategoriaSelect {
  id: string
  nome: string
}

interface FornecedorSelect {
  id: string
  nome: string
}

export default function NovoProdutoPage() {
  const router = useRouter()
  const [categorias, setCategorias] = useState<CategoriaSelect[]>([])
  const [fornecedores, setFornecedores] = useState<FornecedorSelect[]>([])
  const [loadingForm, setLoadingForm] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState("")

  // Form State
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [codigoBarras, setCodigoBarras] = useState("")
  const [precoCompra, setPrecoCompra] = useState<number>(0)
  const [precoVenda, setPrecoVenda] = useState<number>(0)
  const [quantidadeEstoque, setQuantidadeEstoque] = useState<number>(0)
  const [estoqueMinimo, setEstoqueMinimo] = useState<number>(1)
  const [categoriaTexto, setCategoriaTexto] = useState("")
  const [fornecedorId, setFornecedorId] = useState("")

  // Imagem State & Preview
  const [imagemFile, setImagemFile] = useState<File | null>(null)
  const [imagemUrl, setImagemUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadingImagem, setUploadingImagem] = useState(false)

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resCat, resForn] = await Promise.all([
          fetch("/api/categorias"),
          fetch("/api/fornecedores?limit=100"),
        ])

        if (resCat.ok) {
          const dataCat = await resCat.json()
          setCategorias(dataCat)
        }

        if (resForn.ok) {
          const dataForn = await resForn.json()
          setFornecedores(dataForn.data || [])
        }
      } catch (err) {
        console.error("Erro ao carregar categorias/fornecedores:", err)
      } finally {
        setLoadingForm(false)
      }
    }

    carregarDados()
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImagemFile(file)
    // Instant Preview via URL.createObjectURL
    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)

    // Upload via API
    setUploadingImagem(true)
    setErroForm("")
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const json = await res.json()
      if (res.ok && json.url) {
        setImagemUrl(json.url)
      } else {
        setErroForm(json.message || "Erro no upload da imagem.")
      }
    } catch {
      setErroForm("Falha na conexão durante upload da imagem.")
    } finally {
      setUploadingImagem(false)
    }
  }

  const handleRemoverImagem = () => {
    setImagemFile(null)
    setPreviewUrl(null)
    setImagemUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroForm("")
    setSalvando(true)

    if (!nome.trim() || precoVenda <= 0) {
      setErroForm("Preencha os campos obrigatórios corretamente.")
      setSalvando(false)
      return
    }

    const payload = {
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      codigoBarras: codigoBarras.trim() || null,
      precoCompra: Number(precoCompra),
      precoVenda: Number(precoVenda),
      quantidadeEstoque: Number(quantidadeEstoque),
      estoqueMinimo: Number(estoqueMinimo),
      status: "ATIVO",
      categoriaNome: categoriaTexto.trim() || null,
      fornecedorId: fornecedorId || null,
      imagemUrl: imagemUrl || null,
    }

    try {
      const res = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push("/produtos")
      } else {
        const json = await res.json()
        setErroForm(json.message || "Erro ao cadastrar produto.")
      }
    } catch {
      setErroForm("Falha de conexão com o servidor.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/produtos")}
            className="p-2 rounded-full bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-zinc-900" strokeWidth={1.5} />
              <span>Novo Produto / Peça</span>
            </h1>
            <p className="text-xs text-zinc-500 font-light">
              Cadastre um novo item vinculando a categoria e a imagem de exibição
            </p>
          </div>
        </div>
      </div>

      {/* Formulário Soft UI */}
      <div className="bg-white border border-zinc-100/90 rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
        {erroForm && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            <span>{erroForm}</span>
          </div>
        )}

        {loadingForm ? (
          <div className="py-16 text-center text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-zinc-900" strokeWidth={1.5} />
            <span>Carregando formulário de cadastro...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto e Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 ml-1">
                Foto do Produto / Peça
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {previewUrl || imagemUrl ? (
                  <div className="relative w-28 h-28 rounded-[24px] border border-zinc-200 overflow-hidden shrink-0 group">
                    <img
                      src={previewUrl || imagemUrl || ""}
                      alt="Preview do produto"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoverImagem}
                      className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
                      title="Remover foto"
                    >
                      <Trash2 className="w-6 h-6" strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-[24px] bg-zinc-50 border border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 shrink-0">
                    <ImageIcon className="w-8 h-8 text-zinc-300 mb-1" strokeWidth={1.5} />
                    <span className="text-[10px] text-zinc-400 font-light">Sem Foto</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="inline-flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white px-5 py-3 rounded-full text-xs font-semibold cursor-pointer transition-all shadow-sm disabled:opacity-50">
                    {uploadingImagem ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" strokeWidth={1.5} />
                    ) : (
                      <Upload className="w-4 h-4 text-white" strokeWidth={1.5} />
                    )}
                    <span>{uploadingImagem ? "Enviando..." : "Escolher foto do produto"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploadingImagem}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-zinc-400 font-light">
                    Formatos aceitos: WebP, PNG, JPG (Máximo: 5 MB).
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700 ml-1">
                  Nome do Produto / Peça *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Tela Display iPhone 13 Original"
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800 shadow-sm"
                />
              </div>

              {/* Categoria Input com Datalist de Sugestão */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700 ml-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
                  <span>Categoria *</span>
                </label>
                <input
                  type="text"
                  required
                  list="categorias-sugestoes"
                  value={categoriaTexto}
                  onChange={(e) => setCategoriaTexto(e.target.value)}
                  placeholder="Digite ou selecione uma categoria"
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800 shadow-sm"
                />
                <datalist id="categorias-sugestoes">
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.nome} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Preço Compra */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700 ml-1">
                  Preço de Compra (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={precoCompra}
                  onChange={(e) => setPrecoCompra(parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800 shadow-sm"
                />
              </div>

              {/* Preço Venda */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700 ml-1">
                  Preço de Venda (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={precoVenda}
                  onChange={(e) => setPrecoVenda(parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Quantidade Estoque */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700 ml-1">
                  Estoque Inicial
                </label>
                <input
                  type="number"
                  min="0"
                  value={quantidadeEstoque}
                  onChange={(e) => setQuantidadeEstoque(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800 shadow-sm"
                />
              </div>

              {/* Estoque Mínimo */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700 ml-1">
                  Estoque Mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  value={estoqueMinimo}
                  onChange={(e) => setEstoqueMinimo(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800 shadow-sm"
                />
              </div>

              {/* Fornecedor Dropdown */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700 ml-1 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
                  <span>Fornecedor</span>
                </label>
                <select
                  value={fornecedorId}
                  onChange={(e) => setFornecedorId(e.target.value)}
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800 shadow-sm"
                >
                  <option value="">-- Sem Fornecedor Vinculado --</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Código de Barras */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-700 ml-1">
                Código de Barras
              </label>
              <input
                type="text"
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                placeholder="7891234567890"
                className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800 shadow-sm"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-700 ml-1">
                Descrição Detalhada
              </label>
              <textarea
                rows={3}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Especificações técnicas, compatibilidade..."
                className="w-full bg-white border border-zinc-200/80 rounded-[24px] p-4 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800 shadow-sm"
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => router.push("/produtos")}
                className="px-6 py-3 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="px-8 py-3 rounded-full bg-black hover:bg-zinc-800 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
              >
                {salvando ? <Loader2 className="w-4 h-4 animate-spin text-white" strokeWidth={1.5} /> : <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />}
                <span>Salvar Produto</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
