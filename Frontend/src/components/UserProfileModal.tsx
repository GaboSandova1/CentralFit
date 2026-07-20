import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  gym: { id: string; name: string };
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFetch('/auth/me');
        if (!response.ok) throw new Error();
        setProfile(await response.json());
      } catch {
        setError('No se pudo cargar el perfil.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordSuccess(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdatePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Completa los 3 campos de contraseña.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await apiFetch('/auth/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo actualizar la contraseña');

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-surface-container rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-surface-variant w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-surface-variant">
          <h2 className="font-headline-md text-lg text-on-surface">Perfil de Administrador</h2>
          <button onClick={onClose} aria-label="Close modal" className="text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && (
            <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">error</span>
              <p className="text-body-sm text-error">{error}</p>
            </div>
          )}

          {/* Profile Image & Status */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24">
              <button disabled title="La subida de fotos aún no está conectada" className="w-full h-full rounded-full bg-primary/20 border-2 border-primary border-dashed flex items-center justify-center text-primary/50 cursor-not-allowed" aria-label="Upload photo">
                <span className="material-symbols-outlined text-2xl">add_a_photo</span>
              </button>
            </div>
            <div className="text-center">
              <h3 className="font-headline-md text-lg text-on-surface">{isLoading ? 'Cargando...' : profile?.email}</h3>
              {profile?.fullName && <p className="font-body-sm text-body-sm text-on-surface-variant">{profile.fullName}</p>}
            </div>
          </div>
          {/* User Details Grid */}
          <div className="bg-surface rounded-lg p-3 border border-surface-variant grid gap-4">
            <div className="grid grid-cols-3 items-center border-b border-surface-variant/50 pb-2">
              <span className="col-span-1 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Rol</span>
              <span className="col-span-2 font-body-md text-body-md text-on-surface text-right capitalize">{profile?.role ?? '—'}</span>
            </div>
            <div className="grid grid-cols-3 items-center">
              <span className="col-span-1 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Nombre del gimnasio</span>
              <span className="col-span-2 font-body-md text-body-md text-on-surface text-right">{profile?.gym.name ?? '—'}</span>
            </div>
          </div>
          {/* Security Section */}
          <div className="space-y-3">
            <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider">Seguridad</h4>
            <div className="bg-surface rounded-lg p-3 border border-surface-variant space-y-4">
              {passwordError && (
                <div className="bg-error/10 border border-error/30 rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[16px]">error</span>
                  <p className="text-[12px] text-error">{passwordError}</p>
                </div>
              )}
              {passwordSuccess && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                  <p className="text-[12px] text-primary">Contraseña actualizada correctamente.</p>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-label-md text-on-surface-variant">Contraseña Anterior</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="bg-surface-container border border-surface-variant rounded p-1.5 text-on-surface focus:outline-none focus:border-primary transition-colors"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-label-md text-on-surface-variant">Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="bg-surface-container border border-surface-variant rounded p-1.5 text-on-surface focus:outline-none focus:border-primary transition-colors"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-label-md text-on-surface-variant">Confirmar Contraseña</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="flex-1 bg-surface-container border border-surface-variant rounded p-1.5 text-on-surface focus:outline-none focus:border-primary transition-colors"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPassword}
                    className="px-4 py-1.5 bg-primary/20 text-primary border border-primary/50 rounded font-label-md hover:bg-primary/30 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isUpdatingPassword ? 'Actualizando...' : 'Actualizar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Modal Footer */}
        <div className="p-3 bg-surface-container-high border-t border-surface-variant flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded font-label-md text-label-md text-on-surface border border-surface-variant hover:bg-surface-variant/50 transition-colors cursor-pointer">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}