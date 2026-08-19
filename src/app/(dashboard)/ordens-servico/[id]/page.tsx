// src/app/(dashboard)/ordens-servico/[id]/page.tsx
"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  User,
  Smartphone,
  Wrench,
  Clock,
  Printer,
  Loader2,
  ShieldCheck,
  MessageCircle
} from "lucide-react"

interface OSDetalhe {
  id: string
  numero: string
  clienteId: string
  dispositivo: string
  marca: string | null
  modelo: string | null
  imei: string | null
  defeitoRelatado: string
  diagnostico: string | null
  solucao: string | null
  valorServico: number
  valorPecas: number
  valorTotal: number
  status: string
  garantiaDias: number
  createdAt: string
  empresa?: {
    nomeFantasia: string
    razaoSocial?: string | null
    cnpj?: string | null
    telefone?: string | null
    endereco?: string | null
  }
  cliente: {
    id: string
    nome: string
    cpfCnpj?: string | null
    telefone: string | null
    email: string | null
    endereco?: string | null
  }
  tecnico?: {
    nome: string
    email: string
  } | null
  historicos: Array<{
    id: string
    statusNovo: string
    observacao: string | null
    criadoEm: string
    usuario: { nome: string } | null
  }>
}

export default function DetalheOrdemServicoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [os, setOs] = useState<OSDetalhe | null>(null)
  const [loading, setLoading] = useState(true)

  const [novoStatus, setNovoStatus] = useState<string>("")
  const [atualizandoStatus, setAtualizandoStatus] = useState(false)

  const carregarOS = async () => {
    try {
      const res = await fetch(`/api/ordens-servico/${id}`)
      if (res.ok) {
        const json = await res.json()
        setOs(json)
        setNovoStatus(json.status)
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes da OS:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarOS()
  }, [id])

  const handleMudarStatus = async () => {
    if (!os || !novoStatus || novoStatus === os.status) return
    setAtualizandoStatus(true)
    try {
      const res = await fetch(`/api/ordens-servico/${os.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: os.clienteId || os.cliente?.id,
          dispositivo: os.dispositivo,
          defeitoRelatado: os.defeitoRelatado,
          valorServico: Number(os.valorServico),
          valorPecas: Number(os.valorPecas),
          status: novoStatus,
          garantiaDias: os.garantiaDias,
        }),
      })
      if (res.ok) {
        await carregarOS()
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err)
    } finally {
      setAtualizandoStatus(false)
    }
  }

  const enviarNotificacaoWhatsApp = () => {
    if (!os?.cliente.telefone) return alert("Cliente não possui telefone cadastrado.")
    const cleanPhone = os.cliente.telefone.replace(/\D/g, "")
    const texto = encodeURIComponent(
      `Olá ${os.cliente.nome}! Atualização sobre o seu ${os.dispositivo} (${os.numero}):\n` +
      `Status atual: *${os.status}*\n` +
      `Valor Total: R$ ${Number(os.valorTotal).toFixed(2)}\n\n` +
      `Qualquer dúvida estamos à disposição na loja!`
    )
    window.open(`https://wa.me/55${cleanPhone}?text=${texto}`, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400 dark:text-zinc-500 mb-2" />
      </div>
    )
  }

  if (!os) {
    return (
      <div className="text-center py-12 text-zinc-400 dark:text-zinc-500">
        Ordem de Serviço não encontrada.
      </div>
    )
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* LAYOUT EXCLUSIVO DE IMPRESSÃO (A4 / COMPROVANTE OFICIAL)                  */}
      {/* ========================================================================= */}
      <div className="hidden print:block font-sans text-black p-4 max-w-4xl mx-auto space-y-6 bg-white">
        {/* Cabeçalho da Loja */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-4">
            <img src="/assets/wrldevotec.webp" alt="Logo Loja" className="w-14 h-14 object-contain" />
            <div>
              <h1 className="text-xl font-extrabold uppercase tracking-tight text-black">
                {os.empresa?.nomeFantasia || "Assistência Técnica Evo Etec"}
              </h1>
              {os.empresa?.cnpj && <p className="text-xs text-zinc-700 font-mono">CNPJ: {os.empresa.cnpj}</p>}
              {os.empresa?.telefone && <p className="text-xs text-zinc-700">Tel/WhatsApp: {os.empresa.telefone}</p>}
              {os.empresa?.endereco && <p className="text-xs text-zinc-700">{os.empresa.endereco}</p>}
            </div>
          </div>
          <div className="text-right">
            <div className="border border-zinc-900 px-3 py-1.5 rounded-lg text-center bg-zinc-50">
              <span className="text-xs text-zinc-500 font-mono block">ORDEM DE SERVIÇO</span>
              <span className="text-lg font-black font-mono text-black">{os.numero}</span>
            </div>
            <span className="text-xs text-zinc-600 block mt-1">
              Data: {new Date(os.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>

        {/* Quadro 1: Cliente e Dispositivo */}
        <div className="grid grid-cols-2 gap-4 text-xs border border-zinc-300 rounded-lg p-4 bg-zinc-50/50">
          <div className="space-y-1 border-r border-zinc-300 pr-4">
            <span className="font-bold text-zinc-900 uppercase block border-b border-zinc-200 pb-1">DADOS DO CLIENTE</span>
            <p><strong className="text-zinc-700">Nome:</strong> {os.cliente.nome}</p>
            {os.cliente.cpfCnpj && <p><strong className="text-zinc-700">CPF/CNPJ:</strong> {os.cliente.cpfCnpj}</p>}
            {os.cliente.telefone && <p><strong className="text-zinc-700">Telefone:</strong> {os.cliente.telefone}</p>}
            {os.cliente.email && <p><strong className="text-zinc-700">E-mail:</strong> {os.cliente.email}</p>}
            {os.cliente.endereco && <p><strong className="text-zinc-700">Endereço:</strong> {os.cliente.endereco}</p>}
          </div>

          <div className="space-y-1">
            <span className="font-bold text-zinc-900 uppercase block border-b border-zinc-200 pb-1">DADOS DO DISPOSITIVO</span>
            <p><strong className="text-zinc-700">Aparelho:</strong> {os.dispositivo}</p>
            <p><strong className="text-zinc-700">Marca / Modelo:</strong> {[os.marca, os.modelo].filter(Boolean).join(" - ") || "Não informado"}</p>
            {os.imei && <p><strong className="text-zinc-700">IMEI / Nº Série:</strong> {os.imei}</p>}
            {os.tecnico?.nome && <p><strong className="text-zinc-700">Técnico Responsável:</strong> {os.tecnico.nome}</p>}
            <p><strong className="text-zinc-700">Status Atual:</strong> <span className="font-bold uppercase">{os.status}</span></p>
          </div>
        </div>

        {/* Quadro 2: Defeito e Laudo Técnico */}
        <div className="border border-zinc-300 rounded-lg p-4 text-xs space-y-3">
          <span className="font-bold text-zinc-900 uppercase block border-b border-zinc-200 pb-1">LAUDO TÉCNICO & DIAGNÓSTICO</span>
          <div>
            <strong className="text-zinc-800 block font-semibold">Defeito Relatado pelo Cliente:</strong>
            <p className="text-zinc-700 bg-white p-2 rounded border border-zinc-200 mt-1">{os.defeitoRelatado}</p>
          </div>
          {os.diagnostico && (
            <div>
              <strong className="text-zinc-800 block font-semibold">Diagnóstico da Bancada / Solução:</strong>
              <p className="text-zinc-700 bg-white p-2 rounded border border-zinc-200 mt-1">{os.diagnostico}</p>
            </div>
          )}
        </div>

        {/* Quadro 3: Valores e Condições */}
        <div className="border border-zinc-900 rounded-lg p-4 flex items-center justify-between bg-zinc-50">
          <div className="space-y-1 text-xs">
            <p><strong className="text-zinc-800">Serviços / Mão de Obra:</strong> R$ {Number(os.valorServico).toFixed(2)}</p>
            <p><strong className="text-zinc-800">Peças e Componentes:</strong> R$ {Number(os.valorPecas).toFixed(2)}</p>
            <p><strong className="text-emerald-800 font-bold">Garantia Legal de {os.garantiaDias} Dias</strong> inclusa referente aos serviços prestados.</p>
          </div>
          <div className="text-right border-l border-zinc-300 pl-6">
            <span className="text-xs font-mono uppercase text-zinc-600 block">VALOR TOTAL DA OS</span>
            <span className="text-2xl font-black font-mono text-black">
              R$ {Number(os.valorTotal).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Quadro 4: Termo de Garantia e Assinaturas */}
        <div className="pt-4 border-t border-zinc-300 space-y-8 text-[11px] text-zinc-600">
          <p className="leading-tight text-justify">
             Declaro ter conferido o aparelho acima descrito na entrega e concordo com os termos de garantia de {os.garantiaDias} dias referentes exclusivamente aos serviços e peças substituídas descritas neste laudo técnico, conforme previsto no CDC.
          </p>

          <div className="grid grid-cols-2 gap-12 pt-6">
            <div className="text-center border-t border-zinc-800 pt-1">
              <span className="font-semibold text-zinc-900 block">{os.cliente.nome}</span>
              <span className="text-[10px] text-zinc-500 uppercase">Assinatura do Cliente</span>
            </div>
            <div className="text-center border-t border-zinc-800 pt-1">
              <span className="font-semibold text-zinc-900 block">{os.empresa?.nomeFantasia || "Assistência Técnica"}</span>
              <span className="text-[10px] text-zinc-500 uppercase">Assinatura do Técnico</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERFACE DE TELA INTERATIVA                                              */}
      {/* ========================================================================= */}
      <div className="max-w-4xl mx-auto space-y-6 print:hidden page-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/ordens-servico"
              className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-sm transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                <span>{os.numero}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-semibold">
                  {os.status}
                </span>
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Criada em {new Date(os.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={enviarNotificacaoWhatsApp}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all text-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Aviso WhatsApp</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 bg-black dark:bg-zinc-700 hover:bg-zinc-800 dark:hover:bg-zinc-600 text-white font-medium px-4 py-2.5 rounded-xl transition-all text-sm shrink-0 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir OS</span>
            </button>
          </div>
        </div>

        {/* Card de Alteração Direta de Status */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm transition-colors duration-200">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Alterar Status da Ordem de Serviço</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Ao salvar, o novo status é registrado automaticamente na linha do tempo de auditoria.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={novoStatus}
              onChange={(e) => setNovoStatus(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-500"
            >
              <option value="RECEBIDA">RECEBIDA</option>
              <option value="EM_ANALISE">EM ANÁLISE</option>
              <option value="AGUARDANDO_APROVACAO">AGUARDANDO APROVAÇÃO</option>
              <option value="APROVADA">APROVADA</option>
              <option value="EM_REPARO">EM REPARO</option>
              <option value="AGUARDANDO_PECA">AGUARDANDO PEÇA</option>
              <option value="AGUARDANDO_RETIRADA">AGUARDANDO RETIRADA</option>
              <option value="CONCLUIDA">CONCLUÍDA</option>
              <option value="CANCELADA">CANCELADA</option>
            </select>
            <button
              onClick={handleMudarStatus}
              disabled={atualizandoStatus || !novoStatus || novoStatus === os.status}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 shrink-0 cursor-pointer"
            >
              {atualizandoStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Atualizar Status</span>
            </button>
          </div>
        </div>

        {/* Grid de Informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cliente */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 space-y-3 shadow-sm transition-colors duration-200">
            <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <span>Dados do Cliente</span>
            </h3>
            <p className="text-lg font-extrabold text-zinc-900 dark:text-white">{os.cliente.nome}</p>
            {os.cliente.telefone && <p className="text-sm text-zinc-700 dark:text-zinc-300">Tel: {os.cliente.telefone}</p>}
            {os.cliente.email && <p className="text-sm text-zinc-600 dark:text-zinc-400">Email: {os.cliente.email}</p>}
            {os.cliente.endereco && <p className="text-xs text-zinc-500 dark:text-zinc-400">Endereço: {os.cliente.endereco}</p>}
          </div>

          {/* Aparelho */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 space-y-3 shadow-sm transition-colors duration-200">
            <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-500" />
              <span>Dispositivo</span>
            </h3>
            <p className="text-lg font-extrabold text-zinc-900 dark:text-white">{os.dispositivo}</p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {[os.marca, os.modelo].filter(Boolean).join(" - ") || "Sem modelo"}
            </p>
            {os.imei && <p className="text-xs text-zinc-500 dark:text-zinc-400">IMEI / Nº Série: {os.imei}</p>}
          </div>
        </div>

        {/* Defeito e Valores */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors duration-200">
          <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-500" />
            <span>Defeito e Diagnóstico</span>
          </h3>
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium block">Defeito Relatado:</span>
            <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium mt-1">{os.defeitoRelatado}</p>
          </div>
          {os.diagnostico && (
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium block">Laudo Técnico:</span>
              <p className="text-sm text-zinc-800 dark:text-zinc-300 font-medium mt-1">{os.diagnostico}</p>
            </div>
          )}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">Garantia de {os.garantiaDias} dias inclusa</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium block">Valor Total:</span>
              <span className="text-xl font-bold text-emerald-500">
                R$ {Number(os.valorTotal).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Audit Trail / Histórico de Mudanças */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors duration-200">
          <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Histórico de Atualizações (Audit Trail)</span>
          </h3>
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
            {os.historicos.map((h) => (
              <div key={h.id} className="relative pl-8 flex items-start justify-between text-sm">
                <div className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white dark:border-zinc-900" />
                <div>
                  <span className="font-bold text-zinc-900 dark:text-white block">Status alterado para {h.statusNovo}</span>
                  {h.observacao && <span className="text-xs text-zinc-600 dark:text-zinc-400 block mt-0.5">{h.observacao}</span>}
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block mt-1">
                    Por {h.usuario?.nome || "Sistema"}
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                  {new Date(h.criadoEm).toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
