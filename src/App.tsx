// ==============================================================================
// COMPONENTE PRINCIPAL APP - SAFEENTRY PRO
// Control Biométrico, Visión Artificial EPP y Gestión Inmutable SG-SST
// ==============================================================================

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StartupLanding } from './components/StartupLanding';
import { KioskPorteria } from './components/KioskPorteria';
import { DashboardSST } from './components/DashboardSST';
import { BitacoraLedger } from './components/BitacoraLedger';
import { TrabajadoresVigencias } from './components/TrabajadoresVigencias';
import { ExpedienteMensual } from './components/ExpedienteMensual';
import { NotesCrudView } from './components/NotesCrudView';
import { ProjectDocsView } from './components/ProjectDocsView';
import { ConfigSupabaseModal } from './components/ConfigSupabaseModal';
import { EvidenceModal } from './components/EvidenceModal';

import type { Worker, BitacoraIngreso, AuditoriaRechazo, EdgeSyncState } from './types';
import { initializeDataLayer, getWorkers, getBitacora, getRechazos } from './services/dataService';
import { syncEngine } from './services/syncEngine';

export function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'kiosco' | 'dashboard' | 'bitacora' | 'trabajadores' | 'expedientes' | 'notas' | 'docs' | 'config'>('landing');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [bitacora, setBitacora] = useState<BitacoraIngreso[]>([]);
  const [rechazos, setRechazos] = useState<AuditoriaRechazo[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<BitacoraIngreso | null>(null);
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
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center font-mono text-amber-400">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs tracking-wider">INICIALIZANDO MOTOR EDGE KIOSCO & VIGENCIAS SST...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      
      {/* Top Industrial Header with NTP Clock & State */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        syncState={syncState} 
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'landing' && (
          <StartupLanding
            onLaunchKiosk={() => setActiveTab('kiosco')}
            onLaunchDashboard={() => setActiveTab('dashboard')}
            onLaunchBitacora={() => setActiveTab('bitacora')}
            onLaunchNotes={() => setActiveTab('notas')}
            onLaunchDocs={() => setActiveTab('docs')}
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
          <NotesCrudView />
        )}

        {activeTab === 'docs' && (
          <ProjectDocsView />
        )}

        {activeTab === 'config' && (
          <ConfigSupabaseModal />
        )}
      </main>

      {/* Modal de Evidencia Forense con YOLO Overlays */}
      <EvidenceModal 
        record={selectedEvidence} 
        onClose={() => setSelectedEvidence(null)} 
      />

      {/* Corporate Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px]">
          <span className="text-slate-300 font-bold">4·90 ESPACIOS S.A.S. · CONTROL OPERATIVO & SG-SST</span>
          <span className="text-slate-400">RESOLUCIÓN 0312/2019 · RESOLUCIÓN 4272/2021 (TRABAJO SEGURO EN ALTURAS)</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
