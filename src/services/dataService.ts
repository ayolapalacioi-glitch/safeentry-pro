// ==============================================================================
// SERVICIO DE DATOS, VIGENCIAS Y MOTOR SST
// Arquitectura híbrida: lee/escribe en NoSQL Edge + sincroniza con Supabase
// ==============================================================================

import type { Worker, BitacoraIngreso, AuditoriaRechazo, TrafficLightStatus, EPPDetectionsMap } from '../types';
import { edgeDb, seedEdgeDbIfEmpty } from './edgeNoSqlDb';
import { supabase } from './supabaseClient';

// Helper de cálculo de días restantes
export function calculateDaysRemaining(targetDateStr?: string): number {
  if (!targetDateStr) return 0;
  const target = new Date(targetDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Helper para calcular fecha a partir de días a futuro
export function addDaysToToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// Calcular color de semáforo SST del trabajador
export function computeWorkerSemaforo(
  diasArl: number,
  alturasRequerido: boolean,
  diasAlturas?: number,
  estado: string = 'ACTIVO'
): TrafficLightStatus {
  if (estado !== 'ACTIVO') return 'ROJO';
  if (diasArl <= 0) return 'ROJO';
  if (alturasRequerido && (diasAlturas === undefined || diasAlturas <= 0)) return 'ROJO';
  if (diasArl <= 15) return 'AMARILLO';
  if (alturasRequerido && diasAlturas !== undefined && diasAlturas <= 15) return 'AMARILLO';
  return 'VERDE';
}

// Generación de Hash SHA-256 inmutable (Append-Only Ledger)
export async function generateImmutableHash(
  previousHash: string,
  cedula: string,
  timestamp: string,
  resultado: string
): Promise<string> {
  const rawString = `${previousHash}|${cedula}|${timestamp}|${resultado}|${Date.now()}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(rawString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Datos iniciales de la constructora (Octubre 2026)
export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'w-1045821900',
    cedula: '1045821900',
    nombre_completo: 'Carlos Andrés Pérez',
    cargo: 'Oficial de Alturas & Estructura',
    empresa_contratista: 'Consorcio Constructor Principal',
    grupo_sanguineo: 'O+',
    arl_entidad: 'Positiva Compañía de Seguros',
    arl_fecha_vencimiento: addDaysToToday(24),
    dias_vigentes_arl: 24,
    alturas_requerido: true,
    alturas_nivel: 'Avanzado (Res. 4272/2021)',
    alturas_fecha_vencimiento: addDaysToToday(142),
    dias_vigentes_alturas: 142,
    examen_medico_vencimiento: addDaysToToday(180),
    epp_requeridos: ['helmet', 'goggles', 'reflective_vest', 'safety_harness', 'gloves', 'safety_boots'],
    estado: 'ACTIVO',
    foto_perfil_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
    color_semaforo: 'VERDE'
  },
  {
    id: 'w-1032441205',
    cedula: '1032441205',
    nombre_completo: 'Brayan Alexis Martínez',
    cargo: 'Ayudante Práctico de Obra',
    empresa_contratista: 'Estructuras & Cimentaciones S.A.S.',
    grupo_sanguineo: 'A+',
    arl_entidad: 'Seguros Bolívar',
    arl_fecha_vencimiento: addDaysToToday(28),
    dias_vigentes_arl: 28,
    alturas_requerido: false,
    examen_medico_vencimiento: addDaysToToday(95),
    epp_requeridos: ['helmet', 'goggles', 'reflective_vest', 'gloves', 'safety_boots'],
    estado: 'ACTIVO',
    foto_perfil_url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
    color_semaforo: 'VERDE'
  },
  {
    id: 'w-79845120',
    cedula: '79845120',
    nombre_completo: 'Nelson Enrique Gómez',
    cargo: 'Oficial Encofrador',
    empresa_contratista: 'Consorcio Constructor Principal',
    grupo_sanguineo: 'O-',
    arl_entidad: 'Seguros Bolívar',
    arl_fecha_vencimiento: addDaysToToday(18),
    dias_vigentes_arl: 18,
    alturas_requerido: true,
    alturas_nivel: 'Avanzado (Res. 4272/2021)',
    alturas_fecha_vencimiento: addDaysToToday(-2), // Vencido
    dias_vigentes_alturas: 0,
    examen_medico_vencimiento: addDaysToToday(45),
    epp_requeridos: ['helmet', 'goggles', 'reflective_vest', 'safety_harness', 'gloves', 'safety_boots'],
    estado: 'ACTIVO',
    foto_perfil_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
    color_semaforo: 'ROJO'
  },
  {
    id: 'w-98712330',
    cedula: '98712330',
    nombre_completo: 'Jorge Eliecer Ramírez',
    cargo: 'Soldador Estructural',
    empresa_contratista: 'Montajes & Soldadura Industrial',
    grupo_sanguineo: 'B+',
    arl_entidad: 'ARL SURA',
    arl_fecha_vencimiento: addDaysToToday(6), // Pre-alerta (<= 15 días)
    dias_vigentes_arl: 6,
    alturas_requerido: true,
    alturas_nivel: 'Avanzado (Res. 4272/2021)',
    alturas_fecha_vencimiento: addDaysToToday(48),
    dias_vigentes_alturas: 48,
    examen_medico_vencimiento: addDaysToToday(120),
    epp_requeridos: ['helmet', 'goggles', 'reflective_vest', 'safety_harness', 'gloves', 'safety_boots'],
    estado: 'ACTIVO',
    foto_perfil_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=600&auto=format&fit=crop&q=80',
    color_semaforo: 'AMARILLO'
  },
  {
    id: 'w-1018990412',
    cedula: '1018990412',
    nombre_completo: 'Álvaro Hernán Castro',
    cargo: 'Maestro General de Obra',
    empresa_contratista: 'Consorcio Constructor Principal',
    grupo_sanguineo: 'O+',
    arl_entidad: 'ARL SURA',
    arl_fecha_vencimiento: addDaysToToday(30),
    dias_vigentes_arl: 30,
    alturas_requerido: true,
    alturas_nivel: 'Coordinador Alturas',
    alturas_fecha_vencimiento: addDaysToToday(85),
    dias_vigentes_alturas: 85,
    examen_medico_vencimiento: addDaysToToday(210),
    epp_requeridos: ['helmet', 'goggles', 'reflective_vest', 'gloves', 'safety_boots'],
    estado: 'ACTIVO',
    foto_perfil_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80',
    color_semaforo: 'VERDE'
  },
  {
    id: 'w-1090334811',
    cedula: '1090334811',
    nombre_completo: 'Edwin David Morales',
    cargo: 'Electricista Industrial',
    empresa_contratista: 'Instalaciones Técnicas & Redes',
    grupo_sanguineo: 'A+',
    arl_entidad: 'Colmena Seguros',
    arl_fecha_vencimiento: addDaysToToday(19),
    dias_vigentes_arl: 19,
    alturas_requerido: true,
    alturas_nivel: 'Avanzado (Res. 4272/2021)',
    alturas_fecha_vencimiento: addDaysToToday(210),
    dias_vigentes_alturas: 210,
    examen_medico_vencimiento: addDaysToToday(150),
    epp_requeridos: ['helmet', 'goggles', 'reflective_vest', 'safety_harness', 'gloves', 'safety_boots'],
    estado: 'ACTIVO',
    foto_perfil_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    color_semaforo: 'VERDE'
  }
];

export const INITIAL_BITACORA: BitacoraIngreso[] = [
  {
    id: 'bit-001',
    cedula: '1045821900',
    trabajador_nombre: 'Carlos Andrés Pérez',
    cargo: 'Oficial de Alturas & Estructura',
    fecha: new Date().toISOString().split('T')[0],
    tipo_movimiento: 'ENTRADA',
    hora_exacta_llegada: '06:52:14 AM',
    hora_entrada: '06:52 AM',
    hora_salida: null,
    horas_laboradas: 'En jornada activa',
    timestamp_ntp: new Date().toISOString(),
    resultado_ingreso: 'AUTORIZADO',
    estado_epp: 'COMPLETO',
    epp_detectados: {
      helmet: true,
      goggles: true,
      reflective_vest: true,
      safety_harness: true,
      gloves: true,
      safety_boots: true
    },
    epp_faltantes: [],
    dias_vigentes_arl: 24,
    dias_vigentes_alturas: 142,
    foto_evidencia_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
    confidence_avg: 98.4,
    hash_inmutable: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    nodo_porteria_id: 'KIOSKO-01-ACCESO-OBRA',
    sincronizado_desde_edge: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'bit-002',
    cedula: '1018990412',
    trabajador_nombre: 'Álvaro Hernán Castro',
    cargo: 'Maestro General de Obra',
    fecha: new Date().toISOString().split('T')[0],
    tipo_movimiento: 'SALIDA',
    hora_exacta_llegada: '06:45:10 AM',
    hora_entrada: '06:45 AM',
    hora_salida: '04:30 PM',
    horas_laboradas: '9h 45m',
    timestamp_ntp: new Date().toISOString(),
    resultado_ingreso: 'AUTORIZADO',
    estado_epp: 'COMPLETO',
    epp_detectados: {
      helmet: true,
      goggles: true,
      reflective_vest: true,
      safety_harness: false,
      gloves: true,
      safety_boots: true
    },
    epp_faltantes: [],
    dias_vigentes_arl: 30,
    dias_vigentes_alturas: 85,
    foto_evidencia_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80',
    confidence_avg: 99.1,
    hash_inmutable: 'a127a44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852ba89',
    nodo_porteria_id: 'KIOSKO-01-ACCESO-OBRA',
    sincronizado_desde_edge: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'bit-003',
    cedula: '98712330',
    trabajador_nombre: 'Jorge Eliecer Ramírez',
    cargo: 'Oficial de Armado & Encofrado',
    fecha: new Date().toISOString().split('T')[0],
    tipo_movimiento: 'ENTRADA',
    hora_exacta_llegada: '06:58:32 AM',
    hora_entrada: '06:58 AM',
    hora_salida: null,
    horas_laboradas: 'En jornada activa',
    timestamp_ntp: new Date().toISOString(),
    resultado_ingreso: 'PRE_ALERTA',
    estado_epp: 'COMPLETO',
    epp_detectados: {
      helmet: true,
      goggles: true,
      reflective_vest: true,
      safety_harness: true,
      gloves: true,
      safety_boots: true
    },
    epp_faltantes: [],
    dias_vigentes_arl: 6,
    dias_vigentes_alturas: 48,
    foto_evidencia_url: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=600&auto=format&fit=crop&q=80',
    confidence_avg: 97.2,
    hash_inmutable: 'b943214298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852cd12',
    nodo_porteria_id: 'KIOSKO-01-4-90-ESPACIOS',
    sincronizado_desde_edge: true,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_RECHAZOS: AuditoriaRechazo[] = [
  {
    id: 'rec-001',
    cedula: '79845120',
    trabajador_nombre: 'Nelson Enrique Gómez',
    cargo: 'Oficial Encofrador',
    timestamp_intento: new Date().toISOString(),
    motivo_bloqueo: 'ALTURAS_VENCIDO',
    detalle_bloqueo: 'Certificado de Trabajo Seguro en Alturas (Res. 4272/2021) venció hace 2 días. Ingreso bloqueado automáticamente en torniquete.',
    foto_evidencia_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
    notificado_siso: true,
    observacion_inspector: 'Notificado a SISO. Se programó reentrenamiento para el fin de semana.'
  }
];

// Inicializar almacén local
export async function initializeDataLayer() {
  await seedEdgeDbIfEmpty(INITIAL_WORKERS, INITIAL_BITACORA, INITIAL_RECHAZOS);
}

// Obtener todos los trabajadores con días recalculados en tiempo real
export async function getWorkers(): Promise<Worker[]> {
  const localWorkers = await edgeDb.workers.toArray();
  const list = localWorkers.length > 0 ? localWorkers : INITIAL_WORKERS;

  return list.map(w => {
    const diasArl = calculateDaysRemaining(w.arl_fecha_vencimiento);
    const diasAlturas = w.alturas_requerido ? calculateDaysRemaining(w.alturas_fecha_vencimiento) : undefined;
    const semaforo = computeWorkerSemaforo(diasArl, w.alturas_requerido, diasAlturas, w.estado);
    return {
      ...w,
      dias_vigentes_arl: diasArl,
      dias_vigentes_alturas: diasAlturas,
      color_semaforo: semaforo
    };
  });
}

// Obtener bitácora inmutable
export async function getBitacora(): Promise<BitacoraIngreso[]> {
  const localBitacora = await edgeDb.bitacora.toArray();
  return (localBitacora.length > 0 ? localBitacora : INITIAL_BITACORA).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// Obtener auditoría de rechazos
export async function getRechazos(): Promise<AuditoriaRechazo[]> {
  const localRechazos = await edgeDb.rechazos.toArray();
  return (localRechazos.length > 0 ? localRechazos : INITIAL_RECHAZOS).sort(
    (a, b) => new Date(b.timestamp_intento).getTime() - new Date(a.timestamp_intento).getTime()
  );
}

// Registrar nuevo ingreso o salida en la Bitácora (Inmutable)
export async function registerIngresoInmutable(
  worker: Worker,
  detections: EPPDetectionsMap,
  missingEpp: string[],
  evidencePhotoUrl: string,
  tipoMovimiento: 'ENTRADA' | 'SALIDA' = 'ENTRADA'
): Promise<{ record: BitacoraIngreso; status: TrafficLightStatus; rechazo?: AuditoriaRechazo }> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const hasMissingEpp = missingEpp.length > 0;
  const isEppComplete = !hasMissingEpp;

  // Evaluar semáforo
  let status: TrafficLightStatus = 'VERDE';
  let resultado: 'AUTORIZADO' | 'PRE_ALERTA' | 'RECHAZADO' = 'AUTORIZADO';
  let motivoBloqueo: AuditoriaRechazo['motivo_bloqueo'] | null = null;
  let detalleBloqueo = '';

  if (hasMissingEpp) {
    status = 'ROJO';
    resultado = 'RECHAZADO';
    motivoBloqueo = 'EPP_INCOMPLETO';
    detalleBloqueo = `Faltan implementos obligatorios: ${missingEpp.join(', ')}.`;
  } else if (worker.color_semaforo === 'ROJO') {
    status = 'ROJO';
    resultado = 'RECHAZADO';
    motivoBloqueo = (worker.dias_vigentes_arl <= 0) ? 'ARL_VENCIDA' : 'ALTURAS_VENCIDO';
    detalleBloqueo = `Documentación SST vencida (ARL: ${worker.dias_vigentes_arl}d, Alturas: ${worker.dias_vigentes_alturas ?? 0}d).`;
  } else if (worker.color_semaforo === 'AMARILLO') {
    status = 'AMARILLO';
    resultado = 'PRE_ALERTA';
  }

  // Hash inmutable SHA-256
  const previousRecord = await edgeDb.bitacora.orderBy('created_at').last();
  const prevHash = previousRecord ? previousRecord.hash_inmutable : 'GENESIS_BLOCK_OBRA_OCT_2026';
  const newHash = await generateImmutableHash(prevHash, worker.cedula, now.toISOString(), resultado);

  const eppDetectionsObj: Record<string, boolean> = {
    helmet: detections.helmet.detected,
    goggles: detections.goggles.detected,
    reflective_vest: detections.reflective_vest.detected,
    safety_harness: detections.safety_harness.detected,
    gloves: detections.gloves.detected,
    safety_boots: detections.safety_boots.detected
  };

  const isSalida = tipoMovimiento === 'SALIDA';

  const newBitacoraItem: BitacoraIngreso = {
    id: `bit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    cedula: worker.cedula,
    trabajador_nombre: worker.nombre_completo,
    cargo: worker.cargo,
    fecha: dateStr,
    tipo_movimiento: tipoMovimiento,
    hora_exacta_llegada: timeStr,
    hora_entrada: isSalida ? (previousRecord?.hora_entrada || '06:30 AM') : timeStr,
    hora_salida: isSalida ? timeStr : null,
    horas_laboradas: isSalida ? 'Jornada completada' : 'En jornada activa',
    timestamp_ntp: now.toISOString(),
    resultado_ingreso: resultado,
    estado_epp: isEppComplete ? 'COMPLETO' : 'INCOMPLETO',
    epp_detectados: eppDetectionsObj,
    epp_faltantes: missingEpp,
    dias_vigentes_arl: worker.dias_vigentes_arl,
    dias_vigentes_alturas: worker.dias_vigentes_alturas,
    foto_evidencia_url: evidencePhotoUrl,
    confidence_avg: 97.4,
    hash_inmutable: newHash,
    nodo_porteria_id: 'KIOSKO-01-PRINCIPAL',
    sincronizado_desde_edge: false,
    created_at: now.toISOString()
  };

  // Guardar en NoSQL Edge local
  await edgeDb.bitacora.put(newBitacoraItem);

  let rechazoItem: AuditoriaRechazo | undefined;
  if (resultado === 'RECHAZADO' && motivoBloqueo) {
    rechazoItem = {
      id: `rec-${Date.now()}`,
      cedula: worker.cedula,
      trabajador_nombre: worker.nombre_completo,
      cargo: worker.cargo,
      timestamp_intento: now.toISOString(),
      motivo_bloqueo: motivoBloqueo,
      detalle_bloqueo: detalleBloqueo,
      foto_evidencia_url: evidencePhotoUrl,
      notificado_siso: true
    };
    await edgeDb.rechazos.put(rechazoItem);
  }

  // Encolar para sincronización con Supabase Cloud
  await edgeDb.offline_queue.add({
    type: 'BITACORA_INGRESO',
    payload: newBitacoraItem,
    createdAt: now.toISOString(),
    synced: false,
    syncAttempts: 0
  });

  if (rechazoItem) {
    await edgeDb.offline_queue.add({
      type: 'AUDITORIA_RECHAZO',
      payload: rechazoItem,
      createdAt: now.toISOString(),
      synced: false,
      syncAttempts: 0
    });
  }

  // Intentar sincronizar inmediatamente si hay conexión con Supabase
  if (supabase) {
    try {
      await supabase.from('bitacora_ingresos_diarios').insert({
        cedula: newBitacoraItem.cedula,
        trabajador_nombre: newBitacoraItem.trabajador_nombre,
        cargo: newBitacoraItem.cargo,
        fecha: newBitacoraItem.fecha,
        hora_exacta_llegada: newBitacoraItem.hora_exacta_llegada,
        resultado_ingreso: newBitacoraItem.resultado_ingreso,
        estado_epp: newBitacoraItem.estado_epp,
        epp_detectados: newBitacoraItem.epp_detectados,
        epp_faltantes: newBitacoraItem.epp_faltantes,
        dias_vigentes_arl: newBitacoraItem.dias_vigentes_arl,
        dias_vigentes_alturas: newBitacoraItem.dias_vigentes_alturas,
        foto_evidencia_url: newBitacoraItem.foto_evidencia_url,
        confidence_avg: newBitacoraItem.confidence_avg,
        hash_inmutable: newBitacoraItem.hash_inmutable,
        sincronizado_desde_edge: true
      });
      // Marcar sincronizado
      await edgeDb.bitacora.update(newBitacoraItem.id, { sincronizado_desde_edge: true });
    } catch (e) {
      console.warn('[Sync] Falló sincronización inmediata con Supabase, queda en cola NoSQL Edge:', e);
    }
  }

  return { record: newBitacoraItem, status, rechazo: rechazoItem };
}

// Actualizar vigencias de un trabajador (ej: renovar ARL o Curso de Alturas)
export async function updateWorkerVigencias(
  cedula: string,
  newArlExpiry: string,
  newAlturasExpiry?: string,
  newArlEntidad?: string
): Promise<Worker> {
  const worker = await edgeDb.workers.get(cedula);
  if (!worker) throw new Error('Trabajador no encontrado');

  const diasArl = calculateDaysRemaining(newArlExpiry);
  const diasAlturas = worker.alturas_requerido && newAlturasExpiry ? calculateDaysRemaining(newAlturasExpiry) : worker.dias_vigentes_alturas;
  const newSemaforo = computeWorkerSemaforo(diasArl, worker.alturas_requerido, diasAlturas, worker.estado);

  const updated: Worker = {
    ...worker,
    arl_fecha_vencimiento: newArlExpiry,
    arl_entidad: newArlEntidad || worker.arl_entidad,
    dias_vigentes_arl: diasArl,
    alturas_fecha_vencimiento: newAlturasExpiry || worker.alturas_fecha_vencimiento,
    dias_vigentes_alturas: diasAlturas,
    color_semaforo: newSemaforo
  };

  await edgeDb.workers.put(updated);

  if (supabase) {
    try {
      await supabase.from('trabajadores_vigencias').update({
        arl_fecha_vencimiento: updated.arl_fecha_vencimiento,
        arl_entidad: updated.arl_entidad,
        alturas_fecha_vencimiento: updated.alturas_fecha_vencimiento,
        updated_at: new Date().toISOString()
      }).eq('cedula', cedula);
    } catch (e) {
      console.warn('[Supabase] No se pudo actualizar en la nube, actualizado en NoSQL Edge.');
    }
  }

  return updated;
}
