// ==============================================================================
// CLIENTE Y ADAPTADOR DE SUPABASE (POSTGRESQL CLOUD)
// Permite conexión directa con Supabase o modo Edge Local Híbrido
// Detecta automáticamente variables inyectadas por Vercel / Supabase Integration
// ==============================================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

declare const __SUPABASE_URL__: string;
declare const __SUPABASE_KEY__: string;

const envUrl = (typeof __SUPABASE_URL__ !== 'undefined' && __SUPABASE_URL__) 
  ? __SUPABASE_URL__ 
  : (import.meta.env.VITE_SUPABASE_URL || '');

const envKey = (typeof __SUPABASE_KEY__ !== 'undefined' && __SUPABASE_KEY__) 
  ? __SUPABASE_KEY__ 
  : (import.meta.env.VITE_SUPABASE_ANON_KEY || '');

// Prioridad: 1. localStorage (si el usuario la pegó manualmente en pantalla) 2. Vercel Connector 3. .env
const initialUrl = localStorage.getItem('SAFEENTRY_SUPABASE_URL') || envUrl || '';
const initialKey = localStorage.getItem('SAFEENTRY_SUPABASE_ANON_KEY') || envKey || '';

export let supabase: SupabaseClient | null = (initialUrl && initialKey) 
  ? createClient(initialUrl, initialKey) 
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
  const currentUrl = localStorage.getItem('SAFEENTRY_SUPABASE_URL') || envUrl || '';
  const currentKey = localStorage.getItem('SAFEENTRY_SUPABASE_ANON_KEY') || envKey || '';
  return {
    url: currentUrl,
    anonKey: currentKey,
    isConnected: !!supabase,
    source: (localStorage.getItem('SAFEENTRY_SUPABASE_URL') ? 'MANUAL_LOCALSTORAGE' : (envUrl ? 'VERCEL_CONNECTOR' : 'LOCAL_EDGE'))
  };
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return { success: false, message: 'No hay credenciales configuradas. Operando en modo local autónomo.' };
  }
  try {
    const { error } = await supabase.from('trabajadores_vigencias').select('count', { count: 'exact', head: true });
    if (error) {
      return { success: false, message: `Error de conexión con Supabase: ${error.message}` };
    }
    return { success: true, message: 'Conexión verificada exitosamente con PostgreSQL Supabase.' };
  } catch (err: any) {
    return { success: false, message: `Fallo de red o credencial: ${err.message || 'Desconocido'}` };
  }
}
