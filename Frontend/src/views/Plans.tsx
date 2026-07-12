export default function Plans() {
  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Gestión de Planes</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Administra los paquetes de membresía, precios y beneficios de tus clientes.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-surface-container-high border border-outline-variant rounded-lg shadow-sm ml-auto mr-2">
          <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-[18px]">trending_up</span>
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] font-label-sm text-on-surface-variant leading-none uppercase tracking-wider">Más ingresos</p>
            <p className="text-label-md font-bold text-on-surface leading-tight">Mensual</p>
          </div>
        </div>
        <button className="bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-lg hover:bg-primary-fixed transition-colors active:scale-95 flex items-center gap-2 shadow-[0_0_15px_rgba(81,224,132,0.2)] cursor-pointer">
          <span className="material-symbols-outlined">add_circle</span>
          Nuevo Plan
        </button>
      </div>

      {/* Horizontal List for Plans */}
      <div className="flex flex-col gap-4">
        {/* Plan Row: Diario */}
        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-primary/50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all duration-300 group">
          <div className="flex items-center gap-4 w-full md:w-1/3">
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined">today</span>
            </div>
            <div>
              <h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Diario</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Acceso básico diario</p>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 rounded bg-surface-container-low border border-outline-variant text-label-sm font-label-sm text-on-surface-variant">1 Día</span>
                <span className="text-label-sm font-label-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">group</span> 15 miembros
                </span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 flex flex-col md:items-center">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-md text-headline-md text-on-surface">$4</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">.00</span>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">~ 4€: 3.193,17 (Bs) </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end md:justify-end">
            <button className="px-5 py-2 rounded-lg border border-outline-variant text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high hover:border-on-surface transition-colors cursor-pointer">Editar</button>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center border border-error/30 text-error hover:bg-error hover:text-on-error hover:border-error transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </div>

        {/* Plan Row: Semanal */}
        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-primary/50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all duration-300 group">
          <div className="flex items-center gap-4 w-full md:w-1/3">
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined">date_range</span>
            </div>
            <div>
              <h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Semanal</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Ideal para visitas cortas</p>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 rounded bg-surface-container-low border border-outline-variant text-label-sm font-label-sm text-on-surface-variant">7 Días</span>
                <span className="text-label-sm font-label-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">group</span> 48 miembros
                </span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 flex flex-col md:items-center">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-md text-headline-md text-on-surface">$12</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">.00</span>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">~ 12€: 9.579,50 (Bs)</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end md:justify-end">
            <button className="px-5 py-2 rounded-lg border border-outline-variant text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high hover:border-on-surface transition-colors cursor-pointer">Editar</button>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center border border-error/30 text-error hover:bg-error hover:text-on-error hover:border-error transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </div>

        {/* Plan Row: Mensual (Popular) */}
        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-primary/50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all duration-300 group">
          <div className="flex items-center gap-4 w-full md:w-1/3 relative">
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined">star</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Mensual</h3>
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Nuestra opción más balanceada</p>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 rounded bg-surface-container-low border border-outline-variant text-label-sm font-label-sm text-on-surface-variant">30 Días</span>
                <span className="text-label-sm font-label-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">group</span> 124 miembros
                </span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 flex flex-col md:items-center">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-md text-headline-md text-on-surface">$25</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">.00</span>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              <span>~ 30€: 23.948,74 (Bs)</span>
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end md:justify-end">
            <button className="px-5 py-2 rounded-lg border border-outline-variant text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high hover:border-on-surface transition-colors cursor-pointer">Editar</button>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center border border-error/30 text-error hover:bg-error hover:text-on-error hover:border-error transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </div>

        {/* Plan Row: VIP Anual */}
        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-primary/50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all duration-300 group">
          <div className="flex items-center gap-4 w-full md:w-1/3">
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined">workspace_premium</span>
            </div>
            <div>
              <h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Anual</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Acceso ilimitado todo el año</p>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 rounded bg-surface-container-low border border-outline-variant text-label-sm font-label-sm text-on-surface-variant">365 Días</span>
                <span className="text-label-sm font-label-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">group</span> 155 miembros
                </span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 flex flex-col md:items-center">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-md text-headline-md text-on-surface">$360</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">.00</span>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">~ 360€: 287.384,90 (Bs)</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end md:justify-end">
            <button className="px-5 py-2 rounded-lg border border-outline-variant text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high hover:border-on-surface transition-colors cursor-pointer">Editar</button>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center border border-error/30 text-error hover:bg-error hover:text-on-error hover:border-error transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}