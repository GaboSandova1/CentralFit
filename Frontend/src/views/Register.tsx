import { useState } from 'react';

interface RegisterProps {
  onRegisterComplete: () => void;
  onClose: () => void;
}

export default function Register({ onRegisterComplete, onClose }: RegisterProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 3;

  const steps: Record<number, { title: string; label: string; percentage: string }> = {
    1: {
      title: "Datos Personales",
      label: "Paso 1 de 3",
      percentage: "33.33%"
    },
    2: {
      title: "Datos del Gimnasio",
      label: "Paso 2 de 3",
      percentage: "66.66%"
    },
    3: {
      title: "Seguridad",
      label: "Paso 3 de 3",
      percentage: "100%"
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        alert("¡Registro completado con éxito! Bienvenido a CentralFit.");
        onRegisterComplete();
      }, 1500);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex items-center justify-center relative overflow-hidden selection:bg-primary/30 selection:text-primary-fixed py-6">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 z-0 bg-kinetic-grid opacity-50 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Registration Card Container */}
      <main className="relative z-10 w-full max-w-[600px] bg-surface-container rounded-xl border border-outline-variant shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col mx-4 overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* Brand Header */}
        <div className="border-b border-outline-variant bg-surface-container-high px-6 py-4 flex items-center justify-center relative">
          <div className="flex items-center gap-3">
            <div className="size-8 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">fitness_center</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Registro de usuario CentralFit</span>
          </div>
        </div>

          {/* Progress Header */}
          <div className="px-6 pt-5 pb-3">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-1">
                  {steps[currentStep].label}
                </p>
                <h2 className="text-white text-xl font-bold font-headline">
                  {steps[currentStep].title}
                </h2>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-container transition-all duration-300 ease-in-out" 
                style={{ width: steps[currentStep].percentage }}
              ></div>
            </div>
          </div>

          {/* Wizard Steps Container */}
          <div className="px-6 py-4 grow">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              
              {/* STEP 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-on-surface text-sm font-medium">Nombre Completo (Propietario/Gerente)</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">person</span>
                        <input className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-white placeholder:text-on-secondary-container/50 focus:outline-none transition-colors" placeholder="Ej. Juan Pérez" type="text" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-on-surface text-sm font-medium">Correo Electrónico</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
                        <input className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-white placeholder:text-on-secondary-container/50 focus:outline-none transition-colors" placeholder="email@ejemplo.com" type="email" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-on-surface text-sm font-medium">Teléfono</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">call</span>
                          <input className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-white placeholder:text-on-secondary-container/50 focus:outline-none transition-colors" placeholder="+57 ..." type="tel" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-on-surface text-sm font-medium">Cédula / Documento</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">badge</span>
                          <input className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-white placeholder:text-on-secondary-container/50 focus:outline-none transition-colors" placeholder="Número de identidad" type="text" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Gym Info */}
              {currentStep === 2 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-on-surface text-sm font-medium">Nombre del Gimnasio</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">fitness_center</span>
                        <input className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-white placeholder:text-on-secondary-container/50 focus:outline-none transition-colors" placeholder="Ej. Central Power Gym" type="text" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-on-surface text-sm font-medium">Dirección</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">location_on</span>
                        <input className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-white placeholder:text-on-secondary-container/50 focus:outline-none transition-colors" placeholder="Calle 123 #45-67" type="text" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-on-surface text-sm font-medium">Teléfono del Gimnasio</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">call</span>
                        <input className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-white placeholder:text-on-secondary-container/50 focus:outline-none transition-colors" placeholder="+57 ..." type="tel" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Security */}
              {currentStep === 3 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
                    <div className="flex gap-2.5">
                      <span className="material-symbols-outlined text-primary">security</span>
                      <p className="text-xs text-on-surface-variant">Asegúrate de usar una contraseña fuerte con al menos 8 caracteres, incluyendo números y símbolos.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-on-surface text-sm font-medium">Nombre de Usuario</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">account_circle</span>
                        <input className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-white placeholder:text-on-secondary-container/50 focus:outline-none transition-colors" placeholder="Ej. juanperez123" type="text" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-on-surface text-sm font-medium">Contraseña</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock</span>
                        <input className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-white placeholder:text-on-secondary-container/50 focus:outline-none transition-colors" placeholder="••••••••" type="password" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-on-surface text-sm font-medium">Confirmar Contraseña</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock_reset</span>
                        <input className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-12 pr-4 text-white placeholder:text-on-secondary-container/50 focus:outline-none transition-colors" placeholder="••••••••" type="password" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-1">
                      <input className="rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-low" id="terms" type="checkbox" />
                      <label className="text-sm text-on-surface-variant" htmlFor="terms">Acepto los <a className="text-primary hover:underline" href="#">Términos y Condiciones</a></label>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer Navigation */}
          <div className="px-6 py-3 bg-surface-container-high border-t border-outline-variant flex items-center justify-between">
            <button 
              onClick={handlePrev}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg border border-outline text-on-surface hover:bg-surface-container transition-all cursor-pointer ${currentStep === 1 ? 'invisible' : ''}`}
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span className="font-semibold">Anterior</span>
            </button>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleNext}
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-8 py-2 rounded-lg text-on-primary hover:brightness-110 transition-all shadow-lg shadow-primary/20 cursor-pointer ${currentStep === totalSteps ? 'bg-primary-container' : 'bg-primary'}`}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span> Procesando...
                  </>
                ) : (
                  <>
                    <span className="font-bold">{currentStep === totalSteps ? "Finalizar Registro" : "Siguiente"}</span>
                    <span className="material-symbols-outlined text-[20px]">{currentStep === totalSteps ? "check_circle" : "arrow_forward"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="bg-surface-container-high pb-4 flex justify-center">
            <p className="font-body-sm text-on-surface-variant text-body-sm">
              ¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                onClick={onClose}
                className="text-primary hover:text-primary-fixed font-medium transition-colors cursor-pointer"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
      </main>
    </div>
  );
}
