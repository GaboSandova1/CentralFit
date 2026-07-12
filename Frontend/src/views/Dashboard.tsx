export default function Dashboard() {
  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="font-headline-md text-headline-md text-on-surface">Resumen del Tablero</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Bienvenido de nuevo. Esto es lo que está pasando hoy.
        </p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col justify-between hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total de Miembros</h3>
            <span className="material-symbols-outlined text-primary">group</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md text-on-surface">1,248</span>
            <span className="flex items-center text-primary text-label-sm font-label-sm">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              12% MoM
            </span>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col justify-between hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Activos</h3>
            <span className="material-symbols-outlined text-primary">check_circle</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md text-on-surface">1,102</span>
            <span className="text-on-surface-variant text-label-sm font-label-sm">actualmente</span>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl border border-tertiary/50 p-4 flex flex-col justify-between hover:border-tertiary transition-colors shadow-[0_0_10px_rgba(255,184,110,0.05)]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">Por Vencer</h3>
            <span className="material-symbols-outlined text-tertiary">warning</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md text-on-surface">45</span>
            <span className="text-on-surface-variant text-label-sm font-label-sm leading-tight">En 7 días</span>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl border border-error/50 p-4 flex flex-col justify-between hover:border-error transition-colors shadow-[0_0_10px_rgba(255,180,171,0.05)]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-label-sm text-error uppercase tracking-wider">Vencidos</h3>
            <span className="material-symbols-outlined text-error">error</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md text-on-surface">12</span>
            <span className="text-on-surface-variant text-label-sm font-label-sm">Requiere acción</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Registration Form */}
        <div className="lg:col-span-1 bg-surface-container rounded-xl border border-outline-variant p-4 h-fit">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">person_add</span>
            <h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Registro Rápido</h3>
          </div>
          
          <form className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Nombre Completo</label>
              <input type="text" placeholder="John Doe" className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Cédula</label>
                <input type="text" placeholder="V-00000000" className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Teléfono</label>
                <input type="text" placeholder="+58 412-000" className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Tipo de Plan</label>
                <select className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary appearance-none">
                  <option>Diario</option>
                  <option>Semanal</option>
                  <option>Mensual</option>
                  <option>Anual</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Fecha de Inicio</label>
                <input type="date" className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary [color-scheme:dark]" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Método de Pago</label>
                <select className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary appearance-none">
                  <option>Efectivo</option>
                  <option>Zelle</option>
                  <option>Pago Móvil</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase"># Referencia</label>
                <input type="text" placeholder="0000" className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mb-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Fotografía del Afiliado (Opcional)</label>
              <div className="flex items-center gap-3">
                <input type="file" className="text-body-sm text-on-surface-variant file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-body-sm file:font-semibold file:bg-surface-container-high file:text-on-surface hover:file:bg-surface-bright cursor-pointer" />
              </div>
            </div>

            <button type="button" className="w-full bg-primary hover:bg-primary-fixed text-on-primary font-label-md text-label-md py-2 rounded-lg transition-colors flex items-center justify-center gap-2 mt-1 cursor-pointer shadow-[0_4px_12px_rgba(81,224,132,0.15)]">
              Registrar Miembro
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>
        </div>

        {/* Attention Required Table */}
        <div className="lg:col-span-2 bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">notification_important</span>
              <h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Requiere Atención</h3>
            </div>
          </div>
          
          <div className="overflow-x-auto overflow-y-auto max-h-[420px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container z-10">
                <tr className="border-b border-outline-variant bg-surface-container/50">
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Miembro</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Plan</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Estado</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {[
                  { init: 'MS', name: 'Marcus Smith', phone: '+58 412-1234567', plan: 'Mensual', status: 'Vence en 2 días', statusType: 'warning', action: 'Recordar', actionIcon: 'chat' },
                  { init: 'SJ', name: 'Sarah Jenkins', phone: '+58 424-9876543', plan: 'Anual', status: 'Vencido', statusType: 'error', action: 'Renovar', actionIcon: 'autorenew' },
                  { init: 'DC', name: 'David Chen', phone: '+58 414-5554433', plan: 'Semanal', status: 'Vence en 5 días', statusType: 'warning', action: 'Recordar', actionIcon: 'chat' },
                  { init: 'MG', name: 'Maria Garcia', phone: '+58 416-2223311', plan: 'Mensual', status: 'Vence en 1 día', statusType: 'warning', action: 'Recordar', actionIcon: 'chat' },
                  { init: 'CR', name: 'Carlos Ruiz', phone: '+58 412-7778899', plan: 'Anual', status: 'Vencido', statusType: 'error', action: 'Renovar', actionIcon: 'autorenew' },
                  { init: 'AM', name: 'Ana Martinez', phone: '+58 424-3332211', plan: 'Semanal', status: 'Vence en 3 días', statusType: 'warning', action: 'Recordar', actionIcon: 'chat' },
                  { init: 'LL', name: 'Luis Lopez', phone: '+58 414-6665544', plan: 'Mensual', status: 'Vence en 4 días', statusType: 'warning', action: 'Recordar', actionIcon: 'chat' },
                  { init: 'EG', name: 'Elena Gomez', phone: '+58 416-8887766', plan: 'Anual', status: 'Vencido', statusType: 'error', action: 'Renovar', actionIcon: 'autorenew' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface-variant font-label-md font-semibold overflow-hidden">
                          {row.init === 'DC' ? <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnpkkTUiXDAunU1ft8A4rQaYG3K3iakxbnNap_gmrZ1TI5vznT60okq3RCcCUO9Ok7M7-DbWoW3xWzpbQ9w1374FhNt6jSZ8uJEhwdxI9kMFfTrJDjre--oJhqexTh7KlKKfpqGPGa_9L8b4ue-3gmXhJZbUrSWr5qAmKLMfGTNomERMFVwPwoyFzHcJ80IBRfMYmtNI3H2c806CLKqm8lLTBuDk_WssFaDNREyeipjeRmOtslFa24-KgNhK6I2KRpJc49j1ull7Q" alt="User" /> : row.init}
                        </div>
                        <div>
                          <p className="font-body-sm text-on-surface font-medium">{row.name}</p>
                          <p className="font-label-sm text-on-surface-variant text-[11px]">{row.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-body-sm text-on-surface-variant">{row.plan}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold border ${
                        row.statusType === 'warning' ? 'bg-tertiary/10 text-tertiary border-tertiary/20' : 'bg-error/10 text-error border-error/20'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button className="flex items-center gap-1 font-label-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[16px]">{row.actionIcon}</span>
                        {row.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}