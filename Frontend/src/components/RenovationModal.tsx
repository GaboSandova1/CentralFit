import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

interface RenovationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRenewed?: () => void;
  member?: {
    id: string;
    fullName: string;
    cedula: string;
    plan?: string | null;
    endDate?: string | null;
  };
}

interface Plan {
  id: string;
  name: string;
  durationDays: number;
  priceUsd: string;
  priceBs: string;
}

interface SearchedMember {
  id: string;
  fullName: string;
  cedula: string;
  plan?: string | null;
  endDate?: string | null;
}

export default function RenovationModal({ isOpen, onClose, onRenewed, member }: RenovationModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [method, setMethod] = useState('');
  const [reference, setReference] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  const [cedulaInput, setCedulaInput] = useState('');
  const [searchedMember, setSearchedMember] = useState<SearchedMember | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeMember = member ?? searchedMember;

  useEffect(() => {
    if (!isOpen) return;
    apiFetch('/plans')
      .then((res) => res.json())
      .then(setPlans)
      .catch(() => setPlans([]));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedPlanId('');
      setMethod('');
      setReference('');
      setStartDate(new Date().toISOString().slice(0, 10));
      setCedulaInput('');
      setSearchedMember(null);
      setSearchError(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const endDatePreview = selectedPlan
    ? new Date(new Date(startDate).getTime() + selectedPlan.durationDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
    : '';

  const handleSearch = async () => {
    if (!cedulaInput.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const response = await apiFetch(`/members/search?q=${encodeURIComponent(cedulaInput)}`);
      const results = await response.json();
      if (!response.ok || !Array.isArray(results) || results.length === 0) {
        setSearchError('No se encontró ningún miembro con esa cédula.');
        setSearchedMember(null);
        return;
      }
      const found = results[0];
      setSearchedMember({ id: found.id, fullName: found.fullName, cedula: found.cedula });
    } catch {
      setSearchError('No se pudo buscar el miembro.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeMember) {
      setError('Busca y selecciona un miembro primero.');
      return;
    }
    if (!selectedPlanId || !method) {
      setError('Selecciona un plan y un método de pago.');
      return;
    }
    if (!selectedPlan) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiFetch(`/members/${activeMember.id}/renew`, {
        method: 'POST',
        body: JSON.stringify({
          planId: selectedPlanId,
          startDate,
          payments: [
            {
              method,
              amountUsd: Number(selectedPlan.priceUsd),
              amountBs: Number(selectedPlan.priceBs),
              reference: reference || undefined,
            },
          ],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'No se pudo procesar la renovación');
      }

      onRenewed?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar la renovación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-surface-dim/80 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div className="bg-surface-container rounded-xl w-full max-w-lg shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-outline-variant flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-gutter py-card-gap border-b border-outline-variant flex justify-between items-center bg-surface-container-low shrink-0">
          <h2 className="font-headline-md text-lg text-on-surface">Renovación de Membresía</h2>
        </div>

        {/* Modal Body (Form) */}
        <div className="px-gutter flex-1 overflow-y-auto space-y-gutter py-card-gap">
          {error && (
            <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">error</span>
              <p className="text-body-sm text-error">{error}</p>
            </div>
          )}

          {!member && (
            <div className="flex flex-col space-y-2">
              <label className="font-label-md text-label-sm text-on-surface uppercase" htmlFor="cedula">Cédula</label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">badge</span>
                  <input
                    className="w-full bg-background border border-outline-variant rounded-DEFAULT py-1.5 pl-10 pr-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md placeholder-on-surface-variant/50"
                    id="cedula"
                    placeholder="Ej: 12345678"
                    type="text"
                    value={cedulaInput}
                    onChange={(e) => setCedulaInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-primary text-on-primary px-4 py-1.5 rounded-DEFAULT hover:bg-primary-container transition-colors flex items-center justify-center cursor-pointer disabled:opacity-60"
                  type="button"
                >
                  <span className={`material-symbols-outlined ${isSearching ? 'animate-spin' : ''}`}>{isSearching ? 'sync' : 'search'}</span>
                </button>
              </div>
              {searchError && <p className="text-error text-[12px]">{searchError}</p>}
            </div>
          )}

          <div className={`flex flex-col space-y-2 ${!activeMember ? 'opacity-50' : ''}`}>
            <label className="font-label-md text-label-sm text-on-surface-variant uppercase" htmlFor="nombre_miembro">Nombre del Miembro</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
              <input
                className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT py-1.5 pl-10 pr-3 text-on-surface-variant focus:outline-none transition-colors font-body-md text-body-md cursor-default"
                readOnly
                type="text"
                value={activeMember ? `${activeMember.fullName} (C.I: ${activeMember.cedula})` : 'Esperando búsqueda...'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="flex flex-col space-y-2">
              <label className="font-label-md text-label-sm text-on-surface uppercase" htmlFor="plan">Seleccionar Plan</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">fitness_center</span>
                <select
                  className="w-full bg-background border border-outline-variant rounded-DEFAULT py-1.5 pl-10 pr-8 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md appearance-none cursor-pointer"
                  id="plan"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                >
                  <option value="">Elige un plan...</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="font-label-md text-label-sm text-on-surface uppercase" htmlFor="metodo">Método de Pago</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">payments</span>
                <select
                  className="w-full bg-background border border-outline-variant rounded-DEFAULT py-1.5 pl-10 pr-8 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md appearance-none cursor-pointer"
                  id="metodo"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="">Selecciona método...</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Pago Móvil">Pago Móvil</option>
                  <option value="Binance">Binance</option>
                  <option value="Zelle">Zelle</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="flex flex-col space-y-2">
              <label className="font-label-md text-label-sm text-on-surface uppercase" htmlFor="fecha_inicio">Fecha de Inicio</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">calendar_today</span>
                <input
                  className="w-full bg-background border border-outline-variant rounded-DEFAULT py-1.5 pl-10 pr-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md"
                  id="fecha_inicio"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2 opacity-70">
              <label className="font-label-md text-label-sm text-on-surface-variant uppercase" htmlFor="fecha_vencimiento">Fecha de Vencimiento</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">event_busy</span>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT py-1.5 pl-10 pr-3 text-on-surface-variant focus:outline-none transition-colors font-body-md text-body-md cursor-default"
                  id="fecha_vencimiento"
                  readOnly
                  type="text"
                  value={endDatePreview || 'Elige un plan primero'}
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-md text-label-sm text-on-surface-variant uppercase">Precio del Plan</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Monto total a pagar</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-headline-md font-headline-md text-primary">
                {selectedPlan ? `$${Number(selectedPlan.priceUsd).toFixed(2)}` : '$0.00'}
              </span>
              <span className="text-label-sm text-on-surface-variant uppercase">USD</span>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-label-md text-label-sm text-on-surface uppercase" htmlFor="referencia">Número de Referencia</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">tag</span>
              <input
                className="w-full bg-background border border-outline-variant rounded-DEFAULT py-1.5 pl-10 pr-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md placeholder-on-surface-variant/50"
                id="referencia"
                placeholder="Obligatorio para Pago Móvil"
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer (Actions) */}
        <div className="px-gutter py-card-gap border-t border-outline-variant bg-surface-container-low flex justify-end items-center space-x-4 shrink-0">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-DEFAULT border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-high hover:border-on-surface-variant transition-colors flex items-center justify-center cursor-pointer disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !activeMember}
            className="px-5 py-1.5 rounded-DEFAULT bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            )}
            <span>{isSubmitting ? 'Procesando...' : 'Renovar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}