import { useState } from 'react';

interface ConfirmPlanDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
}

export default function ConfirmPlanDeletionModal({ isOpen, onClose, planName = 'Diario' }: ConfirmPlanDeletionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
      {/* Modal Container */}
      <div className="bg-surface border border-outline-variant rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        {/* Modal Header */}
        <div className="p-6 pb-4 flex flex-col items-center text-center gap-4 border-b border-outline-variant/30">
          <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center text-error border border-error/20">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Confirmar Eliminación</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">¿Seguro que quieres eliminar este plan? Esta acción es irreversible y eliminará permanentemente la configuración del plan.</p>
          </div>
        </div>

        {/* Modal Plan Preview (Optional Context) */}
        <div className="p-4 bg-surface-container-low flex items-center justify-center gap-4 border-b border-outline-variant/30 text-center">
          <div>
            <p className="font-label-md text-label-md text-on-surface">Plan {planName}</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 pt-4 flex gap-4 justify-end bg-surface">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-2.5 rounded border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high hover:text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface cursor-pointer" 
            type="button"
          >
            Cancelar
          </button>
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-2.5 rounded bg-error text-on-error font-label-md text-label-md hover:bg-error/90 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 focus:ring-offset-surface cursor-pointer" 
            type="button"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}