import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [backupExport, setBackupExport] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-gutter bg-surface-container-lowest/80 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="bg-surface-container w-full max-w-2xl rounded-xl border border-outline-variant flex flex-col shadow-2xl relative overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="px-container-padding py-2 flex justify-between items-center border-b border-outline-variant bg-surface-container">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[28px]">manufacturing</span>
            <h2 className="font-headline-md text-lg text-on-surface">Configuración del Sistema</h2>
          </div>
          <button 
            onClick={onClose}
            aria-label="Cerrar modal" 
            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-variant p-2 rounded-full transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-container-padding flex flex-col gap-container-padding overflow-y-auto max-h-[80vh] bg-surface-container-low">
          {/* Section: Currency Exchange Rates */}
          <section className="flex flex-col gap-card-gap">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              <h3 className="font-label-md text-label-sm text-on-surface uppercase tracking-wider">Tasa del Día (BCV)</h3>
            </div>
            <div className="bg-surface border border-outline-variant rounded-lg p-card-gap flex flex-col gap-unit">
              {/* <div className="flex items-start gap-3 mb-2">
                <span className="material-symbols-outlined text-on-surface-variant mt-0.5">info</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Los valores ingresados aquí actualizarán automáticamente todos los precios, pagos y reportes globalmente en la plataforma.</p>
              </div> */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface" htmlFor="primary-rate">Tasa de Referencia Principal</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-on-surface-variant group-focus-within:text-primary transition-colors font-label-md text-label-md">Bs</span>
                      </div>
                      <input className="block w-full pl-10 pr-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-on-surface font-body-md focus:ring-1 focus:ring-primary focus:border-primary transition-colors" id="primary-rate" placeholder="0.00" type="text" defaultValue="36.50" />
                    </div>
                    <div className="relative">
                      <select className="appearance-none h-full px-3 pr-10 bg-surface-container border border-outline-variant rounded-lg text-on-surface font-label-md focus:ring-1 focus:ring-primary focus:border-primary transition-colors cursor-pointer">
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded border border-outline-variant/50">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Esta moneda se utilizará como base para todos los cálculos del sistema.</span>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-t border-outline-variant" />

          {/* Section: General Settings */}
          <section className="flex flex-col gap-card-gap">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>settings_suggest</span>
              <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Ajustes Generales</h3>
            </div>
            <div className="bg-surface border border-outline-variant rounded-lg flex flex-col overflow-hidden">
              {/* Input: Días de gracia */}
              <div className="flex items-center justify-between p-card-gap hover:bg-surface-container transition-colors">
                <div className="flex flex-col pr-4">
                  <span className="font-label-md text-label-md text-on-surface mb-1">Días de gracia</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Días adicionales permitidos para acceso de control de entrada tras la fecha de vencimiento.</span>
                </div>
                <div className="w-24">
                  <input className="block w-full px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-on-surface font-body-md text-center focus:ring-1 focus:ring-primary focus:border-primary transition-colors" id="grace-days" max="30" min="0" type="number" defaultValue="3" placeholder="3" />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-t border-outline-variant" />

          {/* Section: Security & Audit */}
          <section className="flex flex-col gap-card-gap">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
              <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Seguridad y Respaldo</h3>
            </div>
            <div className="bg-surface border border-outline-variant rounded-lg flex flex-col overflow-hidden">
              {/* Toggle: Exportación automática */}
              <div 
                className="flex items-center justify-between p-card-gap hover:bg-surface-container transition-colors group cursor-pointer" 
                onClick={() => setBackupExport(!backupExport)}
              >
                <div className="flex flex-col pr-4">
                  <span className="font-label-md text-label-md text-on-surface mb-1">Exportación automática de respaldos</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Generar un archivo CSV diario con el estado contable y lista de miembros activos.</span>
                </div>
                <div className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${backupExport ? 'bg-primary' : 'bg-surface-variant'}`} id="toggle-backup">
                  <span className="sr-only">Toggle Respaldos</span>
                  <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow ring-0 transition duration-200 ease-in-out ${backupExport ? 'translate-x-5' : 'translate-x-0'}`} id="toggle-backup-knob"></span>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-t border-outline-variant" />

          {/* Section: Appearance */}
          <section className="flex flex-col gap-card-gap">
          </section>
        </div>
        {/* Modal Footer Actions */}
      </div>
    </div>
  );
}