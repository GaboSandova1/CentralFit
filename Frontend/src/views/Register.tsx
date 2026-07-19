import { useState } from 'react';

interface RegisterProps {
  onRegisterComplete: (token: string) => void;
  onClose: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  cedula: string;
  gymName: string;
  address: string;
  gymPhone: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Register({ onRegisterComplete, onClose }: RegisterProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const totalSteps = 3;

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    cedula: '',
    gymName: '',
    address: '',
    gymPhone: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Para cédula y teléfonos: filtra cualquier caracter que no sea número mientras se escribe
  const updateDigitsOnly = (field: keyof FormData, value: string, maxLength: number) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, maxLength);
    updateField(field, digitsOnly);
  };

  const steps: Record<number, { title: string; label: string; percentage: string }> = {
    1: { title: 'Datos Personales', label: 'Paso 1 de 3', percentage: '33.33%' },
    2: { title: 'Datos del Gimnasio', label: 'Paso 2 de 3', percentage: '66.66%' },
    3: { title: 'Seguridad', label: 'Paso 3 de 3', percentage: '100%' },
  };

  function validateStep(step: number): string | null {
    if (step === 1) {
      if (!formData.fullName.trim()) return 'El nombre completo es requerido';
      if (!formData.email.trim()) return 'El correo electrónico es requerido';
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) return 'El correo no tiene un formato válido';
      if (!formData.phone.trim()) return 'El teléfono es requerido';
      if (!/^\d{11}$/.test(formData.phone)) return 'El teléfono debe tener exactamente 11 números';
      if (!formData.cedula.trim()) return 'La cédula es requerida';
      if (!/^\d{7,8}$/.test(formData.cedula)) return 'La cédula debe tener entre 7 y 8 números';
    }
    if (step === 2) {
      if (!formData.gymName.trim()) return 'El nombre del gimnasio es requerido';
      if (!formData.address.trim()) return 'La dirección es requerida';
      if (!formData.gymPhone.trim()) return 'El teléfono del gimnasio es requerido';
      if (!/^\d{11}$/.test(formData.gymPhone)) return 'El teléfono del gimnasio debe tener exactamente 11 números';
    }
    if (step === 3) {
      if (formData.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
      if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden';
      if (!formData.acceptedTerms) return 'Debes aceptar los Términos y Condiciones';
    }
    return null;
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return;
    }

    setError(null);
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data?.display_name) {
            updateField('address', data.display_name);
          } else {
            setError('No se pudo determinar tu dirección exacta. Escríbela manualmente.');
          }
        } catch {
          setError('No se pudo obtener la dirección. Escríbela manualmente.');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setError('No se pudo acceder a tu ubicación. Revisa los permisos del navegador.');
        setIsLocating(false);
      }
    );
  };

  const handleNext = async () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // Último paso: enviar al backend
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          cedula: formData.cedula,
          gymName: formData.gymName,
          address: formData.address,
          gymPhone: formData.gymPhone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ocurrió un error al registrar tu gimnasio');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('token', data.token);
      onRegisterComplete(data.token);
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  const handlePrev = () => {
    setError(null);
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex items-center justify-center relative overflow-hidden selection:bg-primary/30 selection:text-primary-fixed py-6">
      <div className="absolute inset-0 z-0 bg-kinetic-grid opacity-50 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="relative z-10 w-full max-w-[600px] bg-surface-container rounded-xl border border-outline-variant shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col mx-4 overflow-hidden">

        <div className="border-b border-outline-variant bg-surface-container-high px-6 py-4 flex items-center justify-center relative">
          <div className="flex items-center gap-3">
            <div className="size-8 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">fitness_center</span>
            </div>
            <span className="text-on-surface font-bold text-xl tracking-tight">Registro de usuario CentralFit</span>
          </div>
        </div>

        <div className="px-6 pt-5 pb-3">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-1">
                {steps[currentStep].label}
              </p>
              <h2 className="text-on-surface text-xl font-bold font-headline-md">
                {steps[currentStep].title}
              </h2>
            </div>
          </div>
          <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-container transition-all duration-300 ease-in-out"
              style={{ width: steps[currentStep].percentage }}
            ></div>
          </div>
        </div>

        <div className="px-6 py-4 grow">
          {error && (
            <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-2.5 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">error</span>
              <p className="text-body-sm text-error">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {currentStep === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-on-surface text-sm font-medium">Nombre Completo (Propietario/Gerente)</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">person</span>
                      <input
                        className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-secondary-container/50 focus:outline-none transition-colors"
                        placeholder="Ej. Juan Pérez"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-on-surface text-sm font-medium">Correo Electrónico</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
                      <input
                        className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-secondary-container/50 focus:outline-none transition-colors"
                        placeholder="email@ejemplo.com"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-on-surface text-sm font-medium">Teléfono</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">call</span>
                        <input
                          className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-secondary-container/50 focus:outline-none transition-colors"
                          placeholder="04121234567"
                          type="tel"
                          inputMode="numeric"
                          maxLength={11}
                          value={formData.phone}
                          onChange={(e) => updateDigitsOnly('phone', e.target.value, 11)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-on-surface text-sm font-medium">Cédula / Documento</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">badge</span>
                        <input
                          className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-secondary-container/50 focus:outline-none transition-colors"
                          placeholder="12345678"
                          type="text"
                          inputMode="numeric"
                          maxLength={8}
                          value={formData.cedula}
                          onChange={(e) => updateDigitsOnly('cedula', e.target.value, 8)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-on-surface text-sm font-medium">Nombre del Gimnasio</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">fitness_center</span>
                      <input
                        className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-secondary-container/50 focus:outline-none transition-colors"
                        placeholder="Ej. Central Power Gym"
                        type="text"
                        value={formData.gymName}
                        onChange={(e) => updateField('gymName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-on-surface text-sm font-medium">Dirección</label>
                      <button
                        type="button"
                        onClick={handleUseLocation}
                        disabled={isLocating}
                        className="flex items-center gap-1 text-primary hover:text-primary-fixed text-xs font-medium transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <span className={`material-symbols-outlined text-[16px] ${isLocating ? 'animate-spin' : ''}`}>
                          {isLocating ? 'sync' : 'my_location'}
                        </span>
                        {isLocating ? 'Localizando...' : 'Usar mi ubicación actual'}
                      </button>
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">location_on</span>
                      <input
                        className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-secondary-container/50 focus:outline-none transition-colors"
                        placeholder="Calle 123 #45-67"
                        type="text"
                        value={formData.address}
                        onChange={(e) => updateField('address', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-on-surface text-sm font-medium">Teléfono del Gimnasio</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">call</span>
                      <input
                        className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-secondary-container/50 focus:outline-none transition-colors"
                        placeholder="04121234567"
                        type="tel"
                        inputMode="numeric"
                        maxLength={11}
                        value={formData.gymPhone}
                        onChange={(e) => updateDigitsOnly('gymPhone', e.target.value, 11)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
                  <div className="flex gap-2.5">
                    <span className="material-symbols-outlined text-primary">security</span>
                    <p className="text-xs text-on-surface-variant">Asegúrate de usar una contraseña fuerte con al menos 8 caracteres, incluyendo números y símbolos.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-on-surface text-sm font-medium">Contraseña</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock</span>
                      <input
                        className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-12 text-on-surface placeholder:text-on-secondary-container/50 focus:outline-none transition-colors"
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-on-surface text-sm font-medium">Confirmar Contraseña</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock_reset</span>
                      <input
                        className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-12 text-on-surface placeholder:text-on-secondary-container/50 focus:outline-none transition-colors"
                        placeholder="••••••••"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                        aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showConfirmPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5 rounded border border-outline-variant bg-surface group-hover:border-primary transition-colors">
                        <input
                          className="peer sr-only"
                          id="terms"
                          type="checkbox"
                          checked={formData.acceptedTerms}
                          onChange={(e) => updateField('acceptedTerms', e.target.checked)}
                        />
                        <span
                          className="material-symbols-outlined absolute text-[16px] text-primary opacity-0 peer-checked:opacity-100 transition-opacity"
                          style={{ fontVariationSettings: '"FILL" 1' }}
                        >
                          check
                        </span>
                      </div>
                      <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors select-none">
                        Acepto los <a className="text-primary hover:underline relative z-10" href="#">Términos y Condiciones</a>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="px-6 py-3 bg-surface-container-high border-t border-outline-variant flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg border border-outline text-on-surface hover:bg-surface-container transition-all cursor-pointer ${currentStep === 1 ? 'invisible' : ''}`}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="font-semibold">Anterior</span>
          </button>
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-8 py-2 rounded-lg text-on-primary hover:brightness-110 transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-60 ${currentStep === totalSteps ? 'bg-primary-container' : 'bg-primary'}`}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span> Procesando...
              </>
            ) : (
              <>
                <span className="font-bold">{currentStep === totalSteps ? 'Finalizar Registro' : 'Siguiente'}</span>
                <span className="material-symbols-outlined text-[20px]">{currentStep === totalSteps ? 'check_circle' : 'arrow_forward'}</span>
              </>
            )}
          </button>
        </div>
        <div className="bg-surface-container-high pb-4 flex justify-center">
          <p className="font-body-sm text-on-surface-variant text-body-sm">
            ¿Ya tienes una cuenta?{' '}
            <button type="button" onClick={onClose} className="text-primary hover:text-primary-fixed font-medium transition-colors cursor-pointer">
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}