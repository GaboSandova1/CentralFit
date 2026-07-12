import { useState } from 'react';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
  duration?: number;
  priceUsd?: string;
  priceBs?: string;
  description?: string;
}

export default function EditPlanModal({ 
  isOpen, 
  onClose,
  planName = "Diario",
  duration = 1,
  priceUsd = "5.00",
  priceBs = "10.00",
  description = "Acceso básico diario"
}: EditPlanModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-[8px] p-4">
      {/* Modal Content */}
      <div className="bg-surface-container w-full max-w-lg rounded-xl border border-outline-variant shadow-2xl overflow-hidden animate-[fadeIn_0.3s_ease-out] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b bg-surface-container-high flex justify-between items-center border-outline-variant shrink-0">
          <h3 className="text-lg font-headline-md text-on-surface">Editar Plan</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
          <div className="flex flex-col gap-1">
            <p className="text-body-sm font-body-sm text-on-surface-variant">Modifica los parámetros para el acceso básico diario.</p>
          </div>
          <form className="space-y-3">
            {/* Name Field */}
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-label-md text-on-surface">Seleccionar Plan</label>
              <div className="relative">
                <select 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer font-body-md"
                  defaultValue={planName.toLowerCase()}
                >
                  <option value="diario">Diario</option>
                  <option value="mensual">Mensual Estándar</option>
                  <option value="anual">Anual VIP</option>
                  <option value="trimestral">Trimestral Pro</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
              </div>
            </div>
            {/* Duration and Price Fields */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
              {/* Duration Field */}
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-label-md text-on-surface">Duración (Días)</label>
                <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-lg px-3">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">calendar_today</span>
                  <input className="w-full bg-transparent border-none py-3 text-on-surface focus:ring-0 outline-none font-body-md text-body-md" type="number" defaultValue={duration} />
                </div>
              </div>
              {/* Price Field (USD) */}
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-label-md text-on-surface">Precio (USD)</label>
                <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-lg px-3">
                  <span className="text-on-surface-variant mr-1">$</span>
                  <input className="w-full bg-transparent border-none py-3 text-on-surface focus:ring-0 outline-none font-body-md text-body-md" type="text" defaultValue={priceUsd} />
                </div>
              </div>
              {/* Price Field (Bs) */}
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-label-md text-on-surface">Precio (€) (Bs)</label>
                <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-lg px-3">
                  <span className="text-on-surface-variant mr-1">€</span>
                  <input className="w-full bg-transparent border-none py-3 text-on-surface focus:ring-0 outline-none font-body-md text-body-md" type="text" defaultValue={priceBs} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-label-md text-on-surface">Descripción / Subtítulo</label>
              <textarea className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[100px] font-body-md text-body-md" rows={4} defaultValue={description}></textarea>
            </div>
          </form>
        </div>
        {/* Modal Footer */}
        <div className="px-5 py-4 bg-surface-container-high border-t border-outline-variant flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-variant transition-colors border border-outline-variant cursor-pointer">
            Cancelar
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-label-md font-label-md bg-primary text-on-primary font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}