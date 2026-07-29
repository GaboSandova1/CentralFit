interface PaymentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentInfoModal({ isOpen, onClose }: PaymentInfoModalProps) {
  if (!isOpen) return null;

  // Generadores de QR dinámicos (apuntan a WhatsApp)
  const qrGabo = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://wa.me/584243811068`;
  const qrDustin = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://wa.me/584144754094`;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-outline-variant/50 w-full max-w-3xl flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.6)] animate-[fadeIn_0.2s_ease-out] max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-3 border-b border-outline-variant/50 bg-surface-container-low shrink-0 rounded-t-2xl">
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

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 bg-surface-container-lowest overflow-y-auto">
          <div className="bg-primary/5 border border-primary/20 text-primary text-sm rounded-lg p-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">info</span>
            <p>Realiza el pago a cualquiera de las dos cuentas y envía el comprobante escaneando el QR de la cuenta que elegiste.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Tarjeta Socio 1: Gabo */}
            <div className="bg-surface rounded-xl p-4 border border-outline-variant/50 flex flex-col items-center gap-3">
              <div className="w-full flex items-center gap-2 border-b border-outline-variant/50 pb-2 mb-1">
                <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                <h3 className="font-label-md text-on-surface uppercase tracking-wider text-sm">Gabriel Sandoval</h3>
              </div>
              
              <div className="bg-white rounded-lg p-2 shadow-md">
                <img src={qrGabo} alt="QR Gabriel" className="w-32 h-32 object-contain" />
              </div>
              <p className="text-on-surface-variant text-[11px] -mt-2 mb-1">Escanea para enviar el comprobante</p>

              <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-on-surface-variant">Banco:</span> <span className="text-on-surface font-medium">Venezuela (0102)</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Cédula:</span> <span className="text-on-surface font-medium">V-30866625</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Cuenta:</span> <span className="text-on-surface font-medium">0102-0358-9600-0122-9181</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Pago Móvil:</span> <span className="text-on-surface font-medium">0424-3811068</span></div>
              </div>
            </div>

            {/* Tarjeta Socio 2: Dustin */}
            <div className="bg-surface rounded-xl p-4 border border-outline-variant/50 flex flex-col items-center gap-3">
              <div className="w-full flex items-center gap-2 border-b border-outline-variant/50 pb-2 mb-1">
                <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                <h3 className="font-label-md text-on-surface uppercase tracking-wider text-sm">Dustin López</h3>
              </div>
              
              <div className="bg-white rounded-lg p-2 shadow-md">
                <img src={qrDustin} alt="QR Dustin" className="w-32 h-32 object-contain" />
              </div>
              <p className="text-on-surface-variant text-[11px] -mt-2 mb-1">Escanea para enviar el comprobante</p>

              <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-on-surface-variant">Banco:</span> <span className="text-on-surface font-medium">Banesco (0134)</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Cédula:</span> <span className="text-on-surface font-medium">V-31284120</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Cuenta:</span> <span className="text-on-surface font-medium">0134-0325-2532-5106-7313</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Pago Móvil:</span> <span className="text-on-surface font-medium">0414-4754094</span></div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
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