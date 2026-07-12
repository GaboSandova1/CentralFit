export default function Reports() {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Reportes y Estadísticas</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Resumen financiero y operativo del gimnasio.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border border-outline-variant rounded-md text-on-surface font-label-sm hover:bg-surface-bright transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Hoy
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 text-primary rounded-md font-label-sm hover:bg-primary/30 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-surface-container rounded-xl border border-primary/30 p-4 flex flex-col justify-between shadow-[0_0_15px_rgba(81,224,132,0.05)]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Ingresos Totales (Bs)</h3>
            <span className="material-symbols-outlined text-primary">payments</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-headline-md text-[22px] font-bold text-on-surface">Bs: 192.453,27</span>
            <div className="text-[11px] text-on-surface-variant font-label-sm mt-2">
              <p>Tasa BCV USD: $ 454,12</p>
              <p>Tasa BCV EUR: € 415,80</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider leading-tight">Ingresos Totales (Efectivo $)</h3>
            <span className="material-symbols-outlined text-tertiary">local_atm</span>
          </div>
          <div className="flex flex-col mt-auto">
            <span className="font-headline-md text-headline-md text-on-surface">$ 8,450</span>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Nuevas Membresías</h3>
            <span className="material-symbols-outlined text-primary">person_add</span>
          </div>
          <div className="flex flex-col mt-auto">
            <span className="font-headline-md text-headline-md text-on-surface">124</span>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Renovaciones</h3>
            <span className="material-symbols-outlined text-on-surface-variant">autorenew</span>
          </div>
          <div className="flex flex-col mt-auto">
            <span className="font-headline-md text-headline-md text-on-surface">438</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden mb-4">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high/30">
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Resumen de Transacciones</h3>
          <button className="text-primary font-label-sm text-label-sm hover:underline cursor-pointer">Ver todas</button>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[320px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface-container z-10">
              <tr className="border-b border-outline-variant">
                <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Miembro</th>
                <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Plan</th>
                <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Método</th>
                <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Fecha</th>
                <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Monto (USD)</th>
                <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Monto (Bs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {[
                { init: 'MR', name: 'Miguel Rodriguez', plan: 'Mensual', method: 'Zelle', date: 'Hoy, 10:45 AM', usd: '$60.00', bs: 'Bs 2,190.00' },
                { init: 'AG', name: 'Ana Garcia', plan: 'Diario', method: 'Pago Móvil', date: 'Hoy, 09:15 AM', usd: '$30.00', bs: 'Bs 1,095.00' },
                { init: 'JL', name: 'Jose Lopez', plan: 'Anual', method: 'Efectivo', date: 'Ayer, 04:30 PM', usd: '$350.00', bs: 'Bs 12,775.00' },
                { init: 'CM', name: 'Carmen Mendez', plan: 'Semanal', method: 'Binance', date: 'Ayer, 11:20 AM', usd: '$25.00', bs: 'Bs 912.50' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-surface-container-high/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface-variant font-label-sm font-semibold shrink-0">
                        {row.init}
                      </div>
                      <span className="font-body-sm text-on-surface font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td className="p-3 font-body-sm text-on-surface-variant">{row.plan}</td>
                  <td className="p-3 font-body-sm text-on-surface-variant">{row.method}</td>
                  <td className="p-3 font-body-sm text-on-surface-variant">{row.date}</td>
                  <td className="p-3 font-body-sm text-on-surface font-medium text-right">{row.usd}</td>
                  <td className="p-3 font-body-sm text-on-surface-variant text-right">{row.bs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts area (Simulated) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface-container rounded-xl border border-outline-variant p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Ingresos Mensuales (USD)</h3>
            <button className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
          {/* Simulated chart */}
          <div className="h-[160px] w-full flex items-end justify-between px-2 relative">
            <div className="absolute left-0 bottom-0 top-0 flex flex-col justify-between text-[10px] text-on-surface-variant">
              <span>$14k</span>
              <span>$12k</span>
              <span>$10k</span>
              <span>$8k</span>
              <span>$6k</span>
              <span>$4k</span>
              <span>$2k</span>
              <span>$0k</span>
            </div>
            
            <div className="ml-8 w-full h-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between opacity-10">
                {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="border-b border-on-surface-variant w-full"></div>)}
              </div>
              {/* Line (Simulated with SVG) */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline points="0,50 20,45 40,48 60,35 80,30 100,25" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" />
                <circle cx="0" cy="50" r="1.5" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1" />
                <circle cx="20" cy="45" r="1.5" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1" />
                <circle cx="40" cy="48" r="1.5" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1" />
                <circle cx="60" cy="35" r="1.5" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1" />
                <circle cx="80" cy="30" r="1.5" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1" />
                <circle cx="100" cy="25" r="1.5" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1" />
              </svg>
            </div>
            
            <div className="absolute left-8 bottom-[-20px] right-0 flex justify-between text-[10px] text-on-surface-variant">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col">
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">Métodos de Pago</h3>
          <div className="flex-1 flex flex-col justify-center items-center">
            {/* Simulated Donut Chart */}
            <div className="w-32 h-32 rounded-full border-[16px] border-surface-container-high relative flex items-center justify-center">
              <div className="absolute inset-[-16px] rounded-full border-[16px] border-primary" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 70% 100%)' }}></div>
              <div className="absolute inset-[-16px] rounded-full border-[16px] border-tertiary" style={{ clipPath: 'polygon(50% 50%, 70% 100%, 0 100%, 0 80%)' }}></div>
              <div className="absolute inset-[-16px] rounded-full border-[16px] border-surface-bright" style={{ clipPath: 'polygon(50% 50%, 0 80%, 0 0, 50% 0)' }}></div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] font-label-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
              <span className="text-on-surface-variant">Zelle (45%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-tertiary"></div>
              <span className="text-on-surface-variant">Efectivo (25%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-on-surface"></div>
              <span className="text-on-surface-variant">Pago Móvil (20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest"></div>
              <span className="text-on-surface-variant">Binance (10%)</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}