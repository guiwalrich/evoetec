'use client';
import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RemoveButton({
  ordemId,
  numeroOS,
  onSuccess,
}: {
  ordemId: string | number;
  numeroOS?: string;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    const identificador = numeroOS ? `#${numeroOS}` : String(ordemId);
    if (!confirm(`Tem certeza que deseja remover a OS ${identificador}?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/ordens-servico/${ordemId}/remover`, {
        method: 'PATCH',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Erro ao remover');
      }

      toast.success('OS removida com sucesso.');
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || 'Falha ao remover OS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-[32px] hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      Remover
    </button>
  );
}
