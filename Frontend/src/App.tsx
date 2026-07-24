import { useState } from 'react';
import { ViewState } from './types';
import Login from './views/Login';
import Register from './views/Register';
import Dashboard from './views/Dashboard';
import Members from './views/Members';
import Plans from './views/Plans';
import Reports from './views/Reports';
import Layout from './components/Layout';
import SuperAdmin from './views/SuperAdmin';
import SuperAdminLogin from './views/SuperAdminLogin';
import Splash from './views/Splash';

function getInitialView(): ViewState {
  if (localStorage.getItem('adminToken')) return 'superadmin';
  if (localStorage.getItem('token') || sessionStorage.getItem('token')) return 'dashboard';
  return 'login';
}

export default function App() {

  // const [currentView, setCurrentView] = useState<ViewState>('splash');

  


  const [currentView, setCurrentView] = useState<ViewState>('splash');

  if (currentView === 'splash') {
    return <Splash onComplete={() => setCurrentView('login')} />;
  }

  if (currentView === 'login') {
    return (
      <Login
        onLogin={() => setCurrentView('dashboard')}
        onNavigateToRegister={() => setCurrentView('register')}
        onLoginSuperAdmin={() => setCurrentView('superadminlogin')}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <Register
        onRegisterComplete={() => setCurrentView('dashboard')}
        onClose={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'superadminlogin') {
    return (
      <SuperAdminLogin
        onLoginSuccess={() => setCurrentView('superadmin')}
        onBack={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'superadmin') {
    return <SuperAdmin onLogout={() => setCurrentView('login')} />;
  }

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'members' && <Members />}
      {currentView === 'plans' && <Plans />}
      {currentView === 'reports' && <Reports />}
    </Layout>
  );
}