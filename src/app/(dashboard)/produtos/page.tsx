// src/app/(dashboard)/produtos/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Barcode,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  AlertCircle,
  Truck,
  Upload,
  ImageIcon
} from "lucide-react"

interface FornecedorSelect {
  id: string
  nome: string
}

interface Produto {
  id: string
  nome: string
  descricao: string | null
  codigoBarras: string | null
  precoCompra: number
  precoVenda: number
  quantidadeEstoque: number
  estoqueMinimo: number
  status: "ATIVO" | "INATIVO"
  imagemUrl: string | null
  fornecedor: FornecedorSelect | null
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [fornecedores, setFornecedores] = useState<FornecedorSelect[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Modal States
  const [modalOpen, setModalOpen] = useState(false)
  const [produtoEdicao, setProdutoEdicao] = useState<Produto | null>(null)
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
  const [status, setStatus] = useState<"ATIVO" | "INATIVO">("ATIVO")
  const [imagemUrl, setImagemUrl] = useState<string | null>(null)
  const [uploadingImagem, setUploadingImagem] = useState(false)
  const [fornecedorId, setFornecedorId] = useState("")

  const carregarProdutos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/produtos?busca=${encodeURIComponent(busca)}&page=${page}&limit=10`)
      const json = await res.json()
      if (res.ok) {
        setProdutos(json.data)
        setTotalPages(json.pagination.totalPages)
        setTotal(json.pagination.total)
      }
    } catch (err) {
      console.error("Erro ao carregar produtos:", err)
    } finally {
      setLoading(false)
    }
  }, [busca, page])

  useEffect(() => {
    carregarProdutos()
  }, [carregarProdutos])

  useEffect(() => {
    async function carregarFornecedores() {
      try {
        const res = await fetch("/api/fornecedores?limit=100")
        const json = await res.json()
        if (res.ok) setFornecedores(json.data)
      } catch (err) {
        console.error("Erro ao carregar fornecedores:", err)
      }
    }
    carregarFornecedores()
  }, [])

  const abrirModalNovo = () => {
    setProdutoEdicao(null)
    setNome("")
    setDescricao("")
    setCodigoBarras("")
    setPrecoCompra(0)
    setPrecoVenda(0)
    setQuantidadeEstoque(0)
    setEstoqueMinimo(1)
    setStatus("ATIVO")
    setImagemUrl(null)
    setFornecedorId("")
    setErroForm("")
    setModalOpen(true)
  }

  const abrirModalEditar = (p: Produto) => {
    setProdutoEdicao(p)
    setNome(p.nome)
    setDescricao(p.descricao || "")
    setCodigoBarras(p.codigoBarras || "")
    setPrecoCompra(Number(p.precoCompra))
    setPrecoVenda(Number(p.precoVenda))
    setQuantidadeEstoque(p.quantidadeEstoque)
    setEstoqueMinimo(p.estoqueMinimo)
    setStatus(p.status)
    setImagemUrl(p.imagemUrl || null)
    setFornecedorId(p.fornecedor?.id || "")
    setErroForm("")
    setModalOpen(true)
  }

  const handleUploadImagem = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
      if (res.ok) {
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

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroForm("")
    setSalvando(true)

    const payload = {
      nome,
      descricao,
      codigoBarras,
      precoCompra: Number(precoCompra),
      precoVenda: Number(precoVenda),
      quantidadeEstoque: Number(quantidadeEstoque),
      estoqueMinimo: Number(estoqueMinimo),
      status,
      imagemUrl,
      fornecedorId: fornecedorId || null,
    }

    try {
      const url = produtoEdicao ? `/api/produtos/${produtoEdicao.id}` : "/api/produtos"
      const method = produtoEdicao ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setModalOpen(false)
        carregarProdutos()
      } else {
        const json = await res.json()
        setErroForm(json.message || "Erro ao salvar produto.")
      }
    } catch {
      setErroForm("Falha na conexão.")
    } finally {
      setSalvando(false)
    }
  }

  const handleDeletar = async (id: string, nomeProduto: string) => {
    if (!confirm(`Deseja realmente excluir o produto "${nomeProduto}"?`)) return

    try {
      const res = await fetch(`/api/produtos/${id}`, { method: "DELETE" })
      if (res.ok) carregarProdutos()
      else alert("Erro ao excluir produto.")
    } catch {
      alert("Falha na requisição.")
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            <Package className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
            <span>Produtos & Peças</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-light">
            Controle de estoque, preços de venda e alertas de estoque mínimo ({total} cadastrados)
          </p>
        </div>

        <button
          onClick={abrirModalNovo}
          className="inline-flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-semibold px-5 py-3 rounded-full shadow-md transition-all text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          <span>Novo Produto / Peça</span>
        </button>
      </div>

      {/* Busca Pílula */}
      <div className="bg-white border border-zinc-200/80 rounded-full p-2 pl-5 flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <Search className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
        <input
          type="text"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value)
            setPage(1)
          }}
          placeholder="Buscar produto por nome, código de barras ou descrição..."
          className="bg-transparent border-none text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none w-full"
        />
      </div>

      {/* Tabela Soft UI */}
      <div className="bg-white border border-zinc-100/90 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-700">
            <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4">Produto / Peça</th>
                <th className="px-6 py-4">Cód. Barras</th>
                <th className="px-6 py-4">Estoque</th>
                <th className="px-6 py-4">Preço Venda</th>
                <th className="px-6 py-4">Fornecedor</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-900" strokeWidth={1.5} />
                    <span>Carregando catálogo de produtos...</span>
                  </td>
                </tr>
              ) : produtos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    Nenhum produto cadastrado no momento.
                  </td>
                </tr>
              ) : (
                produtos.map((p) => {
                  const estoqueBaixo = p.quantidadeEstoque <= p.estoqueMinimo
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-900">
                        <div className="flex items-center gap-3">
                          {p.imagemUrl ? (
                            <img
                              src={p.imagemUrl}
                              alt={p.nome}
                              className="w-10 h-10 rounded-2xl object-cover border border-zinc-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                              <ImageIcon className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                          )}
                          <div>
                            <span className="block font-bold text-zinc-900">{p.nome}</span>
                            {p.descricao && (
                              <span className="text-xs text-zinc-400 font-normal block truncate max-w-xs">
                                {p.descricao}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                        {p.codigoBarras ? (
                          <div className="flex items-center gap-1.5">
                            <Barcode className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                            <span>{p.codigoBarras}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              estoqueBaixo ? "text-amber-600" : "text-emerald-600"
                            }`}
                          >
                            {p.quantidadeEstoque} un.
                          </span>
                          {estoqueBaixo && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                              <AlertTriangle className="w-3 h-3" strokeWidth={1.5} /> Baixo
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 block font-light">
                          Mínimo: {p.estoqueMinimo} un.
                        </span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-zinc-900">
                        R$ {Number(p.precoVenda).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {p.fornecedor ? (
                          <div className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                            <span>{p.fornecedor.nome}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button
                          onClick={() => abrirModalEditar(p)}
                          className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleDeletar(p.id, p.nome)}
                          className="p-2 rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              Página {page} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Soft UI */}
      {modalOpen && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-100 rounded-[32px] w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <h3 className="text-lg font-bold text-zinc-900">
                {produtoEdicao ? "Editar Produto / Peça" : "Novo Produto / Peça"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-900 p-1">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {erroForm && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>{erroForm}</span>
              </div>
            )}

            <form onSubmit={handleSalvar} className="space-y-4">
              {/* Upload de Imagem */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">
                  Foto do Produto / Peça
                </label>
                <div className="flex items-center gap-4">
                  {imagemUrl ? (
                    <div className="relative w-16 h-16 rounded-2xl border border-zinc-200 overflow-hidden shrink-0 group">
                      <img src={imagemUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImagemUrl(null)}
                        className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                        title="Remover Imagem"
                      >
                        <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 shrink-0">
                      <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                  )}

                  <label className="flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-5 py-2.5 rounded-full border border-zinc-200 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50">
                    {uploadingImagem ? <Loader2 className="w-4 h-4 animate-spin text-zinc-900" strokeWidth={1.5} /> : <Upload className="w-4 h-4 text-zinc-700" strokeWidth={1.5} />}
                    <span>{uploadingImagem ? "Enviando..." : "Selecionar Imagem"}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleUploadImagem}
                      disabled={uploadingImagem}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">
                  Nome do Produto / Peça *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Tela Display iPhone 13 Original, Carregador 20W Turbo"
                  className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Código de Barras</label>
                  <input
                    type="text"
                    value={codigoBarras}
                    onChange={(e) => setCodigoBarras(e.target.value)}
                    placeholder="7891234567890"
                    className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Fornecedor</label>
                  <select
                    value={fornecedorId}
                    onChange={(e) => setFornecedorId(e.target.value)}
                    className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Preço de Compra (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={precoCompra}
                    onChange={(e) => setPrecoCompra(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={precoVenda}
                    onChange={(e) => setPrecoVenda(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Qtd em Estoque</label>
                  <input
                    type="number"
                    min="0"
                    value={quantidadeEstoque}
                    onChange={(e) => setQuantidadeEstoque(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Estoque Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={estoqueMinimo}
                    onChange={(e) => setEstoqueMinimo(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "ATIVO" | "INATIVO")}
                    className="w-full bg-white border border-zinc-200/80 rounded-full px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1 ml-2">Descrição Detalhada</label>
                <textarea
                  rows={2}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Especificações técnicas, compatibilidade..."
                  className="w-full bg-white border border-zinc-200/80 rounded-2xl p-3.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2.5 rounded-full bg-black hover:bg-zinc-800 text-white text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {salvando ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : null}
                  <span>{produtoEdicao ? "Atualizar" : "Cadastrar"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
