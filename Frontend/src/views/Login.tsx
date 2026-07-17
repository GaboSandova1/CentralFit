interface LoginProps {
  onLogin: () => void;
  onNavigateToRegister: () => void;
}

export default function Login({ onLogin, onNavigateToRegister }: LoginProps) {
  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex items-center justify-center relative overflow-hidden selection:bg-primary/30 selection:text-primary-fixed">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 z-0 bg-kinetic-grid opacity-50 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Login Card Container */}
      <main className="relative z-10 w-full max-w-md p-8 bg-surface-container rounded-xl border border-outline-variant shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col gap-5 mx-4">
        {/* Brand Header */}
        <header className="text-center flex flex-col items-center gap-2 mb-2">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBc328-7LfLxJ1Ey8LmfGCYUR6Yw1xfmUu1nHo8orS3-nFvA1mgJSjOzcPtn7MHkcQKoQRI6h5KStcypjJbT6wM3Gdqz2PZuGwHCicRy_LKEEWelwA0J0PFMV7-eAEuXF4zbJcixWnY1ZFC3KLLalfjPBkYYAqtUPEnZ3adYKWq1KJa8LrLFEp_xPOjrme379egHMzqUaLLCtN6FD1ehlpsqNZKZOTXhFDh585x0iKj2O38ib0nTlwQmagAjLeoyrYPFw"
            alt="CentralFit Logo"
            className="w-auto mb-2 mx-auto drop-shadow-[0_0_25px_rgba(44,195,107,0.6)] object-contain transition-all duration-200 h-40"
          />
          <div>
            <p className="font-label-md text-label-md uppercase tracking-wider bg-gradient-to-r from-primary to-primary-fixed bg-clip-text text-transparent drop-shadow-sm">
              Gestión centralizada para cadenas fitness
            </p>
          </div>
        </header>

        {/* Login Form */}
        <form
          aria-label="Formulario de inicio de sesión"
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onLogin();
          }}
        >
          {/* Usuario Field */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="usuario">
              Usuario
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors duration-200">
                person
              </span>
              <input
                autoComplete="username"
                className="w-full bg-surface border border-outline-variant rounded-lg py-2.5 pl-12 pr-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 font-body-md text-body-md placeholder-outline/50 shadow-inner"
                id="usuario"
                name="usuario"
                placeholder="Ingresa tu usuario"
                required
                type="text"
              />
            </div>
          </div>

          {/* Contraseña Field */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="password">
              Contraseña
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors duration-200">
                lock
              </span>
              <input
                autoComplete="current-password"
                className="w-full bg-surface border border-outline-variant rounded-lg py-2.5 pl-12 pr-12 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 font-body-md text-body-md placeholder-outline/50 shadow-inner"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                type="password"
              />
              <button
                aria-label="Mostrar contraseña"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors focus:outline-none cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">visibility_off</span>
              </button>
            </div>
          </div>

          {/* Options: Remember & Forgot Password */}
          <div className="flex justify-between items-center mt-[-8px]">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 rounded border border-outline-variant bg-surface group-hover:border-primary transition-colors">
                <input className="peer sr-only" type="checkbox" />
                <span
                  className="material-symbols-outlined absolute text-[16px] text-primary opacity-0 peer-checked:opacity-100 transition-opacity"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  check
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors select-none">
                Recordarme
              </span>
            </label>
            <a
              className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors focus:outline-none focus:underline underline-offset-4 decoration-primary/50"
              href="#"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Submit Action */}
          <button
            className="mt-4 w-full bg-primary hover:bg-primary-fixed text-on-primary font-label-md text-label-md py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(81,224,132,0.15)] hover:shadow-[0_6px_16px_rgba(81,224,132,0.25)] hover:-translate-y-[1px] active:translate-y-[1px] active:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary cursor-pointer"
            type="submit"
          >
            Ingresar
            <span className="material-symbols-outlined text-[20px]">login</span>
          </button>

          <div className="text-center mt-2">
            <p className="font-body-sm text-on-surface-variant text-body-sm">
              ¿No tienes una cuenta?{' '}
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-primary hover:text-primary-fixed font-medium transition-colors cursor-pointer"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}