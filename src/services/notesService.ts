// ==============================================================================
// SERVICIO CRUD DE NOTAS & NOVEDADES DE OBRA (SUPABASE POSTGRESQL + LOCAL CACHE)
// Compatible con la tabla 'notes' y exportación oficial a Excel / CSV para 4·90 Espacios
// ==============================================================================

import { supabase } from './supabaseClient';
import type { Note } from '../types';

const INITIAL_NOTES: Note[] = [
  {
    id: 1,
    title: 'Today I created a Supabase project.',
    content: 'Conexión inicial de base de datos relacional PostgreSQL con políticas RLS activadas.',
    categoria: 'GENERAL',
    autor: 'Ingeniero de Desarrollo',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 2,
    title: 'I added some data and queried it from Next.js.',
    content: 'Verificación de consultas en tiempo real y sincronización en la nube.',
    categoria: 'GENERAL',
    autor: 'Ingeniero de Desarrollo',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 3,
    title: 'It was awesome!',
    content: 'El sistema de bitácora y auditoría legal quedó operativo y listo para producción.',
    categoria: 'GENERAL',
    autor: 'Director Técnico 4·90',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 4,
    title: 'Inspección de líneas de vida Torre 4·90',
    content: 'Revisión técnica de anclajes de alturas en piso 12 conforme a Resolución 4272/2021. Todo conforme.',
    categoria: 'SEGURIDAD_SST',
    autor: 'Coordinador Alturas 4·90',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 5,
    title: 'Verificación de planilla PILA cuadrilla encofrado',
    content: 'Se cruzaron 18 obreros con ARL Seguros Bolívar. Se cargó soporte vigente hasta fin de mes.',
    categoria: 'PERSONAL',
    autor: 'Administración 4·90',
    created_at: new Date().toISOString()
  }
];

// Helper para obtener notas del almacenamiento local si no hay conexión
function getLocalNotes(): Note[] {
  const saved = localStorage.getItem('490_LOCAL_NOTES');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Ignorar
    }
  }
  localStorage.setItem('490_LOCAL_NOTES', JSON.stringify(INITIAL_NOTES));
  return INITIAL_NOTES;
}

function saveLocalNotes(notes: Note[]) {
  localStorage.setItem('490_LOCAL_NOTES', JSON.stringify(notes));
}

// 1. READ: Obtener todas las notas
export async function getNotes(): Promise<Note[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('id', { ascending: false });

      if (!error && data && data.length > 0) {
        saveLocalNotes(data);
        return data;
      }
    } catch (err) {
      console.warn('[Notes] Falló consulta remota a Supabase, leyendo caché local:', err);
    }
  }
  return getLocalNotes();
}

// 2. CREATE: Crear nueva nota
export async function createNote(note: Omit<Note, 'id' | 'created_at'>): Promise<Note> {
  const localList = getLocalNotes();
  const nextId = localList.length > 0 ? Math.max(...localList.map(n => n.id)) + 1 : 1;
  const newNote: Note = {
    ...note,
    id: nextId,
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: note.title,
          content: note.content || '',
          categoria: note.categoria || 'GENERAL',
          autor: note.autor || 'Inspector SST 4·90'
        }])
        .select()
        .single();

      if (!error && data) {
        const updatedList = [data, ...localList.filter(n => n.id !== data.id)];
        saveLocalNotes(updatedList);
        return data;
      }
    } catch (err) {
      console.warn('[Notes] No se pudo insertar en Supabase, guardado localmente:', err);
    }
  }

  const updated = [newNote, ...localList];
  saveLocalNotes(updated);
  return newNote;
}

// 3. UPDATE: Actualizar nota existente
export async function updateNote(id: number, fields: Partial<Omit<Note, 'id' | 'created_at'>>): Promise<Note> {
  const localList = getLocalNotes();
  const foundIndex = localList.findIndex(n => n.id === id);
  if (foundIndex === -1) throw new Error('Nota no encontrada');

  const updatedNote = { ...localList[foundIndex], ...fields };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: fields.title,
          content: fields.content,
          categoria: fields.categoria,
          autor: fields.autor
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        localList[foundIndex] = data;
        saveLocalNotes(localList);
        return data;
      }
    } catch (err) {
      console.warn('[Notes] No se pudo actualizar en Supabase, actualizado local:', err);
    }
  }

  localList[foundIndex] = updatedNote;
  saveLocalNotes(localList);
  return updatedNote;
}

// 4. DELETE: Eliminar nota
export async function deleteNote(id: number): Promise<boolean> {
  const localList = getLocalNotes();
  const filtered = localList.filter(n => n.id !== id);
  saveLocalNotes(filtered);

  if (supabase) {
    try {
      await supabase.from('notes').delete().eq('id', id);
    } catch (err) {
      console.warn('[Notes] Error eliminando en Supabase:', err);
    }
  }

  return true;
}

// 5. EXCEL EXPORT: Exportar a formato CSV / Excel formal para la empresa
export function exportNotesToExcel(notes: Note[]) {
  const now = new Date();
  const fechaStr = now.toISOString().split('T')[0];
  const horaStr = now.toLocaleTimeString('es-CO');

  const headers = ['ID', 'TITULO', 'DESCRIPCION / NOVEDAD', 'CATEGORIA', 'RESPONSABLE / AUTOR', 'FECHA DE REGISTRO'];
  const rows = notes.map(n => [
    n.id,
    `"${(n.title || '').replace(/"/g, '""')}"`,
    `"${(n.content || '').replace(/"/g, '""')}"`,
    n.categoria || 'GENERAL',
    `"${(n.autor || '').replace(/"/g, '""')}"`,
    n.created_at ? new Date(n.created_at).toLocaleString('es-CO') : fechaStr
  ]);

  const metadata = [
    `"4·90 ESPACIOS S.A.S. - BITACORA DE NOTAS Y NOVEDADES DE OBRA"`,
    `"Exportado el: ${fechaStr} a las ${horaStr}"`,
    `"Total Registros: ${notes.length}"`,
    ``
  ];

  const csvContent = '\uFEFF' + [...metadata, headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `490_Espacios_Notas_Obra_${fechaStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
