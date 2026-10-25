// ==============================================================================
// GESTIÓN DE TRABAJADORES & MOTOR DE VIGENCIAS SST (ARL + CURSO ALTURAS)
// Descuento automático diario + actualización inmediata de planillas PILA
// ==============================================================================

import React, { useState } from 'react';
import { 
  Users, 
  RefreshCw, 
  FileCheck, 
  Anchor, 
  Edit3, 
  Search,
  User
} from 'lucide-react';
import type { Worker } from '../types';
import { updateWorkerVigencias, addDaysToToday } from '../services/dataService';

interface TrabajadoresVigenciasProps {
  workers: Worker[];
  onWorkerUpdated: () => void;
}

export const TrabajadoresVigencias: React.FC<TrabajadoresVigenciasProps> = ({ workers, onWorkerUpdated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form fields for updating documentation
  const [newArlExpiry, setNewArlExpiry] = useState('');
  const [newAlturasExpiry, setNewAlturasExpiry] = useState('');
  const [newArlEntidad, setNewArlEntidad] = useState('');

  const openUpdateModal = (worker: Worker) => {
    setSelectedWorker(worker);
    setNewArlExpiry(worker.arl_fecha_vencimiento);
    setNewAlturasExpiry(worker.alturas_fecha_vencimiento || addDaysToToday(365));
    setNewArlEntidad(worker.arl_entidad);
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    setIsUpdating(true);
    try {
      await updateWorkerVigencias(
        selectedWorker.cedula,
        newArlExpiry,
        selectedWorker.alturas_requerido ? newAlturasExpiry : undefined,
        newArlEntidad
      );
      setSelectedWorker(null);
      onWorkerUpdated();
    } catch (err) {
      console.error('Error actualizando vigencias:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = workers.filter(w =>
    w.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.cedula.includes(searchTerm) ||
    w.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      
      {/* Top Banner */}
      <div className="bg-[#111927] border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight font-mono">
              Censo Oficial de Trabajadores & Motor de Vigencias
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            El motor matemático descuenta 1 día a la medianoche (00:01 AM). 
            Al cargar una nueva planilla PILA o certificado de alturas, el contador y el semáforo se recalculan en tiempo real.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar trabajador por nombre, cédula o cargo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[#111927] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Worker Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(w => {
          const semaforoColor = 
            w.color_semaforo === 'VERDE' ? 'border-emerald-700/60 bg-emerald-950/10' :
            w.color_semaforo === 'AMARILLO' ? 'border-amber-700/60 bg-amber-950/15' :
            'border-rose-700/60 bg-rose-950/20';

          return (
            <div 
              key={w.cedula}
              className={`border rounded-xl p-4 shadow-lg flex flex-col justify-between transition-all ${semaforoColor}`}
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex flex-col items-center justify-center text-amber-400 font-bold font-mono text-sm shadow-inner shrink-0 relative overflow-hidden">
                    <User className="w-5 h-5 text-slate-400 mb-0.5" />
                    <span className="text-[9px] text-amber-400 font-bold tracking-tight">
                      {w.nombre_completo.split(' ').slice(0, 2).map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-amber-400">
                        C.C. {w.cedula}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        w.color_semaforo === 'VERDE' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                        w.color_semaforo === 'AMARILLO' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                        'bg-rose-950 text-rose-300 border-rose-800'
                      }`}>
                        {w.color_semaforo}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm truncate mt-0.5">
                      {w.nombre_completo}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{w.cargo}</p>
                  </div>
                </div>

                {/* Vigencias Status Grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                  {/* ARL */}
                  <div className="bg-[#0b101a] p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>ARL / PILA</span>
                      <FileCheck className="w-3 h-3 text-blue-400" />
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="font-mono font-bold text-sm text-white">
                        {w.dias_vigentes_arl}d
                      </span>
                      <span className="text-[10px] text-slate-400 truncate ml-1">{w.arl_entidad.split(' ')[0]}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">Vence: {w.arl_fecha_vencimiento}</div>
                  </div>

                  {/* Alturas */}
                  <div className="bg-[#0b101a] p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Curso Alturas</span>
                      <Anchor className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="font-mono font-bold text-sm text-white">
                        {w.alturas_requerido ? `${w.dias_vigentes_alturas ?? 0}d` : 'N/A'}
                      </span>
                      {w.alturas_requerido && (
                        <span className={`text-[9px] font-bold px-1 rounded ${
                          (w.dias_vigentes_alturas ?? 0) > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {(w.dias_vigentes_alturas ?? 0) > 0 ? 'OK' : 'VENCIDO'}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {w.alturas_requerido ? `Vence: ${w.alturas_fecha_vencimiento}` : 'No requiere'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button: Renew paperwork */}
              <button
                onClick={() => openUpdateModal(w)}
                className="mt-4 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                Renovar Soporte PILA / Alturas
              </button>
            </div>
          );
        })}
      </div>

      {/* Renewal Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111927] border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  Actualizar Vigencias SST
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedWorker.nombre_completo} (C.C. {selectedWorker.cedula})
                </p>
              </div>
              <button 
                onClick={() => setSelectedWorker(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Aseguradora ARL</label>
                <input
                  type="text"
                  value={newArlEntidad}
                  onChange={(e) => setNewArlEntidad(e.target.value)}
                  className="w-full p-2 bg-[#0b101a] border border-slate-700 rounded text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nueva Fecha Vencimiento ARL (Planilla PILA)</label>
                <input
                  type="date"
                  value={newArlExpiry}
                  onChange={(e) => setNewArlExpiry(e.target.value)}
                  className="w-full p-2 bg-[#0b101a] border border-slate-700 rounded text-slate-200"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  El sistema otorgará automáticamente los días restantes calculados contra la fecha actual.
                </span>
              </div>

              {selectedWorker.alturas_requerido && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nueva Fecha Vencimiento Curso Alturas (Res. 4272)</label>
                  <input
                    type="date"
                    value={newAlturasExpiry}
                    onChange={(e) => setNewAlturasExpiry(e.target.value)}
                    className="w-full p-2 bg-[#0b101a] border border-slate-700 rounded text-slate-200"
                    required
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedWorker(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5"
                >
                  {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Guardar y Recalcular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
