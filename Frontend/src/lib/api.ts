import { createClient } from '@supabase/supabase-js';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Configuración de Supabase
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
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    window.location.reload();
  }

  return response;
}

// Helper para subir imágenes a Supabase Storage
export async function uploadProfilePicture(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from('profile-pictures')
    .upload(filePath, file);

  if (error) throw new Error('Error al subir la imagen');

  // Obtener URL pública
  const { data } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(filePath);

  return data.publicUrl;
}