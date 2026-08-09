// src/app/(dashboard)/vendas/nova/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ShoppingCart,
  ArrowLeft,
  Search,
  Trash2,
  User,
  Barcode,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Package
} from "lucide-react"

interface ProdutoSelect {
  id: string
  nome: string
  codigoBarras: string | null
  precoVenda: number
  quantidadeEstoque: number
  imagemUrl: string | null
}

interface ClienteSelect {
  id: string
  nome: string
  telefone: string | null
}

interface ItemCarrinho {
  produtoId: string
  nome: string
  quantidade: number
  valorUnitario: number
  desconto: number
  valorTotal: number
  imagemUrl: string | null
}

interface PagamentoItem {
  formaPagamento: string
  valor: number
  parcelas?: number
}

const formasPagamentoList = [
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "PIX", label: "PIX" },
  { value: "CARTAO_CREDITO", label: "Cartão de Crédito" },
  { value: "CARTAO_DEBITO", label: "Cartão de Débito" },
  { value: "BOLETO", label: "Boleto" },
]

export default function NovaVendaPage() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<ProdutoSelect[]>([])
  const [clientes, setClientes] = useState<ClienteSelect[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState("")

  // Seletores
  const [buscaProduto, setBuscaProduto] = useState("")
  const [clienteId, setClienteId] = useState("")
  const [descontoGeral, setDescontoGeral] = useState<number>(0)

  // Carrinho e Pagamentos
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [pagamentos, setPagamentos] = useState<PagamentoItem[]>([])
  const [formaAtual, setFormaAtual] = useState("PIX")
  const [valorAtual, setValorAtual] = useState<number>(0)
  const [parcelasAtual, setParcelasAtual] = useState<number>(1)

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resProd, resCli] = await Promise.all([
          fetch("/api/produtos?limit=100"),
          fetch("/api/clientes?limit=100"),
        ])
        const [jsonProd, jsonCli] = await Promise.all([resProd.json(), resCli.json()])
        if (resProd.ok) setProdutos(jsonProd.data)
        if (resCli.ok) setClientes(jsonCli.data)
      } catch (err) {
        console.error("Erro ao carregar dados do PDV:", err)
      } finally {
        setLoading(false)
      }
    }
    carregarDados()
  }, [])

  const adicionarAoCarrinho = (p: ProdutoSelect) => {
    const itemExistente = carrinho.find((item) => item.produtoId === p.id)
    if (itemExistente) {
      if (itemExistente.quantidade + 1 > p.quantidadeEstoque) {
        alert(`Estoque insuficiente. Quantidade disponível: ${p.quantidadeEstoque}`)
        return
      }
      setCarrinho(
        carrinho.map((item) =>
          item.produtoId === p.id
            ? {
                ...item,
                quantidade: item.quantidade + 1,
                valorTotal: (item.quantidade + 1) * item.valorUnitario - item.desconto,
              }
            : item
        )
      )
    } else {
      if (p.quantidadeEstoque < 1) {
        alert("Produto sem estoque disponível!")
        return
      }
      setCarrinho([
        ...carrinho,
        {
          produtoId: p.id,
          nome: p.nome,
          quantidade: 1,
          valorUnitario: Number(p.precoVenda),
          desconto: 0,
          valorTotal: Number(p.precoVenda),
          imagemUrl: p.imagemUrl,
        },
      ])
    }
  }

  const removerDoCarrinho = (produtoId: string) => {
    setCarrinho(carrinho.filter((item) => item.produtoId !== produtoId))
  }

  const subtotalCarrinho = carrinho.reduce((acc, item) => acc + item.valorTotal, 0)
  const totalVenda = Math.max(0, subtotalCarrinho - Number(descontoGeral || 0))
  const totalPagamentos = pagamentos.reduce((acc, p) => acc + p.valor, 0)

  const adicionarPagamento = () => {
    if (valorAtual <= 0) return
    setPagamentos([
      ...pagamentos,
      {
        formaPagamento: formaAtual,
        valor: valorAtual,
        parcelas: formaAtual === "CARTAO_CREDITO" ? parcelasAtual : 1,
      },
    ])
    setValorAtual(0)
    setParcelasAtual(1)
  }

  const removerPagamento = (index: number) => {
    setPagamentos(pagamentos.filter((_, i) => i !== index))
  }

  const produtosFiltrados = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(buscaProduto.toLowerCase()) ||
      (p.codigoBarras && p.codigoBarras.includes(buscaProduto))
  )

  const handleFinalizarVenda = async () => {
    setErroForm("")

    if (carrinho.length === 0) {
      setErroForm("O carrinho está vazio. Adicione pelo menos 1 produto.")
      return
    }

    if (pagamentos.length === 0) {
      setErroForm("Adicione pelo menos 1 forma de pagamento.")
      return
    }

    if (Math.abs(totalPagamentos - totalVenda) > 0.05) {
      setErroForm(`O valor pago (R$ ${totalPagamentos.toFixed(2)}) deve ser igual ao total da venda (R$ ${totalVenda.toFixed(2)}).`)
      return
    }

    setSalvando(true)

    const payload = {
      clienteId: clienteId || null,
      desconto: Number(descontoGeral || 0),
      status: "CONCLUIDA",
      itens: carrinho.map((item) => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        desconto: item.desconto,
      })),
      pagamentos: pagamentos.map((p) => ({
        formaPagamento: p.formaPagamento,
        valor: p.valor,
        parcelas: p.parcelas || 1,
      })),
    }

    try {
      const res = await fetch("/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const vendaCriada = await res.json()
        router.push(`/vendas/${vendaCriada.id}`)
      } else {
        const json = await res.json()
        setErroForm(json.message || "Erro ao realizar venda.")
      }
    } catch {
      setErroForm("Falha na requisição com o servidor.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/vendas"
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-blue-500" />
            <span>Ponto de Venda (PDV)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Selecione os produtos, aplique descontos e conclua a venda
          </p>
        </div>
      </div>

      {erroForm && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{erroForm}</span>
        </div>
      )}

      {/* Grid Principal de 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Busca e Produtos (7 Colunas) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={buscaProduto}
              onChange={(e) => setBuscaProduto(e.target.value)}
              placeholder="Digite o nome ou bipe o Código de Barras..."
              className="bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-h-[550px] overflow-y-auto space-y-2">
            {loading ? (
              <div className="py-12 text-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                <span>Carregando produtos...</span>
              </div>
            ) : produtosFiltrados.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                Nenhum produto encontrado.
              </div>
            ) : (
              produtosFiltrados.map((p) => (
                <div
                  key={p.id}
                  onClick={() => adicionarAoCarrinho(p)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    {p.imagemUrl ? (
                      <img src={p.imagemUrl} alt={p.nome} className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-white group-hover:text-blue-400 block text-sm">
                        {p.nome}
                      </span>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                        {p.codigoBarras && (
                          <span className="flex items-center gap-1 font-mono">
                            <Barcode className="w-3 h-3 text-slate-500" /> {p.codigoBarras}
                          </span>
                        )}
                        <span>Estoque: <strong className={p.quantidadeEstoque > 0 ? "text-emerald-400" : "text-red-400"}>{p.quantidadeEstoque}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-white text-base block">
                      R$ {Number(p.precoVenda).toFixed(2)}
                    </span>
                    <span className="text-[11px] text-blue-400 font-medium group-hover:underline">
                      + Adicionar
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna Direita: Carrinho, Cliente e Pagamentos (5 Colunas) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Seleção de Cliente */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" /> Cliente (Opcional)
            </label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Cliente Avulso / Não Identificado --</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} {c.telefone ? `(${c.telefone})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Lista do Carrinho */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Carrinho ({carrinho.length} itens)</span>
              <span className="text-white font-bold">R$ {subtotalCarrinho.toFixed(2)}</span>
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {carrinho.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Carrinho vazio. Clique nos produtos à esquerda.
                </div>
              ) : (
                carrinho.map((item) => (
                  <div
                    key={item.produtoId}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm"
                  >
                    <div>
                      <span className="font-semibold text-white block text-xs">{item.nome}</span>
                      <span className="text-[11px] text-slate-400">
                        {item.quantidade}x R$ {item.valorUnitario.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-xs">
                        R$ {item.valorTotal.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removerDoCarrinho(item.produtoId)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desconto */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Desconto Geral (R$):</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={descontoGeral}
                onChange={(e) => setDescontoGeral(parseFloat(e.target.value) || 0)}
                className="w-28 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-right text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Pagamentos */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Pagamento Fracionado</span>
              <span className="text-emerald-400 font-bold">Total: R$ {totalVenda.toFixed(2)}</span>
            </h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <select
                  value={formaAtual}
                  onChange={(e) => setFormaAtual(e.target.value)}
                  className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {formasPagamentoList.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorAtual}
                  onChange={(e) => setValorAtual(parseFloat(e.target.value) || 0)}
                  placeholder="R$ Valor"
                  className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={adicionarPagamento}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all shrink-0"
                >
                  +
                </button>
              </div>

              {formaAtual === "CARTAO_CREDITO" && (
                <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                  <span className="text-slate-400 font-medium">Número de Parcelas:</span>
                  <select
                    value={parcelasAtual}
                    onChange={(e) => setParcelasAtual(parseInt(e.target.value, 10))}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                      <option key={num} value={num}>
                        {num}x de R$ {(valorAtual > 0 ? valorAtual / num : 0).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {pagamentos.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {pagamentos.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-300 p-2 rounded-lg bg-slate-950">
                    <span>
                      {p.formaPagamento} {p.parcelas && p.parcelas > 1 ? `(${p.parcelas}x de R$ ${(p.valor / p.parcelas).toFixed(2)})` : ""}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400">R$ {p.valor.toFixed(2)}</span>
                      <button onClick={() => removerPagamento(idx)} className="text-slate-500 hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleFinalizarVenda}
              disabled={salvando}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-4"
            >
              {salvando ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              <span>Finalizar Venda (R$ {totalVenda.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
