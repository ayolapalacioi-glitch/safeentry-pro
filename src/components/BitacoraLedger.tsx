// ==============================================================================
// BITÁCORA DE INGRESOS INMUTABLE (APPEND-ONLY LEDGER)
// Cumplimiento probatorio: horas inalterables + hashes SHA-256 + fotos forenses
// ==============================================================================

import React, { useState } from 'react';
import { 
  Lock, 
  FileSpreadsheet, 
  Search, 
  Eye, 
  Hash, 
  CheckCircle2, 
  XCircle,
  Filter
} from 'lucide-react';
import type { BitacoraIngreso } from '../types';

interface BitacoraLedgerProps {
  bitacora: BitacoraIngreso[];
  onVerEvidencia: (record: BitacoraIngreso) => void;
}

export const BitacoraLedger: React.FC<BitacoraLedgerProps> = ({ bitacora, onVerEvidencia }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<string>('ALL');

  const filtered = bitacora.filter(item => {
    const matchSearch = 
      item.trabajador_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cedula.includes(searchTerm) ||
      item.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchFilter = filterResult === 'ALL' || item.resultado_ingreso === filterResult;
    return matchSearch && matchFilter;
  });

  const exportCsv = () => {
    const headers = ['ID', 'Cedula', 'Nombre', 'Cargo', 'Fecha', 'Hora_Llegada', 'Resultado', 'Estado_EPP', 'Dias_ARL', 'Dias_Alturas', 'Hash_Inmutable'];
    const rows = filtered.map(r => [
      r.id,
      r.cedula,
      `"${r.trabajador_nombre}"`,
      `"${r.cargo}"`,
      r.fecha,
      r.hora_exacta_llegada,
      r.resultado_ingreso,
      r.estado_epp,
      r.dias_vigentes_arl,
      r.dias_vigentes_alturas ?? 0,
      r.hash_inmutable
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bitacora_inmutable_sst_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      
      {/* Top Banner: Inmutable Legal Guarantee */}
      <div className="bg-[#111927] border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight font-mono">
              Bitácora Diaria Inmutable (Ledger Solo Escritura)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Registros inalterables protegidos a nivel de motor SQL (<span className="text-slate-300 font-mono">REVOKE UPDATE, DELETE</span>). 
            La hora exacta de llegada es sellada por el reloj atómico del servidor (NTP) y certificada con hash criptográfico SHA-256.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md whitespace-nowrap"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Exportar Excel / CSV Auditable
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por cédula, nombre o cargo del trabajador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#111927] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#111927] border border-slate-800 p-1 rounded-lg text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <button
            onClick={() => setFilterResult('ALL')}
            className={`px-2.5 py-1 rounded font-medium ${filterResult === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterResult('AUTORIZADO')}
            className={`px-2.5 py-1 rounded font-medium ${filterResult === 'AUTORIZADO' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800' : 'text-slate-400 hover:text-white'}`}
          >
            Autorizados
          </button>
          <button
            onClick={() => setFilterResult('PRE_ALERTA')}
            className={`px-2.5 py-1 rounded font-medium ${filterResult === 'PRE_ALERTA' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800' : 'text-slate-400 hover:text-white'}`}
          >
            Pre-alerta
          </button>
          <button
            onClick={() => setFilterResult('RECHAZADO')}
            className={`px-2.5 py-1 rounded font-medium ${filterResult === 'RECHAZADO' ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800' : 'text-slate-400 hover:text-white'}`}
          >
            Rechazados
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#111927] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b101a] border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Hora Llegada (NTP)</th>
                <th className="px-4 py-3">Trabajador & Cédula</th>
                <th className="px-4 py-3">Cargo</th>
                <th className="px-4 py-3">Estado EPP</th>
                <th className="px-4 py-3">Vigencias SST</th>
                <th className="px-4 py-3">Decisión Puerta</th>
                <th className="px-4 py-3">Hash Forense</th>
                <th className="px-4 py-3 text-right">Evidencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  
                  {/* Hora Exacta Llegada */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-white">
                    <span className="text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                      {item.hora_exacta_llegada}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-normal mt-0.5">{item.fecha}</span>
                  </td>

                  {/* Trabajador */}
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white">{item.trabajador_nombre}</div>
                    <div className="text-[11px] font-mono text-slate-400">CC {item.cedula}</div>
                  </td>

                  {/* Cargo */}
                  <td className="px-4 py-3.5 text-slate-300">
                    {item.cargo}
                  </td>

                  {/* EPP */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {item.estado_epp === 'COMPLETO' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        6/6 Conforme
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-semibold bg-rose-950/50 border border-rose-800/50 px-2 py-0.5 rounded text-[11px]" title={item.epp_faltantes.join(', ')}>
                        <XCircle className="w-3 h-3" />
                        Falta: {item.epp_faltantes.slice(0, 2).join(', ')}
                      </span>
                    )}
                  </td>

                  {/* Vigencias SST */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px]">
                    <span className="text-slate-400">ARL: </span>
                    <span className={item.dias_vigentes_arl <= 15 ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                      {item.dias_vigentes_arl}d
                    </span>
                    {item.dias_vigentes_alturas !== undefined && (
                      <>
                        <span className="text-slate-600 mx-1">|</span>
                        <span className="text-slate-400">Alturas: </span>
                        <span className={item.dias_vigentes_alturas <= 0 ? 'text-rose-400 font-bold' : item.dias_vigentes_alturas <= 15 ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                          {item.dias_vigentes_alturas}d
                        </span>
                      </>
                    )}
                  </td>

                  {/* Decisión Semáforo */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {item.resultado_ingreso === 'AUTORIZADO' ? (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                        AUTORIZADO
                      </span>
                    ) : item.resultado_ingreso === 'PRE_ALERTA' ? (
                      <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                        PRE-ALERTA
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded">
                        BLOQUEADO
                      </span>
                    )}
                  </td>

                  {/* Hash */}
                  <td className="px-4 py-3.5 font-mono text-[10px] text-slate-500 max-w-[130px] truncate" title={item.hash_inmutable}>
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3 text-amber-500/70 shrink-0" />
                      <span className="truncate">{item.hash_inmutable.substring(0, 12)}...</span>
                    </div>
                  </td>

                  {/* Acción Ver Evidencia */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => onVerEvidencia(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors border border-slate-700"
                    >
                      <Eye className="w-3 h-3 text-amber-400" />
                      Ver Foto
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
