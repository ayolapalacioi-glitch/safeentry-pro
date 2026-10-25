// ==============================================================================
// VISTA STARTUP SHOWCASE / PRESENTACIÓN EJECUTIVA PARA CLIENTES Y GERENCIA
// Diseñado para proyectar alta credibilidad, solvencia técnica y ROI inmediato
// ==============================================================================

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  HardHat, 
  Zap, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Cpu, 
  Activity, 
  Eye
} from 'lucide-react';

interface StartupLandingProps {
  onLaunchKiosk: () => void;
  onLaunchDashboard: () => void;
  onLaunchBitacora: () => void;
}

export const StartupLanding: React.FC<StartupLandingProps> = ({
  onLaunchKiosk,
  onLaunchDashboard,
  onLaunchBitacora
}) => {
  // Calculadora interactiva de ROI para el cliente
  const [numTrabajadores, setNumTrabajadores] = useState<number>(120);
  const [diasMes, setDiasMes] = useState<number>(24);
  
  // Supuestos de ahorro en construcción (horas fantasma y contingencias SST evitadas)
  const ahorroNominaEstimado = Math.round(numTrabajadores * diasMes * 18500 * 0.08); // 8% de ineficiencia por marcación manual
  const riesgoSancionEvitado = 23200000; // Sanción típica Mintrabajo por falta de EPP / Alturas

  return (
    <div className="space-y-16 py-8">
      
      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-4 text-center space-y-6">
        
        {/* Startup Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Plataforma de Visión Artificial & Biometría SST en Obra Civil
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
          La Portería de Obra Inteligente <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500">
            Con Auditoría Inmutable en &lt; 1.5 Segundos
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
          Integramos hardware biométrico facial, visión por computadora en tiempo real (YOLOv11) y base de datos relacional inalterable para certificar la hora exacta de llegada, verificar los 6 implementos EPP obligatorios y auditar la vigencia de ARL y Alturas antes de liberar el torniquete.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onLaunchKiosk}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2 group active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 fill-current text-slate-950" />
            <span>Iniciar Terminal Kiosco en Vivo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onLaunchDashboard}
            className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold rounded-xl text-sm transition-all border border-slate-700/80 flex items-center gap-2 shadow-sm"
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Ver Centro de Control SG-SST</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Resolución 0312 de 2019 (SG-SST)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Resolución 4272 de 2021 (Alturas)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Edge-First (Opera sin internet a las 6:30 AM)</span>
          </div>
        </div>

      </section>

      {/* The 3 Core Pillars (From Technical Proposal) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            Alcance Funcional de Producción
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Tres Motores de Misión Crítica en un Solo Paso
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1 */}
          <div className="bg-[#111927] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                1. Biometría Facial & Hora Inalterable
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conexión por Webhook/SDK al lector facial de la obra. Registra la cédula y estampa el sello de tiempo atómico (NTP) en una bitácora de solo escritura que no se puede editar ni borrar.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>REVOKE UPDATE, DELETE a nivel SQL</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#111927] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <HardHat className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                2. Auditoría EPP con Visión Artificial
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cámara IP RTSP de cuerpo entero calibrada con el modelo YOLOv11. Verifica en milisegundos: casco, gafas, chaleco, guantes, botas de seguridad y arnés, guardando la foto forense.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>6 implementos auditados con &gt;96% conf.</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#111927] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                3. Conteo Regresivo ARL & Alturas
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Motor automatizado que descuenta 1 día cada mañana de forma autónoma. Alerta con 15 días de anticipación y bloquea automáticamente el torniquete si la cobertura está en 0 días.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Worker Cron a las 00:01 AM</span>
            </div>
          </div>

        </div>
      </section>

      {/* ROI & Impact Calculator for the Construction Director */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-[#111927] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                Retorno de Inversión (ROI)
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                ¿Cuánto ahorra la constructora con SafeEntry Pro?
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Elimina por completo la <strong className="text-slate-200">"nómina fantasma"</strong> (cobro de jornales no laborados) y blinda legalmente el patrimonio frente a demandas por accidentes de trabajadores sin ARL o sin arnés.
              </p>

              {/* Sliders */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Cuadrilla activa en obra:</span>
                    <span className="text-amber-400 font-bold">{numTrabajadores} trabajadores</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="500"
                    step="10"
                    value={numTrabajadores}
                    onChange={(e) => setNumTrabajadores(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Días laborados por mes:</span>
                    <span className="text-amber-400 font-bold">{diasMes} días</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="30"
                    value={diasMes}
                    onChange={(e) => setDiasMes(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Impact Metrics Card */}
            <div className="lg:col-span-6 bg-[#0b101a] border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-slate-400 uppercase">Impacto Mensual Estimado</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold px-2 py-0.5 rounded">
                  Ahorro Inmediato
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Ahorro en Nómina y Fraude de Asistencia:</span>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                  ${ahorroNominaEstimado.toLocaleString('es-CO')} <span className="text-sm text-slate-400 font-normal">COP/mes</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Blindaje de Sanción Legal por Accidente:</span>
                <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                  Hasta ${riesgoSancionEvitado.toLocaleString('es-CO')} <span className="text-xs text-slate-400 font-normal">COP</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Sanciones Art. 13 Ley 1562 y Res. 4272 por omisión de EPP/alturas.</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Tiempo de retorno de inversión:</span>
                <span className="text-white font-bold font-mono">&lt; 45 días</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Commercial Roadmap & Phases (From Commercial Proposal) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            Cronograma de Salida a Producción
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Entrega Llave en Mano en 8 a 10 Semanas
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Esquema estructurado por hitos verificables: 40% al inicio, 30% en prototipo funcional y 30% en despliegue definitivo en portería.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { fase: 'Fase 1', sem: 'Sem. 1–2', titulo: 'Integración Biométrica', desc: 'Captura en vivo del rostro, cédula y estampa NTP inmutable.' },
            { fase: 'Fase 2', sem: 'Sem. 3–4', titulo: 'Motor SST & Base Mensual', desc: 'Descuento diario automático de ARL y carpetas mensuales.' },
            { fase: 'Fase 3', sem: 'Sem. 5–6', titulo: 'Visión YOLOv11', desc: 'Calibración con la dotación real de la obra (los 6 implementos).' },
            { fase: 'Fase 4', sem: 'Sem. 7', titulo: 'Kiosco & Panel Admin', desc: 'Pantalla semáforo para el guardia y dashboard para interventoría.' },
            { fase: 'Fase 5', sem: 'Sem. 8–10', titulo: 'Despliegue en Obra', desc: 'Marcha blanca con cuadrillas reales a las 6:30 AM y entrega final.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#111927] border border-slate-800 rounded-xl p-4 space-y-2 relative">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-amber-400 font-bold">{item.fase}</span>
                <span className="text-slate-500">{item.sem}</span>
              </div>
              <h4 className="font-bold text-white text-xs">{item.titulo}</h4>
              <p className="text-[11px] text-slate-400 leading-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Live Demo Launcher */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-b from-[#111927] to-[#0c121d] border border-amber-500/30 rounded-2xl p-8 space-y-4 shadow-2xl">
          <h3 className="text-2xl font-bold text-white">¿Listo para probar el sistema en vivo?</h3>
          <p className="text-xs text-slate-300 max-w-lg mx-auto">
            Accede a la terminal interactiva de portería para auditar obreros con la cámara, simular el torniquete y verificar la bitácora legal.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={onLaunchKiosk}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
            >
              Abrir Kiosco de Portería Ahora
            </button>
            <button
              onClick={onLaunchBitacora}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors border border-slate-700"
            >
              Explorar Bitácora Inmutable
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
