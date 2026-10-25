// ==============================================================================
// TERMINAL KIOSCO DE PORTERÍA (PANTALLA DE OPERACIÓN EN VIVO)
// Integración en < 1.5s: Biometría + Visión Artificial YOLOv11 + Semáforo + Torniquete
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Lock, 
  Unlock, 
  HardHat, 
  Glasses, 
  Shirt, 
  Anchor, 
  Hand, 
  Footprints, 
  FileCheck, 
  RefreshCw, 
  UserCheck, 
  ShieldAlert, 
  Hash, 
  Video,
  LogIn,
  LogOut
} from 'lucide-react';
import type { Worker, EPPDetectionsMap, BitacoraIngreso } from '../types';
import { DEMO_SCENARIOS, renderYoloBoundingBoxes, type VisionScenario } from '../services/visionSimulator';
import { registerIngresoInmutable } from '../services/dataService';
import { soundService } from '../services/audioAlerts';

interface KioskPorteriaProps {
  workers: Worker[];
  onIngresoRegistrado: () => void;
}

export const KioskPorteria: React.FC<KioskPorteriaProps> = ({ workers, onIngresoRegistrado }) => {
  const [selectedScenario, setSelectedScenario] = useState<VisionScenario>(DEMO_SCENARIOS[0]);
  const [tipoRegistro, setTipoRegistro] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [activeWorker, setActiveWorker] = useState<Worker | null>(null);
  const [currentDetections, setCurrentDetections] = useState<EPPDetectionsMap>(DEMO_SCENARIOS[0].detections);
  const [lastResult, setLastResult] = useState<BitacoraIngreso | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [turnstileOpen, setTurnstileOpen] = useState<boolean>(false);
  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sincronizar trabajador activo según el escenario seleccionado
  useEffect(() => {
    const found = workers.find(w => w.cedula === selectedScenario.workerCedula);
    if (found) {
      setActiveWorker(found);
    } else if (workers.length > 0) {
      setActiveWorker(workers[0]);
    }
    setCurrentDetections(selectedScenario.detections);
  }, [selectedScenario, workers]);

  // Manejo de Webcam Real
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
          console.warn('No se pudo acceder a la cámara web:', err);
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

  // Renderizado dinámico del Canvas con YOLO Bounding Boxes
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (useWebcam && videoRef.current && videoRef.current.readyState === 4) {
        // Dibujar frame de la cámara web
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        // Fondo visual industrial simulado
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = selectedScenario.imageFallback;
        if (img.complete && img.naturalWidth !== 0) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } else {
          // Placeholder táctico mientras carga
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#334155';
          ctx.font = '14px "JetBrains Mono"';
          ctx.fillText('ENLACE RTSP PORTERÍA CAM-01 ...', 20, 40);
        }
      }

      // Renderizar cajas de detección YOLOv11
      renderYoloBoundingBoxes(ctx, canvas.width, canvas.height, currentDetections);

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [selectedScenario, currentDetections, useWebcam]);

  // Lista de implementos faltantes
  const missingEppKeys = Object.values(currentDetections)
    .filter(item => item.required && !item.detected)
    .map(item => item.label);

  // Ejecutar Ciclo Biométrico + Visión + Registro Inmutable
  const handleTriggerIngreso = async () => {
    if (!activeWorker || isEvaluating) return;

    setIsEvaluating(true);

    // Simular latencia real de Edge computing (<400ms)
    await new Promise(r => setTimeout(r, 450));

    try {
      const { record, status } = await registerIngresoInmutable(
        activeWorker,
        currentDetections,
        missingEppKeys,
        selectedScenario.imageFallback,
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
      console.error('Error registrando ingreso:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Alternar manualmente detección de un implemento para pruebas en vivo
  const toggleEppItem = (key: keyof EPPDetectionsMap) => {
    setCurrentDetections(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        detected: !prev[key].detected,
        confidence: !prev[key].detected ? 97.4 : 14.2
      }
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Selector: Modo de Turno (Entrada/Salida) & Escenarios de Obra */}
      <div className="bg-[#111927] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Selector de Modo de Turno: Entrada vs Salida */}
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

        {/* Escenarios Demo */}
        <div className="flex flex-wrap items-center gap-2">
          {DEMO_SCENARIOS.map(esc => (
            <button
              key={esc.id}
              onClick={() => setSelectedScenario(esc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedScenario.id === esc.id
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {esc.name}
            </button>
          ))}

          {/* Toggle Webcam Real */}
          <button
            onClick={() => setUseWebcam(!useWebcam)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              useWebcam
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            {useWebcam ? 'Cámara Real: ON' : 'Activar Webcam'}
          </button>
        </div>
      </div>

      {/* Main Grid: Live Camera / YOLO (Left) + Kiosk Status / Worker / Turnstile (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Camera Viewfinder with YOLO Bounding Boxes (7 cols) */}
        <div className="lg:col-span-7 bg-[#111927] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          
          {/* Viewfinder Header */}
          <div className="bg-[#0b101a] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-bold text-slate-200">CAM-01 PORTERÍA PRINCIPAL · ACCESO OBRA</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">RTSP 1080p · EN VIVO</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-[11px] font-bold">
                AUDITORÍA ÓPTICA DE DOTACIÓN EPP
              </span>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
            {/* Hidden video element for real webcam */}
            <video ref={videoRef} playsInline muted className="hidden" />

            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="w-full h-full object-cover"
            />

            {/* Tactical Overlays */}
            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md border border-slate-800 px-2.5 py-1.5 rounded font-mono text-[11px] space-y-0.5 text-slate-300">
              <div className="text-emerald-400 flex items-center gap-1 font-bold">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                FACE ID: RECONOCIDO
              </div>
              <div className="text-slate-300">C.C. {activeWorker?.cedula}</div>
            </div>

            {/* Scanline Animation */}
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent pointer-events-none animate-scanline" />
          </div>

          {/* EPP Detection Checklist Controls (Clickable for live adjustment) */}
          <div className="bg-[#0e1626] p-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Auditoría en Tiempo Real de Implementos Obligatorios:
              </span>
              <span className="text-[11px] text-slate-400">
                (Haz clic en un ícono para simular que el obrero se lo quita)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { key: 'helmet', label: 'Casco', icon: HardHat },
                { key: 'goggles', label: 'Gafas', icon: Glasses },
                { key: 'reflective_vest', label: 'Chaleco', icon: Shirt },
                { key: 'safety_harness', label: 'Arnés Alturas', icon: Anchor },
                { key: 'gloves', label: 'Guantes', icon: Hand },
                { key: 'safety_boots', label: 'Botas Acero', icon: Footprints },
              ].map(item => {
                const det = currentDetections[item.key as keyof EPPDetectionsMap];
                const Icon = item.icon;
                const isDetected = det?.detected;

                return (
                  <button
                    key={item.key}
                    onClick={() => toggleEppItem(item.key as keyof EPPDetectionsMap)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all text-left ${
                      isDetected
                        ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300 hover:bg-emerald-950/40'
                        : 'bg-rose-950/30 border-rose-800/60 text-rose-300 hover:bg-rose-950/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isDetected ? 'text-emerald-400' : 'text-rose-400'}`} />
                      <span className="font-medium text-slate-200">{item.label}</span>
                    </div>
                    <div className="font-mono text-[10px] font-bold">
                      {isDetected ? (
                        <span className="text-emerald-400">✓ {det.confidence.toFixed(0)}%</span>
                      ) : (
                        <span className="text-rose-400 font-bold">FALTA</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Worker Profile + Gate Decision + Turnstile (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Worker Info Card */}
          {activeWorker && (
            <div className="bg-[#111927] border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-start gap-4">
                <img
                  src={activeWorker.foto_perfil_url}
                  alt={activeWorker.nombre_completo}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-slate-700 shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                      C.C. {activeWorker.cedula}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-semibold">
                      RH {activeWorker.grupo_sanguineo}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white truncate mt-0.5">
                    {activeWorker.nombre_completo}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {activeWorker.cargo}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {activeWorker.empresa_contratista}
                  </p>
                </div>
              </div>

              {/* SST Status Cards: ARL & Alturas Countdowns */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80">
                {/* ARL Box */}
                <div className="bg-[#0b101a] border border-slate-800 p-3 rounded-lg">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Seguridad Social / ARL</span>
                    <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-bold text-lg font-mono text-white">
                      {activeWorker.dias_vigentes_arl}
                      <span className="text-xs font-normal text-slate-400 ml-1">días</span>
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      activeWorker.dias_vigentes_arl > 15
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : activeWorker.dias_vigentes_arl > 0
                        ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {activeWorker.dias_vigentes_arl > 15 ? 'AL DÍA' : activeWorker.dias_vigentes_arl > 0 ? 'POR VENCER' : 'VENCIDA'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-1">
                    {activeWorker.arl_entidad}
                  </div>
                </div>

                {/* Curso de Alturas Box */}
                <div className="bg-[#0b101a] border border-slate-800 p-3 rounded-lg">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Curso Alturas (4272)</span>
                    <Anchor className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-bold text-lg font-mono text-white">
                      {activeWorker.alturas_requerido ? (
                        <>
                          {activeWorker.dias_vigentes_alturas ?? 0}
                          <span className="text-xs font-normal text-slate-400 ml-1">días</span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">No aplica</span>
                      )}
                    </span>
                    {activeWorker.alturas_requerido && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        (activeWorker.dias_vigentes_alturas ?? 0) > 15
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : (activeWorker.dias_vigentes_alturas ?? 0) > 0
                          ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {(activeWorker.dias_vigentes_alturas ?? 0) > 15 ? 'VIGENTE' : (activeWorker.dias_vigentes_alturas ?? 0) > 0 ? 'AVISO' : 'VENCIDO'}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-1">
                    {activeWorker.alturas_nivel || 'Res. 4272/2021'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Button: Trigger Biometric Pass & Decision */}
          <button
            onClick={handleTriggerIngreso}
            disabled={isEvaluating}
            className={`w-full py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2.5 ${
              isEvaluating
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : tipoRegistro === 'ENTRADA'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-emerald-500/20 active:scale-[0.99]'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-[0.99]'
            }`}
          >
            {isEvaluating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Auditoría en proceso (&lt;400ms)...
              </>
            ) : tipoRegistro === 'ENTRADA' ? (
              <>
                <LogIn className="w-5 h-5" />
                Validar e Ingresar Turno (06:30 AM)
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5" />
                Registrar Salida de Turno (Cierre Jornada)
              </>
            )}
          </button>

          {/* Gateway Decision Traffic Light & Turnstile Status */}
          {lastResult ? (
            <div className={`p-5 rounded-xl border shadow-xl transition-all ${
              lastResult.resultado_ingreso === 'AUTORIZADO'
                ? 'bg-emerald-950/40 border-emerald-600 glow-pass'
                : lastResult.resultado_ingreso === 'PRE_ALERTA'
                ? 'bg-amber-950/40 border-amber-500 glow-warn'
                : 'bg-rose-950/50 border-rose-600 glow-danger'
            }`}>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {lastResult.resultado_ingreso === 'AUTORIZADO' ? (
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-inner">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                  ) : lastResult.resultado_ingreso === 'PRE_ALERTA' ? (
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 shadow-inner">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-inner">
                      <XCircle className="w-7 h-7" />
                    </div>
                  )}

                  <div>
                    <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">
                      Decisión Semáforo Portería:
                    </span>
                    <h2 className={`text-xl font-extrabold tracking-tight ${
                      lastResult.resultado_ingreso === 'AUTORIZADO'
                        ? 'text-emerald-400'
                        : lastResult.resultado_ingreso === 'PRE_ALERTA'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}>
                      {lastResult.resultado_ingreso === 'AUTORIZADO'
                        ? 'INGRESO AUTORIZADO'
                        : lastResult.resultado_ingreso === 'PRE_ALERTA'
                        ? 'PRE-ALERTA PREVENTIVA'
                        : 'ACCESO BLOQUEADO'}
                    </h2>
                  </div>
                </div>

                {/* Turnstile Indicator */}
                <div className="text-right">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    turnstileOpen 
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-bounce' 
                      : 'bg-rose-900/60 text-rose-200 border-rose-700'
                  }`}>
                    {turnstileOpen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{turnstileOpen ? 'TORNIQUETE LIBERADO' : 'TORNIQUETE TRABADO'}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    Relé PLC: {turnstileOpen ? 'PULSO 24V ACTIVO' : 'STANDBY'}
                  </div>
                </div>
              </div>

              {/* Audit Details */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Hora de Entrada</span>
                    <span className="font-bold text-emerald-400">
                      {lastResult.hora_entrada || lastResult.hora_exacta_llegada}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Hora de Salida</span>
                    <span className="font-bold text-amber-400">
                      {lastResult.hora_salida || 'En turno activo'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Jornada Registrada:</span>
                  <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {lastResult.tipo_movimiento === 'SALIDA' ? 'Salida Marcada (Turno Cerrado)' : 'Entrada Marcada (Turno Abierto)'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Auditoría de Dotación EPP:</span>
                  <span className={`font-semibold ${lastResult.estado_epp === 'COMPLETO' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {lastResult.estado_epp === 'COMPLETO' ? 'Dotación Completa (6/6 OK)' : `Incompleto: ${lastResult.epp_faltantes.join(', ')}`}
                  </span>
                </div>

                {lastResult.resultado_ingreso === 'RECHAZADO' && lastResult.epp_faltantes.length > 0 && (
                  <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800/60 text-rose-200 text-[11px] font-medium">
                    ⚠️ Notificación automática enviada al Inspector SISO de obra. El obrero no puede pasar el torniquete.
                  </div>
                )}

                {/* Hash Ledger Proof */}
                <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/50">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Hash className="w-3 h-3 text-amber-500" />
                    Hash SHA-256 Inmutable:
                  </span>
                  <span className="text-slate-300 truncate max-w-[200px]" title={lastResult.hash_inmutable}>
                    {lastResult.hash_inmutable.substring(0, 16)}...
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center text-slate-500">
              <UserCheck className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-medium">Kiosco listo para auditoría biométrica.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">El trabajador debe mirar la cámara CAM-01.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
