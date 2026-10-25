// ==============================================================================
// CLIENTE Y ADAPTADOR DE SUPABASE (POSTGRESQL CLOUD)
// Permite conexión directa con Supabase o modo Edge Local Híbrido
// ==============================================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Intentar leer de localStorage si el usuario configuró sus credenciales en caliente
const storedUrl = localStorage.getItem('SAFEENTRY_SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL || '';
const storedKey = localStorage.getItem('SAFEENTRY_SUPABASE_ANON_KEY') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export let supabase: SupabaseClient | null = (storedUrl && storedKey) 
  ? createClient(storedUrl, storedKey) 
  : null;

export function configureSupabase(url: string, anonKey: string) {
  if (url && anonKey) {
    localStorage.setItem('SAFEENTRY_SUPABASE_URL', url);
    localStorage.setItem('SAFEENTRY_SUPABASE_ANON_KEY', anonKey);
    supabase = createClient(url, anonKey);
    return true;
  }
  return false;
}

export function getSupabaseConfig() {
  return {
    url: localStorage.getItem('SAFEENTRY_SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: localStorage.getItem('SAFEENTRY_SUPABASE_ANON_KEY') || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    isConnected: !!supabase
  };
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return { success: false, message: 'No hay credenciales de Supabase configuradas. Operando en modo NoSQL Edge Local.' };
  }
  try {
    const { error } = await supabase.from('trabajadores_vigencias').select('count', { count: 'exact', head: true });
    if (error) {
      return { success: false, message: `Error de conexión: ${error.message}` };
    }
    return { success: true, message: 'Conexión exitosa con PostgreSQL Supabase (Producción).' };
  } catch (err: any) {
    return { success: false, message: `Fallo de red o credencial: ${err.message || 'Desconocido'}` };
  }
}
