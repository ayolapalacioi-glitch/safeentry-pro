// ==============================================================================
// VISTA CORPORATIVA: 4·90 ESPACIOS S.A.S. - CONTROL INTELIGENTE DE OBRA & SG-SST
// Diseño Arquitectónico Profesional, Limpio y Enfocado a Resultados de Construcción
// ==============================================================================

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  HardHat, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Activity, 
  Eye, 
  Lock, 
  FileCheck2, 
  ChevronRight
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
  // Calculadora interactiva de ahorro en obra civil
  const [numTrabajadores, setNumTrabajadores] = useState<number>(120);
  const [diasMes, setDiasMes] = useState<number>(24);
  
  // 8% de ahorro en ineficiencia de asistencia + jornadas ficticias
  const ahorroNominaEstimado = Math.round(numTrabajadores * diasMes * 19500 * 0.08);
  const riesgoSancionEvitado = 25000000; // Sanción típica Mintrabajo por laborar sin ARL / Alturas

  return (
    <div className="bg-slate-50 text-slate-800 space-y-16 py-6 font-sans">
      
      {/* Hero Section con Imagen Real de Obra Civil */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                4·90 ESPACIOS S.A.S. · DIVISIÓN DE OBRAS CIVILES
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Control Inteligente de Portería, <br />
                <span className="text-amber-600">Dotación EPP y Seguridad SST</span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                Solución operativa diseñada a la medida de las obras de <strong className="text-slate-900">4·90 Espacios</strong>: 
                audita en menos de 1.5 segundos la identidad del obrero, verifica que porte sus 6 implementos obligatorios 
                y valida en tiempo real la vigencia de su ARL y Curso de Alturas antes de autorizar el ingreso.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onLaunchKiosk}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 group"
                >
                  <HardHat className="w-4 h-4 text-slate-950" />
                  <span>Ver Kiosco de Portería en Vivo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onLaunchDashboard}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2"
                >
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Panel de Control & Novedades SST</span>
                </button>
              </div>

              {/* Legal Standards Badges */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resolución 0312 de 2019 (SG-SST)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resolución 4272 de 2021 (Trabajo en Alturas)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Garantía Operativa a las 6:30 AM sin Caídas</span>
                </div>
              </div>

            </div>

            {/* Right: Authentic Construction Photo */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white aspect-[4/3] bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80"
                  alt="Personal en Obra 4·90 Espacios con dotación EPP"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                
                {/* Floating Card over Image */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200 shadow-lg text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      INGRESO AUTORIZADO
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">06:52:14 AM</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Carlos Andrés Pérez · Oficial Estructuras 4·90 Espacios
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1">
                    <span>Dotación EPP: 6/6 Conforme</span>
                    <span className="font-semibold text-emerald-600">ARL: 24 días vigentes</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Los 3 Pilares Operativos para 4·90 Espacios */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest font-mono">
            Beneficios Directos en Obra
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Control de Misión Crítica en un Solo Paso
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Cero papeles en portería, cero cuellos de botella al iniciar turno y respaldo documental inalterable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pilar 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                1. Biometría & Horario Inalterable
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Al identificar el rostro del trabajador, el sistema estampa la hora exacta de llegada en un registro blindado de solo lectura. Nadie puede alterar ni borrar asistencias ni llegadas tarde.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-700 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Fin de la "nómina fantasma"</span>
            </div>
          </div>

          {/* Pilar 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <HardHat className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                2. Auditoría Óptica de Dotación EPP
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cámara de cuerpo entero en el torniquete que certifica en milisegundos los 6 implementos obligatorios: casco, gafas, chaleco reflectivo, arnés de alturas, guantes y botas de seguridad.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-700 font-semibold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>Respaldo fotográfico automático</span>
            </div>
          </div>

          {/* Pilar 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                3. Conteo de Vigencias ARL & Alturas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                El sistema descuenta automáticamente 1 día de vigencia cada mañana. Emite aviso preventivo con 15 días de antelación y frena el ingreso si la seguridad social o el certificado de alturas expiró.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-700 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Cumplimiento legal Res. 4272/2021</span>
            </div>
          </div>

        </div>
      </section>

      {/* Galería Real de Operación en Obras Civiles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest font-mono">
                Presencia Operativa en Terreno
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Diseñado para Cuadrillas Reales en Construcción
              </h3>
            </div>
            <button
              onClick={onLaunchKiosk}
              className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Probar Kiosco Operativo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 group border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80"
                alt="Cuadrilla de alturas en estructura"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Trabajo en Alturas</span>
                <p className="text-xs font-bold leading-tight mt-0.5">Control de arnés 4 argollas y certificación vigente</p>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 group border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=600&auto=format&fit=crop&q=80"
                alt="Oficial de soldadura y estructura"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Soldadura & Encofrado</span>
                <p className="text-xs font-bold leading-tight mt-0.5">Auditoría de careta, gafas y guantes de carnaza</p>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 group border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80"
                alt="Maestro de obra y supervisión técnica"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Supervisión en Terreno</span>
                <p className="text-xs font-bold leading-tight mt-0.5">Control para contratistas y maestros de obra</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Calculadora de Ahorro para Gerencia de 4·90 Espacios */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                Retorno de Inversión en Obra
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Impacto Financiero Directo para 4·90 Espacios
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Liquida únicamente las horas realmente trabajadas por obreros y subcontratistas. 
                Evita contingencias laborales y demandas solidarias mediante respaldo fotográfico legal inalterable.
              </p>

              {/* Sliders */}
              <div className="space-y-4 pt-3">
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                    <span>Personal total en obra (cuadrillas 4·90):</span>
                    <span className="text-amber-400 font-bold">{numTrabajadores} trabajadores</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="400"
                    step="10"
                    value={numTrabajadores}
                    onChange={(e) => setNumTrabajadores(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                    <span>Jornales laborados al mes:</span>
                    <span className="text-amber-400 font-bold">{diasMes} días</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="28"
                    value={diasMes}
                    onChange={(e) => setDiasMes(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Impact Box */}
            <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Ahorro Mensual Estimado</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold px-2 py-0.5 rounded">
                  Control Estricto
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Ahorro Directo en Nómina & Horas Ficticias:</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono mt-1">
                  ${ahorroNominaEstimado.toLocaleString('es-CO')} <span className="text-sm text-slate-400 font-normal">COP/mes</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Protección Frente a Sanciones SST (Art. 13 Ley 1562):</span>
                <div className="text-xl font-bold text-amber-400 font-mono mt-1">
                  Hasta ${riesgoSancionEvitado.toLocaleString('es-CO')} <span className="text-xs text-slate-400 font-normal">COP</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Blindaje total ante inspecciones del Ministerio del Trabajo.</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span>Tiempo de amortización del sistema:</span>
                <span className="text-white font-bold font-mono text-sm">&lt; 6 semanas</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center pb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4 shadow-sm">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Comencemos la demostración operativa para 4·90 Espacios
          </h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto">
            Accede al kiosco en vivo, valida las cuadrillas y revisa la bitácora legal inalterable con fotos de evidencia.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={onLaunchKiosk}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
            >
              Abrir Kiosco de Portería
            </button>
            <button
              onClick={onLaunchBitacora}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors border border-slate-200"
            >
              Revisar Bitácora Legal
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
