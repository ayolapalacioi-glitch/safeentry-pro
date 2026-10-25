// ==============================================================================
// MODAL DE EVIDENCIA FORENSE VISUAL (YOLOv11 OVERLAY & HASH)
// ==============================================================================

import React from 'react';
import { Hash, X, HardHat } from 'lucide-react';
import type { BitacoraIngreso } from '../types';

interface EvidenceModalProps {
  record: BitacoraIngreso | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111927] border border-slate-700 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0b101a] px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardHat className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-sm text-white">
              EVIDENCIA FORENSE DE INGRESO · {record.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Photo Container with Tactical Stamping */}
          <div className="relative rounded-lg overflow-hidden border border-slate-700 aspect-video bg-black flex items-center justify-center">
            <img
              src={record.foto_evidencia_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&fit=crop'}
              alt="Evidencia Forense"
              className="w-full h-full object-cover"
            />

            {/* Tactical Stamped Overlays */}
            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded font-mono text-[11px] text-slate-200 border border-slate-700">
              <div className="text-amber-400 font-bold">HORA EXACTA: {record.hora_exacta_llegada}</div>
              <div>FECHA: {record.fecha}</div>
              <div>OBRA: 4·90 ESPACIOS S.A.S. - PORTERÍA PRINCIPAL</div>
            </div>

            <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md px-3 py-2 rounded font-mono text-[11px] text-slate-200 border border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-slate-400">TRABAJADOR: </span>
                <span className="font-bold text-white">{record.trabajador_nombre} (CC {record.cedula})</span>
              </div>
              <div className={`font-bold ${record.resultado_ingreso === 'AUTORIZADO' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {record.resultado_ingreso}
              </div>
            </div>
          </div>

          {/* EPP Verification Matrix */}
          <div className="bg-[#0b101a] border border-slate-800 p-4 rounded-lg space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Diagnóstico de Dotación EPP en Ingreso:
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {Object.entries(record.epp_detectados).map(([key, detected]) => (
                <div 
                  key={key} 
                  className={`p-2 rounded border flex items-center justify-between ${
                    detected 
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' 
                      : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                  }`}
                >
                  <span className="capitalize">{key.replace('_', ' ')}</span>
                  <span className="font-mono font-bold">{detected ? '✓ OK' : '✗ FALTA'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Immutable Cryptographic Digest */}
          <div className="bg-[#0b101a] border border-slate-800 p-3.5 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Hash className="w-3.5 h-3.5 text-amber-400" />
              <span>Sello Criptográfico Inmutable (SHA-256 Ledger):</span>
            </div>
            <div className="font-mono text-xs text-amber-300 bg-slate-900/90 p-2 rounded border border-slate-800 break-all select-all">
              {record.hash_inmutable}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Sello inmutable encadenado con el registro anterior. Garantía de no repudiación.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#0b101a] px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors"
          >
            Cerrar Evidencia
          </button>
        </div>

      </div>
    </div>
  );
};
