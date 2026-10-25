// ==============================================================================
// COMPONENTE HEADER: BRANDING CORPORATIVO 4·90 ESPACIOS S.A.S.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Clock, 
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 lg:px-8 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand: 4·90 ESPACIOS S.A.S. */}
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-600 font-extrabold font-mono text-base shadow-sm">
            4·90
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-slate-900 text-lg font-sans">
                4·90 <span className="text-amber-600 font-bold">ESPACIOS</span>
              </span>
              <span className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-slate-200">
                S.A.S. · OBRAS CIVILES
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Obra: <span className="text-slate-800 font-semibold">Proyecto Residencial & Comercial 4·90 · Portería</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center overflow-x-auto gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'landing'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Presentación 4·90
          </button>

          <button
            onClick={() => setActiveTab('kiosco')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'kiosco'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Kiosco de Portería
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Control SST & Novedades
          </button>

          <button
            onClick={() => setActiveTab('bitacora')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'bitacora'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Bitácora Legal
          </button>

          <button
            onClick={() => setActiveTab('trabajadores')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'trabajadores'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Censo & Vigencias
          </button>

          <button
            onClick={() => setActiveTab('expedientes')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'expedientes'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Expediente Mensual
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`p-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === 'config'
                ? 'bg-slate-300 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            title="Conectividad & Central de Datos"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </nav>

        {/* Telemetry & NTP Clock */}
        <div className="flex items-center gap-3">
          {/* Sello de Tiempo Servidor */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-md text-xs font-mono text-slate-700 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-semibold tracking-wider">{time || '06:30:00 AM'}</span>
          </div>

          {/* Estado de Operación en Obra */}
          <button
            onClick={() => syncEngine.toggleSimulatedOffline()}
            title="Haz clic para probar corte de red en portería"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              syncState.isOnline 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100' 
                : 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
            }`}
          >
            {syncState.isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline font-semibold">Enlace Obra: Activo</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span className="hidden sm:inline font-bold">Modo Autónomo Local</span>
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
