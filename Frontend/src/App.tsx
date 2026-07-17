import { useState } from 'react';
import { ViewState } from './types';
import Login from './views/Login';
import Register from './views/Register';
import Dashboard from './views/Dashboard';
import Members from './views/Members';
import Plans from './views/Plans';
import Reports from './views/Reports';
import Layout from './components/Layout';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('login');

  if (currentView === 'login') {
    return <Login onLogin={() => setCurrentView('dashboard')} onNavigateToRegister={() => setCurrentView('register')} />;
  }

  if (currentView === 'register') {
    return <Register onRegisterComplete={() => setCurrentView('login')} onClose={() => setCurrentView('login')} />;
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