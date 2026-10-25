// ==============================================================================
// CRUD DE NOTAS & NOVEDADES DE OBRA · 4·90 ESPACIOS S.A.S.
// Conexión Supabase (PostgreSQL) + Exportación Excel + Raw JSON Viewer
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  Code2, 
  FileText,
  User,
  X
} from 'lucide-react';
import type { Note } from '../types';
import { getNotes, createNote, updateNote, deleteNote, exportNotesToExcel } from '../services/notesService';
import { getSupabaseConfig } from '../services/supabaseClient';

export const NotesCrudView: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showJsonRaw, setShowJsonRaw] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoria, setCategoria] = useState<Note['categoria']>('GENERAL');
  const [autor, setAutor] = useState('Inspector SST 4·90');
  const [saving, setSaving] = useState(false);

  const isConfigured = getSupabaseConfig().isConnected;

  const loadData = async () => {
    setLoading(true);
    const data = await getNotes();
    setNotes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategoria('GENERAL');
    setAutor('Inspector SST 4·90');
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setCategoria(note.categoria || 'GENERAL');
    setAutor(note.autor || 'Inspector SST 4·90');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      if (editingNote) {
        await updateNote(editingNote.id, { title, content, categoria, autor });
      } else {
        await createNote({ title, content, categoria, autor });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error guardando nota:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Confirmas que deseas eliminar esta nota de la bitácora?')) {
      await deleteNote(id);
      await loadData();
    }
  };

  const handleExport = () => {
    exportNotesToExcel(filteredNotes);
  };

  const filteredNotes = notes.filter(n => {
    const matchSearch = 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.content && n.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (n.autor && n.autor.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchCategory = selectedCategory === 'ALL' || n.categoria === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Bitácora de Notas & Novedades de Obra
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold border border-slate-200">
              CRUD Supabase (Table: `notes`) · {isConfigured ? 'Producción Cloud' : 'Modo Sincronizado'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Registro diario de anotaciones de interventoría, inspecciones de seguridad y novedades de cuadrilla para <strong className="text-slate-800">4·90 Espacios S.A.S.</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJsonRaw(!showJsonRaw)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
              showJsonRaw 
                ? 'bg-slate-900 text-white border-slate-800' 
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Code2 className="w-4 h-4 text-amber-600" />
            <span>{showJsonRaw ? 'Ver Vista Tarjetas' : 'Ver JSON Supabase'}</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel (.csv)</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-sm shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Nota</span>
          </button>
        </div>
      </div>

      {/* Raw JSON Preview if activated */}
      {showJsonRaw && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] border-b border-slate-800 pb-2">
            <span>QUERY RESULT FROM SUPABASE (`notes`):</span>
            <span className="text-amber-400">{filteredNotes.length} registros</span>
          </div>
          <pre className="font-mono text-emerald-400 text-xs overflow-x-auto max-h-96 p-3 bg-black/60 rounded-lg">
            {JSON.stringify(filteredNotes, null, 2)}
          </pre>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar nota por título, contenido o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl text-xs shadow-sm overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({notes.length})
          </button>
          <button
            onClick={() => setSelectedCategory('SEGURIDAD_SST')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'SEGURIDAD_SST' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SST & Alturas
          </button>
          <button
            onClick={() => setSelectedCategory('AVANCE_OBRA')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'AVANCE_OBRA' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Avance de Obra
          </button>
          <button
            onClick={() => setSelectedCategory('PERSONAL')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'PERSONAL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cuadrillas
          </button>
          <button
            onClick={() => setSelectedCategory('GENERAL')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'GENERAL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            General
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-600 mb-2" />
          <p className="text-xs font-semibold">Consultando notas en Supabase...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500">
          <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-700">No se encontraron notas registradas.</p>
          <p className="text-[11px] text-slate-400 mt-1">Haz clic en "Nueva Nota" para agregar una novedad de obra.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(n => (
            <div
              key={n.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                    n.categoria === 'SEGURIDAD_SST' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    n.categoria === 'AVANCE_OBRA' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    n.categoria === 'PERSONAL' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {n.categoria || 'GENERAL'}
                  </span>

                  <span className="text-[10px] text-slate-400 font-mono">
                    ID #{n.id}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {n.title}
                </h3>

                {n.content && (
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {n.content}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 truncate max-w-[170px]" title={n.autor}>
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{n.autor || '4·90 Espacios'}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(n)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                    title="Editar Nota"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Eliminar Nota"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar Nota */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingNote ? 'Editar Nota de Obra' : 'Registrar Nueva Nota / Novedad'}
                </h3>
                <p className="text-xs text-slate-500">
                  Sincronizado directamente con la tabla `notes` de Supabase
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Título de la Nota / Novedad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Inspección de arneses cuadrilla piso 8"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Descripción Detallada
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalles técnicos, estado de los implementos o novedades para la interventoría..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Categoría
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value="GENERAL">General</option>
                    <option value="SEGURIDAD_SST">SST & Alturas</option>
                    <option value="AVANCE_OBRA">Avance de Obra</option>
                    <option value="PERSONAL">Cuadrillas / Personal</option>
                    <option value="INTERVENTORIA">Interventoría</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Responsable / Autor
                  </label>
                  <input
                    type="text"
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm shadow-amber-500/20 flex items-center gap-1.5"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Guardar Nota'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
