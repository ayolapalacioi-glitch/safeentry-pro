// ==============================================================================
// CONFIGURACIÓN DE BASE DE DATOS SUPABASE & NOSQL EDGE
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  UploadCloud, 
  HardDrive,
  Terminal
} from 'lucide-react';
import { getSupabaseConfig, configureSupabase, testSupabaseConnection } from '../services/supabaseClient';
import { syncEngine } from '../services/syncEngine';
import { edgeDb } from '../services/edgeNoSqlDb';

export const ConfigSupabaseModal: React.FC = () => {
  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const [edgeStats, setEdgeStats] = useState({
    workersCount: 0,
    bitacoraCount: 0,
    rechazosCount: 0,
    pendingSyncCount: 0
  });

  const loadStats = async () => {
    try {
      const wCount = await edgeDb.workers.count();
      const bCount = await edgeDb.bitacora.count();
      const rCount = await edgeDb.rechazos.count();
      const qCount = await edgeDb.offline_queue.where('synced').equals(0).count();
      setEdgeStats({
        workersCount: wCount,
        bitacoraCount: bCount,
        rechazosCount: rCount,
        pendingSyncCount: qCount
      });
    } catch {
      // Ignorar
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    configureSupabase(supabaseUrl.trim(), anonKey.trim());
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection();
    setTestResult(res);
    setTesting(false);
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    const res = await syncEngine.processSyncQueue();
    setSyncFeedback(`Sincronización completada: ${res.synced} subidos a Supabase, ${res.failed} pendientes.`);
    await loadStats();
    setSyncing(false);
  };

  const copySqlCode = () => {
    navigator.clipboard.writeText(`-- SCHEMA EN RUTA: supabase/schema.sql
-- Ejecutar el archivo schema.sql en el SQL Editor de tu proyecto Supabase para crear las tablas.`);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#111927] border border-slate-800 p-5 rounded-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight font-mono">
              Central de Datos & Resiliencia en Obra
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestión híbrida: Sincronización continua hacia la nube y operación local autónoma a las 6:30 AM ante cualquier corte de red en obra.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Supabase Cloud Connection Panel */}
        <div className="bg-[#111927] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Servidor Central en la Nube
              </h2>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              currentConfig.isConnected 
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {currentConfig.isConnected ? 'ENLACE ACTIVO' : 'MODO LOCAL OBRA'}
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Punto de Enlace del Servidor Central (URL):
              </label>
              <input
                type="text"
                placeholder="https://490espacios.empresa.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full p-2.5 bg-[#0b101a] border border-slate-700 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Clave de Seguridad / Token de Acceso:
              </label>
              <input
                type="password"
                placeholder="token-seguridad-4-90-espacios..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full p-2.5 bg-[#0b101a] border border-slate-700 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="submit"
                disabled={testing}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Guardar y Probar Conexión'}
              </button>

              <button
                type="button"
                onClick={handleManualSync}
                disabled={syncing}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                {syncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Forzar Sync Cola'}
              </button>
            </div>
          </form>

          {testResult && (
            <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              testResult.success 
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {syncFeedback && (
            <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800 text-blue-200 text-xs">
              {syncFeedback}
            </div>
          )}
        </div>

        {/* Local Gateway Storage */}
        <div className="bg-[#111927] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Almacén Autónomo Local (Portería de Obra)
                </h2>
              </div>
              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 font-bold px-2 py-0.5 rounded font-mono">
                ACTIVO · EN LÍNEA
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Almacena localmente las fotos de dotación, sellos inmutables y colas de sincronización para que la obra jamás dependa de internet a las 6:30 AM.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#0b101a] border border-slate-800 p-3 rounded-lg">
                <span className="text-slate-400 text-[11px] block">Trabajadores en Caché</span>
                <span className="text-xl font-mono font-bold text-white">{edgeStats.workersCount}</span>
              </div>
              <div className="bg-[#0b101a] border border-slate-800 p-3 rounded-lg">
                <span className="text-slate-400 text-[11px] block">Bitácora Local</span>
                <span className="text-xl font-mono font-bold text-emerald-400">{edgeStats.bitacoraCount}</span>
              </div>
              <div className="bg-[#0b101a] border border-slate-800 p-3 rounded-lg">
                <span className="text-slate-400 text-[11px] block">Auditoría Rechazos</span>
                <span className="text-xl font-mono font-bold text-rose-400">{edgeStats.rechazosCount}</span>
              </div>
              <div className="bg-[#0b101a] border border-slate-800 p-3 rounded-lg">
                <span className="text-slate-400 text-[11px] block">Pendientes Sync Nube</span>
                <span className="text-xl font-mono font-bold text-amber-400">{edgeStats.pendingSyncCount}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#0b101a] border border-slate-800 rounded-lg text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center justify-between font-mono text-slate-300 font-bold">
              <span className="flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                Script SQL Supabase Listo:
              </span>
              <button
                type="button"
                onClick={copySqlCode}
                className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded border border-slate-700 transition-colors"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
                <span>{copiedSql ? 'Copiado' : 'Copiar Ruta'}</span>
              </button>
            </div>
            <div className="text-slate-400">
              El archivo completo está listo en <code className="text-amber-400 font-mono">supabase/schema.sql</code> con tablas, triggers de inmutabilidad, RLS y funciones.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
