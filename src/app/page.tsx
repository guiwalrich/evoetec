// src/app/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Wrench, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  MessageSquare, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone,
  Cloud,
  ChevronRight,
  ArrowUpRight,
  Globe,
  Clock,
  Menu,
  Sparkles,
  Users,
  Check,
  FileText,
  DollarSign,
  Laptop,
  Printer,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from "lucide-react"

const USER_AVATARS = Array.from({ length: 16 }, (_, i) => i + 1)

export default function FullyResponsiveScribblitLandingPage() {
  const [selectedAvatar, setSelectedAvatar] = useState(1)
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <div className="min-h-screen w-full bg-[#e8e8ec] text-zinc-900 selection:bg-zinc-900 selection:text-white font-sans antialiased py-4 sm:py-6 px-3 sm:px-8 scroll-smooth overflow-x-hidden">
      
      {/* CONTAINER PRINCIPAL CENTRALIZADO RESPONSIVO */}
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">

        {/* ========================================================================= */}
        {/* 1. HERO CONTAINER CARD */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-[28px] sm:rounded-[36px] p-4 sm:p-10 border-2 sm:border-4 border-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] space-y-8 sm:space-y-10 relative overflow-hidden transition-all duration-500">
          
          {/* Header */}
          <header className="flex items-center justify-between pb-4 border-b border-zinc-100 gap-2">
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <img 
                src="/assets/wrldevotec.webp" 
                alt="Evo Etec Logo" 
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain group-hover:scale-105 transition-transform" 
              />
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-900">
                Evo Etec
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold text-zinc-600">
              <a href="#inicio" className="hover:text-zinc-900 transition-colors">Início</a>
              <a href="#modulos" className="hover:text-zinc-900 transition-colors">Módulos</a>
              <a href="#perfis" className="hover:text-zinc-900 transition-colors">Perfis</a>
              <a href="#precos" className="hover:text-zinc-900 transition-colors">Preços</a>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link 
                href="/login" 
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 px-2.5 sm:px-3 py-1.5 transition-colors"
              >
                Entrar
              </Link>
              <Link 
                href="/registro" 
                className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all shadow-md hover:scale-105 shrink-0"
              >
                Testar 14 Dias
              </Link>
            </div>
          </header>

          {/* Hero Content Center */}
          <div className="text-center space-y-4 sm:space-y-6 max-w-3xl mx-auto pt-2">
            <h1 className="text-3xl sm:text-5xl lg:text-[68px] font-extrabold tracking-[-0.035em] leading-[1.05] text-zinc-900">
              Sua assistência técnica sob controle.<br className="hidden sm:inline" />
              Do orçamento ao lucro da bancada.
            </h1>

            <p className="text-xs sm:text-sm text-zinc-500 font-normal max-w-2xl mx-auto leading-relaxed px-2">
              Sistema completo para assistências técnicas de celulares, notebooks e eletrônicos. Ordens de serviço em segundos, laudo com fotos em nuvem e caixa em tempo real.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link 
                href="/registro" 
                className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-8 py-3.5 sm:py-4 rounded-full transition-all flex items-center justify-center gap-3 shadow-lg hover:scale-105"
              >
                <span>Criar Conta Trial 14 Dias</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a 
                href="#modulos" 
                className="w-full sm:w-auto bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold px-8 py-3.5 sm:py-4 rounded-full transition-all border border-zinc-200 text-center"
              >
                Ver Módulos
              </a>
            </div>
          </div>

          {/* CARD TIPO NASA APOLLO 11 PARA A HERO IMAGE */}
          <div className="rounded-[24px] sm:rounded-[32px] overflow-hidden relative border-2 sm:border-4 border-white shadow-[0_25px_70px_rgba(0,0,0,0.12)] group min-h-[340px] sm:min-h-[480px] flex flex-col justify-end isolate transform-gpu">
            <img 
              src="/assets/tecnico_bancada_4k.jpg?v=1" 
              alt="Técnico Especialista em Assistência Técnica 4K" 
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
            />

            {/* Frosted Glass Overlay Bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-5 sm:p-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent backdrop-blur-md border-t border-white/10 text-white flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 rounded-b-[22px] sm:rounded-b-[28px]">
              <div className="space-y-1">
                <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                  Bancada de Precisão & Diagnóstico
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-300 font-light max-w-lg leading-relaxed">
                  Infraestrutura de ponta para controlar laudos técnicos, fotos do aparelho e histórico financeiro de forma segura.
                </p>
              </div>

              <Link 
                href="/registro" 
                className="w-full sm:w-auto bg-white/90 hover:bg-white text-zinc-950 text-xs font-bold px-6 py-3 rounded-full transition-all backdrop-blur-md shrink-0 shadow-lg hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>Saiba Mais</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 2. MÓDULOS EM CARDS NO MODELO PORSCHE 911 GT3 RS */}
        {/* ========================================================================= */}
        <section id="modulos" className="space-y-6 sm:space-y-8 pt-2">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-5xl font-extrabold tracking-tight text-zinc-900">
              Módulos Principais
            </h2>
            <p className="text-xs text-zinc-500 font-normal">
              Recursos desenhados com a precisão exigida pela sua bancada:
            </p>
          </div>

          {/* Grid de Cards no Estilo Porsche GT3 RS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* CARD 1: OS KANBAN */}
            <div className="bg-[#dfdfe3] rounded-[28px] sm:rounded-[36px] p-5 sm:p-6 border-2 sm:border-4 border-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between space-y-6 group">
              
              <div className="bg-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 border border-zinc-200/80 space-y-4 shadow-sm group-hover:scale-[1.01] transition-transform">
                <div className="flex items-center justify-between border-b pb-3 border-zinc-100">
                  <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">Status em Tempo Real</span>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">Em Reparo</span>
                </div>
                <div className="space-y-1">
                  <div className="font-extrabold text-sm text-zinc-900">OS-1048 · iPhone 14 Pro</div>
                  <p className="text-xs text-zinc-500 font-normal">Troca de Display OLED e Teste de Touch</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-white px-3 py-1 rounded-full text-[11px] font-semibold text-zinc-700 shadow-2xs border border-zinc-200">
                  Kanban
                </span>
                <span className="bg-white px-3 py-1 rounded-full text-[11px] font-semibold text-zinc-700 shadow-2xs border border-zinc-200">
                  Via Térmica
                </span>
                <span className="bg-white px-3 py-1 rounded-full text-[11px] font-semibold text-zinc-700 shadow-2xs border border-zinc-200">
                  Garantia 90 Dias
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                  Ordens de Serviço
                </h3>
                <h4 className="text-base sm:text-lg font-bold text-zinc-500 tracking-tight">
                  Controle Kanban de Bancada
                </h4>
                <p className="text-xs text-zinc-600 font-normal leading-relaxed">
                  Emissão rápida de comprovante de entrada, vínculo direto de peças do estoque e laudo técnico impresso em 1 clique.
                </p>
              </div>

            </div>

            {/* CARD 2: CLOUDINARY NUVEM */}
            <div className="bg-[#dfdfe3] rounded-[28px] sm:rounded-[36px] p-5 sm:p-6 border-2 sm:border-4 border-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between space-y-6 group">
              
              <div className="bg-zinc-900 text-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 border border-zinc-800 space-y-4 shadow-sm group-hover:scale-[1.01] transition-transform">
                <div className="flex items-center justify-between border-b pb-3 border-zinc-800 text-[10px] font-mono">
                  <span className="text-indigo-400 font-bold">Cloudinary SDK</span>
                  <span className="text-emerald-400 font-semibold">HTTPS Seguro</span>
                </div>
                <div className="flex items-center gap-3">
                  <Cloud className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-400 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">Fotos Permanentes no Check-in</div>
                    <p className="text-[11px] text-zinc-400">Comprove riscos ou trincados pré-existentes.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-white px-3 py-1 rounded-full text-[11px] font-semibold text-zinc-700 shadow-2xs border border-zinc-200">
                  HTTPS Cloud
                </span>
                <span className="bg-white px-3 py-1 rounded-full text-[11px] font-semibold text-zinc-700 shadow-2xs border border-zinc-200">
                  Até 6 Fotos HD por OS
                </span>
                <span className="bg-white px-3 py-1 rounded-full text-[11px] font-semibold text-zinc-700 shadow-2xs border border-zinc-200">
                  Nuvem Permanente
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                  Fotos em Nuvem
                </h3>
                <h4 className="text-base sm:text-lg font-bold text-zinc-500 tracking-tight">
                  Segurança para a Assistência
                </h4>
                <p className="text-xs text-zinc-600 font-normal leading-relaxed">
                  Galeria de fotos da bancada na nuvem (até 6 fotos em HD por Ordem de Serviço) salvas em servidores de alta disponibilidade que nunca são apagadas.
                </p>
              </div>

            </div>

            {/* CARD 3: FINANCEIRO */}
            <div className="bg-[#dfdfe3] rounded-[28px] sm:rounded-[36px] p-5 sm:p-6 border-2 sm:border-4 border-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between space-y-6 group">
              
              <div className="bg-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 border border-zinc-200/80 space-y-4 shadow-sm group-hover:scale-[1.01] transition-transform">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono text-[10px]">Saldo no Caixa Hoje</span>
                  <span className="text-emerald-600 font-extrabold text-base sm:text-lg">R$ 2.850,00</span>
                </div>
                <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[80%]" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-white px-3 py-1 rounded-full text-[11px] font-semibold text-zinc-700 shadow-2xs border border-zinc-200">
                  Fluxo Diário
                </span>
                <span className="bg-white px-3 py-1 rounded-full text-[11px] font-semibold text-zinc-700 shadow-2xs border border-zinc-200">
                  DRE & Lucros
                </span>
                <span className="bg-white px-3 py-1 rounded-full text-[11px] font-semibold text-zinc-700 shadow-2xs border border-zinc-200">
                  Vendas de Balcão
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                  Controle Financeiro
                </h3>
                <h4 className="text-base sm:text-lg font-bold text-zinc-500 tracking-tight">
                  Caixa & Faturamento Diário
                </h4>
                <p className="text-xs text-zinc-600 font-normal leading-relaxed">
                  Acompanhe entradas por OS, vendas de acessórios no balcão e saídas com fornecedores de peças.
                </p>
              </div>

            </div>

            {/* CARD 4: DISCORD AUDITORIA */}
            <div className="bg-[#dfdfe3] rounded-[28px] sm:rounded-[36px] p-5 sm:p-6 border-2 sm:border-4 border-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between space-y-6 group">
              
              <div className="bg-[#5865F2] text-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 space-y-2 shadow-sm group-hover:scale-[1.01] transition-transform">
                <div className="flex items-center gap-2 text-xs font-mono font-bold">
                  <MessageSquare className="w-4 h-4" />
                  <span>Discord Webhook (#auditoria)</span>
                </div>
                <p className="text-xs text-indigo-100 font-mono bg-black/30 p-2.5 rounded-xl border border-white/10">
                  Notificação: OS-1048 concluída por Técnico Lucas.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-white px-3 py-1 rounded-full text-[11px] font-semibold text-zinc-700 shadow-2xs border border-zinc-200">
                  Discord Realtime
                </span>
                <span className="bg-white px-3 py-1 rounded-full text-[11px] font-semibold text-zinc-700 shadow-2xs border border-zinc-200">
                  Auditoria de Exclusão
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                  Auditoria & Discord
                </h3>
                <h4 className="text-base sm:text-lg font-bold text-zinc-500 tracking-tight">
                  Notificações no Celular
                </h4>
                <p className="text-xs text-zinc-600 font-normal leading-relaxed">
                  Alertas em tempo real no canal do Discord da sua equipe para acompanhar toda movimentação da bancada.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* ========================================================================= */}
        {/* 3. CARD NASA STYLE PARA A SEÇÃO DE AVATARES PIXEL ART */}
        {/* ========================================================================= */}
        <section id="perfis" className="bg-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-12 border-2 sm:border-4 border-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] space-y-6 sm:space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
              Perfis de Acesso & Avatares da Equipe
            </h2>
            <p className="text-xs text-zinc-500 font-normal">
              16 avatares em pixel art para personalizar cada técnico, atendente e gerente da assistência.
            </p>
          </div>

          {/* Grade de 16 Avatares Responsiva (4 colunas em mobile, 8 em telas maiores) */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
            {USER_AVATARS.map((num) => {
              const isSelected = selectedAvatar === num
              return (
                <button
                  key={num}
                  onClick={() => setSelectedAvatar(num)}
                  className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-300 flex flex-col items-center gap-1.5 sm:gap-2 cursor-pointer ${
                    isSelected 
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-xl scale-105" 
                      : "bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800 hover:scale-105"
                  }`}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-zinc-300 bg-zinc-200 shrink-0">
                    <img 
                      src={`/assets/avatars/avatar_${num}.png`}
                      alt={`Avatar ${num}`}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold">
                    #{num.toString().padStart(2, "0")}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Card de Confirmação do Avatar */}
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-white/20 bg-zinc-800 shrink-0 mx-auto sm:mx-0">
                <img 
                  src={`/assets/avatars/avatar_${selectedAvatar}.png`}
                  alt="Avatar Selecionado"
                  className="w-full h-full object-cover"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Avatar Pixel Art #{selectedAvatar} Selecionado</h4>
                <p className="text-xs text-zinc-400 font-light">
                  Vinculado ao perfil de usuário do seu sistema durante o cadastro.
                </p>
              </div>
            </div>

            <Link
              href={`/registro?avatar=${selectedAvatar}`}
              className="w-full sm:w-auto bg-white text-zinc-950 text-xs font-bold px-6 py-3 rounded-full hover:bg-zinc-200 transition-all hover:scale-105 shrink-0 text-center"
            >
              Usar no Cadastro
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. SEÇÃO DE PREÇOS EM CARDS NO ESTILO PORSCHE / NASA */}
        {/* ========================================================================= */}
        <section id="precos" className="bg-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-12 border-2 sm:border-4 border-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] space-y-6 sm:space-y-8">
          
          <div className="text-center space-y-3 sm:space-y-4 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-5xl font-extrabold tracking-tight text-zinc-900">
              Plano Único & Transparente
            </h2>
            <p className="text-xs text-zinc-500 font-normal">
              Comece grátis por 14 dias sem cartão de crédito. Assinatura mensal sem fidelidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-3xl mx-auto pt-2 sm:pt-4">
            
            {/* Plan 1: Trial 14 Dias */}
            <div className="bg-[#dfdfe3] rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 border-2 sm:border-4 border-white flex flex-col justify-between space-y-6 hover:-translate-y-1.5 transition-all duration-300">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-3xl font-extrabold text-zinc-900">R$ 0,00</div>
                  <div className="text-xs font-bold text-zinc-700">Trial Completo (14 Dias)</div>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-600 font-normal pt-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Acesso a todas as funções da bancada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cadastro de Ordens de Serviço ilimitado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Código de 6 dígitos enviado via Resend</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Suporte via canal de texto no Discord</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/registro" 
                className="w-full bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-bold py-3.5 rounded-full border border-zinc-300 text-center block transition-all"
              >
                Criar Conta Grátis
              </Link>
            </div>

            {/* Plan 2: Profissional Completo R$ 39,90/mês */}
            <div className="bg-zinc-900 text-white rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 border-2 sm:border-4 border-zinc-900 shadow-xl flex flex-col justify-between space-y-6 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden">
              
              <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-mono px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
                Tudo Incluso
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-4xl font-extrabold text-white">
                    R$ 39,90<span className="text-xs font-normal text-zinc-400">/mês</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-400">Plano Profissional Completo</div>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-300 font-normal pt-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Ordens de Serviço, Clientes & Laudos Ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Galeria em nuvem (até 6 fotos HD por OS)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Notificações & Auditoria em tempo real no Discord</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Suporte prioritário via canal exclusivo no Discord</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Impressão de vias em 1 clique (Térmica 80mm/58mm)</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/registro" 
                className="w-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-extrabold py-4 rounded-full text-center block transition-all shadow-md hover:scale-105"
              >
                Iniciar Teste de 14 Dias Grátis
              </Link>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. FOOTER */}
        {/* ========================================================================= */}
        <footer className="bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 border-2 sm:border-4 border-white shadow-[0_20px_60px_rgba(0,0,0,0.04)] text-xs text-zinc-500 font-normal space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-xs text-zinc-500 font-mono text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <img src="/assets/wrldevotec.webp" alt="Logo" className="w-6 h-6 object-contain" />
              <span>© 2026 Evo Etec. Todos os direitos reservados.</span>
            </div>

            <div className="flex items-center gap-6 justify-center">
              <Link href="/login" className="hover:text-zinc-900 transition-colors">Entrar</Link>
              <Link href="/registro" className="hover:text-zinc-900 transition-colors">Criar Conta</Link>
            </div>
          </div>
        </footer>

      </div>

    </div>
  )
}
