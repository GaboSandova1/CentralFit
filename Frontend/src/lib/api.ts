export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function getToken(): string | null {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    window.location.reload();
  }

  return response;
}