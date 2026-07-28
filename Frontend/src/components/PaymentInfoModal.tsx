interface PaymentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentInfoModal({ isOpen, onClose }: PaymentInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-outline-variant/50 w-full max-w-md flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.6)] animate-[fadeIn_0.2s_ease-out]">
        
        <div className="flex justify-between items-center px-6 py-5 border-b border-outline-variant/50 bg-surface-container-low shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[22px]">credit_card</span>
            </div>
            <div>
              <h2 className="font-headline-md text-xl text-on-surface font-semibold leading-tight">Pagar Suscripción</h2>
              <p className="font-body-sm text-[13px] text-on-surface-variant mt-0.5">Datos para tu mensualidad de CentralFit</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 bg-surface-container-lowest">
          <div className="flex flex-col items-center gap-3">
            <div className="w-48 h-48 bg-white rounded-xl p-2 shadow-md">
              {/* Reemplaza este link con la imagen de tu QR real */}
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://wa.me/584243811068" alt="QR Pago Móvil" className="w-full h-full object-contain" />
            </div>
            <p className="text-on-surface-variant text-sm">Escanea el QR para contactarnos y enviar tu comprobante</p>
          </div>

          <div className="bg-surface rounded-lg p-4 border border-outline-variant/50 space-y-3">
            <h3 className="font-label-md text-on-surface uppercase tracking-wider text-sm mb-2">Datos de Transferencia</h3>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant text-sm">Banco:</span>
              <span className="text-on-surface font-medium text-sm">Venezuela</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant text-sm">Cédula:</span>
              <span className="text-on-surface font-medium text-sm">V-30866625</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant text-sm">Cuenta:</span>
              <span className="text-on-surface font-medium text-sm">0134-XXXX-XX-XXXX-XXXX</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant text-sm">Pago Móvil:</span>
              <span className="text-on-surface font-medium text-sm">0424-3811068</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant/50 bg-surface-container-low flex justify-end shrink-0 rounded-b-2xl">
          <button onClick={onClose} className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-[14px] hover:bg-primary-fixed transition-all cursor-pointer flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check</span>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}