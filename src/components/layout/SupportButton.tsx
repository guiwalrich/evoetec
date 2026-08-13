'use client';
import { useRef, useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

type Assunto = 'Bug/Erro' | 'Dúvida' | 'Sugestão' | 'Outro';

export default function SupportButton() {
  const [open, setOpen] = useState(false);
  const [assunto, setAssunto] = useState<Assunto>('Bug/Erro');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const assuntoRef = useRef<HTMLSelectElement>(null);

  // ----- cooldown (anti‑spam) -----
  const startCooldown = () => {
    setCooldown(300);
    const int = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) clearInterval(int);
        return prev - 1;
      });
    }, 1000);
  };

  // foco automático ao abrir
  useEffect(() => {
    if (open) assuntoRef.current?.focus();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (descricao.trim().length < 10) {
      toast.error('Descreva ao menos 10 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/suporte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assunto, descricao })
      });

      if (!res.ok) throw new Error('Falha no envio');

      toast.success('Chamado enviado com sucesso! 🎉');
      setOpen(false);
      setDescricao('');
      startCooldown();
    } catch {
      toast.error('Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(true)}
        disabled={cooldown > 0}
        className="fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 bg-white/70 backdrop-blur-2xl rounded-full shadow-lg hover:scale-105 transition-transform disabled:opacity-50 z-40 border border-zinc-200 cursor-pointer"
        title={cooldown > 0 ? `Aguarde ${cooldown}s` : 'Abrir suporte'}
      >
        {cooldown > 0 ? (
          <span className="text-sm font-medium text-gray-600">{Math.ceil(cooldown / 60)}m</span>
        ) : (
          <svg
            className="w-6 h-6 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zM12 14v4m0 0h-3m3 0h3"
            />
          </svg>
        )}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="relative bg-white/90 backdrop-blur-2xl rounded-[32px] p-6 w-full max-w-md sm:max-w-lg shadow-xl border border-gray-200 space-y-4">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 cursor-pointer p-1"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-zinc-900">Suporte ao Cliente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Assunto */}
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Assunto</span>
                <select
                  ref={assuntoRef}
                  value={assunto}
                  onChange={e => setAssunto(e.target.value as Assunto)}
                  className="block w-full rounded-[32px] border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 text-zinc-900 text-sm bg-white"
                >
                  <option>Bug/Erro</option>
                  <option>Dúvida</option>
                  <option>Sugestão</option>
                  <option>Outro</option>
                </select>
              </label>

              {/* Descrição */}
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </span>
                <textarea
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Descreva o problema ou dúvida (mín. 10 caracteres)"
                  className="block w-full rounded-[32px] border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-3 text-zinc-900 text-sm resize-none"
                />
                <div className="text-xs text-gray-500 text-right mt-1">
                  {descricao.length}/500
                </div>
              </label>

              {/* Botão enviar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-[32px] hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? 'Enviando...' : 'Enviar Chamado'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
