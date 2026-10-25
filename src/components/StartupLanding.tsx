// ==============================================================================
// VISTA CORPORATIVA: SAFEENTRY PRO - CONTROL INTELIGENTE DE OBRA & SG-SST
// Diseño Arquitectónico Profesional, Limpio y Enfocado a Resultados de Construcción
// ==============================================================================

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  HardHat, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Activity, 
  Eye, 
  Lock, 
  FileCheck2, 
  ChevronRight,
  ChevronLeft,
  FileSpreadsheet,
  BookOpen
} from 'lucide-react';

interface StartupLandingProps {
  onLaunchKiosk: () => void;
  onLaunchDashboard: () => void;
  onLaunchBitacora: () => void;
  onLaunchNotes: () => void;
  onLaunchManual: () => void;
}

export const StartupLanding: React.FC<StartupLandingProps> = ({
  onLaunchKiosk,
  onLaunchDashboard,
  onLaunchBitacora,
  onLaunchNotes,
  onLaunchManual
}) => {
  // Calculadora interactiva de ahorro en obra civil
  const [numTrabajadores, setNumTrabajadores] = useState<number>(120);
  const [diasMes, setDiasMes] = useState<number>(24);
  
  // Carrusel interactivo de fotografías de obra civil
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const carouselSlides = [
    {
      id: 1,
      tag: 'Supervisión Estructural & Control',
      title: 'Dirección de Obra y Revisión de Planos en Losa',
      desc: 'Ingenieros residentes y maestros de obra coordinando ejes de cimentación con dotación EPP completa.',
      imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80',
      badge: 'Fase Estructuras'
    },
    {
      id: 2,
      tag: 'Trabajo Seguro en Alturas',
      title: 'Andamiaje Certificado & Arnés de 4 Argollas',
      desc: 'Control estricto de certificación Res. 4272/2021 y líneas de vida para vaciado en altura.',
      imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&auto=format&fit=crop&q=80',
      badge: 'Cero Accidentes'
    },
    {
      id: 3,
      tag: 'Armado de Acero & Encofrados',
      title: 'Cuadrilla de Armadores y Mallas de Cimentación',
      desc: 'Verificación de guantes de vaqueta, gafas y calzado con puntera de acero en maniobras con varilla.',
      imageUrl: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=1200&auto=format&fit=crop&q=80',
      badge: 'Seguridad Operativa'
    },
    {
      id: 4,
      tag: 'Edificación Vertical & Izaje',
      title: 'Operación con Grúas Torre y Vaciado de Concreto',
      desc: 'Control perimetral en radio de giro de grúa y verificación de cuadrillas en pisos superiores.',
      imageUrl: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=1200&auto=format&fit=crop&q=80',
      badge: 'Alta Productividad'
    },
    {
      id: 5,
      tag: 'Topografía & Replanteo',
      title: 'Control Métrico y Niveles de Construcción',
      desc: 'Topógrafos y cadeneros auditados en portería antes de iniciar mediciones en terreno.',
      imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&auto=format&fit=crop&q=80',
      badge: 'Precisión Civil'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  // 8% de ahorro en ineficiencia de asistencia + jornadas ficticias
  const ahorroNominaEstimado = Math.round(numTrabajadores * diasMes * 19500 * 0.08);
  const riesgoSancionEvitado = 25000000; // Sanción típica Mintrabajo por laborar sin ARL / Alturas

  return (
    <div className="bg-slate-50 text-slate-800 space-y-16 py-6 font-sans">
      
      {/* Hero Section con Imagen Real de Obra Civil */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                SAFEENTRY PRO · PLATAFORMA UNIVERSAL PARA CONSTRUCCIÓN
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Control Inteligente de Portería, <br />
                <span className="text-amber-600">Dotación EPP y Seguridad SST</span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                Solución integral de misión crítica para proyectos de obras civiles e infraestructura: 
                audita en menos de 1.5 segundos la identidad del obrero, verifica que porte sus 6 implementos obligatorios 
                y valida en tiempo real la vigencia de su ARL y Curso de Alturas antes de autorizar el ingreso.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onLaunchKiosk}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 group"
                >
                  <HardHat className="w-4 h-4 text-slate-950" />
                  <span>Ver Kiosco de Portería en Vivo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onLaunchNotes}
                  className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Notas de Obra & Excel</span>
                </button>

                <button
                  onClick={onLaunchManual}
                  className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl text-sm transition-all border border-slate-300 shadow-sm flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>Manual de Usuario</span>
                </button>

                <button
                  onClick={onLaunchDashboard}
                  className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2"
                >
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Panel SST</span>
                </button>
              </div>

              {/* Legal Standards Badges */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resolución 0312 de 2019 (SG-SST)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resolución 4272 de 2021 (Trabajo en Alturas)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Garantía Operativa a las 6:30 AM sin Caídas</span>
                </div>
              </div>

            </div>

            {/* Right: Authentic Construction Photo */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white aspect-[4/3] bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80"
                  alt="Personal e ingenieros en obra civil con dotación EPP y planos"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                
                {/* Floating Card over Image */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200 shadow-lg text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      INGRESO AUTORIZADO
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">06:52:14 AM</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Carlos Andrés Pérez · Oficial de Estructuras (Cuadrilla Encofrado)
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1">
                    <span>Dotación EPP: 6/6 Conforme</span>
                    <span className="font-semibold text-emerald-600">ARL: 24 días vigentes</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Sección Destacada: Actualizaciones Recientes (CRUD Notes + Excel + Manual) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border-2 border-amber-500/30 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded tracking-wide">
                  NUEVO EN ESTA VERSIÓN
                </span>
                <span className="text-xs font-bold text-slate-700">
                  Control Centralizado & Exportación
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Bitácora de Notas & Novedades con Descarga a Excel y Manual de Usuario
              </h3>
              <p className="text-xs text-slate-600 max-w-3xl">
                Accede directamente al nuevo gestor de notas con registro centralizado, visor de respuesta del servidor y exportador a hojas de cálculo Excel, además del manual operativo paso a paso para supervisores de portería.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={onLaunchNotes}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Abrir Notas & Excel</span>
              </button>

              <button
                onClick={onLaunchManual}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Manual de Usuario</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Los 3 Pilares Operativos de Control */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest font-mono">
            Beneficios Directos en Obra
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Control de Misión Crítica en un Solo Paso
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Cero papeles en portería, cero cuellos de botella al iniciar turno y respaldo documental inalterable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pilar 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                1. Biometría & Horario Inalterable
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Al identificar el rostro del trabajador, el sistema estampa la hora exacta de llegada en un registro blindado de solo lectura. Nadie puede alterar ni borrar asistencias ni llegadas tarde.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-700 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Fin de la "nómina fantasma"</span>
            </div>
          </div>

          {/* Pilar 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <HardHat className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                2. Auditoría Óptica de Dotación EPP
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cámara de cuerpo entero en el torniquete que certifica en milisegundos los 6 implementos obligatorios: casco, gafas, chaleco reflectivo, arnés de alturas, guantes y botas de seguridad.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-700 font-semibold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>Respaldo fotográfico automático</span>
            </div>
          </div>

          {/* Pilar 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                3. Conteo de Vigencias ARL & Alturas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                El sistema descuenta automáticamente 1 día de vigencia cada mañana. Emite aviso preventivo con 15 días de antelación y frena el ingreso si la seguridad social o el certificado de alturas expiró.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-700 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Cumplimiento legal Res. 4272/2021</span>
            </div>
          </div>

        </div>
      </section>

      {/* Carrusel Profesional de Fotografías de Obra Civil */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Carrusel Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest font-mono">
                  Galería Operativa en Terreno
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                Presencia Real en Proyectos de Construcción Civil
              </h3>
            </div>

            {/* Controles del Carrusel (Flechas y Contador) */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-500">
                0{currentSlide + 1} / 0{carouselSlides.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={prevSlide}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 transition-colors shadow-xs"
                  title="Foto anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 transition-colors shadow-xs"
                  title="Siguiente foto"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Slide Principal del Carrusel */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] bg-slate-900 border border-slate-200 shadow-md">
            <img
              src={carouselSlides[currentSlide].imageUrl}
              alt={carouselSlides[currentSlide].title}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>

            {/* Info Overlay del Slide Activo */}
            <div className="absolute bottom-6 left-6 right-6 md:left-8 md:right-8 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-mono">
                    {carouselSlides[currentSlide].tag}
                  </span>
                  <span className="text-[10px] font-bold bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded border border-white/20">
                    {carouselSlides[currentSlide].badge}
                  </span>
                </div>
                <h4 className="text-lg md:text-2xl font-bold tracking-tight">
                  {carouselSlides[currentSlide].title}
                </h4>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                  {carouselSlides[currentSlide].desc}
                </p>
              </div>

              <button
                onClick={onLaunchKiosk}
                className="self-start md:self-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shrink-0 flex items-center gap-1.5"
              >
                <span>Ver Control en Kiosco</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tiras de Miniaturas / Indicadores */}
          <div className="grid grid-cols-5 gap-2 md:gap-3 pt-1">
            {carouselSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`text-left p-2 rounded-xl border transition-all ${
                  currentSlide === idx
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 opacity-70 hover:opacity-100'
                }`}
              >
                <span className="block text-[10px] font-mono font-bold text-amber-600">
                  0{idx + 1}
                </span>
                <span className="block text-[11px] font-bold text-slate-800 truncate">
                  {slide.tag}
                </span>
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Calculadora de Ahorro para Gerencia de Obra */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                Retorno de Inversión en Obra
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Impacto Financiero Directo en Obra Civil
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Liquida únicamente las horas realmente trabajadas por obreros y subcontratistas. 
                Evita contingencias laborales y demandas solidarias mediante respaldo fotográfico legal inalterable.
              </p>

              {/* Sliders */}
              <div className="space-y-4 pt-3">
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                    <span>Personal total en obra (todas las cuadrillas):</span>
                    <span className="text-amber-400 font-bold">{numTrabajadores} trabajadores</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="400"
                    step="10"
                    value={numTrabajadores}
                    onChange={(e) => setNumTrabajadores(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                    <span>Jornales laborados al mes:</span>
                    <span className="text-amber-400 font-bold">{diasMes} días</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="28"
                    value={diasMes}
                    onChange={(e) => setDiasMes(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Impact Box */}
            <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Ahorro Mensual Estimado</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold px-2 py-0.5 rounded">
                  Control Estricto
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Ahorro Directo en Nómina & Horas Ficticias:</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono mt-1">
                  ${ahorroNominaEstimado.toLocaleString('es-CO')} <span className="text-sm text-slate-400 font-normal">COP/mes</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Protección Frente a Sanciones SST (Art. 13 Ley 1562):</span>
                <div className="text-xl font-bold text-amber-400 font-mono mt-1">
                  Hasta ${riesgoSancionEvitado.toLocaleString('es-CO')} <span className="text-xs text-slate-400 font-normal">COP</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Blindaje total ante inspecciones del Ministerio del Trabajo.</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span>Tiempo de amortización del sistema:</span>
                <span className="text-white font-bold font-mono text-sm">&lt; 6 semanas</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center pb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4 shadow-sm">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Comencemos la Demostración Operativa en Vivo
          </h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto">
            Accede al kiosco en vivo, valida las cuadrillas y revisa la bitácora legal inalterable con fotos de evidencia.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={onLaunchKiosk}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
            >
              Abrir Kiosco de Portería
            </button>
            <button
              onClick={onLaunchBitacora}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors border border-slate-200"
            >
              Revisar Bitácora Legal
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
