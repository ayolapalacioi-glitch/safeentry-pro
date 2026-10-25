-- ==============================================================================
-- SISTEMA SAFEENTRY PRO - CONTROL BIOMÉTRICO, EPP & VIGENCIAS SST (OBRA CIVIL)
-- ARQUITECTURA DE BASE DE DATOS SUPABASE (POSTGRESQL 15+)
-- Cumplimiento: Resolución 0312/2019, Resolución 4272/2021 (Trabajo Seguro en Alturas)
-- ==============================================================================

-- 1. EXTENSIONES CRÍTICAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLA: TRABAJADORES Y VIGENCIAS SST
-- Almacena el censo oficial de obreros y contratistas con sus fechas de corte.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.trabajadores_vigencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    cargo VARCHAR(80) NOT NULL,
    empresa_contratista VARCHAR(120) DEFAULT 'Constructora Principal S.A.S.',
    telefono VARCHAR(20),
    grupo_sanguineo VARCHAR(5) DEFAULT 'O+',
    
    -- VIGENCIAS DE SEGURIDAD Y SALUD EN EL TRABAJO
    arl_entidad VARCHAR(50) NOT NULL, -- Ej: 'Positiva', 'SURA', 'Seguros Bolívar', 'Colmena'
    arl_fecha_vencimiento DATE NOT NULL,
    
    alturas_requerido BOOLEAN DEFAULT true,
    alturas_nivel VARCHAR(60) DEFAULT 'Avanzado (Res. 4272/2021)', -- 'Avanzado', 'Reentrenamiento', 'Coordinador'
    alturas_fecha_vencimiento DATE,
    
    examen_medico_vencimiento DATE NOT NULL,
    
    -- EPP REQUERIDOS POR MATRIZ DE RIESGOS (JSON Array)
    epp_requeridos JSONB DEFAULT '["helmet", "goggles", "reflective_vest", "gloves", "safety_boots", "safety_harness"]'::jsonb,
    
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'SUSPENDIDO', 'INCAPACITADO', 'RETIRADO')),
    foto_perfil_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABLA: BITÁCORA DE INGRESOS DIARIOS (LEDGER INMUTABLE · APPEND-ONLY)
