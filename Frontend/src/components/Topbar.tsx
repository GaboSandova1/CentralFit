import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

interface TopbarProps {
  onMenuClick: () => void;
  onOpenProfile: () => void;
}

interface Member {
  id: string;
  fullName: string;
  plan: string | null;
  status: 'sin_plan' | 'activo' | 'por_vencer' | 'en_gracia' | 'vencido';
}

export default function Topbar({ onMenuClick, onOpenProfile }: TopbarProps) {
  const [usdToBs, setUsdToBs] = useState<string | null>(null);
  const [attentionList, setAttentionList] = useState<Member[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    apiFetch('/exchange-rate')
      .then((res) => res.json())
      .then((data) => setUsdToBs(data.usdToBs))
      .catch(() => setUsdToBs(null));

    apiFetch('/members')
      .then((res) => res.json())
      .then((members: Member[]) => {
        setAttentionList(members.filter((m) => ['por_vencer', 'vencido', 'en_gracia'].includes(m.status)));
      })
      .catch(() => setAttentionList([]));
  }, []);

  return (
    <header className="h-topbar-height fixed top-0 right-0 left-0 md:left-sidebar-width z-20 bg-surface dark:bg-surface border-b border-outline-variant dark:border-outline-variant flex justify-between items-center px-gutter w-full md:w-[calc(100%-var(--spacing-sidebar-width))]">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high border border-outline-variant text-on-surface-variant font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-primary text-[16px]">payments</span>
          {usdToBs ? `$1 = ${usdToBs} Bs` : 'Cargando tasa...'}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="text-on-surface-variant hover:text-primary transition-colors relative cursor-pointer"
          >
            <span className="material-symbols-outlined">notifications</span>
            {attentionList.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-error rounded-full text-[10px] text-on-error flex items-center justify-center font-bold">
                {attentionList.length > 9 ? '9+' : attentionList.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-72 bg-surface-container border border-outline-variant rounded-lg shadow-xl z-40 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-outline-variant bg-surface-container-high">
                  <p className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">Requiere Atención</p>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {attentionList.length === 0 ? (
                    <p className="px-4 py-6 text-center text-on-surface-variant text-body-sm">No hay alertas por ahora.</p>
                  ) : (
                    attentionList.map((m) => {
                      const isOverdue = m.status === 'vencido' || m.status === 'en_gracia';
                      return (
                        <div key={m.id} className="px-4 py-2.5 border-b border-outline-variant/50 flex items-center gap-2">
                          <span className={`material-symbols-outlined text-[18px] ${isOverdue ? 'text-error' : 'text-tertiary'}`}>
                            {isOverdue ? 'error' : 'warning'}
                          </span>
                          <div>
                            <p className="text-body-sm text-on-surface">{m.fullName}</p>
                            <p className="text-[11px] text-on-surface-variant">{m.plan ?? 'Sin plan'} · {isOverdue ? 'Vencido' : 'Por vencer'}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Help tooltip */}
        <div className="relative group">
          <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-highest border border-outline-variant rounded-lg shadow-xl px-3 py-2 text-[12px] text-on-surface opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40">
            Cualquier duda o inconveniente, escríbenos al <span className="font-semibold text-primary">0424-3811068</span>
          </div>
        </div>

        <div className="h-8 w-px bg-outline-variant mx-2"></div>
        <button onClick={onOpenProfile} className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors cursor-pointer">
          <img
            alt="Manager Profile"
            className="w-8 h-8 rounded-full object-cover border border-outline-variant"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnpkkTUiXDAunU1ft8A4rQaYG3K3iakxbnNap_gmrZ1TI5vznT60okq3RCcCUO9Ok7M7-DbWoW3xWzpbQ9w1374FhNt6jSZ8uJEhwdxI9kMFfTrJDjre--oJhqexTh7KlKKfpqGPGa_9L8b4ue-3gmXhJZbUrSWr5qAmKLMfGTNomERMFVwPwoyFzHcJ80IBRfMYmtNI3H2c806CLKqm8lLTBuDk_WssFaDNREyeipjeRmOtslFa24-KgNhK6I2KRpJc49j1ull7Q"
          />
        </button>
      </div>
    </header>
  );
}