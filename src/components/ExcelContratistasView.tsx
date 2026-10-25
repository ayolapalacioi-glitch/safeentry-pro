// ==============================================================================
// MÓDULO EMPRESARIAL DE IMPORTACIÓN & CENSO EXCEL DE CONTRATISTAS
// Carga Masiva de Archivos Excel (.xlsx, .xls, .csv), Mapeo Inteligente y
// Organización Automática por Empresa Contratista para Control de Acceso en Obra
// ==============================================================================

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  Building2, 
  ArrowUpDown, 
  Filter, 
  RefreshCw
} from 'lucide-react';
import type { Worker } from '../types';
import { addDaysToToday } from '../services/dataService';
import { edgeDb } from '../services/edgeNoSqlDb';

interface ExcelContratistasViewProps {
  workers: Worker[];
  onWorkersReloaded: () => void;
}

export const ExcelContratistasView: React.FC<ExcelContratistasViewProps> = ({ 
  workers, 
  onWorkersReloaded 
}) => {
  const [parsedRows, setParsedRows] = useState<Partial<Worker>[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [workbookRef, setWorkbookRef] = useState<XLSX.WorkBook | null>(null);
  const [filterEmpresa, setFilterEmpresa] = useState<string>('TODAS');
  const [sortBy, setSortBy] = useState<'empresa' | 'nombre' | 'vigencia' | 'semaforo'>('empresa');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Normalizador de texto para emparejar cabeceras
  const normalizeKey = (key: string): string => {
    return key
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Función de mapeo inteligente de columnas
  const mapRowToWorker = (row: Record<string, any>): Partial<Worker> => {
    const rawKeys = Object.keys(row);
    const worker: any = {
      epp_requeridos: ['helmet', 'goggles', 'reflective_vest', 'gloves', 'safety_boots'],
      estado: 'ACTIVO',
      foto_perfil_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80'
    };

    rawKeys.forEach(rawKey => {
      const norm = normalizeKey(rawKey);
      const val = String(row[rawKey] ?? '').trim();

      if (['cedula', 'cc', 'documento', 'doc', 'identificacion', 'id'].includes(norm)) {
        worker.cedula = val.replace(/[^0-9]/g, '');
      } else if (['nombre', 'nombres', 'nombrecompleto', 'trabajador', 'empleado', 'operario'].includes(norm)) {
        worker.nombre_completo = val;
      } else if (['cargo', 'oficio', 'puesto', 'rol', 'especialidad'].includes(norm)) {
        worker.cargo = val;
      } else if (['empresa', 'contratista', 'empresacontratista', 'subcontratista', 'razonsocial'].includes(norm)) {
        worker.empresa_contratista = val;
      } else if (['arl', 'entidadarl', 'aseguradora'].includes(norm)) {
        worker.arl_entidad = val;
      } else if (['vencimientoarl', 'vencearl', 'fechaarl', 'pilavence', 'fechapila', 'vigenciaarl'].includes(norm)) {
        worker.arl_fecha_vencimiento = formatExcelDate(val);
      } else if (['alturas', 'cursoalturas', 'requierealturas', 'trabajoalturas'].includes(norm)) {
        worker.alturas_requerido = ['si', 's', 'true', '1', 'requiere', 'aplica'].includes(normVal(val));
      } else if (['vencimientoalturas', 'vencealturas', 'fechaalturas', 'certalturas'].includes(norm)) {
        worker.alturas_fecha_vencimiento = formatExcelDate(val);
      } else if (['examenmedico', 'examenovence', 'fechamedico', 'medico'].includes(norm)) {
        worker.examen_medico_vencimiento = formatExcelDate(val);
      } else if (['rh', 'gruposanguineo', 'sangre', 'tiposangre'].includes(norm)) {
        worker.grupo_sanguineo = val.toUpperCase();
      }
    });

    // Valores por defecto si faltan
    if (!worker.cedula) worker.cedula = 'SIN-DOC-' + Math.floor(Math.random() * 899999 + 100000);
    if (!worker.nombre_completo) worker.nombre_completo = 'Operario No Identificado';
    if (!worker.cargo) worker.cargo = 'Ayudante de Obra';
    if (!worker.empresa_contratista) worker.empresa_contratista = 'Contratista General';
    if (!worker.arl_entidad) worker.arl_entidad = 'ARL SURA';
    if (!worker.arl_fecha_vencimiento) worker.arl_fecha_vencimiento = addDaysToToday(30);
    if (!worker.grupo_sanguineo) worker.grupo_sanguineo = 'O+';
    if (worker.alturas_requerido === undefined) {
      const lowerCargo = (worker.cargo || '').toLowerCase();
      worker.alturas_requerido = lowerCargo.includes('altura') || lowerCargo.includes('encofrad') || lowerCargo.includes('armador');
    }
    if (worker.alturas_requerido && !worker.alturas_fecha_vencimiento) {
      worker.alturas_fecha_vencimiento = addDaysToToday(180);
    }
    if (worker.alturas_requerido) {
      worker.alturas_nivel = 'Avanzado (Res. 4272/2021)';
      if (!worker.epp_requeridos.includes('safety_harness')) {
        worker.epp_requeridos.push('safety_harness');
      }
    }

    // Cálculo dinámico de días vigentes
    worker.dias_vigentes_arl = computeDaysLeft(worker.arl_fecha_vencimiento);
    if (worker.alturas_requerido && worker.alturas_fecha_vencimiento) {
      worker.dias_vigentes_alturas = computeDaysLeft(worker.alturas_fecha_vencimiento);
    }

    // Clasificación de Semáforo
    if (worker.dias_vigentes_arl <= 0 || (worker.alturas_requerido && (worker.dias_vigentes_alturas ?? 0) <= 0)) {
      worker.color_semaforo = 'ROJO';
    } else if (worker.dias_vigentes_arl <= 15) {
      worker.color_semaforo = 'AMARILLO';
    } else {
      worker.color_semaforo = 'VERDE';
    }

    worker.id = `w-${worker.cedula}`;
    return worker;
  };

  const normVal = (v: string): string => {
    return v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  };

  // Convertidor de fechas de Excel (soporta serial numérico y cadenas 'YYYY-MM-DD', 'DD/MM/YYYY')
  const formatExcelDate = (val: any): string => {
    if (!val) return addDaysToToday(30);
    if (typeof val === 'number') {
      const date = new Date((val - (25567 + 2)) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    const str = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return addDaysToToday(30);
  };

  const computeDaysLeft = (targetDateStr: string): number => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(targetDateStr);
      target.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  // Manejo de carga de archivo Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        setWorkbookRef(wb);
        setSheetNames(wb.SheetNames);
        
        const firstSheet = wb.SheetNames[0];
        setSelectedSheet(firstSheet);
        parseSheet(wb, firstSheet);
      } catch (err) {
        console.error('Error leyendo archivo Excel:', err);
        setImportFeedback('Error al procesar el archivo Excel. Verifica que sea un formato .xlsx o .csv válido.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const parseSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return;
    const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
    
    if (jsonRows.length === 0) {
      setParsedRows([]);
      setImportFeedback(`La hoja "${sheetName}" no contiene registros válidos.`);
      return;
    }

    const mapped = jsonRows.map(mapRowToWorker);
    setParsedRows(mapped);
    setImportFeedback(`Se identificaron ${mapped.length} operarios en la hoja "${sheetName}".`);
  };

  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (workbookRef) {
      parseSheet(workbookRef, sheetName);
    }
  };

  // Guardar operarios importados en la base de datos local y memoria
  const handleImportToDatabase = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);

    try {
      let savedCount = 0;
      for (const row of parsedRows) {
        const workerToSave = row as Worker;
        await edgeDb.workers.put(workerToSave);
        savedCount++;
      }

      onWorkersReloaded();
      setImportFeedback(`¡Éxito! ${savedCount} operarios fueron cargados e indexados a la base de datos de portería.`);
    } catch (err: any) {
      console.error('Error guardando operarios en base de datos:', err);
      setImportFeedback(`Fallo al guardar: ${err.message || 'Error de base de datos'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Descarga de Plantilla Modelo de Excel
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Cédula': '1045821900',
        'Nombre Completo': 'Carlos Andrés Pérez',
        'Cargo': 'Oficial de Alturas & Estructura',
        'Empresa Contratista': 'Consorcio Constructor Principal',
        'Grupo Sanguíneo': 'O+',
        'Entidad ARL': 'ARL SURA',
        'Vencimiento ARL': addDaysToToday(28),
        'Requiere Alturas': 'SI',
        'Vencimiento Alturas': addDaysToToday(150),
        'Examen Médico': addDaysToToday(200)
      },
      {
        'Cédula': '1032441205',
        'Nombre Completo': 'Brayan Alexis Martínez',
        'Cargo': 'Ayudante Práctico de Obra',
        'Empresa Contratista': 'Estructuras de Concreto & Aceros S.A.S.',
        'Grupo Sanguíneo': 'A+',
        'Entidad ARL': 'Seguros Bolívar',
        'Vencimiento ARL': addDaysToToday(30),
        'Requiere Alturas': 'NO',
        'Vencimiento Alturas': '',
        'Examen Médico': addDaysToToday(120)
      },
      {
        'Cédula': '98712330',
        'Nombre Completo': 'Jorge Eliecer Ramírez',
        'Cargo': 'Oficial de Armado & Encofrado',
        'Empresa Contratista': 'Estructuras de Concreto & Aceros S.A.S.',
        'Grupo Sanguíneo': 'B+',
        'Entidad ARL': 'ARL SURA',
        'Vencimiento ARL': addDaysToToday(12),
        'Requiere Alturas': 'SI',
        'Vencimiento Alturas': addDaysToToday(60),
        'Examen Médico': addDaysToToday(90)
      },
      {
        'Cédula': '79845120',
        'Nombre Completo': 'Nelson Enrique Gómez',
        'Cargo': 'Oficial Encofrador',
        'Empresa Contratista': 'Consorcio Constructor Principal',
        'Grupo Sanguíneo': 'O-',
        'Entidad ARL': 'Seguros Bolívar',
        'Vencimiento ARL': addDaysToToday(20),
        'Requiere Alturas': 'SI',
        'Vencimiento Alturas': addDaysToToday(-5),
        'Examen Médico': addDaysToToday(45)
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Censo_Personal_Obra');
    XLSX.writeFile(wb, 'Plantilla_Censo_Contratistas_Obra.xlsx');
  };

  // Exportar todo el censo actual consolidado a Excel
  const handleExportCurrentCensus = () => {
    const listToExport = parsedRows.length > 0 ? parsedRows : workers;
    const exportData = listToExport.map(w => ({
      'Cédula': w.cedula,
      'Nombre Completo': w.nombre_completo,
      'Cargo': w.cargo,
      'Empresa Contratista': w.empresa_contratista,
      'Estado Semáforo': w.color_semaforo,
      'Días Restantes ARL': w.dias_vigentes_arl,
      'Entidad ARL': w.arl_entidad,
      'Vencimiento ARL': w.arl_fecha_vencimiento,
      'Requiere Alturas': w.alturas_requerido ? 'SI' : 'NO',
      'Días Restantes Alturas': w.dias_vigentes_alturas ?? 'N/A',
      'Vencimiento Alturas': w.alturas_fecha_vencimiento || 'N/A',
      'RH': w.grupo_sanguineo
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Censo_Consolidado');
    XLSX.writeFile(wb, `Censo_Contratistas_Obra_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Lista de datos a mostrar (los recién cargados o los que ya están en la base de datos)
  const displayList = parsedRows.length > 0 ? parsedRows : workers;

  // Empresas únicas detectadas
  const empresasList = Array.from(new Set(displayList.map(w => w.empresa_contratista || 'Sin Empresa'))).filter(Boolean);

  // Filtrado y ordenamiento según empresa o criterio
  const filteredList = displayList.filter(w => {
    if (filterEmpresa === 'TODAS') return true;
    return w.empresa_contratista === filterEmpresa;
  }).sort((a, b) => {
    if (sortBy === 'empresa') {
      return (a.empresa_contratista || '').localeCompare(b.empresa_contratista || '');
    }
    if (sortBy === 'nombre') {
      return (a.nombre_completo || '').localeCompare(b.nombre_completo || '');
    }
    if (sortBy === 'vigencia') {
      return (a.dias_vigentes_arl ?? 0) - (b.dias_vigentes_arl ?? 0);
    }
    if (sortBy === 'semaforo') {
      const score = (col: string | undefined) => col === 'ROJO' ? 0 : col === 'AMARILLO' ? 1 : 2;
      return score(a.color_semaforo) - score(b.color_semaforo);
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#111927] border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight font-sans">
              Gestor de Censo & Carga Masiva en Excel
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Sube los archivos de personal de cada empresa contratista en formato <strong>.xlsx</strong> o <strong>.csv</strong>. 
            El motor mapea las columnas automáticamente, organiza las cuadrillas por razón social y actualiza el control de portería al instante.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-sm"
            title="Descargar archivo modelo con encabezados estándar"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Plantilla Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportCurrentCensus}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Todo a Excel</span>
          </button>
        </div>
      </div>

      {/* Upload Drop Zone Card */}
      <div className="bg-[#111927] border-2 border-dashed border-slate-700 hover:border-amber-500/60 transition-colors rounded-2xl p-6 text-center space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
          <Upload className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">
            {fileName ? `Archivo Seleccionado: ${fileName}` : 'Arrastra o selecciona el archivo Excel de la Empresa Contratista'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Compatible con formatos Microsoft Excel (.xlsx, .xls) y valores separados por comas (.csv)
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>{fileName ? 'Reemplazar Archivo Excel' : 'Seleccionar Archivo de mi Equipo'}</span>
          </button>

          {parsedRows.length > 0 && (
            <button
              onClick={handleImportToDatabase}
              disabled={isProcessing}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Cargar e Integrar al Censo de Obra ({parsedRows.length} Operarios)</span>
            </button>
          )}
        </div>

        {/* Sheet Selector if multiple sheets exist */}
        {sheetNames.length > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400 font-mono">Pestaña del Libro Excel:</span>
            <select
              value={selectedSheet}
              onChange={(e) => handleSheetChange(e.target.value)}
              className="p-1.5 bg-[#0b101a] border border-slate-700 rounded-lg text-xs text-slate-200 font-mono"
            >
              {sheetNames.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {importFeedback && (
          <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-300 font-medium inline-block">
            {importFeedback}
          </div>
        )}
      </div>

      {/* Filter and Grouping Bar */}
      <div className="bg-[#111927] border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Filter by Contractor */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 font-mono uppercase">Filtrar por Contratista:</span>
          <select
            value={filterEmpresa}
            onChange={(e) => setFilterEmpresa(e.target.value)}
            className="flex-1 sm:flex-none p-2 bg-[#0b101a] border border-slate-700 rounded-lg text-xs text-slate-200 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="TODAS">Todas las Empresas ({displayList.length} Operarios)</option>
            {empresasList.map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
        </div>

        {/* Sorting options */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 font-mono uppercase">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-2 bg-[#0b101a] border border-slate-700 rounded-lg text-xs text-slate-200 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="empresa">Empresa Contratista (A - Z)</option>
            <option value="nombre">Nombre de Operario</option>
            <option value="vigencia">Urgencia de Vencimiento ARL</option>
            <option value="semaforo">Estado de Semáforo (Rojos primero)</option>
          </select>
        </div>

      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#111927] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">Operarios en Lista</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">{filteredList.length}</span>
            <span className="text-xs text-slate-500">registros</span>
          </div>
        </div>

        <div className="bg-[#111927] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">Empresas Contratistas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-400">{empresasList.length}</span>
            <span className="text-xs text-slate-500">consorcios</span>
          </div>
        </div>

        <div className="bg-[#111927] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">Documentación al Día</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {filteredList.filter(w => w.color_semaforo === 'VERDE').length}
            </span>
            <span className="text-xs text-slate-500">Semáforo Verde</span>
          </div>
        </div>

        <div className="bg-[#111927] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">Pre-alertas o Vencidos</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-rose-400">
              {filteredList.filter(w => w.color_semaforo !== 'VERDE').length}
            </span>
            <span className="text-xs text-slate-500">requieren trámite</span>
          </div>
        </div>
      </div>

      {/* Table Display Organized by Contractor */}
      <div className="bg-[#111927] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0b101a] border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Operario & Documento</th>
                <th className="py-3 px-4">Empresa Contratista</th>
                <th className="py-3 px-4">Cargo / Oficio</th>
                <th className="py-3 px-4">Cobertura ARL</th>
                <th className="py-3 px-4">Trabajo en Alturas</th>
                <th className="py-3 px-4 text-center">Semáforo SST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredList.map((w, idx) => {
                const initials = (w.nombre_completo || 'OP')
                  .split(' ')
                  .slice(0, 2)
                  .map(p => p[0])
                  .join('');

                return (
                  <tr key={w.cedula || idx} className="hover:bg-slate-800/40 transition-colors">
                    {/* Worker Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-amber-400 shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{w.nombre_completo}</div>
                          <div className="font-mono text-[11px] text-slate-400">C.C. {w.cedula}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contractor Company */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-200">
                        <Building2 className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                        <span className="truncate max-w-[200px]">{w.empresa_contratista}</span>
                      </div>
                    </td>

                    {/* Cargo */}
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {w.cargo}
                    </td>

                    {/* ARL status */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-bold">{w.dias_vigentes_arl}d vigentes</span>
                        <span className="text-slate-500">({w.arl_entidad?.split(' ')[0]})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Vence: {w.arl_fecha_vencimiento}</div>
                    </td>

                    {/* Alturas Status */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {w.alturas_requerido ? (
                        <div>
                          <span className={`font-bold ${
                            (w.dias_vigentes_alturas ?? 0) > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {(w.dias_vigentes_alturas ?? 0) > 0 ? `${w.dias_vigentes_alturas}d (Vigente)` : 'EXPIRADO'}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">Res. 4272/2021</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">No aplica</span>
                      )}
                    </td>

                    {/* Semáforo SST Badge */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        w.color_semaforo === 'VERDE'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : w.color_semaforo === 'AMARILLO'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          w.color_semaforo === 'VERDE' ? 'bg-emerald-400' : w.color_semaforo === 'AMARILLO' ? 'bg-amber-400' : 'bg-rose-400'
                        }`} />
                        {w.color_semaforo}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
