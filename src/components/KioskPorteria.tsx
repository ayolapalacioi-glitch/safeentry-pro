// ==============================================================================
// TERMINAL KIOSCO DE PORTERÍA & CONTROL DE ACCESO BIOMÉTRICO EPP
// Motor de Detección en Tiempo Real, Consulta Indexada a Base de Datos de Obra
// y Registro Inmutable de Turnos (Entrada 06:30 AM / Salida)
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Lock, 
  Unlock, 
  RefreshCw, 
  UserCheck, 
  Hash, 
  Video, 
  LogIn, 
  LogOut, 
  Search, 
  ScanLine, 
  Building2, 
  Sparkles, 
  User
} from 'lucide-react';
import type { Worker, EPPDetectionsMap, BitacoraIngreso } from '../types';
import { 
  runEppInference, 
  queryWorkerDatabase, 
  renderTacticalVisionCanvas, 
  ANATOMICAL_REGIONS,
  type WorkerDbQueryResult 
} from '../services/advancedDetectionEngine';
import { registerIngresoInmutable } from '../services/dataService';
import { soundService } from '../services/audioAlerts';

interface KioskPorteriaProps {
  workers: Worker[];
  onIngresoRegistrado: () => void;
}

const DEFAULT_DETECTIONS: EPPDetectionsMap = {
  helmet: { key: 'helmet', label: 'Casco Dieléctrico', detected: true, confidence: 99.2, box: [0.06, 0.32, 0.22, 0.68], required: true },
  goggles: { key: 'goggles', label: 'Gafas de Seguridad', detected: true, confidence: 96.5, box: [0.20, 0.38, 0.28, 0.62], required: true },
  reflective_vest: { key: 'reflective_vest', label: 'Chaleco Reflectivo', detected: true, confidence: 98.7, box: [0.28, 0.22, 0.68, 0.78], required: true },
  safety_harness: { key: 'safety_harness', label: 'Arnés 4 Argollas', detected: true, confidence: 95.8, box: [0.30, 0.25, 0.72, 0.75], required: true },
  gloves: { key: 'gloves', label: 'Guantes de Vaqueta', detected: true, confidence: 94.3, box: [0.55, 0.15, 0.68, 0.30], required: true },
  safety_boots: { key: 'safety_boots', label: 'Botas Punta de Acero', detected: true, confidence: 97.4, box: [0.80, 0.30, 0.96, 0.70], required: true },
};

