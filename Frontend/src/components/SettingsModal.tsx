import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

interface ExchangeRate {
  usdToBs: string;
  eurToBs: string | null;
  fetchedAt: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: () => void;
}

// NUEVO: Interfaz para los miembros que vamos a exportar
interface MemberCsv {
  fullName: string;
  cedula: string;
  phone: string | null;
  plan: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
}

// NUEVO: Función para descargar el CSV de miembros
// Función para descargar el CSV de miembros
function downloadMembersCsv(members: MemberCsv[]) {
  const header = ['Nombre', 'Cédula', 'Teléfono', 'Plan', 'Fecha Inicio', 'Fecha Vencimiento', 'Estado'];
  const statusLabels: Record<string, string> = {
    sin_plan: 'Sin Plan',
    activo: 'Activo',
    por_vencer: 'Por Vencer',
    en_gracia: 'En Gracia',
    vencido: 'Vencido',
  };

  const rows = members.map((m) => [
    m.fullName,
    `\t${m.cedula}`, // El \t evita que Excel borre los ceros o ponga la E
    m.phone ? `\t${m.phone}` : 'Sin teléfono',
    m.plan ?? 'Sin plan',
    m.startDate ? new Date(m.startDate).toLocaleDateString('es-VE') : '—',
    m.endDate ? new Date(m.endDate).toLocaleDateString('es-VE') : '—',
    statusLabels[m.status] || m.status,
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\r\n');

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `miembros_centralift_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function SettingsModal({ isOpen, onClose, onSettingsSaved }: SettingsModalProps) {
  const [graceDays, setGraceDays] = useState('3');
  const [rateType, setRateType] = useState<'BCV' | 'Euro'>('BCV');
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false); // NUEVO
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
        setRateType(settings.rateType || 'BCV');
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
        body: JSON.stringify({ graceDays: Number(graceDays), rateType }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'No se pudo guardar la configuración');
      }

      onSettingsSaved?.();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  // NUEVO: Función para exportar miembros
  const handleExportMembers = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const res = await apiFetch('/members');
      if (!res.ok) throw new Error();
      const members = await res.json();
      downloadMembersCsv(members);
    } catch {
      setError('No se pudieron exportar los miembros.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-gutter bg-surface-container-lowest/80 backdrop-blur-sm">
      <div className="bg-surface-container w-full max-w-2xl rounded-xl border border-outline-variant flex flex-col shadow-2xl relative overflow-hidden transform transition-all">
        <div className="px-container-padding py-2 flex justify-between items-center border-b border-outline-variant bg-surface-container">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[28px]">manufacturing</span>
            <h2 className="font-headline-md text-lg text-on-surface">Configuración del Sistema</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            type="button"
            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-variant p-2 rounded-full transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

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

          {/* Tasa del Día */}
          <section className="flex flex-col gap-card-gap">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              <h3 className="font-label-md text-label-sm text-on-surface uppercase tracking-wider">Tasas del Día (Solo Lectura)</h3>
            </div>
            <div className="bg-surface border border-outline-variant rounded-lg p-card-gap flex flex-col gap-unit">
              {isLoading ? (
                <p className="text-body-sm text-on-surface-variant">Cargando tasa...</p>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-3 py-2 bg-surface-container-low rounded border border-outline-variant/50">
                    <span className="font-label-md text-label-md text-on-surface">1 USD (BCV)</span>
                    <span className="font-body-md text-on-surface">{rate ? `Bs ${Number(rate.usdToBs).toFixed(2)}` : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-surface-container-low rounded border border-outline-variant/50">
                    <span className="font-label-md text-label-md text-on-surface">1 EUR (BCV)</span>
                    <span className="font-body-md text-on-surface">{rate?.eurToBs ? `Bs ${Number(rate.eurToBs).toFixed(2)}` : '—'}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <hr className="border-t border-outline-variant" />

          {/* Ajustes Generales */}
          <section className="flex flex-col gap-card-gap">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>settings_suggest</span>
              <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Ajustes Generales</h3>
            </div>
            <div className="bg-surface border border-outline-variant rounded-lg flex flex-col overflow-hidden">
              
              {/* Selector de Tasa */}
              <div className="flex items-center justify-between p-card-gap hover:bg-surface-container transition-colors border-b border-outline-variant">
                <div className="flex flex-col pr-4">
                  <span className="font-label-md text-label-md text-on-surface mb-1">Tasa para cobros en Bs</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Selecciona qué tasa usarás para calcular los pagos en Pago Móvil/Binance.</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRateType('BCV')}
                    className={`px-4 py-2 rounded-lg border font-label-md text-label-md transition-colors cursor-pointer ${rateType === 'BCV' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container border-outline-variant text-on-surface-variant hover:bg-surface-container-high'}`}
                  >
                    BCV
                  </button>
                  <button
                    type="button"
                    onClick={() => setRateType('Euro')}
                    className={`px-4 py-2 rounded-lg border font-label-md text-label-md transition-colors cursor-pointer ${rateType === 'Euro' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container border-outline-variant text-on-surface-variant hover:bg-surface-container-high'}`}
                  >
                    Euro
                  </button>
                </div>
              </div>

              {/* Días de gracia */}
              <div className="flex items-center justify-between p-card-gap hover:bg-surface-container transition-colors">
                <div className="flex flex-col pr-4">
                  <span className="font-label-md text-label-md text-on-surface mb-1">Días de gracia</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Días adicionales permitidos tras el vencimiento.</span>
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

          {/* NUEVO: Sección de Seguridad y Respaldo */}
          <section className="flex flex-col gap-card-gap">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
              <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Seguridad y Respaldo</h3>
            </div>
            <div className="bg-surface border border-outline-variant rounded-lg flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-card-gap hover:bg-surface-container transition-colors">
                <div className="flex flex-col pr-4">
                  <span className="font-label-md text-label-md text-on-surface mb-1">Exportar lista de miembros</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Descarga un archivo Excel/CSV con todos los datos de tus clientes para tener un respaldo seguro.</span>
                </div>
                <button
                  type="button"
                  onClick={handleExportMembers}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 text-primary rounded-lg font-label-md text-label-md hover:bg-primary/30 transition-colors cursor-pointer disabled:opacity-60 shrink-0"
                >
                  {isExporting ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  )}
                  {isExporting ? 'Exportando...' : 'Exportar CSV'}
                </button>
              </div>
            </div>
          </section>

        </div>

        <div className="px-container-padding py-3 border-t border-outline-variant bg-surface-container flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={isSaving} className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-60" type="button">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={isSaving || isLoading} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-fixed transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2" type="button">
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