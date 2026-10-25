// ==============================================================================
// DOCUMENTACIÓN OFICIAL DEL PROYECTO · 4·90 ESPACIOS S.A.S.
// Especificaciones Técnicas, Arquitectura de Base de Datos y Manual Operativo SG-SST
// ==============================================================================

import React, { useState } from 'react';
import { 
  BookOpen, 
  Database, 
  ShieldCheck, 
  Lock, 
  Copy, 
  Check, 
  Workflow, 
  Server
} from 'lucide-react';

export const ProjectDocsView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const sqlNotesSnippet = `-- TABLA 'notes' CON CRUD COMPLETO Y POLÍTICAS RLS EN SUPABASE
create table if not exists public.notes (
  id bigint primary key generated always as identity,
  title text not null,
  content text,
  categoria text default 'GENERAL',
  autor text default 'Inspector SST 4·90',
  created_at timestamptz default now()
);

alter table public.notes enable row level security;

create policy "public can read notes" on public.notes for select to anon, authenticated using (true);
create policy "public can insert notes" on public.notes for insert to anon, authenticated with check (true);
create policy "public can update notes" on public.notes for update to anon, authenticated using (true);
create policy "public can delete notes" on public.notes for delete to anon, authenticated using (true);

insert into public.notes (title, content, categoria, autor) values
  ('Today I created a Supabase project.', 'Conexión inicial de base de datos relacional PostgreSQL con RLS.', 'GENERAL', 'Ingeniero de Desarrollo'),
  ('I added some data and queried it from Next.js.', 'Verificación de consultas en tiempo real y sincronización en nube.', 'GENERAL', 'Ingeniero de Desarrollo'),
  ('It was awesome!', 'El sistema de bitácora y auditoría legal quedó operativo y listo para producción.', 'GENERAL', 'Director Técnico 4·90');`;

  const sqlFullSchemaSnippet = `-- 1. TABLA CENSO Y VIGENCIAS SST
CREATE TABLE IF NOT EXISTS public.trabajadores_vigencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    cargo VARCHAR(80) NOT NULL,
    empresa_contratista VARCHAR(120) DEFAULT '4·90 ESPACIOS S.A.S.',
    arl_entidad VARCHAR(50) NOT NULL,
    arl_fecha_vencimiento DATE NOT NULL,
    alturas_requerido BOOLEAN DEFAULT true,
    alturas_fecha_vencimiento DATE,
    examen_medico_vencimiento DATE NOT NULL,
    epp_requeridos JSONB DEFAULT '["helmet", "goggles", "reflective_vest", "gloves", "safety_boots", "safety_harness"]'::jsonb,
    estado VARCHAR(20) DEFAULT 'ACTIVO'
);

-- 2. BITÁCORA INMUTABLE (APPEND-ONLY LEDGER)
CREATE TABLE IF NOT EXISTS public.bitacora_ingresos_diarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cedula VARCHAR(20) NOT NULL,
    trabajador_nombre VARCHAR(150) NOT NULL,
    cargo VARCHAR(80) NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_exacta_llegada TIME NOT NULL,
    resultado_ingreso VARCHAR(20) NOT NULL,
    estado_epp VARCHAR(20) NOT NULL,
    epp_detectados JSONB NOT NULL,
    dias_vigentes_arl INTEGER NOT NULL,
    dias_vigentes_alturas INTEGER,
    hash_inmutable VARCHAR(64) NOT NULL
);

-- 3. TRIGGER DE BLINDAJE INMUTABLE
CREATE OR REPLACE FUNCTION public.fn_blindaje_bitacora_inmutable()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'VIOLACION DE INTEGRIDAD SST: La bitácora de ingreso es inmutable (Append-Only Ledger). No se permite modificar (UPDATE) ni eliminar (DELETE) registros.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_blindar_bitacora
BEFORE UPDATE OR DELETE ON public.bitacora_ingresos_diarios
FOR EACH ROW EXECUTE FUNCTION public.fn_blindaje_bitacora_inmutable();`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 font-sans">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold font-mono">
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          DOCUMENTACIÓN TÉCNICA & OPERATIVA
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Arquitectura de Software & Manual de Control en Obra
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-3xl leading-relaxed">
          Especificación integral del sistema desarrollado para <strong className="text-slate-900">4·90 ESPACIOS S.A.S.</strong>, 
          cubriendo la base de datos relacional en Supabase, el almacén autónomo de portería, los flujos duraderos de Vercel Workflows y las reglas de decisión del semáforo.
        </p>
      </div>

      {/* Grid de Secciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">PostgreSQL & Supabase</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Esquema relacional con 5 tablas normalizadas, disparador de inmutabilidad (Append-Only) y políticas Row Level Security (RLS).
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Normativa SG-SST</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Blindaje jurídico conforme a la Resolución 0312 de 2019 (Estándares Mínimos) y Resolución 4272 de 2021 (Trabajo Seguro en Alturas).
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
            <Workflow className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Vercel Workflow SDK</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Orquestación duradera con pausas de 24h (`sleep`), ejecución resiliente y alertas de recarga de planilla PILA.
          </p>
        </div>

      </div>

      {/* Sección 1: Esquema de Base de Datos */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest font-mono">Sección 01</span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Esquema SQL de la Tabla `notes` (CRUD)</h2>
          </div>
          <button
            onClick={() => copyToClipboard(sqlNotesSnippet, 'notes')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-300"
          >
            {copiedSection === 'notes' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-amber-600" />}
            <span>{copiedSection === 'notes' ? 'Copiado' : 'Copiar SQL'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Copia este código y ejecútalo en el <strong>SQL Editor</strong> de tu proyecto de Supabase para activar la tabla de notas con políticas públicas de lectura e inserción:
        </p>

        <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
          {sqlNotesSnippet}
        </pre>
      </section>

      {/* Sección 2: Esquema Maestro de la Constructora */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest font-mono">Sección 02</span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Esquema Maestro SG-SST (Ledger Inmutable)</h2>
          </div>
          <button
            onClick={() => copyToClipboard(sqlFullSchemaSnippet, 'schema')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-300"
          >
            {copiedSection === 'schema' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-amber-600" />}
            <span>{copiedSection === 'schema' ? 'Copiado' : 'Copiar DDL'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-600" />
              Garantía de Inmutabilidad Legal
            </h4>
            <p className="text-slate-600 leading-relaxed">
              El disparador <code className="font-mono text-amber-700">trg_blindar_bitacora</code> bloquea a nivel de PostgreSQL cualquier intento de <code className="font-mono">UPDATE</code> o <code className="font-mono">DELETE</code>. Esto asegura ante un juez o inspector laboral que las horas de ingreso no pudieron ser manipuladas por personal de portería.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-blue-600" />
              Sello de Tiempo del Servidor
            </h4>
            <p className="text-slate-600 leading-relaxed">
              La hora exacta no se toma del reloj del computador local de portería (evitando que alguien cambie la hora de Windows), sino que es estampa atómica certificada del servidor central.
            </p>
          </div>
        </div>

        <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed border border-slate-800 max-h-72">
          {sqlFullSchemaSnippet}
        </pre>
      </section>

      {/* Sección 3: Manual de Operación en Portería */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest font-mono">Sección 03</span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">Manual Operativo del Guarda en Portería</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Verde */}
          <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-emerald-900 uppercase">Luz Verde · Acceso Autorizado</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <strong>Condición:</strong> Dotación completa (6 de 6 implementos) + ARL con vigencia mayor a 15 días + Curso de Alturas al día.
            </p>
            <p className="text-emerald-800 font-semibold">
              Acción: El torniquete recibe pulso de 24V y permite el paso.
            </p>
          </div>

          {/* Amarillo */}
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="font-bold text-amber-900 uppercase">Luz Amarilla · Pre-Alerta</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <strong>Condición:</strong> Dotación completa, pero la planilla PILA o el Curso de Alturas vencerán en menos de 15 días.
            </p>
            <p className="text-amber-800 font-semibold">
              Acción: Permite el ingreso, muestra aviso preventivo y alerta a RRHH.
            </p>
          </div>

          {/* Rojo */}
          <div className="p-4 rounded-xl border border-rose-300 bg-rose-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="font-bold text-rose-900 uppercase">Luz Roja · Acceso Bloqueado</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <strong>Condición:</strong> Falta cualquier implemento (botas, casco, arnés) o la ARL/Alturas están vencidos (0 días).
            </p>
            <p className="text-rose-800 font-semibold">
              Acción: Torniquete trabado y novedad inmediata al inspector SISO.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
