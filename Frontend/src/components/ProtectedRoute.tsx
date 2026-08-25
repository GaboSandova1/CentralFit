import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  
  // Si no hay token, lo mandamos a /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, dejamos pasar (renderiza el Layout o la vista)
  return <Outlet />;
}