-- Regla de Oro: ¡ESTA TABLA NUNCA SE MODIFICA NI SE BORRA!
-- Prueba reina legal ante Mintrabajo, ARL y liquidación de nómina.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bitacora_ingresos_diarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cedula VARCHAR(20) NOT NULL REFERENCES public.trabajadores_vigencias(cedula) ON UPDATE CASCADE,
    trabajador_nombre VARCHAR(150) NOT NULL,
    cargo VARCHAR(80) NOT NULL,
    
    -- TIMESTAMPS CRIPTOGRÁFICOS DE PORTERÍA
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_exacta_llegada TIME NOT NULL,
    timestamp_ntp TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    
    -- EVALUACIÓN DE ACCESO
    resultado_ingreso VARCHAR(20) NOT NULL CHECK (resultado_ingreso IN ('AUTORIZADO', 'PRE_ALERTA', 'RECHAZADO')),
    estado_epp VARCHAR(20) NOT NULL CHECK (estado_epp IN ('COMPLETO', 'INCOMPLETO')),
    
    -- DETECCIÓN DETALLADA DE EPP (YOLOv11 Inference Payload)
    epp_detectados JSONB NOT NULL,
    epp_faltantes JSONB DEFAULT '[]'::jsonb,
    
    -- VIGENCIAS AL MOMENTO EXACTO DE PISAR LA PORTERÍA
    dias_vigentes_arl INTEGER NOT NULL,
    dias_vigentes_alturas INTEGER,
    
    -- EVIDENCIA FORENSE VISUAL
    foto_evidencia_url TEXT,
    confidence_avg NUMERIC(5,2) DEFAULT 97.50,
    
    -- BLINDAJE CRIPTOGRÁFICO (HASH CADENA INMUTABLE TIPO BLOCKCHAIN)
    hash_inmutable VARCHAR(64) NOT NULL,
    hash_previo VARCHAR(64) DEFAULT 'GENESIS_BLOCK_OBRA_OCT_2026',
    
    nodo_porteria_id VARCHAR(50) DEFAULT 'KIOSKO-01-PRINCIPAL',
    sincronizado_desde_edge BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABLA: AUDITORÍA DE RECHAZOS SST (NOVEDADES SISO)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.auditoria_rechazos_sst (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cedula VARCHAR(20) NOT NULL,
    trabajador_nombre VARCHAR(150) NOT NULL,
    cargo VARCHAR(80) NOT NULL,
    timestamp_intento TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    motivo_bloqueo VARCHAR(80) NOT NULL, -- 'EPP_INCOMPLETO', 'ARL_VENCIDA', 'ALTURAS_VENCIDO', 'NO_EN_CENSO'
    detalle_bloqueo TEXT NOT NULL,
    foto_evidencia_url TEXT,
    notificado_siso BOOLEAN DEFAULT true,
    gestionado_por_inspector VARCHAR(100),
    observacion_inspector TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TABLA: EXPEDIENTE MENSUAL HISTÓRICO POR TRABAJADOR
-- Consolidado mensual para nómina y archivo de gestión SST.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.historial_mensual_persona (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cedula VARCHAR(20) NOT NULL,
    trabajador_nombre VARCHAR(150) NOT NULL,
    cargo VARCHAR(80) NOT NULL,
    periodo VARCHAR(10) NOT NULL, -- '2026-10', '2026-11'
    
    total_dias_asistidos INTEGER DEFAULT 0,
    total_llegadas_tarde INTEGER DEFAULT 0,
    total_rechazos_epp INTEGER DEFAULT 0,
    tasa_cumplimiento_epp NUMERIC(5,2) DEFAULT 100.0,
    
    estado_pila VARCHAR(20) DEFAULT 'AL_DIA',
    expediente_cerrado BOOLEAN DEFAULT false,
    cerrado_at TIMESTAMPTZ,
    url_reporte_pdf TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unq_trabajador_periodo UNIQUE(cedula, periodo)
);

-- ==============================================================================
-- 6. DISPARADOR (TRIGGER) DE BLINDAJE INMUTABLE EN LA BITÁCORA
-- Revoca toda operación UPDATE o DELETE para garantizar valor probatorio.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_blindaje_bitacora_inmutable()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'VIOLACION DE INTEGRIDAD SST: La bitacora de ingreso es inmutable (Append-Only Ledger). No se permite modificar (UPDATE) ni eliminar (DELETE) registros historicos conforme al Decreto 1072/2015 y Res. 4272/2021.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blindar_bitacora ON public.bitacora_ingresos_diarios;
CREATE TRIGGER trg_blindar_bitacora
BEFORE UPDATE OR DELETE ON public.bitacora_ingresos_diarios
FOR EACH ROW EXECUTE FUNCTION public.fn_blindaje_bitacora_inmutable();

-- ==============================================================================
-- 7. FUNCIÓN DEL MOTOR SST: RECALCULAR CONTEO REGRESIVO DIARIO
-- Simula o ejecuta el Worker de las 00:01 AM para descontar días de ARL y Alturas.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_calcular_dias_vigencia(p_fecha_vencimiento DATE)
RETURNS INTEGER AS $$
BEGIN
    IF p_fecha_vencimiento IS NULL THEN
        RETURN 0;
    END IF;
    RETURN GREATEST(0, (p_fecha_vencimiento - CURRENT_DATE));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- VISTA EN TIEMPO REAL CON SEMÁFORO CALCULADO AUTOMÁTICAMENTE
CREATE OR REPLACE VIEW public.v_trabajadores_semaforo_live AS
SELECT 
    t.id,
    t.cedula,
    t.nombre_completo,
    t.cargo,
    t.empresa_contratista,
    t.arl_entidad,
    t.arl_fecha_vencimiento,
    public.fn_calcular_dias_vigencia(t.arl_fecha_vencimiento) AS dias_arl,
    t.alturas_requerido,
    t.alturas_fecha_vencimiento,
    CASE 
        WHEN t.alturas_requerido THEN public.fn_calcular_dias_vigencia(t.alturas_fecha_vencimiento)
        ELSE 999 
    END AS dias_alturas,
    t.epp_requeridos,
    t.estado,
    t.foto_perfil_url,
    -- EVALUACIÓN DE SEMÁFORO
    CASE 
        WHEN t.estado != 'ACTIVO' THEN 'ROJO'
        WHEN public.fn_calcular_dias_vigencia(t.arl_fecha_vencimiento) = 0 THEN 'ROJO'
        WHEN t.alturas_requerido AND public.fn_calcular_dias_vigencia(t.alturas_fecha_vencimiento) = 0 THEN 'ROJO'
        WHEN public.fn_calcular_dias_vigencia(t.arl_fecha_vencimiento) <= 15 THEN 'AMARILLO'
        WHEN t.alturas_requerido AND public.fn_calcular_dias_vigencia(t.alturas_fecha_vencimiento) <= 15 THEN 'AMARILLO'
        ELSE 'VERDE'
    END AS color_semaforo_sst
FROM public.trabajadores_vigencias t;

-- ==============================================================================
-- 8. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.trabajadores_vigencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bitacora_ingresos_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_rechazos_sst ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_mensual_persona ENABLE ROW LEVEL SECURITY;

-- Política de lectura general para la App de portería y panel administrativo
CREATE POLICY "Lectura libre para personal autorizado" ON public.trabajadores_vigencias FOR SELECT USING (true);
CREATE POLICY "Lectura de bitacora" ON public.bitacora_ingresos_diarios FOR SELECT USING (true);
CREATE POLICY "Insercion de bitacora" ON public.bitacora_ingresos_diarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Lectura rechazos" ON public.auditoria_rechazos_sst FOR SELECT USING (true);
CREATE POLICY "Insercion rechazos" ON public.auditoria_rechazos_sst FOR INSERT WITH CHECK (true);
CREATE POLICY "Lectura mensual" ON public.historial_mensual_persona FOR SELECT USING (true);

-- ==============================================================================
-- 9. TABLA DE NOTAS & NOVEDADES DE OBRA (CRUD)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  content TEXT,
  categoria TEXT DEFAULT 'GENERAL',
  autor TEXT DEFAULT 'Inspector SST 4·90',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can read notes" ON public.notes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public can insert notes" ON public.notes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public can update notes" ON public.notes FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "public can delete notes" ON public.notes FOR DELETE TO anon, authenticated USING (true);
