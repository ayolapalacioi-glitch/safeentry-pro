// ==============================================================================
// TIPOS Y MODELOS DE DOMINIO - SAFEENTRY PRO
// ==============================================================================

export type TrafficLightStatus = 'VERDE' | 'AMARILLO' | 'ROJO';

export interface EPPItemState {
  key: 'helmet' | 'goggles' | 'reflective_vest' | 'safety_harness' | 'gloves' | 'safety_boots';
  label: string;
  detected: boolean;
  confidence: number;
  box?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] relative 0..1
  required: boolean;
}

export interface EPPDetectionsMap {
  helmet: EPPItemState;
  goggles: EPPItemState;
  reflective_vest: EPPItemState;
  safety_harness: EPPItemState;
  gloves: EPPItemState;
  safety_boots: EPPItemState;
}

export interface Worker {
  id: string;
  cedula: string;
  nombre_completo: string;
  cargo: string;
  empresa_contratista: string;
  grupo_sanguineo?: string;
  arl_entidad: string;
  arl_fecha_vencimiento: string; // YYYY-MM-DD
  dias_vigentes_arl: number;
  alturas_requerido: boolean;
  alturas_nivel?: string;
  alturas_fecha_vencimiento?: string; // YYYY-MM-DD
  dias_vigentes_alturas?: number;
  examen_medico_vencimiento: string;
  epp_requeridos: string[];
  estado: 'ACTIVO' | 'SUSPENDIDO' | 'INCAPACITADO' | 'RETIRADO';
  foto_perfil_url: string;
  color_semaforo: TrafficLightStatus;
}

export interface BitacoraIngreso {
  id: string;
  cedula: string;
  trabajador_nombre: string;
  cargo: string;
  fecha: string;
  tipo_movimiento?: 'ENTRADA' | 'SALIDA';
  hora_exacta_llegada: string;
  hora_entrada?: string;
  hora_salida?: string | null;
  horas_laboradas?: string | null;
  timestamp_ntp: string;
  resultado_ingreso: 'AUTORIZADO' | 'PRE_ALERTA' | 'RECHAZADO';
  estado_epp: 'COMPLETO' | 'INCOMPLETO';
  epp_detectados: Record<string, boolean>;
  epp_faltantes: string[];
  dias_vigentes_arl: number;
  dias_vigentes_alturas?: number;
  foto_evidencia_url?: string;
  confidence_avg: number;
  hash_inmutable: string;
  nodo_porteria_id: string;
  sincronizado_desde_edge: boolean;
  created_at: string;
}

export interface AuditoriaRechazo {
  id: string;
  cedula: string;
  trabajador_nombre: string;
  cargo: string;
  timestamp_intento: string;
  motivo_bloqueo: 'EPP_INCOMPLETO' | 'ARL_VENCIDA' | 'ALTURAS_VENCIDO' | 'NO_EN_CENSO' | 'MULTIPLE';
  detalle_bloqueo: string;
  foto_evidencia_url?: string;
  notificado_siso: boolean;
  observacion_inspector?: string;
}

export interface ExpedienteMensual {
  cedula: string;
  trabajador_nombre: string;
  cargo: string;
  periodo: string; // '2026-10'
  total_dias_asistidos: number;
  total_llegadas_tarde: number;
  total_rechazos_epp: number;
  tasa_cumplimiento_epp: number;
  estado_pila: string;
  asistencias: BitacoraIngreso[];
}

export interface EdgeSyncState {
  isOnline: boolean;
  pendingSyncCount: number;
  lastSyncTimestamp: string | null;
  supabaseConnected: boolean;
  edgeDbReady: boolean;
}

export interface Note {
  id: number;
  title: string;
  content?: string;
  categoria?: 'SEGURIDAD_SST' | 'AVANCE_OBRA' | 'INTERVENTORIA' | 'PERSONAL' | 'GENERAL';
  autor?: string;
  created_at?: string;
}
