// ==============================================================================
// BASE DE DATOS NOSQL EDGE (OFFLINE-FIRST) CON DEXIE (INDEXEDDB)
// Diseñado para operar en la portería de la obra incluso si el internet se cae a las 6:30 AM
// ==============================================================================

import Dexie, { type Table } from 'dexie';
import type { Worker, BitacoraIngreso, AuditoriaRechazo } from '../types';

export interface OfflineQueueItem {
  id?: number;
  type: 'BITACORA_INGRESO' | 'AUDITORIA_RECHAZO' | 'WORKER_UPDATE';
  payload: any;
  createdAt: string;
  synced: boolean;
  syncAttempts: number;
  lastError?: string;
}

export interface RawAiTelemetryItem {
  id?: number;
  cedula: string;
  timestamp: string;
  inferenceTimeMs: number;
  model: string;
  fps: number;
  detections: any;
  confidenceScores: Record<string, number>;
  rawFrameHash: string;
}

export class SafeEntryEdgeNoSqlDatabase extends Dexie {
  workers!: Table<Worker, string>;
  bitacora!: Table<BitacoraIngreso, string>;
  rechazos!: Table<AuditoriaRechazo, string>;
  offline_queue!: Table<OfflineQueueItem, number>;
  raw_telemetry!: Table<RawAiTelemetryItem, number>;

  constructor() {
    super('SafeEntry_Edge_NoSQL_Obra');
    this.version(1).stores({
      workers: 'cedula, id, cargo, color_semaforo',
      bitacora: 'id, cedula, fecha, resultado_ingreso, created_at',
      rechazos: 'id, cedula, timestamp_intento, motivo_bloqueo',
      offline_queue: '++id, type, synced, createdAt',
      raw_telemetry: '++id, cedula, timestamp, rawFrameHash'
    });
  }
}

export const edgeDb = new SafeEntryEdgeNoSqlDatabase();

// Iniciar almacenamiento local con datos por defecto si está vacío
export async function seedEdgeDbIfEmpty(initialWorkers: Worker[], initialBitacora: BitacoraIngreso[], initialRechazos: AuditoriaRechazo[]) {
  const count = await edgeDb.workers.count();
  if (count === 0) {
    console.log('[NoSQL Edge] Inicializando almacén local de portería con trabajadores y bitácora...');
    await edgeDb.workers.bulkPut(initialWorkers);
    await edgeDb.bitacora.bulkPut(initialBitacora);
    await edgeDb.rechazos.bulkPut(initialRechazos);
  }
}
