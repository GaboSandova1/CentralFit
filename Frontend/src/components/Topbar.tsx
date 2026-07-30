import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';
import PaymentInfoModal from './PaymentInfoModal';

interface Member {
  id: string;
  fullName: string;
  cedula: string;
  plan: string | null;
  endDate: string | null;
  status: 'sin_plan' | 'activo' | 'por_vencer' | 'en_gracia' | 'vencido';
}

interface TopbarProps {
  onMenuClick: () => void;
  onOpenProfile: () => void;
  refreshTrigger?: number;
  onNotificationClick: (member: Member) => void;
}

export default function Topbar({ onMenuClick, onOpenProfile, refreshTrigger, onNotificationClick }: TopbarProps) {
  const [rateLabel, setRateLabel] = useState<string | null>(null);
  const [attentionList, setAttentionList] = useState<Member[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false); // NUEVO

  const fetchTopbarData = useCallback(() => {
    Promise.all([
      apiFetch('/exchange-rate').then(res => res.json()),
      apiFetch('/settings').then(res => res.json()).catch(() => ({ rateType: 'BCV' })),
      apiFetch('/auth/me').then(res => res.json()).catch(() => null)
    ]).then(([rateData, settings, userData]) => {
      const isEuro = settings.rateType === 'Euro' && rateData.eurToBs;
      const rateValue = isEuro ? Number(rateData.eurToBs) : Number(rateData.usdToBs);
      const symbol = isEuro ? '€1' : '$1';
      setRateLabel(`${symbol} = ${rateValue.toFixed(2)} Bs`);
      if (userData?.photoUrl) setProfilePic(userData.photoUrl);
    }).catch(() => setRateLabel(null));

    apiFetch('/members')
      .then((res) => res.json())
      .then((members: Member[]) => {
        setAttentionList(members.filter((m) => ['por_vencer', 'vencido', 'en_gracia'].includes(m.status)));
      })
      .catch(() => setAttentionList([]));
  }, []);

  useEffect(() => {
    fetchTopbarData();
  }, [refreshTrigger, fetchTopbarData]);

  useEffect(() => {
    const handleDataChange = () => fetchTopbarData();
    window.addEventListener('centralFitDataChanged', handleDataChange);
    return () => window.removeEventListener('centralFitDataChanged', handleDataChange);
  }, [fetchTopbarData]);

  const handleNotificationClick = (member: Member) => {
    onNotificationClick(member);
    setNotificationsOpen(false);
  };

  return (
    <>
      <header className="h-topbar-height fixed top-0 right-0 left-0 md:left-sidebar-width z-20 bg-surface dark:bg-surface border-b border-outline-variant dark:border-outline-variant flex justify-between items-center px-gutter w-full md:w-[calc(100%-var(--spacing-sidebar-width))]">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="md:hidden text-on-surface-variant hover:text-primary transition-colors cursor-pointer" aria-label="Abrir menú" type="button">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high border border-outline-variant text-on-surface-variant font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-primary text-[16px]">payments</span>
            {rateLabel ? rateLabel : 'Cargando tasa...'}
          </div>

          {/* NUEVO: Botón de Pago de Suscripción */}
          <button 
            onClick={() => setPaymentModalOpen(true)} 
            className="hidden sm:flex items-center gap-1 text-primary border border-primary/50 rounded-full px-3 py-1.5 hover:bg-primary/10 transition-colors text-sm cursor-pointer"
            title="Datos para pagar tu mensualidad"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            Suscripción
          </button>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setNotificationsOpen((prev) => !prev)} className="text-on-surface-variant hover:text-primary transition-colors relative cursor-pointer" type="button">
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
                          <button key={m.id} onClick={() => handleNotificationClick(m)} className="w-full px-4 py-2.5 border-b border-outline-variant/50 flex items-center gap-2 hover:bg-surface-container-high/50 transition-colors text-left cursor-pointer" type="button">
                            <span className={`material-symbols-outlined text-[18px] ${isOverdue ? 'text-error' : 'text-tertiary'}`}>{isOverdue ? 'error' : 'warning'}</span>
                            <div className="flex-1">
                              <p className="text-body-sm text-on-surface">{m.fullName}</p>
                              <p className="text-[11px] text-on-surface-variant">
                                {m.plan ?? 'Sin plan'} · {m.status === 'vencido' ? 'Vencido' : m.status === 'en_gracia' ? 'En Gracia' : 'Por vencer'}
                              </p>
                            </div>
                            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">chevron_right</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative group">
            <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer" type="button">
              <span className="material-symbols-outlined">help</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-highest border border-outline-variant rounded-lg shadow-xl px-3 py-2 text-[12px] text-on-surface opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40">
              Cualquier duda o inconveniente, escríbenos al <span className="font-semibold text-primary">0424-3811068</span>
            </div>
          </div>

          <div className="h-8 w-px bg-outline-variant mx-2"></div>
          <button onClick={onOpenProfile} className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors cursor-pointer" type="button">
            <img alt="Manager Profile" className="w-8 h-8 rounded-full object-cover border border-outline-variant bg-surface-container-high" src={profilePic || "https://lh3.googleusercontent.com/aida-public/AB6AXuAnpkkTUiXDAunU1ft8A4rQaYG3K3iakxbnNap_gmrZ1TI5vznT60okq3RCcCUO9Ok7M7-DbWoW3xWzpbQ9w1374FhNt6jSZ8uJEhwdxI9kMFfTrJDjre--oJhqexTh7KlKKfpqGPGa_9L8b4ue-3gmXhJZbUrSWr5qAmKLMfGTNomERMFVwPwoyFzHcJ80IBRfMYmtNI3H2c806CLKqm8lLTBuDk_WssFaDNREyeipjeRmOtslFa24-KgNhK6I2KRpJc49j1ull7Q"} />
          </button>
        </div>
      </header>

      <PaymentInfoModal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} />
    </>
  );
}