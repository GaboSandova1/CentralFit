import { useState } from 'react';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionHistoryModal({ isOpen, onClose }: TransactionHistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-gutter">
      {/* Modal Container */}
      <div className="bg-surface-container w-full max-w-6xl rounded-xl border border-surface-variant shadow-[0px_4px_12px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] z-50">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-surface-variant shrink-0">
          <div>
            <h2 className="font-headline-md text-lg text-on-surface">Historial Completo de Transacciones</h2>
            {/* <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Revisa el detalle de todos los pagos registrados en el sistema.</p> */}
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 rounded-lg transition-colors cursor-pointer" aria-label="Cerrar modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-2 border-b border-surface-variant bg-surface-container-low shrink-0 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 flex-1">
            {/* Date Range Dropdown */}
            <div className="relative">
              <select className="appearance-none bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm rounded-lg py-1.5 pl-4 pr-10 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container cursor-pointer">
                <option>Hoy</option>
                <option>Esta semana</option>
                <option>Este mes</option>
                <option>Personalizado...</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]" data-icon="expand_more">expand_more</span>
              </div>
            </div>

            {/* Payment Method Dropdown */}
            <div className="relative">
              <select className="appearance-none bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm rounded-lg py-1.5 pl-4 pr-10 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container cursor-pointer">
                <option>Todos los métodos</option>
                <option>Zelle</option>
                <option>Pago Móvil</option>
                <option>Efectivo (USD)</option>
                <option>Binance (USDT)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]" data-icon="expand_more">expand_more</span>
              </div>
            </div>

            {/* Subscription Plan Dropdown */}
            <div className="relative">
              <select className="appearance-none bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm rounded-lg py-1.5 pl-4 pr-10 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container cursor-pointer">
                <option>Todos los planes</option>
                <option>Diario</option>
                <option>Semanal</option>
                <option>Mensual</option>
                <option>Anual</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]" data-icon="expand_more">expand_more</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]" data-icon="search">search</span>
            </div>
            <input type="text" placeholder="Buscar por nombre o C.I..." className="bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm rounded-lg py-1.5 pl-10 pr-4 w-full focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container placeholder-on-surface-variant/50" />
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto bg-surface-dim">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-surface-container sticky top-0 z-10 border-b border-surface-variant">
              <tr>
                <th className="py-3 px-4 font-label-md text-label-sm text-on-surface-variant uppercase tracking-wider">Miembro</th>
                <th className="py-3 px-4 font-label-md text-label-sm text-on-surface-variant uppercase tracking-wider">Plan</th>
                <th className="py-3 px-4 font-label-md text-label-sm text-on-surface-variant uppercase tracking-wider">Método</th>
                <th className="py-3 px-4 font-label-md text-label-sm text-on-surface-variant uppercase tracking-wider">Fecha y Hora</th>
                <th className="py-3 px-4 font-label-md text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Monto (USD)</th>
                <th className="py-3 px-4 font-label-md text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Monto (Bs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant font-body-sm text-body-sm">
              {/* Row 1 */}
              <tr className="hover:bg-surface-variant/30 transition-colors bg-[#131920]">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos" alt="Carlos Mendoza" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Carlos Mendoza</span>
                      <span className="text-on-surface-variant text-xs">C.I: 24.567.891</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-on-surface">Mensual</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-on-surface">
                    Zelle
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-on-surface">15 Oct 2023</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-on-surface">$40.00</td>
                <td className="py-3 px-4 text-right text-on-surface-variant">-</td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-surface-variant/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Andrea" alt="Andrea Gómez" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Andrea Gómez</span>
                      <span className="text-on-surface-variant text-xs">C.I: 28.123.456</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-on-surface">Diario</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-on-surface">
                    Efectivo
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-on-surface">15 Oct 2023</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-on-surface">$5.00</td>
                <td className="py-3 px-4 text-right text-on-surface-variant">-</td>
              </tr>
              {/* Row 3 */}
              <tr className="hover:bg-surface-variant/30 transition-colors bg-[#131920]">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Luis" alt="Luis Fernández" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Luis Fernández</span>
                      <span className="text-on-surface-variant text-xs">C.I: 19.876.543</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-on-surface">Semanal</td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-on-surface">Pago Móvil</div>
                    <span className="text-xs text-on-surface-variant/70">Ref: 8492</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-on-surface">14 Oct 2023</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-on-surface">$75.00</td>
                <td className="py-3 px-4 text-right text-on-surface-variant">Bs. 2,662.50</td>
              </tr>
              {/* Row 4 */}
              <tr className="hover:bg-surface-variant/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" alt="Maria Rodriguez" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Maria Rodriguez</span>
                      <span className="text-on-surface-variant text-xs">C.I: 22.345.678</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-on-surface">Anual</td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-on-surface">Pago Movil</div>
                    <span className="text-xs text-on-surface-variant/70">Ref: 3105</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-on-surface">14 Oct 2023</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-on-surface">$400.00</td>
                <td className="py-3 px-4 text-right text-on-surface-variant">Bs. 14,200.00</td>
              </tr>
              {/* Row 5 */}
              <tr className="hover:bg-surface-variant/30 transition-colors bg-[#131920]">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jose" alt="Jose Perez" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Jose Perez</span>
                      <span className="text-on-surface-variant text-xs">C.I: 15.432.109</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-on-surface">Mensual</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-on-surface">Zelle</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-on-surface">13 Oct 2023</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-on-surface">$40.00</td>
                <td className="py-3 px-4 text-right text-on-surface-variant">-</td>
              </tr>
              {/* Row 6 */}
              <tr className="hover:bg-surface-variant/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Elena" alt="Elena Rivas" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Elena Rivas</span>
                      <span className="text-on-surface-variant text-xs">C.I: 21.098.765</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-on-surface">Diario</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-on-surface">Efectivo</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-on-surface">13 Oct 2023</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-on-surface">$5.00</td>
                <td className="py-3 px-4 text-right text-on-surface-variant">-</td>
              </tr>
              {/* Row 7 */}
              <tr className="hover:bg-surface-variant/30 transition-colors bg-[#131920]">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel" alt="Miguel Angel" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Miguel Angel</span>
                      <span className="text-on-surface-variant text-xs">C.I: 12.345.678</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-on-surface">Semanal</td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-on-surface">Pago Móvil</div>
                    <span className="text-xs text-on-surface-variant/70">Ref: 9921</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-on-surface">12 Oct 2023</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-on-surface">$20.00</td>
                <td className="py-3 px-4 text-right text-on-surface-variant">Bs. 730.00</td>
              </tr>
              {/* Row 8 */}
              <tr className="hover:bg-surface-variant/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia" alt="Sofia Castro" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Sofia Castro</span>
                      <span className="text-on-surface-variant text-xs">C.I: 26.789.012</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-on-surface">Anual</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-on-surface">Binance</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-on-surface">12 Oct 2023</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-on-surface">$400.00</td>
                <td className="py-3 px-4 text-right text-on-surface-variant">-</td>
              </tr>
              {/* Row 9 */}
              <tr className="hover:bg-surface-variant/30 transition-colors bg-[#131920]">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo" alt="Ricardo Diaz" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Ricardo Diaz</span>
                      <span className="text-on-surface-variant text-xs">C.I: 18.901.234</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-on-surface">Mensual</td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-on-surface">Pago Móvil</div>
                    <span className="text-xs text-on-surface-variant/70">Ref: 4456</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-on-surface">11 Oct 2023</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-on-surface">$40.00</td>
                <td className="py-3 px-4 text-right text-on-surface-variant">Bs. 1,460.00</td>
              </tr>
              {/* Row 10 */}
              <tr className="hover:bg-surface-variant/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Laura" alt="Laura Torres" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Laura Torres</span>
                      <span className="text-on-surface-variant text-xs">C.I: 23.456.789</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-on-surface">Semanal</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-on-surface">Efectivo</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-on-surface">11 Oct 2023</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-on-surface">$20.00</td>
                <td className="py-3 px-4 text-right text-on-surface-variant">-</td>
              </tr>
              {/* Row 11 */}
              <tr className="hover:bg-surface-variant/30 transition-colors bg-[#131920]">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel" alt="Gabriel Ruiz" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Gabriel Ruiz</span>
                      <span className="text-on-surface-variant text-xs">C.I: 25.678.901</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-on-surface">Diario</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-on-surface">Zelle</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-on-surface">10 Oct 2023</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-on-surface">$5.00</td>
                <td className="py-3 px-4 text-right text-on-surface-variant">-</td>
              </tr>
              {/* Row 12 */}
              <tr className="hover:bg-surface-variant/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia" alt="Patricia Leon" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Patricia Leon</span>
                      <span className="text-on-surface-variant text-xs">C.I: 14.567.890</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-on-surface">Anual</td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-on-surface">Pago Móvil</div>
                    <span className="text-xs text-on-surface-variant/70">Ref: 1122</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-on-surface">10 Oct 2023</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-on-surface">$400.00</td>
                <td className="py-3 px-4 text-right text-on-surface-variant">Bs. 14,600.00</td>
              </tr>
              {/* Row 13 */}
              <tr className="hover:bg-surface-variant/30 transition-colors bg-[#131920]">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Fernando" alt="Fernando Gil" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Fernando Gil</span>
                      <span className="text-on-surface-variant text-xs">C.I: 17.890.123</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-on-surface">Mensual</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-on-surface">Binance</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-on-surface">09 Oct 2023</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-on-surface">$40.00</td>
                <td className="py-3 px-4 text-right text-on-surface-variant">-</td>
              </tr>
              {/* Row 14 */}
              <tr className="hover:bg-surface-variant/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Isabel" alt="Isabel Blanco" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Isabel Blanco</span>
                      <span className="text-on-surface-variant text-xs">C.I: 27.890.123</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-on-surface">Semanal</td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-on-surface">Pago Móvil</div>
                    <span className="text-xs text-on-surface-variant/70">Ref: 7788</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-on-surface">09 Oct 2023</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-on-surface">$20.00</td>
                <td className="py-3 px-4 text-right text-on-surface-variant">Bs. 730.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center p-3 border-t border-surface-variant bg-surface-container shrink-0 justify-end">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="px-5 py-2 rounded border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-variant/50 transition-colors cursor-pointer">
              Cerrar
            </button>
            <button className="px-5 py-2 rounded bg-primary-container text-[#0F141A] font-label-md text-label-md font-bold flex items-center gap-2 hover:bg-primary-fixed transition-colors shadow-sm cursor-pointer">
              <span className="material-symbols-outlined text-[20px]" data-icon="download">download</span>
              Exportar Reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}