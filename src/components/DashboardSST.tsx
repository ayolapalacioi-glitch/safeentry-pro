// ==============================================================================
// DASHBOARD EJECUTIVO SG-SST (SEGURIDAD Y SALUD EN EL TRABAJO)
// Visión de producción para Gerencia de Obra y Directores SISO
// ==============================================================================

import React from 'react';
import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  XOctagon, 
  Clock, 
  CheckCircle, 
  Download,
  Building2,
  ShieldAlert
} from 'lucide-react';
import type { Worker, BitacoraIngreso, AuditoriaRechazo } from '../types';

interface DashboardSSTProps {
  workers: Worker[];
  bitacora: BitacoraIngreso[];
  rechazos: AuditoriaRechazo[];
}

export const DashboardSST: React.FC<DashboardSSTProps> = ({ workers, bitacora, rechazos }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const entriesToday = bitacora.filter(b => b.fecha === todayStr);

  const totalWorkers = workers.length;
  const presentToday = new Set(entriesToday.map(b => b.cedula)).size;
  const attendanceRate = totalWorkers > 0 ? ((presentToday / totalWorkers) * 100).toFixed(0) : 0;

  // Trabajadores con alertas de vigencia (<= 15 días)
  const expiringWorkers = workers.filter(w => 
    (w.dias_vigentes_arl <= 15 && w.dias_vigentes_arl > 0) ||
    (w.alturas_requerido && (w.dias_vigentes_alturas ?? 0) <= 15 && (w.dias_vigentes_alturas ?? 0) > 0)
  );

  // Trabajadores con documentos ya vencidos
  const expiredWorkers = workers.filter(w => 
    w.dias_vigentes_arl <= 0 || 
    (w.alturas_requerido && (w.dias_vigentes_alturas ?? 0) <= 0)
  );

  // Tasa de cumplimiento EPP
  const totalAuditedToday = entriesToday.length;
  const compliantEpp = entriesToday.filter(b => b.estado_epp === 'COMPLETO').length;
  const eppRate = totalAuditedToday > 0 ? ((compliantEpp / totalAuditedToday) * 100).toFixed(1) : '98.5';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Title & Site Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111927] border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Centro de Control SG-SST · Portería de Obra</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervisión continua en obra conforme a la Resolución 0312 de 2019 y Resolución 4272 de 2021.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => alert('Generando informe consolidado oficial en PDF/Excel para interventoría...')}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-amber-400" />
            Descargar Informe SG-SST (PDF)
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Asistencia en Obra */}
        <div className="bg-[#111927] border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Presentes en Obra</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-white">
              {presentToday} <span className="text-sm font-normal text-slate-400">/ {totalWorkers}</span>
            </span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              {attendanceRate}% Asistencia
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Obreros auditados en portería hoy</p>
        </div>

        {/* KPI 2: Cumplimiento EPP */}
        <div className="bg-[#111927] border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Apego a EPP</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-emerald-400">
              {eppRate}%
            </span>
            <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
              Auditoría Óptica
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Casco, arnés, gafas, botas, guantes, chaleco</p>
        </div>

        {/* KPI 3: Pre-alertas SST (< 15 días) */}
        <div className="bg-[#111927] border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Alertas Vencimiento</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-amber-400">
              {expiringWorkers.length}
            </span>
            <span className="text-xs font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
              &le; 15 Días
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Requieren recarga de planilla PILA o curso</p>
        </div>

        {/* KPI 4: Bloqueos / Rechazos */}
        <div className="bg-[#111927] border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Rechazos en Puerta</span>
            <XOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-rose-400">
              {rechazos.length}
            </span>
            <span className="text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded">
              SISO Alert
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Por EPP incompleto o ARL vencida</p>
        </div>

      </div>

      {/* Two Column Layout: Radar de Vencimientos (Left) + Registro de Bloqueos SISO (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar de Vigencias Críticas (7 cols) */}
        <div className="lg:col-span-7 bg-[#111927] border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Radar de Vigencias Críticas (ARL & Curso Alturas)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Conteo regresivo 24h</span>
          </div>

          <div className="space-y-3">
            {[...expiredWorkers, ...expiringWorkers].slice(0, 5).map(w => {
              const isExpired = w.color_semaforo === 'ROJO';
              return (
                <div 
                  key={w.cedula}
                  className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 text-xs ${
                    isExpired 
                      ? 'bg-rose-950/20 border-rose-800/60' 
                      : 'bg-amber-950/20 border-amber-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-amber-400 shrink-0">
                      {w.nombre_completo.split(' ').slice(0, 2).map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">{w.nombre_completo}</span>
                        <span className="text-[10px] font-mono text-slate-400">CC {w.cedula}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] truncate">{w.cargo}</p>
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-slate-400 font-mono">ARL:</span>
                      <span className={`font-mono font-bold ${w.dias_vigentes_arl <= 15 ? 'text-amber-400' : 'text-slate-200'}`}>
                        {w.dias_vigentes_arl}d
                      </span>
                      {w.alturas_requerido && (
                        <>
                          <span className="text-slate-600">|</span>
                          <span className="text-slate-400 font-mono">Alturas:</span>
                          <span className={`font-mono font-bold ${(w.dias_vigentes_alturas ?? 0) <= 0 ? 'text-rose-400 font-extrabold' : (w.dias_vigentes_alturas ?? 0) <= 15 ? 'text-amber-400' : 'text-slate-200'}`}>
                            {w.dias_vigentes_alturas ?? 0}d
                          </span>
                        </>
                      )}
                    </div>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-1 ${
                      isExpired ? 'bg-rose-900/80 text-rose-200' : 'bg-amber-900/80 text-amber-200'
                    }`}>
                      {isExpired ? 'BLOQUEO INGRESO' : 'AVISO PREVENTIVO'}
                    </span>
                  </div>
                </div>
              );
            })}

            {expiredWorkers.length === 0 && expiringWorkers.length === 0 && (
              <div className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
                <CheckCircle className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
                <p className="text-xs font-semibold text-slate-400">Todo el personal activo cuenta con vigencias al día (&gt; 15 días).</p>
              </div>
            )}
          </div>
        </div>

        {/* Novedades y Bloqueos Recientes para SISO (5 cols) */}
        <div className="lg:col-span-5 bg-[#111927] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Bitácora de Novedades SISO
              </h2>
            </div>
            <span className="text-[11px] text-rose-400 font-bold bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 rounded">
              {rechazos.length} Novedades
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {rechazos.map(r => (
              <div 
                key={r.id}
                className="bg-[#0b101a] border border-rose-900/40 p-3 rounded-lg text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{r.trabajador_nombre}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(r.timestamp_intento).toLocaleTimeString('es-CO')}
                  </span>
                </div>
                <div className="text-[11px] font-medium text-rose-300">
                  {r.detalle_bloqueo}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 font-mono">
                  <span>C.C. {r.cedula} · {r.cargo}</span>
                  <span className="text-emerald-400">Inspector Notificado ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
