// ==============================================================================
// COMPONENTE PRINCIPAL APP - SAFEENTRY PRO
// Control Biométrico, Visión Artificial EPP y Gestión Inmutable SG-SST
// ==============================================================================

import { useState, useEffect } from 'react';
import { Sidebar, type NavTab } from './components/Sidebar';
import { StartupLanding } from './components/StartupLanding';
import { KioskPorteria } from './components/KioskPorteria';
import { DashboardSST } from './components/DashboardSST';
import { BitacoraLedger } from './components/BitacoraLedger';
import { TrabajadoresVigencias } from './components/TrabajadoresVigencias';
import { ExpedienteMensual } from './components/ExpedienteMensual';
import { ExcelContratistasView } from './components/ExcelContratistasView';
import { UserManualView } from './components/UserManualView';
import { ConfigSupabaseModal } from './components/ConfigSupabaseModal';
import { EvidenceModal } from './components/EvidenceModal';
import { Menu, ShieldCheck } from 'lucide-react';

import type { Worker, BitacoraIngreso, AuditoriaRechazo, EdgeSyncState } from './types';
import { initializeDataLayer, getWorkers, getBitacora, getRechazos } from './services/dataService';
import { syncEngine } from './services/syncEngine';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('landing');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [bitacora, setBitacora] = useState<BitacoraIngreso[]>([]);
  const [rechazos, setRechazos] = useState<AuditoriaRechazo[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<BitacoraIngreso | null>(null);
  
  // Sidebar states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const [syncState, setSyncState] = useState<EdgeSyncState>({
    isOnline: navigator.onLine,
    pendingSyncCount: 0,
    lastSyncTimestamp: null,
    supabaseConnected: false,
    edgeDbReady: true
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Carga inicial de datos
  const reloadData = async () => {
    try {
      const [wList, bList, rList] = await Promise.all([
        getWorkers(),
        getBitacora(),
        getRechazos()
      ]);
      setWorkers(wList);
      setBitacora(bList);
      setRechazos(rList);
    } catch (err) {
      console.error('Error cargando datos de portería:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await initializeDataLayer();
      await reloadData();
      setLoading(false);
    };
    init();

    const unsubscribe = syncEngine.subscribe((state) => {
      setSyncState({ ...state });
    });

    return () => unsubscribe();
  }, []);

  const handleIngresoRegistrado = async () => {
    await reloadData();
    syncEngine.updatePendingCount();
  };

  const handleWorkerUpdated = async () => {
    await reloadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-mono text-amber-400">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs tracking-wider">INICIALIZANDO MOTOR EDGE KIOSCO & VIGENCIAS SST...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col md:flex-row font-sans">
      
      {/* Menú Lateral Enterprise (Sidebar) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        syncState={syncState}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Top Header */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-700"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span className="font-extrabold text-slate-900 text-sm">
                SafeEntry <span className="text-amber-600">PRO</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700 border border-slate-200">
              Obra Civil
            </span>
          </div>
        </header>

        {/* Dynamic View Content */}
        <main className="flex-1 pb-12">
          {activeTab === 'landing' && (
            <StartupLanding 
              onLaunchKiosk={() => setActiveTab('kiosco')}
              onLaunchDashboard={() => setActiveTab('dashboard')}
              onLaunchBitacora={() => setActiveTab('bitacora')}
              onLaunchNotes={() => setActiveTab('notas')}
              onLaunchManual={() => setActiveTab('manual')}
            />
          )}

          {activeTab === 'kiosco' && (
            <KioskPorteria 
              workers={workers} 
              onIngresoRegistrado={handleIngresoRegistrado} 
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardSST 
              workers={workers} 
              bitacora={bitacora} 
              rechazos={rechazos} 
            />
          )}

          {activeTab === 'bitacora' && (
            <BitacoraLedger 
              bitacora={bitacora} 
              onVerEvidencia={(rec) => setSelectedEvidence(rec)} 
            />
          )}

          {activeTab === 'trabajadores' && (
            <TrabajadoresVigencias 
              workers={workers} 
              onWorkerUpdated={handleWorkerUpdated} 
            />
          )}

          {activeTab === 'expedientes' && (
            <ExpedienteMensual 
              workers={workers} 
              bitacora={bitacora} 
            />
          )}

          {activeTab === 'notas' && (
            <ExcelContratistasView 
              workers={workers} 
              onWorkersReloaded={reloadData} 
            />
          )}

          {activeTab === 'manual' && (
            <UserManualView />
          )}

          {activeTab === 'config' && (
            <ConfigSupabaseModal />
          )}
        </main>

        {/* Modal de Evidencia Forense con Visión Computacional */}
        <EvidenceModal 
          record={selectedEvidence} 
          onClose={() => setSelectedEvidence(null)} 
        />

        {/* Corporate Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px]">
            <span className="text-slate-300 font-bold">SAFEENTRY PRO · CONTROL BIOMÉTRICO & SG-SST</span>
            <span className="text-slate-400">RESOLUCIÓN 0312/2019 · RESOLUCIÓN 4272/2021 (TRABAJO EN ALTURAS)</span>
          </div>
        </footer>

      </div>

    </div>
  );
}

export default App;
