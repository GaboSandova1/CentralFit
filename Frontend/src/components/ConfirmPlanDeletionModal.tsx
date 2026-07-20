import { useState } from 'react';

interface ConfirmPlanDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  planName?: string;
}

export default function ConfirmPlanDeletionModal({ isOpen, onClose, onConfirm, planName = 'este plan' }: ConfirmPlanDeletionModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
      {/* Modal Container */}
      <div className="bg-surface border border-outline-variant rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        {/* Modal Header */}
        <div className="p-4 pb-3 flex flex-col items-center text-center gap-4 border-b border-outline-variant/30">
          <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center text-error border border-error/20">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>
          <div>
            <h2 className="font-headline-md text-lg text-on-surface mb-2">Confirmar Eliminación</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">¿Seguro que quieres eliminar este plan? Esta acción es irreversible y eliminará permanentemente la configuración del plan.</p>
          </div>
        </div>

        {/* Modal Plan Preview */}
        <div className="p-4 bg-surface-container-low flex items-center justify-center gap-4 border-b border-outline-variant/30 text-center">
          <p className="font-label-md text-label-md text-on-surface">Plan {planName}</p>
        </div>

        {/* Modal Actions */}
        <div className="p-4 pt-4 flex gap-4 justify-end bg-surface">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 rounded border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high hover:text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface cursor-pointer disabled:opacity-60"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 rounded bg-error text-on-error font-label-md text-label-md hover:bg-error/90 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 focus:ring-offset-surface cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            type="button"
          >
            {isDeleting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}