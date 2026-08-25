import { createClient } from '@supabase/supabase-js';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
    // NUEVO (Riesgo 13): Solo borramos el token de usuario, no el de admin
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.dispatchEvent(new Event('centralFitUnauthorized'));
  }

  const method = (options.method || 'GET').toUpperCase();
  if (response.ok && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    window.dispatchEvent(new Event('centralFitDataChanged'));
  }

  return response;
}

export async function uploadProfilePicture(file: File): Promise<string> {
  // NUEVO (Riesgo 8): Validar tamaño (máx 5MB) y tipo de archivo
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La imagen es muy grande (Máximo 5MB).');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo no es una imagen válida.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from('profile-pictures')
    .upload(filePath, file);

  if (error) throw new Error('Error al subir la imagen a Supabase');

  const { data } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(filePath);

  window.dispatchEvent(new Event('centralFitDataChanged'));

  return data.publicUrl;
}