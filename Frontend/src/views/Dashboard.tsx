import { useEffect, useState } from 'react';
import RenovationModal from '../components/RenovationModal';
import { apiFetch } from '../lib/api';

interface Member {
  id: string;
  fullName: string;
  cedula: string;
  phone: string | null;
  photoUrl: string | null;
  plan: string | null;
  endDate: string | null;
  status: 'sin_plan' | 'activo' | 'por_vencer' | 'en_gracia' | 'vencido';
}

interface Plan {
  id: string;
  name: string;
  durationDays: number;
  priceUsd: string;
  priceBs: string;
}

function daysUntil(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Vencido';
  if (diff === 0) return 'Vence hoy';
  if (diff === 1) return 'Vence en 1 día';
  return `Vence en ${diff} días`;
}

export default function Dashboard() {
  const [renovationModalOpen, setRenovationModalOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    cedula: '',
    phone: '',
    planId: '',
    startDate: new Date().toISOString().slice(0, 10),
    method: 'Efectivo',
    reference: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [membersRes, plansRes] = await Promise.all([
        apiFetch('/members'),
        apiFetch('/plans'),
      ]);
      if (!membersRes.ok || !plansRes.ok) throw new Error();
      setMembers(await membersRes.json());
      setPlans(await plansRes.json());
    } catch {
      setError('No se pudieron cargar los datos del dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'activo').length;
  const dueSoonMembers = members.filter((m) => m.status === 'por_vencer').length;
  // "Vencidos" agrupa vencido + en_gracia: ambos significan que el plan ya pasó su fecha límite
  const overdueMembers = members.filter((m) => m.status === 'vencido' || m.status === 'en_gracia').length;

  const attentionList = members.filter((m) =>
    ['por_vencer', 'vencido', 'en_gracia'].includes(m.status)
  );

  const handleFormChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.cedula.trim()) {
      setError('Nombre y cédula son requeridos');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFormSuccess(null);

    try {
      const response = await apiFetch('/members', {
        method: 'POST',
        body: JSON.stringify({
          fullName: form.fullName,
          cedula: form.cedula,
          phone: form.phone || undefined,
          planId: form.planId || undefined,
          startDate: form.startDate,
          method: form.planId ? form.method : undefined,
          reference: form.reference || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'No se pudo registrar el miembro');
        setIsSubmitting(false);
        return;
      }

      setFormSuccess(`${form.fullName} fue registrado correctamente.`);
      setForm({
        fullName: '',
        cedula: '',
        phone: '',
        planId: '',
        startDate: new Date().toISOString().slice(0, 10),
        method: 'Efectivo',
        reference: '',
      });
      loadData();
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="font-headline-md text-headline-md text-on-surface">Resumen del Tablero</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Bienvenido de nuevo. Esto es lo que está pasando hoy.
        </p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[18px]">error</span>
          <p className="text-body-sm text-error">{error}</p>
        </div>
      )}

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col justify-between hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total de Miembros</h3>
            <span className="material-symbols-outlined text-primary">group</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md text-on-surface">{isLoading ? '—' : totalMembers}</span>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col justify-between hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Activos</h3>
            <span className="material-symbols-outlined text-primary">check_circle</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md text-on-surface">{isLoading ? '—' : activeMembers}</span>
            <span className="text-on-surface-variant text-label-sm font-label-sm">actualmente</span>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl border border-tertiary/50 p-4 flex flex-col justify-between hover:border-tertiary transition-colors shadow-[0_0_10px_rgba(255,184,110,0.05)]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">Por Vencer</h3>
            <span className="material-symbols-outlined text-tertiary">warning</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md text-on-surface">{isLoading ? '—' : dueSoonMembers}</span>
            <span className="text-on-surface-variant text-label-sm font-label-sm leading-tight">En 7 días</span>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl border border-error/50 p-4 flex flex-col justify-between hover:border-error transition-colors shadow-[0_0_10px_rgba(255,180,171,0.05)]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-label-sm text-error uppercase tracking-wider">Vencidos</h3>
            <span className="material-symbols-outlined text-error">error</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md text-on-surface">{isLoading ? '—' : overdueMembers}</span>
            <span className="text-on-surface-variant text-label-sm font-label-sm">Requiere acción</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Registration Form */}
        <div className="lg:col-span-1 bg-surface-container rounded-xl border border-outline-variant p-4 h-fit">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">person_add</span>
            <h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Registro Rápido</h3>
          </div>

          {formSuccess && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
              <p className="text-[12px] text-primary">{formSuccess}</p>
            </div>
          )}

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Nombre Completo</label>
              <input
                type="text"
                placeholder="John Doe"
                className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                value={form.fullName}
                onChange={(e) => handleFormChange('fullName', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Cédula</label>
                <input
                  type="text"
                  placeholder="V-00000000"
                  className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                  value={form.cedula}
                  onChange={(e) => handleFormChange('cedula', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Teléfono</label>
                <input
                  type="text"
                  placeholder="+58 412-000"
                  className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                  value={form.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Tipo de Plan</label>
                <select
                  className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary appearance-none"
                  value={form.planId}
                  onChange={(e) => handleFormChange('planId', e.target.value)}
                >
                  <option value="">Sin plan por ahora</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Fecha de Inicio</label>
                <input
                  type="date"
                  className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary [color-scheme:dark]"
                  value={form.startDate}
                  onChange={(e) => handleFormChange('startDate', e.target.value)}
                />
              </div>
            </div>

            {form.planId && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Método de Pago</label>
                  <select
                    className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary appearance-none"
                    value={form.method}
                    onChange={(e) => handleFormChange('method', e.target.value)}
                  >
                    <option>Efectivo</option>
                    <option>Zelle</option>
                    <option>Pago Móvil</option>
                    <option>Binance</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase"># Referencia</label>
                  <input
                    type="text"
                    placeholder="0000"
                    className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                    value={form.reference}
                    onChange={(e) => handleFormChange('reference', e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 mb-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Fotografía del Afiliado (Opcional)</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  disabled
                  title="La subida de fotos aún no está conectada"
                  className="text-body-sm text-on-surface-variant/50 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-body-sm file:font-semibold file:bg-surface-container-high file:text-on-surface-variant cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-fixed text-on-primary font-label-md text-label-md py-2 rounded-lg transition-colors flex items-center justify-center gap-2 mt-1 cursor-pointer shadow-[0_4px_12px_rgba(81,224,132,0.15)] disabled:opacity-60"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Miembro'}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>
        </div>

        {/* Attention Required Table */}
        <div className="lg:col-span-2 bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">notification_important</span>
              <h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Requiere Atención</h3>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[420px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-40 gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined animate-spin">sync</span>
                Cargando...
              </div>
            ) : attentionList.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-on-surface-variant text-body-sm">
                No hay miembros que requieran atención por ahora.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-surface-container z-10">
                  <tr className="border-b border-outline-variant bg-surface-container/50">
                    <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Miembro</th>
                    <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Plan</th>
                    <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Estado</th>
                    <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {attentionList.map((member) => {
                    const isOverdue = member.status === 'vencido' || member.status === 'en_gracia';
                    return (
                      <tr key={member.id} className="hover:bg-surface-container-high/30 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface-variant font-label-md font-semibold overflow-hidden">
                              {member.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-body-sm text-on-surface font-medium">{member.fullName}</p>
                              <p className="font-label-sm text-on-surface-variant text-[12px]">{member.phone ?? 'Sin teléfono'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-body-sm text-on-surface-variant text-[14px]">{member.plan ?? 'Sin plan'}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-[12px] font-semibold border ${
                            isOverdue ? 'bg-error/10 text-error border-error/20' : 'bg-tertiary/10 text-tertiary border-tertiary/20'
                          }`}>
                            {isOverdue ? 'Vencido' : daysUntil(member.endDate)}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => setRenovationModalOpen(true)}
                            className="flex items-center gap-1 font-label-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer text-[14px]"
                          >
                            <span className="material-symbols-outlined">{isOverdue ? 'autorenew' : 'chat'}</span>
                            {isOverdue ? 'Renovar' : 'Recordar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <RenovationModal isOpen={renovationModalOpen} onClose={() => setRenovationModalOpen(false)} />
    </>
  );
}