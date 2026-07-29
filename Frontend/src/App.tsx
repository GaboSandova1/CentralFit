import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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

// Wrappers para adaptar las props a useNavigate
const LoginWrapper = () => {
  const navigate = useNavigate();
  return (
    <Login
      onLogin={() => navigate('/dashboard')}
      onNavigateToRegister={() => navigate('/register')}
      onLoginSuperAdmin={() => navigate('/superadminlogin')}
    />
  );
};

const RegisterWrapper = () => {
  const navigate = useNavigate();
  return (
    <Register
      onRegisterComplete={() => navigate('/dashboard')}
      onClose={() => navigate('/login')}
    />
  );
};

const SuperAdminLoginWrapper = () => {
  const navigate = useNavigate();
  return (
    <SuperAdminLogin
      onLoginSuccess={() => navigate('/superadmin')}
      onBack={() => navigate('/login')}
    />
  );
};

const SuperAdminWrapper = () => {
  const navigate = useNavigate();
  return <SuperAdmin onLogout={() => navigate('/login')} />;
};

function getInitialRoute() {
  if (localStorage.getItem('adminToken')) return '/superadmin';
  if (localStorage.getItem('token')) return '/dashboard';
  return '/login';
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={getInitialRoute()} replace />} />
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/register" element={<RegisterWrapper />} />
        <Route path="/superadminlogin" element={<SuperAdminLoginWrapper />} />
        <Route path="/superadmin" element={<SuperAdminWrapper />} />
        
        {/* Rutas protegidas que usan el Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        {/* Si la URL no existe, lo mandamos al inicio */}
        <Route path="*" element={<Navigate to={getInitialRoute()} replace />} />
      </Routes>
    </BrowserRouter>
  );
}