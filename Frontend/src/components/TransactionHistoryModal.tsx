import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Transaction {
  id: string;
  memberName: string;
  memberCedula: string;
  plan: string;
  planId: string;
  method: string;
  amountUsd: string;
  amountBs: string;
  reference: string | null;
  createdAt: string;
}

interface Plan {
  id: string;
  name: string;
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const isToday = date.toDateString() === new Date().toDateString();
  const time = date.toLocaleTimeString('es-VE', { hour: 'numeric', minute: '2-digit' });
  return `${isToday ? 'Hoy' : date.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })}, ${time}`;
}

function downloadCsv(transactions: Transaction[]) {
  const header = ['Miembro', 'Cédula', 'Plan', 'Método', 'Fecha', 'Monto USD', 'Monto Bs', 'Referencia'];
  const rows = transactions.map((t) => [
    t.memberName,
    t.memberCedula,
    t.plan,
    t.method,
    new Date(t.createdAt).toLocaleString('es-VE'),
    t.amountUsd,
    t.amountBs,
    t.reference ?? '',
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transacciones_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function TransactionHistoryModal({ isOpen, onClose }: TransactionHistoryModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('');
  const [planId, setPlanId] = useState('');
  const [range, setRange] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    apiFetch('/plans')
      .then((res) => res.json())
      .then(setPlans)
      .catch(() => setPlans([]));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const loadTransactions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (method) params.set('method', method);
        if (planId) params.set('planId', planId);
        if (range) params.set('range', range);
        params.set('limit', '100');

        const response = await apiFetch(`/reports/transactions?${params.toString()}`);
        if (!response.ok) throw new Error();
        setTransactions(await response.json());
      } catch {
        setError('No se pudieron cargar las transacciones.');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce corto para la búsqueda de texto
    const timeout = setTimeout(loadTransactions, 300);
    return () => clearTimeout(timeout);
  }, [isOpen, search, method, planId, range]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-container w-full max-w-5xl rounded-xl border border-outline-variant shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high shrink-0">
          <h3 className="text-lg font-headline-md text-on-surface">Historial de Transacciones</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-5 py-3 border-b border-outline-variant bg-surface-container-low flex flex-wrap gap-3 items-center shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              className="w-full bg-surface border border-outline-variant rounded-md pl-10 pr-4 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="">Todo el tiempo</option>
            <option value="today">Hoy</option>
            <option value="week">Últimos 7 días</option>
            <option value="month">Este mes</option>
          </select>
          <select
            className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="">Todos los métodos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Zelle">Zelle</option>
            <option value="Pago Móvil">Pago Móvil</option>
            <option value="Binance">Binance</option>
          </select>
          <select
            className="bg-surface border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
          >
            <option value="">Todos los planes</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
          <button
            onClick={() => downloadCsv(transactions)}
            disabled={transactions.length === 0}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 text-primary rounded-md font-label-sm hover:bg-primary/30 transition-colors cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exportar CSV
          </button>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          {error && (
            <div className="p-4">
              <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[18px]">error</span>
                <p className="text-body-sm text-error">{error}</p>
              </div>
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center h-40 gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin">sync</span>
              Cargando transacciones...
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-on-surface-variant text-body-sm">
              No se encontraron transacciones con esos filtros.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container z-10">
                <tr className="border-b border-outline-variant">
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Miembro</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Plan</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Método</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Fecha</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Referencia</th>
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
                        <div>
                          <p className="font-body-sm text-on-surface font-medium">{tx.memberName}</p>
                          <p className="text-[11px] text-on-surface-variant">C.I: {tx.memberCedula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-body-sm text-on-surface-variant">{tx.plan}</td>
                    <td className="p-3 font-body-sm text-on-surface-variant">{tx.method}</td>
                    <td className="p-3 font-body-sm text-on-surface-variant">{formatDateTime(tx.createdAt)}</td>
                    <td className="p-3 font-body-sm text-on-surface-variant">{tx.reference ?? '—'}</td>
                    <td className="p-3 font-body-sm text-on-surface font-medium text-right">${Number(tx.amountUsd).toFixed(2)}</td>
                    <td className="p-3 font-body-sm text-on-surface-variant text-right">Bs {Number(tx.amountBs).toLocaleString('es-VE')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}