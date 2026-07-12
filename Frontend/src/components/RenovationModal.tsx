import { useState } from 'react';

interface RenovationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const prices: Record<string, string> = {
  'diario': '$5.00',
  'semanal': '$25.00',
  'mensual': '$45.00',
  'vip_anual': '$450.00'
};

export default function RenovationModal({ isOpen, onClose }: RenovationModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-surface-dim/80 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div className="bg-surface-container rounded-xl w-full max-w-lg shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-outline-variant flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-gutter py-card-gap border-b border-outline-variant flex justify-between items-center bg-surface-container-low shrink-0">
          <div>
            <h2 className="font-headline-md text-lg text-on-surface">Renovación de Membresía</h2>
            {/* <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Ingresa los datos para procesar el pago del miembro</p> */}
          </div>
        </div>

        {/* Modal Body (Form) */}
        <div className="px-gutter flex-1 overflow-y-auto space-y-gutter py-card-gap">
          <div className="flex flex-col space-y-2">
            <label className="font-label-md text-label-sm text-on-surface uppercase" htmlFor="cedula">Cédula</label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">badge</span>
                <input className="w-full bg-background border border-outline-variant rounded-DEFAULT py-1.5 pl-10 pr-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md placeholder-on-surface-variant/50" id="cedula" placeholder="Ej: 12345678" type="number" />
              </div>
              <button className="bg-primary text-on-primary px-4 py-1.5 rounded-DEFAULT hover:bg-primary-container transition-colors flex items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined">search</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-2 opacity-50">
            <label className="font-label-md text-label-sm text-on-surface-variant uppercase" htmlFor="nombre_miembro">Nombre del Miembro</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
              <input className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT py-1.5 pl-10 pr-3 text-on-surface-variant focus:outline-none transition-colors font-body-md text-body-md cursor-default" id="nombre_miembro" readOnly type="text" value="Esperando búsqueda..." />
            </div>
          </div>

          <div className="flex flex-col space-y-2 opacity-50">
            <label className="font-label-md text-label-sm text-on-surface-variant uppercase" htmlFor="vencimiento_anterior">Fecha de Vencimiento Anterior</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">history</span>
              <input className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT py-1.5 pl-10 pr-3 text-on-surface-variant focus:outline-none transition-colors font-body-md text-body-md cursor-default" id="vencimiento_anterior" readOnly type="text" value="Dec 15, 2023" />
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
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                >
                  <option disabled value="">Elige un plan...</option>
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                  <option value="vip_anual">Anual</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="font-label-md text-label-sm text-on-surface uppercase" htmlFor="metodo">Método de Pago</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">payments</span>
                <select className="w-full bg-background border border-outline-variant rounded-DEFAULT py-1.5 pl-10 pr-8 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md appearance-none cursor-pointer" id="metodo" defaultValue="">
                  <option disabled value="">Selecciona método...</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="pago_movil">Pago Móvil</option>
                  <option value="binance">Binance</option>
                  <option value="zelle">Zelle</option>
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
                <input className="w-full bg-background border border-outline-variant rounded-DEFAULT py-1.5 pl-10 pr-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md" id="fecha_inicio" type="date" />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="font-label-md text-label-sm text-on-surface uppercase" htmlFor="fecha_vencimiento">Fecha de Vencimiento</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">event_busy</span>
                <input className="w-full bg-background border border-outline-variant rounded-DEFAULT py-1.5 pl-10 pr-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md" id="fecha_vencimiento" type="date" />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-md text-label-sm text-on-surface-variant uppercase">Precio del Plan</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Monto total a pagar</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-headline-md font-headline-md text-primary" id="display-precio">{prices[selectedPlan] || '$0.00'}</span>
              <span className="text-label-sm text-on-surface-variant uppercase">USD</span>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-label-md text-label-sm text-on-surface uppercase" htmlFor="referencia">Número de Referencia</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">tag</span>
              <input className="w-full bg-background border border-outline-variant rounded-DEFAULT py-1.5 pl-10 pr-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md placeholder-on-surface-variant/50" id="referencia" placeholder="Obligatorio para Pago Movil" type="text" />
            </div>
          </div>
        </div>

        {/* Modal Footer (Actions) */}
        <div className="px-gutter py-card-gap border-t border-outline-variant bg-surface-container-low flex justify-end items-center space-x-4 shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-DEFAULT border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-high hover:border-on-surface-variant transition-colors flex items-center justify-center cursor-pointer">
            Cancelar
          </button>
          <button 
            onClick={onClose}
            className="px-5 py-1.5 rounded-DEFAULT bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors flex items-center justify-center space-x-2 cursor-pointer">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            <span className="">Renovar</span>
          </button>
        </div>
      </div>
    </div>
  );
}