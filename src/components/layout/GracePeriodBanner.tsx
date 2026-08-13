'use client';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GracePeriodBanner({ vencimento }: { vencimento: string }) {
  const [visible, setVisible] = useState(true);
  const vencData = new Date(vencimento);
  const fimCarencia = new Date(vencData.getTime() + 48 * 60 * 60 * 1000);
  const diasRestantes = Math.max(
    0,
    Math.ceil((fimCarencia.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  // envia webhook na visualização
  useEffect(() => {
    fetch('/api/auditoria/carencia', { method: 'POST' }).catch(() => {});
  }, []);

  if (!visible) return null;

  return (
    <div className="w-full bg-yellow-200 text-gray-800 py-3 px-4 flex items-center justify-between border-b border-yellow-400 z-50 relative">
      <div className="flex-1 text-sm font-medium">
        ⚠️ Seu plano venceu em <strong>{vencData.toLocaleDateString('pt-BR')}</strong>.
        Ainda tem <strong>{diasRestantes} dia(s)</strong> de carência para regularizar o pagamento.
      </div>
      <a
        href="/assinatura"
        className="ml-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-[32px] hover:bg-indigo-700 transition-colors shadow-sm"
      >
        Regularizar Agora
      </a>
      <button onClick={() => setVisible(false)} className="ml-2 text-gray-600 hover:text-gray-900 cursor-pointer">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
