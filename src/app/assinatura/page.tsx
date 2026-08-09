// src/app/assinatura/page.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { Lock, CheckCircle2, MessageCircle, Send, Loader2 } from "lucide-react"
import { signOut } from "next-auth/react"

export default function AssinaturaPage() {
  const [feedback, setFeedback] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [feedbackEnviado, setFeedbackEnviado] = useState(false)

  const handleEnviarFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim()) return
    setEnviando(true)

    try {
      // Dispara envio do feedback para API
      const res = await fetch("/api/empresa/feedback-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: feedback }),
      })

      if (res.ok) {
        setFeedbackEnviado(true)
      }
    } catch {
      console.error("Erro ao enviar feedback")
    } finally {
      setEnviando(false)
    }
  }


  return (
    <div className="min-h-screen bg-[#111113] text-zinc-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-xl bg-[#18181b]/90 border border-zinc-800 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center">
            <img
              src="/assets/wrldevotec.png"
              alt="Evo Etec Logo"
              className="object-contain w-20 h-20 hover:scale-105 transition-transform drop-shadow-md mx-auto"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Assinatura Pendente ou Teste Expirado</span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            Período de Testes Encerrado
          </h1>
          <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-md mx-auto">
            Sua conta no <span className="text-zinc-200 font-medium">Evo Etec ERP</span> requer a ativação da assinatura para continuar acessando todos os recursos da sua assistência técnica.
          </p>
        </div>

        {/* Benefícios */}
        <div className="bg-[#111113] border border-zinc-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            O que você garante com a assinatura:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ordens de Serviço Ilimitadas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>PDV Frente de Caixa & Estoque</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Catálogo Online de Produtos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Gestão Financeira & Relatórios</span>
            </div>
          </div>
        </div>

        {/* QR Code e Botão de Pagamento */}
        <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 backdrop-blur-md mb-6">
          <p className="text-zinc-300 text-sm mb-4 text-center font-medium">
            Escaneie o QR Code para ativar sua assinatura (R$ 39,90/mês):
          </p>
          
          <div className="p-3 bg-white rounded-xl mb-4 shadow-lg shadow-black/50">
            <img 
              src="/assets/qr-pix.png" 
              alt="QR Code Pix - Evo Etec" 
              className="w-40 h-40 object-contain"
            />
          </div>
          <div className="w-full mb-5">
            <p className="text-zinc-400 text-xs mb-1.5 text-center">Ou use a Chave Pix Copia e Cola:</p>
            <div className="relative flex items-center bg-[#111113] border border-zinc-800/80 rounded-xl p-2.5">
              <code className="text-zinc-300 text-[10px] break-all select-all text-center w-full">
                00020101021126580014BR.GOV.BCB.PIX01362897a911-4b39-4292-a203-c3b411c2d71f5204000053039865802BR5914Joao Guilherme6009SAO PAULO62080504daqr63046724
              </code>
            </div>
          </div>
          <a 
            href="https://wa.me/5577999863269?text=Ol%C3%A1%2C%20acabei%20de%20fazer%20o%20pagamento%20da%20assinatura%20do%20Evo%20Etec.%20Segue%20meu%20comprovante%3A" 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 rounded-2xl text-xs tracking-wider transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Já paguei: Enviar Comprovante</span>
          </a>
        </div>

        {/* Formulário de Feedback */}
        <div className="border-t border-zinc-800 pt-6 space-y-4">
          <h4 className="text-xs font-medium text-zinc-400 text-center">
            Como foi a sua experiência durante o período de testes?
          </h4>

          {feedbackEnviado ? (
            <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-xs text-center">
              Obrigado pelo seu feedback! Nossa equipe já recebeu a sua mensagem.
            </div>
          ) : (
            <form onSubmit={handleEnviarFeedback} className="space-y-3">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Conte-nos o que achou do sistema, elogios ou sugestões de melhoria..."
                rows={3}
                className="w-full bg-[#111113] border border-zinc-800 rounded-2xl p-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all resize-none"
              />
              <button
                type="submit"
                disabled={enviando || !feedback.trim()}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold py-2.5 rounded-2xl text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Enviar Feedback</span>
              </button>
            </form>
          )}
        </div>

        {/* Sair da Conta */}
        <div className="text-center pt-2">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-light"
          >
            Sair da conta e voltar ao login
          </button>
        </div>
      </div>
    </div>
  )
}
