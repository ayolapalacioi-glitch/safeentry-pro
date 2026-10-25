// ==============================================================================
// MANUAL DE USUARIO Y GUÍA OPERATIVA EN OBRA · SAFEENTRY PRO
// Procedimientos de Portería, Control de Acceso, Turnos Entrada/Salida y Protocolo SST
// ==============================================================================

import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileSpreadsheet, 
  WifiOff, 
  Scan,
  Printer
} from 'lucide-react';

export const UserManualView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'porteria' | 'salidas' | 'semaforo' | 'novedades' | 'offline'>('porteria');

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            MANUAL OFICIAL DE OPERACIÓN EN OBRA
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Manual de Usuario & Protocolo Operativo SG-SST
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Guía práctica para supervisores de portería, coordinadores de seguridad y residentes de obra. 
            Contiene el paso a paso para registro de entradas, salidas, atención de alertas y reportes a gerencia.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-300 self-start md:self-auto shadow-xs"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Imprimir / Guardar PDF</span>
        </button>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSection('porteria')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSection === 'porteria'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>1. Registro de Ingreso (06:30 AM)</span>
        </button>

        <button
          onClick={() => setActiveSection('salidas')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSection === 'salidas'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>2. Registro de Salida & Jornada</span>
        </button>

        <button
          onClick={() => setActiveSection('semaforo')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSection === 'semaforo'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>3. Protocolo de Aptitud & Estados SST</span>
        </button>

        <button
          onClick={() => setActiveSection('novedades')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSection === 'novedades'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>4. Bitácora de Novedades & Excel</span>
        </button>

        <button
          onClick={() => setActiveSection('offline')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSection === 'offline'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <WifiOff className="w-4 h-4" />
          <span>5. Modo Autónomo sin Internet</span>
        </button>
      </div>

      {/* Section Content */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">

        {/* 1. REGISTRO DE INGRESO */}
        {activeSection === 'porteria' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                  1
                </span>
                Procedimiento de Ingreso Matutino en Portería
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Tiempo promedio por operario: <strong>1.5 segundos</strong>. Diseñado para evitar congestión en el pico de las 6:30 AM.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50/50">
                <span className="text-xs font-bold text-amber-700 uppercase font-mono">Paso 1 · Posicionamiento</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  El trabajador se ubica a 1 metro de la cámara en el torniquete. Debe mirar al frente y tener colocada su dotación obligatoria antes de llegar al punto de escaneo.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50/50">
                <span className="text-xs font-bold text-amber-700 uppercase font-mono">Paso 2 · Escaneo Óptico</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  La cámara analiza en milisegundos los 6 implementos reglamentarios: casco, gafas, chaleco reflectivo, arnés de alturas (si aplica), guantes y calzado con puntera de acero.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50/50">
                <span className="text-xs font-bold text-amber-700 uppercase font-mono">Paso 3 · Cruce de Vigencias</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  El sistema verifica que la seguridad social (ARL) y la certificación de alturas (Res. 4272/2021) estén vigentes. Si tiene menos de 15 días, emite aviso preventivo sin frenar el paso.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50/50">
                <span className="text-xs font-bold text-amber-700 uppercase font-mono">Paso 4 · Apertura de Torniquete</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Si el semáforo es VERDE o AMARILLO, el relé libera el torniquete durante 4 segundos para el paso individual. La hora exacta queda sellada en la bitácora inalterable.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. REGISTRO DE SALIDAS */}
        {activeSection === 'salidas' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                  2
                </span>
                Control de Salidas y Cierre de Jornada
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Monitorea la hora exacta de salida del personal para el cálculo de horas laboradas y control de contratistas.
              </p>
            </div>

            <div className="border-l-4 border-emerald-500 bg-emerald-50/60 p-4 rounded-r-xl space-y-1">
              <span className="text-xs font-bold text-emerald-900">Conmutación Rápida en Portería:</span>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Al finalizar el turno (por ejemplo, a partir de las 4:30 PM), el vigilante selecciona el botón <strong>"Registro Salida"</strong> en el kiosco. Al identificar al obrero, el sistema registra su hora de retiro y calcula automáticamente el tiempo que permaneció dentro de la obra.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Beneficios de Registrar la Salida:</h3>
              <ul className="space-y-2 text-xs text-slate-700 list-disc list-inside">
                <li><strong>Cero horas ficticias:</strong> Evita el cobro de jornales completos a obreros que se retiraron a mitad de turno.</li>
                <li><strong>Censo en tiempo real ante emergencias:</strong> Permite saber con exactitud cuántas personas están físicamente dentro de la obra en caso de evacuación o sismo.</li>
                <li><strong>Auditoría laboral probatoria:</strong> Cruza las horas reales con la planilla de nómina o corte de pago de subcontratistas.</li>
              </ul>
            </div>
          </div>
        )}

        {/* 3. PROTOCOLO SEMÁFORO */}
        {activeSection === 'semaforo' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                  3
                </span>
                Interpretación y Acciones de Aptitud SG-SST (Verde / Amarillo / Rojo)
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Reglas claras de respuesta para el personal de vigilancia y el coordinador SISO.
              </p>
            </div>

            <div className="space-y-4">
              
              {/* Verde */}
              <div className="border border-emerald-200 bg-emerald-50/40 p-4 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-950">VERDE · INGRESO AUTORIZADO (100% Conforme)</h4>
                  <p className="text-xs text-emerald-900">
                    Dotación EPP completa (6/6 implementos) y vigencias de seguridad social al día. El torniquete abre normalmente.
                  </p>
                </div>
              </div>

              {/* Amarillo */}
              <div className="border border-amber-200 bg-amber-50/50 p-4 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-950">AMARILLO · PRE-ALERTA PREVENTIVA (ARL o Alturas por vencer &le; 15 días)</h4>
                  <p className="text-xs text-amber-900">
                    El trabajador tiene su dotación completa, pero su planilla PILA o curso de alturas vence en menos de 15 días. <strong>Acción:</strong> Se le permite el ingreso y la pantalla notifica al vigilante para que le recuerde al contratista renovar la documentación antes de la fecha límite.
                  </p>
                </div>
              </div>

              {/* Rojo */}
              <div className="border border-rose-200 bg-rose-50/50 p-4 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-rose-950">ROJO · ACCESO BLOQUEADO (Riesgo Legal Inminente)</h4>
                  <p className="text-xs text-rose-900">
                    Ocurre por dos motivos: <strong>a)</strong> Falta algún implemento obligatorio (ej. sin botas o sin arnés), o <strong>b)</strong> La ARL o el certificado de alturas expiró. <strong>Acción obligatoria:</strong> El torniquete permanece bloqueado. El vigilante remite al trabajador a la oficina de SISO o al almacén de dotación.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 4. NOVEDADES Y EXCEL */}
        {activeSection === 'novedades' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                  4
                </span>
                Bitácora de Notas y Reportes Oficiales en Excel
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Registro diario de incidencias de interventoría, entrega de dotación y descargos de seguridad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">Crear una Anotación de Obra</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ve a la pestaña <strong>"Notas de Obra"</strong> en el menú lateral y haz clic en <strong>"+ Nueva Nota"</strong>. Selecciona la categoría (Seguridad, Interventoría, Cuadrilla, Equipos o General) y escribe la descripción técnica de lo ocurrido.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">Descargar Planilla en Excel (.csv)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Haz clic en el botón verde <strong>"Exportar Excel (.csv)"</strong>. El archivo se descarga listo con membrete formal, autor, categoría y sello de fecha para ser adjuntado a los informes de interventoría o actas de pago.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. MODO AUTÓNOMO */}
        {activeSection === 'offline' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                  5
                </span>
                Operación Continua sin Internet en Obra (Alta Disponibilidad)
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Garantía técnica: La portería jamás se bloquea si se cae la fibra óptica o la señal celular en la obra.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-900">¿Cómo opera el sistema cuando no hay internet?</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                El computador o tableta de portería almacena localmente el censo de trabajadores y los modelos de visión. Los ingresos y salidas se siguen registrando de forma ininterrumpida y se encolan con sello temporal seguro.
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                En el momento en que regresa la conexión, el indicador del menú lateral pasa de <strong>"Modo Autónomo"</strong> a <strong>"Enlace en Línea"</strong> y sincroniza todos los registros hacia el servidor central en segundo plano sin intervención humana.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
