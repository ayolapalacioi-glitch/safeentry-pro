// ==============================================================================
// MENÚ LATERAL ENTERPRISE (SIDEBAR DE NAVEGACIÓN) · SAFEENTRY PRO
// Interfaz Moderna, Colapsable y Profesional para Obras Civiles
// ==============================================================================

import React from 'react';
import { 
  Home, 
  ScanFace, 
  Activity, 
  FileText, 
  Users, 
  FolderArchive, 
  FileSpreadsheet, 
  BookOpen, 
  SlidersHorizontal,
  Wifi, 
  WifiOff, 
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  HardHat
} from 'lucide-react';
import type { EdgeSyncState } from '../types';
import { syncEngine } from '../services/syncEngine';

export type NavTab = 
  | 'landing' 
  | 'kiosco' 
  | 'dashboard' 
  | 'bitacora' 
  | 'trabajadores' 
  | 'expedientes' 
  | 'notas' 
  | 'manual' 
  | 'config';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  syncState: EdgeSyncState;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  syncState,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const [time, setTime] = React.useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: 'landing' as NavTab,
      label: 'Inicio & Presentación',
      icon: Home,
      badge: null
    },
    {
      id: 'kiosco' as NavTab,
      label: 'Kiosco de Portería',
      icon: ScanFace,
      badge: 'Entrada / Salida',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'dashboard' as NavTab,
      label: 'Control SST & Novedades',
      icon: Activity,
      badge: 'Semáforo',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'bitacora' as NavTab,
      label: 'Bitácora de Asistencia',
      icon: FileText,
      badge: 'Inmutable',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'trabajadores' as NavTab,
      label: 'Censo & Vigencias',
      icon: Users,
      badge: 'ARL / Alturas',
      badgeColor: 'bg-slate-200 text-slate-800'
    },
    {
      id: 'expedientes' as NavTab,
      label: 'Expediente Mensual',
      icon: FolderArchive,
      badge: null
    },
    {
      id: 'notas' as NavTab,
      label: 'Notas de Obra',
      icon: FileSpreadsheet,
      badge: 'Excel',
      badgeColor: 'bg-emerald-500 text-white font-bold'
    },
    {
      id: 'manual' as NavTab,
      label: 'Manual de Usuario',
      icon: BookOpen,
      badge: 'Guía',
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'config' as NavTab,
      label: 'Servidor Central',
      icon: SlidersHorizontal,
      badge: null
    }
  ];

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shadow-sm select-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-extrabold shadow-sm">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5 font-black text-slate-900 tracking-tight text-base font-sans">
                  <span>SafeEntry</span>
                  <span className="text-amber-600">PRO</span>
                </div>
                <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider truncate">
                  Enterprise Construction OS
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors"
            title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider font-mono">
              Módulos Operativos
            </div>
          )}

          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <IconComponent className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'text-slate-950 scale-105' : 'text-slate-500 group-hover:text-slate-800'
                }`} />

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Telemetry & Server Clock Footer */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/70">
          
          {/* Sello de Tiempo NTP */}
          <div className={`flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-lg text-xs font-mono text-slate-700 shadow-xs ${
            isCollapsed ? 'justify-center' : ''
          }`}>
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            {!isCollapsed && (
              <div className="truncate">
                <span className="font-bold text-slate-900">{time || '06:30:00 AM'}</span>
                <span className="block text-[10px] text-slate-600">Sello de Red</span>
              </div>
            )}
          </div>

          {/* Estado de Enlace / Modo Autónomo */}
          <button
            onClick={() => syncEngine.toggleSimulatedOffline()}
            title="Clic para simular desconexión de red en portería"
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium border transition-all ${
              syncState.isOnline 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100' 
                : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            {syncState.isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {!isCollapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <span className="font-bold block truncate">Enlace en Línea</span>
                    <span className="text-[10px] text-emerald-700 block truncate">Servidor Central</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600 shrink-0 animate-pulse" />
                {!isCollapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <span className="font-bold block truncate">Modo Autónomo</span>
                    <span className="text-[10px] text-rose-700 block truncate">Portería Local</span>
                  </div>
                )}
              </>
            )}

            {!isCollapsed && syncState.pendingSyncCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                {syncState.pendingSyncCount}
              </span>
            )}
          </button>

          {!isCollapsed && (
            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-600 font-mono px-1">
              <span className="flex items-center gap-1">
                <HardHat className="w-3 h-3 text-amber-600" />
                Obra Civil Activa
              </span>
              <span>v2.4 Pro</span>
            </div>
          )}

        </div>
      </aside>
    </>
  );
};
