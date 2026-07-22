import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

interface NewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function NewPlanModal({ isOpen, onClose, onCreated }: NewPlanModalProps) {
  const [name, setName] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [priceUsd, setPriceUsd] = useState('');
  const [description, setDescription] = useState('');
  const [rate, setRate] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    apiFetch('/exchange-rate')
      .then((res) => res.json())
      .then((data) => setRate(Number(data.usdToBs)))
      .catch(() => setRate(null));
  }, [isOpen]);

  if (!isOpen) return null;

  const bsEstimate = priceUsd && rate ? (Number(priceUsd) * rate).toLocaleString('es-VE', { maximumFractionDigits: 2 }) : null;

  const resetForm = () => {
    setName('');
    setDurationDays('30');
    setPriceUsd('');
    setDescription('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!name.trim() || !durationDays || !priceUsd) {
      setError('Nombre, duración y precio son requeridos');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await apiFetch('/plans', {
        method: 'POST',
        body: JSON.stringify({
          name,
          durationDays: Number(durationDays),
          priceUsd: Number(priceUsd),
          description: description || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'No se pudo crear el plan');
      }

      onCreated();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el plan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Modal Content */}
      <div className="bg-surface-container w-full max-w-lg rounded-xl border border-outline-variant shadow-2xl overflow-hidden animate-[fadeIn_0.3s_ease-out] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b bg-surface-container-high flex justify-between items-center border-outline-variant shrink-0">
          <h3 className="text-lg font-headline-md text-on-surface">Crear Nuevo Plan</h3>
          <button onClick={handleClose} className="text-on-surface-variant hover:text-white transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
          <div className="flex flex-col gap-1">
            <p className="text-body-sm font-body-sm text-on-surface-variant">Define los parámetros para una nueva oferta de membresía. El precio se fija en USD; el equivalente en Bs se calcula solo con la tasa BCV del día.</p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">error</span>
              <p className="text-body-sm text-error">{error}</p>
            </div>
          )}

          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            {/* Name Field */}
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-label-md text-on-surface">Nombre del Plan</label>
              <input
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md"
                placeholder="Ej. Plan Premium"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {/* Duration and Price Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Duration Field */}
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-label-md text-on-surface">Duración (Días)</label>
                <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-lg px-3">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">calendar_today</span>
                  <input
                    className="w-full bg-transparent border-none py-3 text-on-surface focus:ring-0 outline-none font-body-md text-body-md"
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                  />
                </div>
              </div>
              {/* Price USD Field */}
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-label-md text-on-surface">Precio (USD)</label>
                <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-lg px-3">
                  <span className="text-on-surface-variant mr-1">$</span>
                  <input
                    className="w-full bg-transparent border-none py-3 text-on-surface focus:ring-0 outline-none font-body-md text-body-md"
                    placeholder="0.00"
                    type="text"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value)}
                  />
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  {bsEstimate ? `≈ Bs ${bsEstimate}` : 'Escribe un precio para ver el equivalente en Bs'}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-label-md text-on-surface">Descripción / Subtítulo</label>
              <textarea
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[100px] font-body-md"
                placeholder="Describe los beneficios y condiciones de este plan..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </form>
        </div>
        {/* Modal Footer */}
        <div className="px-5 py-4 bg-surface-container-high border-t border-outline-variant flex justify-end gap-3 shrink-0">
          <button onClick={handleClose} disabled={isSaving} className="px-4 py-2 rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-variant transition-colors border border-outline-variant cursor-pointer disabled:opacity-60">
            Cancelar
          </button>
          <button onClick={handleCreate} disabled={isSaving} className="px-4 py-2 rounded-lg text-label-md font-label-md bg-primary text-on-primary font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-60 flex items-center gap-2">
            {isSaving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                Creando...
              </>
            ) : (
              'Crear Plan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}