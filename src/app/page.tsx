// src/app/page.tsx
import Link from "next/link"
import { 
  Wrench, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Lock,
  Layers
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans antialiased relative overflow-x-hidden">
      {/* Luz Radial de Fundo Superior (Radial Glow TrySchema) */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.12) 0%, rgba(0, 0, 0, 0) 70%)"
        }}
      />

      {/* Grid de Linhas Finas Estilo TrySchema */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: "linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)",
          backgroundSize: "64px 64px"
        }}
      />

      {/* Header Fixo Flutuante Glassmorphic */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/assets/wrldevotec.webp" 
              alt="Evo Etec Logo" 
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" 
            />
            <span className="font-extrabold text-lg tracking-tight text-white">
              Evo Etec<span className="text-zinc-500 font-light">.ERP</span>
            </span>
          </Link>

          {/* Navegação Âncoras */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#garantia" className="hover:text-white transition-colors">Segurança & Trial</a>
            <a href="#precos" className="hover:text-white transition-colors">Preço</a>
          </nav>

          {/* Botões CTA Header */}
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-xs font-medium text-zinc-300 hover:text-white px-4 py-2 rounded-full transition-colors"
            >
              Entrar
            </Link>
            <Link 
              href="/registro" 
              className="bg-white hover:bg-zinc-200 text-black text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105"
            >
              Iniciar Trial Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-36 pb-20 px-6 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-zinc-900/80 border border-white/10 px-4 py-1.5 rounded-full text-xs font-medium text-zinc-300 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Novo: Trial completo por 14 dias sem cartão de crédito</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
          Gestão inteligente para sua assistência<span className="text-emerald-400">.</span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
          Simplifique ordens de serviço, orçamento, peças, controle financeiro e catálogo online. Projetado para máxima velocidade e clareza.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href="/registro" 
            className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black text-sm font-extrabold px-8 py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:scale-105"
          >
            <span>Experimentar 14 Dias Grátis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a 
            href="#recursos" 
            className="w-full sm:w-auto border border-white/15 hover:bg-white/5 text-zinc-300 text-sm font-semibold px-8 py-4 rounded-full transition-all flex items-center justify-center"
          >
            Conhecer Recursos
          </a>
        </div>

        {/* Mockup Interativo Estilo TrySchema (Vidro Polido) */}
        <div className="pt-12">
          <div className="relative rounded-[32px] border border-white/10 bg-zinc-950/80 p-3 sm:p-5 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Reflexo Linear de Borda Polida */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            <div className="bg-zinc-900/60 rounded-[24px] border border-white/5 p-6 space-y-6 text-left">
              {/* Header do Mockup */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-zinc-500 ml-2">evoetec.app/dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sistema Online</span>
                </div>
              </div>

              {/* Cards de Métricas Rápidas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-xs text-zinc-400 font-light">Ordens em Aberto</span>
                  <div className="text-2xl font-bold text-white">28 OS</div>
                  <span className="text-[10px] text-emerald-400">+4 hoje na bancada</span>
                </div>
                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-xs text-zinc-400 font-light">Faturamento no Mês</span>
                  <div className="text-2xl font-bold text-white">R$ 14.850,00</div>
                  <span className="text-[10px] text-emerald-400">Meta mensal 82%</span>
                </div>
                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-xs text-zinc-400 font-light">Peças em Estoque</span>
                  <div className="text-2xl font-bold text-white">342 itens</div>
                  <span className="text-[10px] text-zinc-400">Catálogo atualizado</span>
                </div>
              </div>

              {/* Tabela de OS Recentes Simulado */}
              <div className="bg-zinc-950/60 rounded-2xl border border-white/5 p-4 space-y-3">
                <div className="text-xs font-bold text-zinc-300">Últimas Ordens de Serviço</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-white/5">
                    <span className="font-mono text-zinc-400">OS-1042</span>
                    <span className="font-medium text-white">iPhone 13 Pro — Troca de Tela OLED</span>
                    <span className="bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20 text-[10px]">Em Reparo</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-white/5">
                    <span className="font-mono text-zinc-400">OS-1041</span>
                    <span className="font-medium text-white">Notebook Dell XPS — Limpeza & Pasta Térmica</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[10px]">Pronto para Retirada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Bento Grid de Recursos */}
      <section id="recursos" className="relative z-10 py-24 px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Tudo o que sua bancada precisa<span className="text-emerald-400">.</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Recursos projetados especificamente para acelerar o atendimento de assistências técnicas e lojas de eletrônicos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-[32px] p-8 space-y-4 hover:border-white/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Ordens de Serviço</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Emita OS completas com fotos do aparelho, laudo técnico, valores de peças e serviços, além de impressão de vias para o cliente.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-[32px] p-8 space-y-4 hover:border-white/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Controle Financeiro</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Acompanhe contas a receber e pagar, fluxo de caixa diário, vendas no balcão e obtenha relatórios financeiros em segundos.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-[32px] p-8 space-y-4 hover:border-white/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Catálogo de Produtos</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Organize peças por categoria dinâmica, adicione fotos hospedadas em nuvem e compartilhe o catálogo vitrine com seus clientes.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-[32px] p-8 space-y-4 hover:border-white/20 transition-all group md:col-span-2">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Notificações & Discord Webhook</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Receba alertas de auditoria diretamente no Discord de sua empresa sempre que uma Ordem de Serviço for atualizada, finalizada ou removida.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-[32px] p-8 space-y-4 hover:border-white/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Segurança Total</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Soft delete de registros, isolamento multi-tenant por empresa e verificação de e-mail por código de 6 dígitos.
            </p>
          </div>
        </div>
      </section>

      {/* Seção Garantia & Trial */}
      <section id="garantia" className="relative z-10 py-20 px-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-b from-zinc-900/80 to-zinc-950 border border-white/10 rounded-[32px] p-8 sm:p-12 text-center space-y-6 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            14 Dias de Teste Grátis Sem Risco
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto font-light leading-relaxed">
            Cadastre sua assistência agora, receba o código de 6 dígitos no seu e-mail e aproveite o acesso completo a todos os recursos durante 14 dias. Sem necessidade de cartão de crédito.
          </p>
          <div className="pt-2">
            <Link 
              href="/registro" 
              className="inline-flex items-center gap-2 bg-white hover:bg-zinc-200 text-black text-sm font-bold px-8 py-3.5 rounded-full transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-105"
            >
              <span>Criar Minha Conta Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Seção de Preço Transparente */}
      <section id="precos" className="relative z-10 py-24 px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            Plano Único & Transparente<span className="text-emerald-400">.</span>
          </h2>
          <p className="text-zinc-400 text-sm font-light">Sem taxas escondidas. Comece com 14 dias grátis.</p>
        </div>

        <div className="max-w-md mx-auto bg-zinc-900/60 backdrop-blur-2xl border border-white/15 rounded-[32px] p-8 sm:p-10 space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 bg-emerald-500 text-black font-extrabold text-[10px] uppercase tracking-widest px-4 py-1 rounded-bl-xl">
            Popular
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Plano Profissional ERP</h3>
            <p className="text-xs text-zinc-400 font-light">Acesso ilimitado para sua assistência</p>
            <div className="pt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">R$ 97</span>
              <span className="text-xs text-zinc-400">/mês após o Trial</span>
            </div>
          </div>

          <ul className="space-y-3 text-xs text-zinc-300">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ordens de Serviço e Clientes Ilimitados</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Controle Financeiro & Fluxo de Caixa</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Catálogo por Categorias Dinâmicas</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Auditoria e Webhooks no Discord</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Suporte Prioritário ao Cliente</span>
            </li>
          </ul>

          <Link 
            href="/registro" 
            className="w-full bg-white hover:bg-zinc-200 text-black text-sm font-extrabold py-3.5 rounded-full transition-all text-center block shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02]"
          >
            Iniciar 14 Dias Grátis
          </Link>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-zinc-500 font-light">
          <div className="flex items-center gap-3">
            <img src="/assets/wrldevotec.webp" alt="Logo" className="w-6 h-6 object-contain" />
            <span>© 2026 Evo Etec ERP. Todos os direitos reservados.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-zinc-300 transition-colors">Área do Cliente</Link>
            <Link href="/registro" className="hover:text-zinc-300 transition-colors">Cadastrar Trial</Link>
            <a href="#garantia" className="hover:text-zinc-300 transition-colors">Termos & Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
