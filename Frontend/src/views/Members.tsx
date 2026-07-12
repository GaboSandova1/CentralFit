export default function Members() {
  return (
    <>
      <div className="mb-6">
        <h2 className="font-headline-md text-headline-md text-on-surface">Directorio de Miembros</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Gestiona suscripciones activas, visualiza vencimientos y actualiza perfiles de miembros.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total de Miembros</h3>
            <span className="material-symbols-outlined text-primary">group</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md text-on-surface">1,248</span>
            <span className="flex items-center text-primary text-label-sm font-label-sm">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +12% vs mes anterior
            </span>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl border border-tertiary/50 p-4 flex flex-col justify-between shadow-[0_0_10px_rgba(255,184,110,0.05)]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">Por Vencer</h3>
            <span className="material-symbols-outlined text-tertiary">warning</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md text-on-surface">42</span>
            <span className="text-on-surface-variant text-label-sm font-label-sm">Próximos 7 días</span>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Tasa de Activos</h3>
            <span className="material-symbols-outlined text-primary">show_chart</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md text-on-surface">94%</span>
            <span className="flex items-center text-primary text-label-sm font-label-sm">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +2% vs mes anterior
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
        <div className="p-4 border-b border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <select className="bg-surface-container-high border border-outline-variant rounded-md px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary">
              <option>Todos los Miembros</option>
              <option>Activos</option>
              <option>Por Vencer</option>
              <option>Vencidos</option>
            </select>
          </div>
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Buscar por nombre o cédula..." 
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-md pl-10 pr-4 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[440px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface-container-lowest z-10">
              <tr className="border-b border-outline-variant bg-surface-container-lowest">
                <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider w-[250px]">Nombre del Miembro</th>
                <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Plan de Suscripción</th>
                <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer">
                    Fecha de Vencimiento
                    <span className="material-symbols-outlined text-[14px]">unfold_more</span>
                  </div>
                </th>
                <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Estado</th>
                <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {[
                { init: 'SJ', name: 'Sarah Jenkins', id: '24.582.119', plan: 'Anual', date: 'Dec 15, 2024', status: 'Activo', statusColor: 'text-primary border-primary/30 bg-primary/10' },
                { init: 'MC', name: 'Michael Chang', id: '18.923.445', plan: 'Mensual', date: 'Oct 28, 2023', status: 'Por Vencer', statusColor: 'text-tertiary border-tertiary/30 bg-tertiary/10' },
                { init: 'ER', name: 'Elena Rodriguez', id: '21.004.872', plan: 'Semanal', date: 'Sep 15, 2023', status: 'Vencido', statusColor: 'text-error border-error/30 bg-error/10' },
                { init: 'DK', name: 'David Kim', id: '27.115.339', plan: 'Anual', date: 'Jan 10, 2025', status: 'Activo', statusColor: 'text-primary border-primary/30 bg-primary/10' },
                { init: 'AM', name: 'Ana Martínez', id: '15.662.901', plan: 'Anual', date: 'Feb 12, 2025', status: 'Activo', statusColor: 'text-primary border-primary/30 bg-primary/10' },
                { init: 'JL', name: 'Jorge López', id: '19.443.210', plan: 'Mensual', date: 'Aug 05, 2023', status: 'Vencido', statusColor: 'text-error border-error/30 bg-error/10' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-surface-container-high/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface-variant font-label-md font-semibold overflow-hidden shrink-0">
                        {row.init === 'SJ' || row.init === 'MC' || row.init === 'DK' ? (
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.name}`} alt={row.name} className="w-full h-full object-cover" />
                        ) : row.init}
                      </div>
                      <div>
                        <p className="font-body-sm text-on-surface font-medium leading-tight">{row.name}</p>
                        <p className="font-label-sm text-on-surface-variant text-[11px]">C.I: {row.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-body-sm text-on-surface-variant">{row.plan}</td>
                  <td className="p-3 font-body-sm text-on-surface-variant">{row.date}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-semibold border min-w-[80px] ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button className="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}