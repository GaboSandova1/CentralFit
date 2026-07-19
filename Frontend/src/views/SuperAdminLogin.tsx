import { useState } from 'react';

interface SuperAdminLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function SuperAdminLogin({ onLoginSuccess, onBack }: SuperAdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Credenciales inválidas');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('adminToken', data.token);
      onLoginSuccess();
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex items-center justify-center relative overflow-hidden selection:bg-primary/30 selection:text-primary-fixed">
      <div className="absolute inset-0 z-0 bg-kinetic-grid opacity-50 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="relative z-10 w-full max-w-md p-8 bg-surface-container rounded-xl border border-outline-variant shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col gap-5 mx-4">
        <header className="text-center flex flex-col items-center gap-2 mb-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <span className="material-symbols-outlined text-[32px]">shield_person</span>
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary leading-none tracking-tight">
            Consola de Super Admin
          </h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Acceso exclusivo para administración de la plataforma
          </p>
        </header>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">error</span>
              <p className="text-body-sm text-error">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="admin-email">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">mail</span>
              <input
                className="w-full bg-surface border border-outline-variant rounded-lg py-3 pl-12 pr-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md text-body-md"
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="admin-password">
              Contraseña
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
              <input
                className="w-full bg-surface border border-outline-variant rounded-lg py-3 pl-12 pr-12 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md text-body-md"
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            className="mt-2 w-full bg-primary hover:bg-primary-fixed text-on-primary font-label-md text-label-md py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                Verificando...
              </>
            ) : (
              <>
                Ingresar
                <span className="material-symbols-outlined text-[20px]">login</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors cursor-pointer"
          >
            {/* <span className="material-symbols-outlined text-[18px]">arrow_back</span> */}
            Volver al inicio de sesión
          </button>
        </form>
      </main>
    </div>
  );
}