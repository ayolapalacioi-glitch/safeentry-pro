-- ==============================================================================
-- TABLA DE NOTAS Y NOVEDADES DE OBRA (SUPABASE POSTGRESQL) - SAFEENTRY PRO
-- ==============================================================================

-- 1. Crear tabla notes con soporte de id identity y campos de bitácora
CREATE TABLE IF NOT EXISTS public.notes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  content TEXT,
  categoria TEXT DEFAULT 'GENERAL',
  autor TEXT DEFAULT 'Inspector SST',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acceso público/anon para CRUD completo
DROP POLICY IF EXISTS "public can read notes" ON public.notes;
CREATE POLICY "public can read notes"
ON public.notes
FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "public can insert notes" ON public.notes;
CREATE POLICY "public can insert notes"
ON public.notes
FOR INSERT TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "public can update notes" ON public.notes;
CREATE POLICY "public can update notes"
ON public.notes
FOR UPDATE TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "public can delete notes" ON public.notes;
CREATE POLICY "public can delete notes"
ON public.notes
FOR DELETE TO anon, authenticated
USING (true);

-- 4. Datos de ejemplo iniciales (Starter + Obras Civiles)
INSERT INTO public.notes (title, content, categoria, autor)
VALUES
  ('Today I created a Supabase project.', 'Conexión inicial de base de datos relacional PostgreSQL con políticas RLS activadas.', 'GENERAL', 'Ingeniero de Desarrollo'),
  ('I added some data and queried it from Next.js.', 'Verificación de consultas en tiempo real y sincronización en la nube.', 'GENERAL', 'Ingeniero de Desarrollo'),
  ('It was awesome!', 'El sistema de bitácora y auditoría legal quedó operativo y listo para producción.', 'GENERAL', 'Director Técnico'),
  ('Inspección de líneas de vida Torre Principal', 'Revisión técnica de anclajes de alturas en piso 12 conforme a Resolución 4272/2021. Todo conforme.', 'SEGURIDAD_SST', 'Coordinador Alturas'),
  ('Verificación de planilla PILA cuadrilla encofrado', 'Se cruzaron 18 obreros con ARL Seguros Bolívar. Se cargó soporte vigente hasta fin de mes.', 'PERSONAL', 'Administración de Obra');
