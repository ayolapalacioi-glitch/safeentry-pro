// ==============================================================================
// MOTOR DE SINCRONIZACIÓN EDGE <-> SUPABASE (OFFLINE-RESILIENT)
// ==============================================================================

import { edgeDb } from './edgeNoSqlDb';
import { supabase } from './supabaseClient';
import type { EdgeSyncState } from '../types';

class SyncEngine {
  private listeners: ((state: EdgeSyncState) => void)[] = [];
  private state: EdgeSyncState = {
    isOnline: navigator.onLine,
    pendingSyncCount: 0,
    lastSyncTimestamp: null,
    supabaseConnected: false,
    edgeDbReady: true
  };

  constructor() {
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));
    this.updatePendingCount();
    // Reintentar sincronización periódica cada 15s si hay red
    setInterval(() => {
      if (this.state.isOnline && supabase) {
        this.processSyncQueue();
      }
    }, 15000);
  }

  public subscribe(callback: (state: EdgeSyncState) => void) {
    this.listeners.push(callback);
    callback(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.state));
  }

  private async handleNetworkChange(online: boolean) {
    this.state.isOnline = online;
    if (online) {
      console.log('[Sync Engine] Red restablecida en obra. Procesando cola de sincronización Edge...');
      await this.processSyncQueue();
    } else {
      console.warn('[Sync Engine] Obra sin conexión a internet. Cambiando a modo 100% NoSQL Local.');
    }
    this.notify();
  }

  public async updatePendingCount() {
    try {
      const count = await edgeDb.offline_queue.where('synced').equals(0).count();
      this.state.pendingSyncCount = count;
      this.notify();
    } catch {
      // Ignorar en arranque
    }
  }

  // Sincronizar elementos encolados hacia Supabase
  public async processSyncQueue(): Promise<{ synced: number; failed: number }> {
    if (!supabase || !this.state.isOnline) {
      await this.updatePendingCount();
      return { synced: 0, failed: 0 };
    }

    const items = await edgeDb.offline_queue.where('synced').equals(0).limit(20).toArray();
    let synced = 0;
    let failed = 0;

    for (const item of items) {
      try {
        if (item.type === 'BITACORA_INGRESO') {
          const { error } = await supabase.from('bitacora_ingresos_diarios').insert({
            cedula: item.payload.cedula,
            trabajador_nombre: item.payload.trabajador_nombre,
            cargo: item.payload.cargo,
            fecha: item.payload.fecha,
            hora_exacta_llegada: item.payload.hora_exacta_llegada,
            resultado_ingreso: item.payload.resultado_ingreso,
            estado_epp: item.payload.estado_epp,
            epp_detectados: item.payload.epp_detectados,
            epp_faltantes: item.payload.epp_faltantes,
            dias_vigentes_arl: item.payload.dias_vigentes_arl,
            dias_vigentes_alturas: item.payload.dias_vigentes_alturas,
            foto_evidencia_url: item.payload.foto_evidencia_url,
            confidence_avg: item.payload.confidence_avg,
            hash_inmutable: item.payload.hash_inmutable,
            sincronizado_desde_edge: true
          });
          if (error) throw error;
        } else if (item.type === 'AUDITORIA_RECHAZO') {
          const { error } = await supabase.from('auditoria_rechazos_sst').insert({
            cedula: item.payload.cedula,
            trabajador_nombre: item.payload.trabajador_nombre,
            cargo: item.payload.cargo,
            motivo_bloqueo: item.payload.motivo_bloqueo,
            detalle_bloqueo: item.payload.detalle_bloqueo,
            foto_evidencia_url: item.payload.foto_evidencia_url,
            notificado_siso: item.payload.notificado_siso
          });
          if (error) throw error;
        }

        if (item.id) {
          await edgeDb.offline_queue.update(item.id, { synced: true });
        }
        synced++;
      } catch (err: any) {
        failed++;
        console.error('[Sync Queue] Error sincronizando elemento:', err);
        if (item.id) {
          await edgeDb.offline_queue.update(item.id, {
            syncAttempts: item.syncAttempts + 1,
            lastError: err?.message || 'Error desconocido'
          });
        }
      }
    }

    this.state.lastSyncTimestamp = new Date().toISOString();
    await this.updatePendingCount();
    return { synced, failed };
  }

  // Simular desconexión manual para pruebas de robustez en obra
  public toggleSimulatedOffline() {
    this.handleNetworkChange(!this.state.isOnline);
  }
}

export const syncEngine = new SyncEngine();
