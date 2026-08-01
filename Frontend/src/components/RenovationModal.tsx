import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

interface RenovationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRenewed?: () => void | Promise<void>;
  member?: {
    id: string;
    fullName: string;
    cedula: string;
    plan?: string | null;
    planId?: string | null; // <--- AGREGAR ESTO
    endDate?: string | null;
  };
}

interface Plan {
  id: string;
  name: string;
  durationDays: number;
  priceUsd: string;
  priceUsdBs?: string | null; // NUEVO
}

interface SearchedMember {
  id: string;
  fullName: string;
  cedula: string;
}

interface PaymentEntry {
  id: string;
  method: string;
  amount: string;
  reference: string;
}

function formatDMY(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

const isBsMethod = (method: string) => method !== 'Efectivo' && method !== 'Zelle';

export default function RenovationModal({ isOpen, onClose, onRenewed, member }: RenovationModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  
  // Ahora guardaremos la tasa activa (ya sea BCV o Euro) y el tipo
  const [activeRate, setActiveRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(true);

  const [cedulaInput, setCedulaInput] = useState('');
  const [searchedMember, setSearchedMember] = useState<SearchedMember | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [payments, setPayments] = useState<PaymentEntry[]>([
    { id: generateId(), method: 'Efectivo', amount: '', reference: '' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeMember = member ?? searchedMember;

  useEffect(() => {
    if (!isOpen) return;
    
    // Cargar planes, tasa y configuración al mismo tiempo
    Promise.all([
      apiFetch('/plans').then(res => res.json()),
      apiFetch('/exchange-rate').then(res => res.json()),
      apiFetch('/settings').then(res => res.json()).catch(() => ({ rateType: 'BCV' }))
    ]).then(([plansData, rateData, settings]) => {
      setPlans(plansData);
      const isEuro = settings.rateType === 'Euro' && rateData.eurToBs;
      setActiveRate(isEuro ? Number(rateData.eurToBs) : Number(rateData.usdToBs));
      setRateLoading(false);
    }).catch(() => {
      setActiveRate(null);
      setRateLoading(false);
    });

  }, [isOpen]);

    useEffect(() => {
    if (!isOpen) {
      setSelectedPlanId('');
      setStartDate(new Date().toISOString().slice(0, 10));
      setCedulaInput('');
      setSearchedMember(null);
      setSearchError(null);
      setError(null);
      setPayments([{ id: generateId(), method: 'Efectivo', amount: '', reference: '' }]);
    } else {
      // NUEVO: Si el miembro ya tiene un plan, lo preseleccionamos
      if (member?.planId) {
        setSelectedPlanId(member.planId);
      }
    }
  }, [isOpen, member]);

  if (!isOpen) return null;

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  
  // Determinar si en los pagos actuales hay alguno en Bs
  const hasBsPayment = payments.some(p => isBsMethod(p.method));
  
  // Precio objetivo en USD: si hay pago en Bs y el plan tiene priceUsdBs, lo usamos. Si no, priceUsd normal.
  const targetPlanPriceUsd = selectedPlan 
    ? (hasBsPayment && selectedPlan.priceUsdBs ? Number(selectedPlan.priceUsdBs) : Number(selectedPlan.priceUsd))
    : 0;
    
  const planPriceBs = activeRate ? targetPlanPriceUsd * activeRate : 0;
  
  const endDatePreview = selectedPlan
    ? formatDMY(new Date(new Date(startDate).getTime() + selectedPlan.durationDays * 24 * 60 * 60 * 1000))
    : '';

  // Cálculos para pagos divididos
  const totalPaidUsd = payments.reduce((sum, p) => sum + (!isBsMethod(p.method) ? (Number(p.amount) || 0) : 0), 0);
  const totalPaidBs = payments.reduce((sum, p) => sum + (isBsMethod(p.method) ? (Number(p.amount) || 0) : 0), 0);
  const totalPaidUsdEquivalent = totalPaidUsd + (activeRate ? totalPaidBs / activeRate : 0);

  const remainingUsd = targetPlanPriceUsd - totalPaidUsdEquivalent;
  const remainingBs = activeRate ? remainingUsd * activeRate : 0;

  const remainingUsdRounded = Math.round(remainingUsd * 100) / 100;
  const remainingBsRounded = Math.round(remainingBs * 100) / 100;

  const allBs = payments.length > 0 && payments.every(p => isBsMethod(p.method));
  const allUsd = payments.length > 0 && payments.every(p => !isBsMethod(p.method));
  const isMixed = !allBs && !allUsd;

  // Validación EXTREMA: 0.01 de la moneda que corresponda
  let isExactMatch = false;
  if (allUsd) {
    isExactMatch = Math.abs(remainingUsdRounded) === 0;
  } else {
    isExactMatch = Math.abs(remainingBsRounded) === 0;
  }

  const hasValidReferences = payments.every(p => p.method === 'Efectivo' || p.reference.trim() !== '');

  // Función para mostrar el texto del monto faltante/excedido
  const displayRemaining = () => {
    if (isExactMatch) return allUsd ? '$0.00 USD' : 'Bs. 0.00';
    
    if (allUsd) return `$${Math.abs(remainingUsdRounded).toFixed(2)} USD`;
    if (allBs) return `Bs. ${Math.abs(remainingBsRounded).toFixed(2)}`;
    
    if (Math.abs(remainingUsd) < 0.01) return `Bs. ${Math.abs(remainingBsRounded).toFixed(2)}`;
    
    return `$${Math.abs(remainingUsdRounded).toFixed(2)} USD`;
  };

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
      const exactMatch = results.find((m: SearchedMember) => m.cedula === cedulaInput);
      if (!exactMatch) {
        setSearchError('No se encontró ningún miembro con esa cédula exacta.');
        setSearchedMember(null);
        return;
      }
      setSearchedMember({ id: exactMatch.id, fullName: exactMatch.fullName, cedula: exactMatch.cedula });
    } catch {
      setSearchError('No se pudo buscar el miembro.');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePaymentChange = (id: string, field: keyof PaymentEntry, value: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addPaymentMethod = () => {
    setPayments((prev) => [
      ...prev,
      { id: generateId(), method: 'Pago Móvil', amount: '', reference: '' }
    ]);
  };

  const removePaymentMethod = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async () => {
    if (!activeMember) {
      setError('Busca y selecciona un miembro primero.');
      return;
    }
    if (!selectedPlanId) {
      setError('Selecciona un plan.');
      return;
    }
    if (!isExactMatch) {
      setError('El total de los pagos no coincide exactamente con el precio del plan.');
      return;
    }
    if (!hasValidReferences) {
      setError('Los métodos en Bs o Zelle requieren una referencia.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payloadPayments = payments.map((p) => ({
        method: p.method,
        amount: Number(p.amount) || 0,
        reference: p.reference || undefined,
      }));

      const response = await apiFetch(`/members/${activeMember.id}/renew`, {
        method: 'POST',
        body: JSON.stringify({
          planId: selectedPlanId,
          startDate,
          payments: payloadPayments,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'No se pudo procesar la renovación');
      }

      await onRenewed?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar la renovación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-surface-dim/80 backdrop-blur-sm p-4">
      <div className="bg-surface-container rounded-xl w-full max-w-2xl shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-outline-variant flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-gutter py-card-gap border-b border-outline-variant flex justify-between items-center bg-surface-container-low shrink-0">
          <h2 className="font-headline-md text-lg text-on-surface">Renovación de Membresía</h2>
        </div>

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
                    onChange={(e) => setCedulaInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
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
            {/* NUEVO: Indicador visual de estado del plan */}
            {activeMember && (
              <div className="flex items-center gap-2 mt-1">
                {member?.endDate && new Date(member.endDate) > new Date() ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Plan Activo
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-error bg-error/10 px-2 py-0.5 rounded-full border border-error/20">
                    <span className="material-symbols-outlined text-[14px]">cancel</span>
                    Sin Plan Activo
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
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

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-label-md text-label-sm text-on-surface uppercase">Métodos de Pago</label>
              <button 
                onClick={addPaymentMethod} 
                type="button"
                className="text-primary hover:text-primary-container transition-colors flex items-center gap-1 text-label-sm font-label-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Agregar pago
              </button>
            </div>

            {payments.map((pay, index) => {
              const isBs = isBsMethod(pay.method);
              return (
                <div key={pay.id} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-label-sm text-on-surface-variant font-label-md">Pago {index + 1}</span>
                    {payments.length > 1 && (
                      <button 
                        onClick={() => removePaymentMethod(pay.id)} 
                        className="ml-auto text-error/80 hover:text-error transition-colors cursor-pointer"
                        title="Quitar método"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex flex-col space-y-1">
                      <select
                        className="w-full bg-background border border-outline-variant rounded-DEFAULT py-1.5 px-3 text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md text-body-md cursor-pointer"
                        value={pay.method}
                        onChange={(e) => handlePaymentChange(pay.id, 'method', e.target.value)}
                      >
                        <option value="Efectivo">Efectivo (USD)</option>
                        <option value="Zelle">Zelle (USD)</option>
                        <option value="Pago Móvil">Pago Móvil (Bs)</option>
                        <option value="Binance">Binance (Bs)</option>
                      </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-label-sm font-label-md pointer-events-none">
                          {isBs ? 'Bs' : '$'}
                        </span>
                        <input
                          className="w-full bg-background border border-outline-variant rounded-DEFAULT py-1.5 pl-10 pr-3 text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md text-body-md"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={pay.amount}
                          onChange={(e) => handlePaymentChange(pay.id, 'amount', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">tag</span>
                    <input
                      className="w-full bg-background border border-outline-variant rounded-DEFAULT py-1.5 pl-10 pr-3 text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md text-body-sm placeholder-on-surface-variant/50 disabled:opacity-50"
                      placeholder={pay.method === 'Efectivo' ? 'No aplica para efectivo' : 'Número de referencia (Obligatorio)'}
                      type="text"
                      disabled={pay.method === 'Efectivo'}
                      value={pay.method === 'Efectivo' ? '' : pay.reference}
                      onChange={(e) => handlePaymentChange(pay.id, 'reference', e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen de totales dinámico (Dual) */}
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-label-md text-label-sm text-on-surface-variant uppercase">Precio del Plan</span>
              <div className="text-right">
                <span className="font-body-md text-body-md text-on-surface block">
                  {hasBsPayment && selectedPlan?.priceUsdBs 
                    ? `$${targetPlanPriceUsd.toFixed(2)} USD (P. Bs)` 
                    : `$${targetPlanPriceUsd.toFixed(2)} USD`}
                </span>
                {isMixed && activeRate && <span className="font-body-sm text-body-sm text-on-surface-variant block">Bs. {planPriceBs.toFixed(2)}</span>}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-label-md text-label-sm text-on-surface-variant uppercase">Total Abonado</span>
              <div className="text-right">
                {totalPaidUsd > 0 && <span className="font-body-md text-body-md text-on-surface block">${totalPaidUsd.toFixed(2)} USD</span>}
                {totalPaidBs > 0 && <span className="font-body-md text-body-md text-on-surface block">Bs. {totalPaidBs.toFixed(2)}</span>}
                {totalPaidUsd === 0 && totalPaidBs === 0 && <span className="font-body-md text-body-md text-on-surface-variant block">$0.00 / Bs. 0.00</span>}
              </div>
            </div>
            
            <div className="border-t border-outline-variant my-1"></div>
            
            <div className="flex justify-between items-center">
              <span className={`font-label-md text-label-sm uppercase font-bold ${isExactMatch ? 'text-primary' : remainingUsd > 0 ? 'text-tertiary' : 'text-error'}`}>
                {isExactMatch ? 'Cuadre Exacto' : remainingUsd > 0 ? 'Falta Pagar' : 'Excedido'}
              </span>
              <div className="text-right">
                <span className={`font-headline-md text-headline-md font-bold block ${isExactMatch ? 'text-primary' : remainingUsd > 0 ? 'text-tertiary' : 'text-error'}`}>
                  {displayRemaining()}
                </span>
                {isMixed && activeRate && !isExactMatch && (
                  <span className={`font-body-sm text-body-sm block ${remainingUsd > 0 ? 'text-tertiary' : 'text-error'}`}>
                    {remainingUsd > 0 ? 'Equivale a' : 'Excedente de'} {Math.abs(remainingUsd) < 0.01 ? `$${Math.abs(remainingUsdRounded).toFixed(2)} USD` : `Bs. ${Math.abs(remainingBsRounded).toFixed(2)}`}
                  </span>
                )}
              </div>
            </div>
            {!activeRate && !rateLoading && (
              <p className="text-error text-[12px] mt-1">No se pudo cargar la tasa. Los pagos en Bs no se calcularán bien.</p>
            )}
          </div>
        </div>

        <div className="px-gutter py-card-gap border-t border-outline-variant bg-surface-container-low flex justify-end items-center space-x-4 shrink-0">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-DEFAULT border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-high hover:border-on-surface-variant transition-colors flex items-center justify-center cursor-pointer disabled:opacity-60"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !activeMember || !isExactMatch || !hasValidReferences}
            type="button"
            className="px-5 py-1.5 rounded-DEFAULT bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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