export const KioskPorteria: React.FC<KioskPorteriaProps> = ({ workers, onIngresoRegistrado }) => {
  const [tipoRegistro, setTipoRegistro] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [cedulaInput, setCedulaInput] = useState<string>(workers[0]?.cedula || '1045821900');
  const [dbQueryResult, setDbQueryResult] = useState<WorkerDbQueryResult | null>(null);
  const [currentDetections, setCurrentDetections] = useState<EPPDetectionsMap>(DEFAULT_DETECTIONS);
  const [lastResult, setLastResult] = useState<BitacoraIngreso | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [turnstileOpen, setTurnstileOpen] = useState<boolean>(false);
  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [telemetry, setTelemetry] = useState({ fps: 30, latencyMs: 14.2, complianceScore: 100, distance: 1.5 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Ejecutar consulta indexada a la base de datos de obra cuando cambia la cédula
  const executeDbQuery = async (ced: string) => {
    const res = await queryWorkerDatabase(ced, workers);
    setDbQueryResult(res);

    // Ajustar exigencia de arnés según cargo en base de datos
    if (res.found && res.worker) {
      setCurrentDetections(prev => ({
        ...prev,
        safety_harness: {
          ...prev.safety_harness,
          required: res.worker?.alturas_requerido || false
        }
      }));
    }
  };

  useEffect(() => {
    executeDbQuery(cedulaInput);
  }, [cedulaInput, workers]);

  // Manejo de Webcam
  useEffect(() => {
    if (useWebcam) {
      navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
        .then(stream => {
          setWebcamStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch(err => {
          console.warn('Webcam no disponible o denegada:', err);
          setUseWebcam(false);
        });
    } else {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        setWebcamStream(null);
      }
    }
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [useWebcam]);

  // Ciclo continuo de renderizado en Canvas (30 FPS)
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (useWebcam && videoRef.current && videoRef.current.readyState === 4) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        // Feed óptico de simulación de cámara fija de portería
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80';
        if (bgImg.complete && bgImg.naturalWidth !== 0) {
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = '#0b101a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#f59e0b';
          ctx.font = '12px "JetBrains Mono"';
          ctx.fillText('INICIANDO ENLACE ÓPTICO CAM-01 (PORTERÍA NORTE)...', 24, 36);
        }
      }

      // Inferencia y cálculo de telemetría
      const reqList = dbQueryResult?.requiredEppList || ['helmet', 'reflective_vest', 'safety_boots'];
      const inference = runEppInference(currentDetections, reqList, 0.4);
      setTelemetry({
        fps: inference.fps,
        latencyMs: inference.latencyMs,
        complianceScore: inference.complianceScore,
        distance: inference.distanceMeters
      });

      // Dibujar overlay táctico y bounding boxes
      renderTacticalVisionCanvas(ctx, canvas.width, canvas.height, currentDetections, {
        fps: inference.fps,
        latencyMs: inference.latencyMs,
        complianceScore: inference.complianceScore,
        distance: inference.distanceMeters
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentDetections, useWebcam, dbQueryResult]);

  // Alternar manualmente detección de un implemento para inspección en tiempo real
  const toggleEppItem = (key: keyof EPPDetectionsMap) => {
    setCurrentDetections(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        detected: !prev[key].detected,
        confidence: !prev[key].detected ? 97.8 : 12.5
      }
    }));
  };

  // Ejecutar Ciclo Biométrico + Visión + Registro Inmutable
  const handleTriggerValidation = async () => {
    if (!dbQueryResult?.worker || isEvaluating) return;

    setIsEvaluating(true);

    // Simulación de latencia de cómputo seguro (<350ms)
    await new Promise(r => setTimeout(r, 380));

    try {
      const activeWorker = dbQueryResult.worker;
      const reqList = dbQueryResult.requiredEppList;

      // Implementos faltantes
      const missingKeys = reqList
        .filter(key => !currentDetections[key]?.detected)
        .map(key => ANATOMICAL_REGIONS[key].label);

      const { record, status } = await registerIngresoInmutable(
        activeWorker,
        currentDetections,
        missingKeys,
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
        tipoRegistro
      );

      setLastResult(record);

      if (status === 'VERDE') {
        soundService.playAccessGranted();
        setTurnstileOpen(true);
        setTimeout(() => setTurnstileOpen(false), 4000);
      } else if (status === 'AMARILLO') {
        soundService.playAccessWarning();
        setTurnstileOpen(true);
        setTimeout(() => setTurnstileOpen(false), 4000);
      } else {
        soundService.playAccessDenied();
        setTurnstileOpen(false);
      }

      onIngresoRegistrado();
    } catch (err) {
      console.error('Error registrando acceso en portería:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const activeWorker = dbQueryResult?.worker;
  const isDocExpired = activeWorker ? (activeWorker.dias_vigentes_arl <= 0 || (activeWorker.alturas_requerido && (activeWorker.dias_vigentes_alturas ?? 0) <= 0)) : true;
  const reqList = dbQueryResult?.requiredEppList || ['helmet', 'reflective_vest', 'safety_boots'];
  const hasMissingEpp = reqList.some(k => !currentDetections[k]?.detected);
  const willGrantAccess = !isDocExpired && !hasMissingEpp && activeWorker !== null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Controller Bar: Shift Mode & Real Operator Scanner */}
      <div className="bg-[#111927] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Selector de Modo de Turno */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setTipoRegistro('ENTRADA')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              tipoRegistro === 'ENTRADA'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Turno Entrada (06:30 AM)</span>
          </button>

          <button
            onClick={() => setTipoRegistro('SALIDA')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              tipoRegistro === 'SALIDA'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>Turno Salida (Cierre Jornada)</span>
          </button>
        </div>

        {/* Real Document Search / Badge Scanner */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Escanear o digitar Cédula..."
              value={cedulaInput}
              onChange={(e) => setCedulaInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0b101a] border border-slate-700 rounded-xl text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Quick Select from Active Workers Census */}
          <select
            value={cedulaInput}
            onChange={(e) => setCedulaInput(e.target.value)}
            className="p-2 bg-[#0b101a] border border-slate-700 rounded-xl text-xs text-slate-300 font-medium focus:outline-none focus:border-amber-500 max-w-[200px]"
          >
            {workers.map(w => (
              <option key={w.cedula} value={w.cedula}>
                {w.nombre_completo.split(' ')[0]} {w.nombre_completo.split(' ')[1] || ''} ({w.cedula})
              </option>
            ))}
          </select>

          {/* Toggle Webcam */}
          <button
            onClick={() => setUseWebcam(!useWebcam)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
              useWebcam
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
            title="Conectar cámara web USB o de laptop en portería"
          >
            <Video className="w-3.5 h-3.5" />
            <span>{useWebcam ? 'Cámara Real: ON' : 'Activar Webcam'}</span>
          </button>
        </div>

      </div>

      {/* Main Grid: Video Viewfinder (Left) + Verification Telemetry & Turnstile (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Tactical Optical Stream (7 cols) */}
        <div className="lg:col-span-7 bg-[#111927] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-4">
          
          {/* Header Strip with Live Feed Info */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
                {useWebcam ? 'CÁMARA LOCAL EN VIVO (PORTERÍA 01)' : 'SENSOR ÓPTICO AUTOMATIZADO CAM-01'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>RES: 1280x720</span>
              <span className="text-amber-400 font-bold">{telemetry.fps} FPS</span>
              <span className="text-emerald-400 font-bold">{telemetry.latencyMs}ms</span>
            </div>
          </div>

          {/* Viewfinder Canvas */}
          <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-video bg-black flex items-center justify-center shadow-inner">
            <video
              ref={videoRef}
              playsInline
              muted
              className="hidden"
            />
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="w-full h-full object-cover"
            />

            {/* Tactical Grid Overlay Frame */}
            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 font-mono text-[11px] text-slate-200">
              <div className="flex items-center gap-2">
                <ScanLine className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-amber-400 font-bold">ESCÁNER BIOMÉTRICO ACTIVO</span>
              </div>
              <div className="text-slate-400 text-[10px] mt-0.5">
                CÉDULA: <strong className="text-white">{cedulaInput}</strong>
              </div>
            </div>

            {/* Turnstile Indicator Overlay */}
            <div className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-2 transition-all ${
              turnstileOpen
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-lg shadow-emerald-900/40'
                : 'bg-slate-900/90 text-slate-300 border-slate-700'
            }`}>
              {turnstileOpen ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-400" />}
              <span>{turnstileOpen ? 'TORNIQUETE: DESTRABADO' : 'TORNIQUETE: BLOQUEADO'}</span>
            </div>
          </div>

          {/* Interactive EPP Toggles for Live Inspection */}
          <div className="bg-[#0b101a] border border-slate-800 p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                Inspección Táctil de Dotación EPP (Simulador de Campo):
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                Clic en cada implemento para alternar estado
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.entries(currentDetections).map(([key, item]) => {
                const isReq = reqList.includes(key as any);
                const isDetected = item.detected;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleEppItem(key as any)}
                    className={`p-2 rounded-lg border text-[11px] font-mono font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                      isDetected
                        ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                        : isReq
                        ? 'bg-rose-950/50 border-rose-700 text-rose-300 animate-pulse'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="truncate w-full text-center">{item.label.split(' ')[0]}</span>
                    <span className="text-[10px] font-bold">
                      {isDetected ? '✓ OK' : '✕ FALTA'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Database Profile, Semáforo & Action (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Worker Identity Card from Database */}
          <div className="bg-[#111927] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            
            {/* Database Query Performance Benchmark */}
            <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Base de Datos Local</span>
              </div>
              <span className="text-emerald-400 font-bold">
                ⚡ Consulta: {dbQueryResult?.queryLatencyMs || 0.6}ms (Cache Hit)
              </span>
            </div>

            {/* Profile Information */}
            {activeWorker ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex flex-col items-center justify-center text-amber-400 font-bold font-mono text-base shadow-inner shrink-0 relative overflow-hidden">
                    <User className="w-6 h-6 text-slate-400 mb-0.5" />
                    <span className="text-[10px] text-amber-400 font-bold tracking-tight">
                      {activeWorker.nombre_completo.split(' ').slice(0, 2).map(n => n[0]).join('')}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        C.C. {activeWorker.cedula}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        RH {activeWorker.grupo_sanguineo}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white truncate mt-0.5">
                      {activeWorker.nombre_completo}
                    </h3>

                    <div className="flex items-center gap-1 text-xs text-slate-300 mt-0.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                      <span className="truncate">{activeWorker.empresa_contratista}</span>
                    </div>

                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      Cargo: <strong className="text-slate-200">{activeWorker.cargo}</strong>
                    </div>
                  </div>
                </div>

                {/* Vigencias Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="bg-[#0b101a] p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Planilla PILA / ARL</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className={`font-mono font-bold text-sm ${
                        activeWorker.dias_vigentes_arl > 15 ? 'text-emerald-400' : activeWorker.dias_vigentes_arl > 0 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {activeWorker.dias_vigentes_arl}d vigentes
                      </span>
                      <span className="text-[10px] text-slate-400">{activeWorker.arl_entidad.split(' ')[0]}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Vence: {activeWorker.arl_fecha_vencimiento}</span>
                  </div>

                  <div className="bg-[#0b101a] p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Curso Alturas Res. 4272</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-mono font-bold text-sm text-white">
                        {activeWorker.alturas_requerido ? `${activeWorker.dias_vigentes_alturas ?? 0}d` : 'No Requiere'}
                      </span>
                      {activeWorker.alturas_requerido && (
                        <span className={`text-[10px] font-bold ${
                          (activeWorker.dias_vigentes_alturas ?? 0) > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {(activeWorker.dias_vigentes_alturas ?? 0) > 0 ? 'VIGENTE' : 'VENCIDO'}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                      {activeWorker.alturas_requerido ? `Vence: ${activeWorker.alturas_fecha_vencimiento}` : 'Personal de suelo'}
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-4 bg-rose-950/30 border border-rose-800 rounded-xl text-center text-xs text-rose-300">
                Operario con Cédula <strong>{cedulaInput}</strong> no encontrado en la base de datos de obra.
              </div>
            )}

            {/* SST Decision Status Banner */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              willGrantAccess
                ? (activeWorker && activeWorker.dias_vigentes_arl <= 15 ? 'bg-amber-950/40 border-amber-800 text-amber-300' : 'bg-emerald-950/40 border-emerald-800 text-emerald-300')
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}>
              <div className="flex items-center gap-3">
                {willGrantAccess ? (
                  activeWorker && activeWorker.dias_vigentes_arl <= 15 ? (
                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  )
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-xs uppercase font-mono tracking-wider">
                    {willGrantAccess ? (activeWorker && activeWorker.dias_vigentes_arl <= 15 ? 'SEMÁFORO AMARILLO (PREALERTA)' : 'SEMÁFORO VERDE (CONFORME)') : 'SEMÁFORO ROJO (ACCESO DENEGADO)'}
                  </div>
                  <div className="text-[11px] opacity-90 mt-0.5">
                    {hasMissingEpp 
                      ? 'Faltan implementos de protección obligatorios.'
                      : isDocExpired
                      ? 'Documentación ARL o curso de alturas vencido.'
                      : 'Dotación completa y papeles al día.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Trigger Button */}
            <button
              onClick={handleTriggerValidation}
              disabled={isEvaluating || !activeWorker}
              className={`w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                willGrantAccess
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Procesando Validación en Portería...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>
                    Validar Acceso {tipoRegistro === 'ENTRADA' ? 'de Ingreso' : 'de Salida'} ({activeWorker?.nombre_completo.split(' ')[0]})
                  </span>
                </>
              )}
            </button>

          </div>

          {/* Last Record Audited Stamp */}
          {lastResult && (
            <div className="bg-[#111927] border border-slate-800 rounded-2xl p-4 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1 text-slate-300 font-bold">
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  Registro Criptográfico Inmutable
                </span>
                <span className="text-emerald-400">{lastResult.tipo_movimiento || 'ENTRADA'}</span>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1">
                <div>Operario: <strong className="text-white">{lastResult.trabajador_nombre}</strong></div>
                <div className="flex items-center justify-between">
                  <span>Hora: <strong className="text-amber-400">{lastResult.hora_exacta_llegada}</strong></span>
                  <span>Jornada: <strong className="text-emerald-400">{lastResult.horas_laboradas || 'En Curso'}</strong></span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  HASH SHA-256: <span className="text-slate-300 font-mono">{lastResult.hash_inmutable}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
