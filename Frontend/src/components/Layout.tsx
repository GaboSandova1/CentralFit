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
  
  // Estado para forzar la actualización del Topbar cuando cambian las configuraciones
  const [refreshTopbar, setRefreshTopbar] = useState(0);

  return (
    <div className="bg-background text-on-background font-body-md text-body-md antialiased overflow-x-hidden min-h-screen">
      <Sidebar
        currentView={currentView}
        onViewChange={onViewChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenRenovation={() => setRenovationModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />
      <Topbar 
        onMenuClick={() => setSidebarOpen(true)} 
        onOpenProfile={() => setUserProfileModalOpen(true)} 
        refreshTrigger={refreshTopbar} 
      />
      <main className="ml-0 md:ml-sidebar-width mt-topbar-height p-4 md:p-container-padding min-h-[calc(100vh-var(--spacing-topbar-height))]">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      
      <RenovationModal 
        isOpen={renovationModalOpen} 
        onClose={() => setRenovationModalOpen(false)} 
      />
      
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onSettingsSaved={() => setRefreshTopbar(prev => prev + 1)} // <--- AQUÍ SE AVISA AL TOPBAR
      />

      <UserProfileModal
        isOpen={userProfileModalOpen}
        onClose={() => setUserProfileModalOpen(false)}
      />
    </div>
  );
}