import { useEffect, useState } from 'react';
import TransactionHistoryModal from '../components/TransactionHistoryModal';
import { apiFetch } from '../lib/api';

interface Summary {
  totalUsd: number;
  totalBs: number;
  byMethod: Record<string, number>;
  newMemberships: number;
  renewals: number;
}

interface Transaction {
  id: string;
  memberName: string;
  plan: string;
  method: string;
  amountUsd: string | null;
  amountBs: string | null;
  reference: string | null;
  createdAt: string;
}

interface MonthlyPoint {
  month: string;
  total: number;
}

interface ExchangeRate {
  usdToBs: string;
  eurToBs: string | null;
}

const METHOD_COLORS_HEX: Record<string, string> = {
  Zelle: '#51e084',
  Efectivo: '#ffb86e',
  'Pago Móvil': '#dee3eb',
  Binance: '#869486',
};

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const isToday = date.toDateString() === new Date().toDateString();
  const time = date.toLocaleTimeString('es-VE', { hour: 'numeric', minute: '2-digit' });
  return `${isToday ? 'Hoy' : date.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })}, ${time}`;
}

export default function Reports() {
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyInitialRange, setHistoryInitialRange] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthly, setMonthly] = useState<MonthlyPoint[]>([]);
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para la torta interactiva
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryRes, txRes, monthlyRes, rateRes] = await Promise.all([
        apiFetch('/reports/summary'),
        apiFetch('/reports/transactions'),
        apiFetch('/reports/monthly'),
        apiFetch('/exchange-rate'),
      ]);

      if (!summaryRes.ok || !txRes.ok || !monthlyRes.ok || !rateRes.ok) throw new Error();

      setSummary(await summaryRes.json());
      setTransactions(await txRes.json());
      setMonthly(await monthlyRes.json());
      setRate(await rateRes.json());
    } catch {
      setError('No se pudieron cargar los reportes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalMethodCount = summary ? Object.values(summary.byMethod).reduce((a, b) => a + b, 0) : 0;
  const methodPercentages = summary
    ? Object.entries(summary.byMethod).map(([method, count]) => ({
        method,
        count,
        percentage: totalMethodCount > 0 ? Math.round((count / totalMethodCount) * 100) : 0,
      }))
    : [];

  const maxMonthly = Math.max(1, ...monthly.map((m) => m.total));
  const chartWidth = 100;
  const chartPoints = monthly.map((m, i) => {
    const x = monthly.length > 1 ? (i / (monthly.length - 1)) * chartWidth : 50;
    const y = 100 - (m.total / maxMonthly) * 85 - 5; // 5% de padding arriba
    return { x, y };
  });
  const polylinePoints = chartPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Reportes y Estadísticas</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Resumen financiero y operativo del gimnasio.
          </p>
        </div>
        <button
          onClick={() => { setHistoryInitialRange('today'); setHistoryModalOpen(true); }}
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 text-primary rounded-md font-label-sm hover:bg-primary/30 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          Historial de Transacciones
        </button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[18px]">error</span>
          <p className="text-body-sm text-error">{error}</p>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-surface-container rounded-xl border border-primary/30 p-4 flex flex-col justify-between shadow-[0_0_15px_rgba(81,224,132,0.05)]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Ingresos Totales (Bs)</h3>
            <span className="material-symbols-outlined text-primary">payments</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-headline-md text-[22px] font-bold text-on-surface">
              {isLoading ? '—' : `Bs ${summary?.totalBs.toLocaleString('es-VE') ?? 0}`}
            </span>
            <div className="text-[11px] text-on-surface-variant font-label-sm mt-2">
              <p>1 USD = {rate?.usdToBs ?? '—'} Bs</p>
              {rate?.eurToBs && <p>1 EUR = {rate.eurToBs} Bs</p>}
            </div>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider leading-tight">Ingresos Totales (Efectivo $)</h3>
            <span className="material-symbols-outlined text-tertiary">local_atm</span>
          </div>
          <span className="font-headline-md text-headline-md text-on-surface">{isLoading ? '—' : `$${(summary?.totalUsd ?? 0).toLocaleString('es-VE')}`}</span>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Nuevas Membresías</h3>
            <span className="material-symbols-outlined text-primary">person_add</span>
          </div>
          <span className="font-headline-md text-headline-md text-on-surface">{isLoading ? '—' : summary?.newMemberships ?? 0}</span>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Renovaciones</h3>
            <span className="material-symbols-outlined text-on-surface-variant">autorenew</span>
          </div>
          <span className="font-headline-md text-headline-md text-on-surface">{isLoading ? '—' : summary?.renewals ?? 0}</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden mb-4">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high/30">
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Resumen de Transacciones</h3>
          <button onClick={() => setHistoryModalOpen(true)} className="text-primary font-label-sm text-label-sm hover:underline cursor-pointer" type="button">Ver todas</button>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[320px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin">sync</span>
              Cargando transacciones...
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-on-surface-variant text-body-sm">
              Todavía no hay transacciones registradas.
            </div>
          ) : (
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
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface-variant font-label-sm font-semibold shrink-0">
                          {tx.memberName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <span className="font-body-sm text-on-surface font-medium">{tx.memberName}</span>
                      </div>
                    </td>
                    <td className="p-3 font-body-sm text-on-surface-variant">{tx.plan}</td>
                    <td className="p-3 font-body-sm text-on-surface-variant">{tx.method}</td>
                    <td className="p-3 font-body-sm text-on-surface-variant">{formatDateTime(tx.createdAt)}</td>
                    <td className="p-3 font-body-sm text-on-surface font-medium text-right">{tx.amountUsd !== null ? `$${Number(tx.amountUsd).toFixed(2)}` : '—'}</td>
                    <td className="p-3 font-body-sm text-on-surface-variant text-right">{tx.amountBs !== null ? `Bs ${Number(tx.amountBs).toLocaleString('es-VE')}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-surface-container rounded-xl border border-outline-variant p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Ingresos Mensuales (USD)</h3>
          </div>
          {isLoading ? (
            <div className="h-[240px] flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin">sync</span>
            </div>
          ) : monthly.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-on-surface-variant text-sm">
              No hay datos suficientes para mostrar el gráfico.
            </div>
          ) : (
            <div className="relative h-[240px] w-full pt-4">
              {/* Eje Y */}
              <div className="absolute left-0 top-4 bottom-8 w-10 flex flex-col justify-between text-[10px] text-on-surface-variant text-right pr-2">
                <span>${maxMonthly.toLocaleString('es-VE')}</span>
                <span>${Math.round(maxMonthly / 2).toLocaleString('es-VE')}</span>
                <span>$0</span>
              </div>

              {/* Contenedor del Gráfico */}
              <div className="ml-10 h-[calc(100%-32px)] relative border-l border-b border-outline-variant/50">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-t border-dashed border-outline-variant/20 w-full"></div>
                  <div className="border-t border-dashed border-outline-variant/20 w-full"></div>
                  <div className="border-t border-dashed border-outline-variant/20 w-full"></div>
                </div>

                {/* SVG */}
                <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'var(--color-primary)', stopOpacity: 0.4 }} />
                      <stop offset="100%" style={{ stopColor: 'var(--color-primary)', stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  <polygon points={`0,100 ${polylinePoints} 100,100`} fill="url(#grad)" />
                  <polyline points={polylinePoints} fill="none" stroke="var(--color-primary)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
                </svg>

                {/* Puntos Interactivos */}
                {chartPoints.map((p, i) => (
                  <div key={i} className="absolute group z-10" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}>
                    <div className="w-4 h-4 rounded-full bg-surface border-2 border-primary cursor-pointer transition-transform group-hover:scale-150"></div>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-surface-container-highest border border-outline-variant text-on-surface text-[11px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-20">
                      <span className="font-bold text-primary">${monthly[i].total.toLocaleString('es-VE')}</span>
                      <span className="text-on-surface-variant">{monthly[i].month}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Eje X (Meses) */}
              <div className="ml-10 mt-2 relative h-4">
                {monthly.map((m, i) => {
                  const x = monthly.length > 1 ? (i / (monthly.length - 1)) * 100 : 50;
                  let align = 'translateX(-50%)';
                  if (i === 0) align = 'translateX(0%)';
                  if (i === monthly.length - 1) align = 'translateX(-100%)';
                  return (
                    <span key={i} className="absolute text-[10px] text-on-surface-variant whitespace-nowrap" style={{ left: `${x}%`, transform: align }}>
                      {m.month}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-1 bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col">
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">Métodos de Pago</h3>
          {methodPercentages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant text-body-sm">
              Sin datos todavía.
            </div>
          ) : (
            <>
              <div className="flex-1 flex flex-col justify-center items-center py-4">
                <div className="relative w-36 h-36">
                  <svg width="144" height="144" viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-surface-container-low)" strokeWidth="14" />
                    {(() => {
                      const C = 2 * Math.PI * 40;
                      let offset = 0;
                      return methodPercentages.map(({ method, percentage }) => {
                        const dash = (percentage / 100) * C;
                        const circle = (
                          <circle
                            key={method}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={METHOD_COLORS_HEX[method] || 'var(--color-outline-variant)'}
                            strokeWidth="14"
                            strokeDasharray={`${dash} ${C - dash}`}
                            strokeDashoffset={-offset}
                            className="cursor-pointer transition-opacity duration-300"
                            style={{ opacity: hoveredMethod && hoveredMethod !== method ? 0.3 : 1 }}
                            onMouseEnter={() => setHoveredMethod(method)}
                            onMouseLeave={() => setHoveredMethod(null)}
                          />
                        );
                        offset += dash;
                        return circle;
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {hoveredMethod ? (
                      <>
                        <span className="text-primary font-headline-md text-headline-md">
                          {methodPercentages.find(m => m.method === hoveredMethod)?.percentage}%
                        </span>
                        <span className="text-on-surface-variant text-[10px]">{hoveredMethod}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-on-surface font-headline-md text-headline-md">{totalMethodCount}</span>
                        <span className="text-on-surface-variant text-[10px]">Pagos</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] font-label-sm">
                {methodPercentages.map(({ method, percentage }) => (
                  <div 
                    key={method} 
                    className="flex items-center gap-2 cursor-pointer transition-opacity"
                    style={{ opacity: hoveredMethod && hoveredMethod !== method ? 0.3 : 1 }}
                    onMouseEnter={() => setHoveredMethod(method)}
                    onMouseLeave={() => setHoveredMethod(null)}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: METHOD_COLORS_HEX[method] || 'var(--color-outline-variant)' }}></div>
                    <span className="text-on-surface-variant">{method} ({percentage}%)</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <TransactionHistoryModal
        isOpen={historyModalOpen}
        onClose={() => { setHistoryModalOpen(false); setHistoryInitialRange(''); }}
        initialRange={historyInitialRange}
      />
    </>
  );
}