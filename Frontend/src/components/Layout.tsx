import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import RenovationModal from './RenovationModal';
import SettingsModal from './SettingsModal';
import UserProfileModal from './UserProfileModal';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [renovationModalOpen, setRenovationModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  
  const [refreshTopbar, setRefreshTopbar] = useState(0);
  const [selectedMember, setSelectedMember] = useState<{ id: string; fullName: string; cedula: string; plan?: string | null; planId?: string | null; endDate?: string | null } | null>(null);

  const handleNotificationClick = (member: any) => {
    setSelectedMember(member);
    setRenovationModalOpen(true);
  };

  return (
    <div className="bg-background text-on-background font-body-md text-body-md antialiased overflow-x-hidden min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenRenovation={() => {
          setSelectedMember(null);
          setRenovationModalOpen(true);
        }}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />
      <Topbar 
        onMenuClick={() => setSidebarOpen(true)} 
        onOpenProfile={() => setUserProfileModalOpen(true)} 
        refreshTrigger={refreshTopbar}
        onNotificationClick={handleNotificationClick}
      />
      <main className="ml-0 md:ml-sidebar-width mt-topbar-height p-4 md:p-container-padding min-h-[calc(100vh-var(--spacing-topbar-height))]">
        <div className="max-w-6xl mx-auto">
          <Outlet /> {/* Aquí se renderiza Dashboard, Members, etc. */}
        </div>
      </main>
      
      <RenovationModal 
        isOpen={renovationModalOpen} 
        onClose={() => setRenovationModalOpen(false)} 
        member={selectedMember || undefined}
      />
      
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onSettingsSaved={() => setRefreshTopbar(prev => prev + 1)}
      />

      <UserProfileModal
        isOpen={userProfileModalOpen}
        onClose={() => setUserProfileModalOpen(false)}
        onProfileUpdated={() => setRefreshTopbar(prev => prev + 1)}
      />
    </div>
  );
}