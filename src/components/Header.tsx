// ==============================================================================
// COMPONENTE HEADER: ESTILO INDUSTRIAL CON SELLO DE TIEMPO NTP & ESTADO EDGE
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  HardHat, 
  SlidersHorizontal
} from 'lucide-react';
import type { EdgeSyncState } from '../types';
import { syncEngine } from '../services/syncEngine';

interface HeaderProps {
  activeTab: 'landing' | 'kiosco' | 'dashboard' | 'bitacora' | 'trabajadores' | 'expedientes' | 'config';
  setActiveTab: (tab: 'landing' | 'kiosco' | 'dashboard' | 'bitacora' | 'trabajadores' | 'expedientes' | 'config') => void;
  syncState: EdgeSyncState;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, syncState }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
      }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#0e1626] border-b border-[#1E293B] sticky top-0 z-50 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand & Construction Site Info */}
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
            <HardHat className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-lg font-mono">SAFEENTRY<span className="text-amber-400 font-sans">PRO</span></span>
              <span className="bg-slate-800 text-slate-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-slate-700">
                SG-SST v2.6
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Obra: <span className="text-slate-200 font-medium">Torre Altagracia · Portería Kiosco 01</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center overflow-x-auto gap-1 bg-[#090D16] p-1 rounded-lg border border-slate-800/80">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'landing'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Presentación Startup
          </button>

          <button
            onClick={() => setActiveTab('kiosco')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'kiosco'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Terminal Kiosco
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Dashboard SST
          </button>

          <button
            onClick={() => setActiveTab('bitacora')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'bitacora'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Bitácora Inmutable
          </button>

          <button
            onClick={() => setActiveTab('trabajadores')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'trabajadores'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Censo & Vigencias
          </button>

          <button
            onClick={() => setActiveTab('expedientes')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'expedientes'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Expediente Mensual
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`p-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === 'config'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Configuración Supabase & NoSQL"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </nav>

        {/* Telemetry & NTP Clock */}
        <div className="flex items-center gap-3">
          {/* NTP Clock */}
          <div className="flex items-center gap-1.5 bg-[#090D16] border border-slate-800 px-3 py-1 rounded-md text-xs font-mono text-slate-200">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold tracking-wider">{time || '06:30:00 AM'}</span>
          </div>

          {/* Edge / Sync State Pill */}
          <button
            onClick={() => syncEngine.toggleSimulatedOffline()}
            title="Haz clic para alternar corte de internet en obra"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              syncState.isOnline 
                ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/50' 
                : 'bg-rose-950/60 border-rose-700/60 text-rose-300 hover:bg-rose-900/60'
            }`}
          >
            {syncState.isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Edge Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="hidden sm:inline">Sin Internet (NoSQL Activo)</span>
              </>
            )}
            
            {syncState.pendingSyncCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-1">
                {syncState.pendingSyncCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
