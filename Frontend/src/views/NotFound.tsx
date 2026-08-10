import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Fondo ambience */}
      <div className="absolute inset-0 z-0 bg-kinetic-grid opacity-50 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      {/* Pesas flotantes de fondo (Decorativas) */}
      <span className="material-symbols-outlined absolute top-[10%] left-[10%] text-primary/10 text-[120px] animate-[bounce_3s_ease-in-out_infinite] hidden md:block">fitness_center</span>
      <span className="material-symbols-outlined absolute bottom-[10%] right-[10%] text-primary/10 text-[150px] animate-[bounce_4s_ease-in-out_infinite] hidden md:block">sports_gymnastics</span>

      <main className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        
        {/* Escena del 404 Animada */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-8 select-none">
          
          {/* Primer 4 (Tiembla) */}
          <h1 className="font-headline-xl text-[100px] md:text-[160px] font-black text-primary leading-none tracking-tighter drop-shadow-[0_0_25px_rgba(44,195,107,0.4)] animate-[wiggle_1.5s_ease-in-out_infinite]">
            4
          </h1>

          {/* El 0 convertido en Disco de 20kg (Mismo movimiento que los 4) */}
          <div className="flex items-center justify-center animate-[wiggle_1.5s_ease-in-out_infinite_0.2s]">
            <svg viewBox="0 0 100 100" className="w-28 md:w-40 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              {/* Disco Principal (Color primario de la app) */}
              <circle cx="50" cy="50" r="45" fill="#51e084" />
              {/* Anillo interior decorativo (Color secundario) */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#2cc36b" strokeWidth="3" opacity="0.8" />
              {/* Agujero central (El centro del 0, color de fondo) */}
              <circle cx="50" cy="50" r="15" fill="#0f141a" />
              
              {/* Texto "20kg" en el disco */}
              <text x="50" y="32" fontSize="9" fill="#003919" textAnchor="middle" fontWeight="bold">20kg</text>
              <text x="50" y="75" fontSize="6" fill="#003919" textAnchor="middle" fontWeight="bold">CENTRALFIT</text>
            </svg>
          </div>

          {/* Segundo 4 (Tiembla desfasado) */}
          <h1 className="font-headline-xl text-[100px] md:text-[160px] font-black text-primary leading-none tracking-tighter drop-shadow-[0_0_25px_rgba(44,195,107,0.4)] animate-[wiggle_1.5s_ease-in-out_infinite_0.4s]">
            4
          </h1>

        </div>

        {/* Texto y Mensaje */}
        <div className="bg-surface-container/80 backdrop-blur-sm border border-outline-variant rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col items-center gap-4 animate-[fadeIn_0.8s_ease-out]">
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-error">error</span>
            ¡Página no encontrada!
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Parece que te saltaste el día de pierna... o más bien, esta página no existe o fue movida. ¡No te rindas, vuelve a la rutina principal!
          </p>

          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-fixed transition-all duration-200 shadow-[0_4px_12px_rgba(81,224,132,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none cursor-pointer mt-2"
          >
            <span className="material-symbols-outlined">home</span>
            Volver al Inicio
          </Link>
        </div>

      </main>

      {/* Animaciones personalizadas inyectadas */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}