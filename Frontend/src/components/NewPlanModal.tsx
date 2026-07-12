import { useState } from 'react';

interface NewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewPlanModal({ isOpen, onClose }: NewPlanModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Modal Content */}
      <div className="bg-surface-container w-full max-w-lg rounded-xl border border-outline-variant shadow-2xl overflow-hidden animate-[fadeIn_0.3s_ease-out] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b bg-surface-container-high flex justify-between items-center border-outline-variant shrink-0">
          <h3 className="text-lg font-headline-md text-on-surface">Crear Nuevo Plan</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
          <div className="flex flex-col gap-1">
            <p className="text-body-sm font-body-sm text-on-surface-variant">Define los parámetros para una nueva oferta de membresía.</p>
          </div>
          <form className="space-y-3">
            {/* Name Field */}
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-label-md text-on-surface">Nombre del Plan</label>
              <div className="relative">
                <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md" placeholder="Ej. Plan Premium" type="text" defaultValue="" />
              </div>
            </div>
            {/* Description Field */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Duration Field */}
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-label-md text-on-surface">Duración (Días)</label>
                <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-lg px-3">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">calendar_today</span>
                  <input className="w-full bg-transparent border-none py-3 text-on-surface focus:ring-0 outline-none font-body-md text-body-md" type="number" defaultValue="30" />
                </div>
              </div>
              {/* Price USD Field */}
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-label-md text-on-surface">Precio (USD)</label>
                <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-lg px-3">
                  <span className="text-on-surface-variant mr-1">$</span>
                  <input className="w-full bg-transparent border-none py-3 text-on-surface focus:ring-0 outline-none font-body-md text-body-md" type="text" defaultValue="0.00" />
                </div>
              </div>
              {/* Price Bs Field */}
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-label-md text-on-surface">Precio (€) (Bs)</label>
                <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-lg px-3">
                  <span className="text-on-surface-variant mr-1">€</span>
                  <input className="w-full bg-transparent border-none py-3 text-on-surface focus:ring-0 outline-none font-body-md text-body-md" placeholder="0.00" type="text" defaultValue="0.00" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-label-md text-on-surface">Descripción / Subtítulo</label>
              <textarea className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[100px] font-body-md" placeholder="Describe los beneficios y condiciones de este plan..." rows={4}></textarea>
            </div>
          </form>
        </div>
        {/* Modal Footer */}
        <div className="px-5 py-4 bg-surface-container-high border-t border-outline-variant flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-variant transition-colors border border-outline-variant cursor-pointer">
            Cancelar
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-label-md font-label-md bg-primary text-on-primary font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer">Crear Plan</button>
        </div>
      </div>
    </div>
  );
}