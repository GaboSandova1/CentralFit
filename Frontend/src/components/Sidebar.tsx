import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenRenovation: () => void;
  onOpenSettings: () => void;
}

export default function Sidebar({ currentView, onViewChange, isOpen, onClose, onOpenRenovation, onOpenSettings }: SidebarProps) {
  const navigate = (view: ViewState) => {
    onViewChange(view);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <nav
        className={`bg-surface-container dark:bg-surface-container w-sidebar-width h-screen fixed left-0 top-0 border-r border-outline-variant dark:border-outline-variant flex flex-col py-gutter z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
      {/* Brand Header */}
      <div className="px-gutter mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <img
            alt="CentralFit Logo"
            className="h-13 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoN3nhTiWMtDPIlNWrdimpj-hogB7cmQ6CvuOkILIAf1PRz51A3XnvCDvUp7Uk-ay_uOM1AlN7Os86VK-b3q5fVwviYgDzq7ogfu378mQHWhQ53t8UFiwkI7BhUgJ2XcVg6uZE53oIdJtGola2aVTS0KViJQxGg67K41jAZsG2C5goWRYWRqDNDzMD-2yBWZLtItTAABNJx4YMfH_zVpWaFaYYa-h8H1-VE4RxG_JBSutdXRdFJXP5UhzEBg5nA0K4Fg"
          />
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary leading-none tracking-tight">
              CentralFit
            </h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Gym Management</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
          aria-label="Cerrar menú"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      
      {/* Main Navigation */}
      <ul className="flex-1 px-4 space-y-1">
        <li>
          <a
            onClick={() => navigate('dashboard')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 active:scale-95 group ${
              currentView === 'dashboard'
                ? 'text-primary font-bold border-l-4 border-primary bg-secondary-container/10'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span
              className={`material-symbols-outlined ${currentView === 'dashboard' ? 'icon-fill' : 'group-hover:text-primary transition-colors'}`}
              style={currentView === 'dashboard' ? { fontVariationSettings: '"FILL" 1' } : {}}
            >
              dashboard
            </span>
            <span className="font-body-md text-body-md">Panel</span>
          </a>
        </li>
        <li>
          <a
            onClick={() => navigate('members')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 active:scale-95 group ${
              currentView === 'members'
                ? 'text-primary font-bold border-l-4 border-primary bg-secondary-container/10'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span
              className={`material-symbols-outlined ${currentView === 'members' ? 'icon-fill' : 'group-hover:text-primary transition-colors'}`}
              style={currentView === 'members' ? { fontVariationSettings: '"FILL" 1' } : {}}
            >
              group
            </span>
            <span className="font-body-md text-body-md">Miembros</span>
          </a>
        </li>
        <li>
          <a
            onClick={() => navigate('plans')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 active:scale-95 group ${
              currentView === 'plans'
                ? 'text-primary font-bold border-l-4 border-primary bg-secondary-container/10'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span
              className={`material-symbols-outlined ${currentView === 'plans' ? 'icon-fill' : 'group-hover:text-primary transition-colors'}`}
              style={currentView === 'plans' ? { fontVariationSettings: '"FILL" 1' } : {}}
            >
              fitness_center
            </span>
            <span className="font-body-md text-body-md">Planes</span>
          </a>
        </li>
        <li>
          <a
            onClick={() => navigate('reports')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 active:scale-95 group ${
              currentView === 'reports'
                ? 'text-primary font-bold border-l-4 border-primary bg-secondary-container/10'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span
              className={`material-symbols-outlined ${currentView === 'reports' ? 'icon-fill' : 'group-hover:text-primary transition-colors'}`}
              style={currentView === 'reports' ? { fontVariationSettings: '"FILL" 1' } : {}}
            >
              analytics
            </span>
            <span className="font-body-md text-body-md">Reportes</span>
          </a>
        </li>
      </ul>
      
      {/* Bottom Actions */}
      <div className="px-4 mt-auto space-y-4">
        <button 
          onClick={onOpenRenovation}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-primary-container text-on-primary-container font-headline-md text-label-md rounded-lg hover:opacity-90 transition-all active:scale-95 mb-4 cursor-pointer"
        >
          <span className="material-symbols-outlined">autorenew</span>
          <div className="flex flex-col items-start leading-tight">
            <span>Renovación de</span>
            <span>Membresía</span>
          </div>
        </button>
        <div className="border-t border-outline-variant/50 pt-4 space-y-1">
          <a 
            onClick={onOpenSettings}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-sm text-body-sm">Configuración</span>
          </a>
          <a
            onClick={() => navigate('login')}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:text-error hover:bg-error/10 transition-colors duration-200 cursor-pointer text-error"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-sm text-body-sm">Cerrar Sesión</span>
          </a>
        </div>
      </div>
      </nav>
    </>
  );
}