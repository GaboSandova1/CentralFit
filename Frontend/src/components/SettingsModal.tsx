import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExchangeRate {
  usdToBs: string;
  eurToBs: string | null;
  fetchedAt: string;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [graceDays, setGraceDays] = useState('3');
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadSettings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [settingsRes, rateRes] = await Promise.all([
          apiFetch('/settings'),
          apiFetch('/exchange-rate'),
        ]);
        if (!settingsRes.ok || !rateRes.ok) throw new Error();

        const settings = await settingsRes.json();
        setGraceDays(String(settings.graceDays));
        setRate(await rateRes.json());
      } catch {
        setError('No se pudo cargar la configuración.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiFetch('/settings', {
        method: 'PATCH',
        body: JSON.stringify({ graceDays: Number(graceDays) }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'No se pudo guardar la configuración');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-gutter bg-surface-container-lowest/80 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="bg-surface-container w-full max-w-2xl rounded-xl border border-outline-variant flex flex-col shadow-2xl relative overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="px-container-padding py-2 flex justify-between items-center border-b border-outline-variant bg-surface-container">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[28px]">manufacturing</span>
            <h2 className="font-headline-md text-lg text-on-surface">Configuración del Sistema</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-variant p-2 rounded-full transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-container-padding flex flex-col gap-container-padding overflow-y-auto max-h-[80vh] bg-surface-container-low">
          {error && (
            <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">error</span>
              <p className="text-body-sm text-error">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
              <p className="text-body-sm text-primary">Configuración guardada correctamente.</p>
            </div>
          )}

          {/* Section: Currency Exchange Rates (solo lectura, se actualiza sola desde el BCV) */}
          <section className="flex flex-col gap-card-gap">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              <h3 className="font-label-md text-label-sm text-on-surface uppercase tracking-wider">Tasa del Día (BCV)</h3>
            </div>
            <div className="bg-surface border border-outline-variant rounded-lg p-card-gap flex flex-col gap-unit">
              {isLoading ? (
                <p className="text-body-sm text-on-surface-variant">Cargando tasa...</p>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-3 py-2 bg-surface-container-low rounded border border-outline-variant/50">
                    <span className="font-label-md text-label-md text-on-surface">1 USD</span>
                    <span className="font-body-md text-on-surface">{rate ? `Bs ${rate.usdToBs}` : '—'}</span>
                  </div>
                  {rate?.eurToBs && (
                    <div className="flex items-center justify-between px-3 py-2 bg-surface-container-low rounded border border-outline-variant/50">
                      <span className="font-label-md text-label-md text-on-surface">1 EUR</span>
                      <span className="font-body-md text-on-surface">Bs {rate.eurToBs}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded border border-outline-variant/50">
                    <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Esta tasa se actualiza automáticamente desde el Banco Central de Venezuela y no se puede editar manualmente.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <hr className="border-t border-outline-variant" />

          {/* Section: General Settings */}
          <section className="flex flex-col gap-card-gap">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>settings_suggest</span>
              <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Ajustes Generales</h3>
            </div>
            <div className="bg-surface border border-outline-variant rounded-lg flex flex-col overflow-hidden">
              {/* Input: Días de gracia */}
              <div className="flex items-center justify-between p-card-gap hover:bg-surface-container transition-colors">
                <div className="flex flex-col pr-4">
                  <span className="font-label-md text-label-md text-on-surface mb-1">Días de gracia</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Días adicionales permitidos para acceso de control de entrada tras la fecha de vencimiento.</span>
                </div>
                <div className="w-24">
                  <input
                    className="block w-full px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-on-surface font-body-md text-center focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                    id="grace-days"
                    max="30"
                    min="0"
                    type="number"
                    value={graceDays}
                    onChange={(e) => setGraceDays(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-t border-outline-variant" />

          {/* Section: Security & Audit */}
          <section className="flex flex-col gap-card-gap">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
              <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Seguridad y Respaldo</h3>
            </div>
            <div className="bg-surface border border-outline-variant rounded-lg flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-card-gap opacity-50 cursor-not-allowed">
                <div className="flex flex-col pr-4">
                  <span className="font-label-md text-label-md text-on-surface mb-1 flex items-center gap-2">
                    Exportación automática de respaldos
                    <span className="text-[10px] bg-surface-container-high border border-outline-variant rounded px-1.5 py-0.5 uppercase tracking-wider">Próximamente</span>
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Generar un archivo CSV diario con el estado contable y lista de miembros activos.</span>
                </div>
                <div className="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent bg-surface-variant">
                  <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow ring-0"></span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-container-padding py-3 border-t border-outline-variant bg-surface-container flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={isSaving} className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-60">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={isSaving || isLoading} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-fixed transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2">
            {isSaving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}