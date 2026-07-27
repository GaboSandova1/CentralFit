import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { ViewState } from '../types';
import RenovationModal from './RenovationModal';
import SettingsModal from './SettingsModal';
import UserProfileModal from './UserProfileModal';

interface LayoutProps {
  children: ReactNode;
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

export default function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [renovationModalOpen, setRenovationModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  
  // Estado para forzar la actualización del Topbar
  const [refreshTopbar, setRefreshTopbar] = useState(0);
  
  // NUEVO: Estado para guardar el miembro seleccionado desde la notificación
  const [selectedMember, setSelectedMember] = useState<{ id: string; fullName: string; cedula: string; plan?: string | null; endDate?: string | null } | null>(null);

  // NUEVO: Función que se ejecuta al hacer clic en una notificación
  const handleNotificationClick = (member: any) => {
    setSelectedMember(member);
    setRenovationModalOpen(true);
  };

  return (
    <div className="bg-background text-on-background font-body-md text-body-md antialiased overflow-x-hidden min-h-screen">
      <Sidebar
        currentView={currentView}
        onViewChange={onViewChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenRenovation={() => {
          setSelectedMember(null); // Si se abre desde el sidebar, va vacío para buscar por cédula
          setRenovationModalOpen(true);
        }}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />
      <Topbar 
        onMenuClick={() => setSidebarOpen(true)} 
        onOpenProfile={() => setUserProfileModalOpen(true)} 
        refreshTrigger={refreshTopbar}
        onNotificationClick={handleNotificationClick} // NUEVO
      />
      <main className="ml-0 md:ml-sidebar-width mt-topbar-height p-4 md:p-container-padding min-h-[calc(100vh-var(--spacing-topbar-height))]">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      
      <RenovationModal 
        isOpen={renovationModalOpen} 
        onClose={() => setRenovationModalOpen(false)} 
        member={selectedMember || undefined} // NUEVO: Le pasamos el miembro
      />
      
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onSettingsSaved={() => setRefreshTopbar(prev => prev + 1)}
      />

      <UserProfileModal
        isOpen={userProfileModalOpen}
        onClose={() => setUserProfileModalOpen(false)}
        onProfileUpdated={() => setRefreshTopbar(prev => prev + 1)} // <--- AÑADIR ESTO
      />
    </div>
  );
}