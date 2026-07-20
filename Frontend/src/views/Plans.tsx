import { useEffect, useState } from 'react';
import NewPlanModal from '../components/NewPlanModal';
import EditPlanModal from '../components/EditPlanModal';
import ConfirmPlanDeletionModal from '../components/ConfirmPlanDeletionModal';
import { apiFetch } from '../lib/api';

interface Plan {
  id: string;
  name: string;
  durationDays: number;
  priceUsd: string;
  priceBs: string;
  description: string | null;
  activeMemberCount: number;
}

function iconForDuration(days: number): string {
  if (days <= 1) return 'today';
  if (days <= 7) return 'date_range';
  if (days <= 31) return 'star';
  return 'workspace_premium';
}

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newPlanModalOpen, setNewPlanModalOpen] = useState(false);
  const [editPlanModalOpen, setEditPlanModalOpen] = useState(false);
  const [deletePlanModalOpen, setDeletePlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const loadPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch('/plans');
      if (!response.ok) throw new Error();
      setPlans(await response.json());
    } catch {
      setError('No se pudieron cargar los planes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const mostPopular = plans.reduce<Plan | null>((top, plan) => {
    if (!top || plan.activeMemberCount > top.activeMemberCount) return plan;
    return top;
  }, null);

  const handleDeleteConfirm = async () => {
    if (!selectedPlan) return;
    try {
      const response = await apiFetch(`/plans/${selectedPlan.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'No se pudo eliminar el plan');
      }
      setDeletePlanModalOpen(false);
      setSelectedPlan(null);
      loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el plan');
      setDeletePlanModalOpen(false);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Gestión de Planes</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Administra los paquetes de membresía, precios y beneficios de tus clientes.
          </p>
        </div>
        {mostPopular && mostPopular.activeMemberCount > 0 && (
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-surface-container-high border border-outline-variant rounded-lg shadow-sm ml-auto mr-2">
            <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-label-sm text-on-surface-variant leading-none uppercase tracking-wider">Más popular</p>
              <p className="text-label-md font-bold text-on-surface leading-tight">{mostPopular.name}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setNewPlanModalOpen(true)}
          className="bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-lg hover:bg-primary-fixed transition-colors active:scale-95 flex items-center gap-2 shadow-[0_0_15px_rgba(81,224,132,0.2)] cursor-pointer"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Nuevo Plan
        </button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[18px]">error</span>
          <p className="text-body-sm text-error">{error}</p>
        </div>
      )}

      {/* Horizontal List for Plans */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40 gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin">sync</span>
          Cargando planes...
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-surface-container rounded-xl border border-outline-variant p-8 text-center text-on-surface-variant">
          Todavía no tienes planes creados. Dale a "Nuevo Plan" para crear el primero.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-primary/50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all duration-300 group">
              <div className="flex items-center gap-4 w-full md:w-1/3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">{iconForDuration(plan.durationDays)}</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-body-lg font-semibold text-on-surface">{plan.name}</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">{plan.description ?? 'Sin descripción'}</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-0.5 rounded bg-surface-container-low border border-outline-variant text-label-sm font-label-sm text-on-surface-variant">{plan.durationDays} {plan.durationDays === 1 ? 'Día' : 'Días'}</span>
                    <span className="text-label-sm font-label-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">group</span> {plan.activeMemberCount} miembros
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/3 flex flex-col md:items-center">
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-md text-headline-md text-on-surface">${Number(plan.priceUsd).toFixed(0)}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">.{(Number(plan.priceUsd) % 1).toFixed(2).slice(2)}</span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Bs {Number(plan.priceBs).toLocaleString('es-VE')}</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto justify-end md:justify-end">
                <button
                  onClick={() => { setSelectedPlan(plan); setEditPlanModalOpen(true); }}
                  className="px-5 py-2 rounded-lg border border-outline-variant text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high hover:border-on-surface transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => { setSelectedPlan(plan); setDeletePlanModalOpen(true); }}
                  className="w-10 h-10 rounded-lg flex items-center justify-center border border-error/30 text-error hover:bg-error hover:text-on-error hover:border-error transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewPlanModal
        isOpen={newPlanModalOpen}
        onClose={() => setNewPlanModalOpen(false)}
        onCreated={loadPlans}
      />
      <EditPlanModal
        isOpen={editPlanModalOpen}
        onClose={() => setEditPlanModalOpen(false)}
        onSaved={loadPlans}
        plan={selectedPlan ?? undefined}
      />
      <ConfirmPlanDeletionModal
        isOpen={deletePlanModalOpen}
        onClose={() => setDeletePlanModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        planName={selectedPlan?.name}
      />
    </>
  );
}