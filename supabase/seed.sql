-- ==============================================================================
-- DATOS SEMILLA (SEED DATA) REALES - SISTEMA SAFEENTRY PRO
-- Fecha Base de Prueba: Octubre 2026
-- ==============================================================================

INSERT INTO public.trabajadores_vigencias 
(cedula, nombre_completo, cargo, arl_entidad, arl_fecha_vencimiento, alturas_requerido, alturas_nivel, alturas_fecha_vencimiento, examen_medico_vencimiento, estado, foto_perfil_url)
VALUES
('1045821900', 'Carlos Andrés Pérez', 'Oficial de Alturas', 'Positiva Compañía de Seguros', CURRENT_DATE + INTERVAL '24 days', true, 'Avanzado Res. 4272/2021', CURRENT_DATE + INTERVAL '142 days', CURRENT_DATE + INTERVAL '180 days', 'ACTIVO', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'),
('1032441205', 'Brayan Alexis Martínez', 'Ayudante Práctico de Obra', 'Seguros Bolívar', CURRENT_DATE + INTERVAL '28 days', false, NULL, NULL, CURRENT_DATE + INTERVAL '90 days', 'ACTIVO', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'),
('79845120', 'Nelson Enrique Gómez', 'Oficial Encofrador', 'Seguros Bolívar', CURRENT_DATE + INTERVAL '18 days', true, 'Avanzado Res. 4272/2021', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '45 days', 'ACTIVO', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80'),
('98712330', 'Jorge Eliecer Ramírez', 'Soldador Estructural', 'ARL SURA', CURRENT_DATE + INTERVAL '6 days', true, 'Avanzado Res. 4272/2021', CURRENT_DATE + INTERVAL '48 days', CURRENT_DATE + INTERVAL '120 days', 'ACTIVO', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80'),
('1018990412', 'Álvaro Hernán Castro', 'Maestro General de Obra', 'ARL SURA', CURRENT_DATE + INTERVAL '30 days', true, 'Coordinador Alturas', CURRENT_DATE + INTERVAL '85 days', CURRENT_DATE + INTERVAL '210 days', 'ACTIVO', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80'),
('1090334811', 'Edwin David Morales', 'Electricista Industrial', 'Colmena Seguros', CURRENT_DATE + INTERVAL '19 days', true, 'Avanzado Res. 4272/2021', CURRENT_DATE + INTERVAL '210 days', CURRENT_DATE + INTERVAL '150 days', 'ACTIVO', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80')
ON CONFLICT (cedula) DO NOTHING;

-- INSERTAR REGISTROS DE BITÁCORA INMUTABLE PARA HISTÓRICO DE AUDITORÍA
INSERT INTO public.bitacora_ingresos_diarios
(cedula, trabajador_nombre, cargo, fecha, hora_exacta_llegada, resultado_ingreso, estado_epp, epp_detectados, epp_faltantes, dias_vigentes_arl, dias_vigentes_alturas, hash_inmutable, foto_evidencia_url)
VALUES
('1045821900', 'Carlos Andrés Pérez', 'Oficial de Alturas', CURRENT_DATE, '06:52:14'::time, 'AUTORIZADO', 'COMPLETO', 
 '{"helmet": true, "goggles": true, "reflective_vest": true, "safety_harness": true, "gloves": true, "safety_boots": true}'::jsonb, 
 '[]'::jsonb, 24, 142, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop'),
('1018990412', 'Álvaro Hernán Castro', 'Maestro General de Obra', CURRENT_DATE, '06:45:10'::time, 'AUTORIZADO', 'COMPLETO', 
 '{"helmet": true, "goggles": true, "reflective_vest": true, "safety_harness": false, "gloves": true, "safety_boots": true}'::jsonb, 
 '[]'::jsonb, 30, 85, 'a127a44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852ba89', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&fit=crop'),
('98712330', 'Jorge Eliecer Ramírez', 'Soldador Estructural', CURRENT_DATE, '06:58:32'::time, 'PRE_ALERTA', 'COMPLETO', 
 '{"helmet": true, "goggles": true, "reflective_vest": true, "safety_harness": true, "gloves": true, "safety_boots": true}'::jsonb, 
 '[]'::jsonb, 6, 48, 'b943214298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852cd12', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&fit=crop');

-- INSERTAR AUDITORÍA DE RECHAZO
INSERT INTO public.auditoria_rechazos_sst
(cedula, trabajador_nombre, cargo, motivo_bloqueo, detalle_bloqueo, notificado_siso)
VALUES
('79845120', 'Nelson Enrique Gómez', 'Oficial Encofrador', 'ALTURAS_VENCIDO', 'Certificado de Trabajo Seguro en Alturas (Res. 4272/2021) venció hace 2 días. Ingreso bloqueado automáticamente.', true);
