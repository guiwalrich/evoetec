'use client';
import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

type Assunto = 'Bug/Erro' | 'Dúvida' | 'Sugestão' | 'Outro';

export default function SupportButton() {
  const [open, setOpen] = useState(false);
  const [assunto, setAssunto] = useState<Assunto>('Bug/Erro');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // segundos restantes

  // anti‑spam – habilita cooldown de 5 min (300 s)
  const startCooldown = () => {
    setCooldown(300);
    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) clearInterval(interval);
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (descricao.trim().length < 10) {
      toast.error('A descrição precisa ter ao menos 10 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/suporte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assunto, descricao })
      });

      if (!res.ok) throw new Error('Erro no envio');

      toast.success('Chamado enviado com sucesso! 🎉');
      setOpen(false);
      setDescricao('');
      startCooldown();
    } catch {
      toast.error('Falha ao enviar o chamado. Tente novamente.');
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
        className="fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 bg-white/70 backdrop-blur-2xl rounded-full shadow-lg hover:scale-105 transition-transform hover:shadow-xl disabled:opacity-50 z-40"
        title={cooldown > 0 ? `Aguarde ${cooldown}s` : 'Abrir suporte'}
      >
        {cooldown > 0 ? (
          <span className="text-sm font-medium text-gray-600">{Math.ceil(cooldown/60)}m</span>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">Suporte ao Cliente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Assunto</span>
                <select
                  value={assunto}
                  onChange={e => setAssunto(e.target.value as Assunto)}
                  className="mt-1 block w-full rounded-[32px] border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-zinc-900"
                >
                  <option>Bug/Erro</option>
                  <option>Dúvida</option>
                  <option>Sugestão</option>
                  <option>Outro</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Descrição</span>
                <textarea
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  rows={4}
                  minLength={10}
                  required
                  className="mt-1 block w-full rounded-[32px] border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-zinc-900"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-2 bg-indigo-600 text-white rounded-[32px] hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {loading ? 'Enviando...' : 'Enviar Chamado'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
