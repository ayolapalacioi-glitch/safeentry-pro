// ==============================================================================
// MOTOR DE VISIÓN ARTIFICIAL (YOLOv11-EPP CORE)
// Detección en tiempo real de implementos de seguridad con coordenadas normalizadas
// ==============================================================================

import type { EPPDetectionsMap, EPPItemState } from '../types';

export interface VisionScenario {
  id: string;
  name: string;
  description: string;
  workerCedula: string;
  workerName: string;
  cargo: string;
  imageFallback: string;
  detections: EPPDetectionsMap;
}

export const DEMO_SCENARIOS: VisionScenario[] = [
  {
    id: 'esc-carlos-ok',
    name: '1. Carlos Pérez (Conforme 100%)',
    description: 'Oficial de Alturas con dotación completa de 6 implementos y papeles vigentes.',
    workerCedula: '1045821900',
    workerName: 'Carlos Andrés Pérez',
    cargo: 'Oficial de Alturas & Estructura',
    imageFallback: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
    detections: {
      helmet: { key: 'helmet', label: 'Casco Dielectrico', detected: true, confidence: 99.4, box: [0.08, 0.32, 0.22, 0.68], required: true },
      goggles: { key: 'goggles', label: 'Gafas de Seguridad', detected: true, confidence: 96.8, box: [0.22, 0.38, 0.28, 0.62], required: true },
      reflective_vest: { key: 'reflective_vest', label: 'Chaleco Reflectivo', detected: true, confidence: 98.9, box: [0.30, 0.22, 0.65, 0.78], required: true },
      safety_harness: { key: 'safety_harness', label: 'Arnés Alturas 4 Argollas', detected: true, confidence: 95.2, box: [0.32, 0.25, 0.70, 0.75], required: true },
      gloves: { key: 'gloves', label: 'Guantes Vaqueta', detected: true, confidence: 94.7, box: [0.55, 0.15, 0.68, 0.30], required: true },
      safety_boots: { key: 'safety_boots', label: 'Botas Punta de Acero', detected: true, confidence: 97.6, box: [0.82, 0.30, 0.96, 0.70], required: true },
    }
  },
  {
    id: 'esc-brayan-missing-boots',
    name: '2. Brayan Martínez (Sin Botas ni Gafas)',
    description: 'Ayudante de obra que omitió colocarse las gafas y llegó en calzado no reglamentario.',
    workerCedula: '1032441205',
    workerName: 'Brayan Alexis Martínez',
    cargo: 'Ayudante Práctico de Obra',
    imageFallback: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
    detections: {
      helmet: { key: 'helmet', label: 'Casco Obra', detected: true, confidence: 98.7, box: [0.08, 0.32, 0.22, 0.68], required: true },
      goggles: { key: 'goggles', label: 'Gafas de Seguridad', detected: false, confidence: 12.3, required: true },
      reflective_vest: { key: 'reflective_vest', label: 'Chaleco Reflectivo', detected: true, confidence: 99.1, box: [0.30, 0.22, 0.65, 0.78], required: true },
      safety_harness: { key: 'safety_harness', label: 'Arnés Alturas', detected: false, confidence: 15.0, required: false },
      gloves: { key: 'gloves', label: 'Guantes Vaqueta', detected: true, confidence: 91.5, box: [0.55, 0.15, 0.68, 0.30], required: true },
      safety_boots: { key: 'safety_boots', label: 'Botas Punta Acero', detected: false, confidence: 24.1, required: true },
    }
  },
  {
    id: 'esc-jorge-warning',
    name: '3. Jorge Ramírez (Pre-alerta ARL en 6 días)',
    description: 'Armador de acero y encofrador con EPP completo, pero su cobertura ARL vence en menos de una semana.',
    workerCedula: '98712330',
    workerName: 'Jorge Eliecer Ramírez',
    cargo: 'Oficial de Armado & Encofrado',
    imageFallback: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&auto=format&fit=crop&q=80',
    detections: {
      helmet: { key: 'helmet', label: 'Casco Dielectrico', detected: true, confidence: 99.1, box: [0.08, 0.32, 0.22, 0.68], required: true },
      goggles: { key: 'goggles', label: 'Gafas de Seguridad', detected: true, confidence: 95.4, box: [0.22, 0.38, 0.28, 0.62], required: true },
      reflective_vest: { key: 'reflective_vest', label: 'Chaleco Reflectivo', detected: true, confidence: 97.8, box: [0.30, 0.22, 0.65, 0.78], required: true },
      safety_harness: { key: 'safety_harness', label: 'Arnés de Seguridad', detected: true, confidence: 96.0, box: [0.32, 0.25, 0.70, 0.75], required: true },
      gloves: { key: 'gloves', label: 'Guantes de Vaqueta', detected: true, confidence: 98.2, box: [0.55, 0.15, 0.68, 0.30], required: true },
      safety_boots: { key: 'safety_boots', label: 'Botas Punta Acero', detected: true, confidence: 96.9, box: [0.82, 0.30, 0.96, 0.70], required: true },
    }
  },
  {
    id: 'esc-nelson-expired-alturas',
    name: '4. Nelson Gómez (Curso Alturas Vencido)',
    description: 'Encofrador con dotación lista, pero su certificación de alturas Res. 4272 expiró.',
    workerCedula: '79845120',
    workerName: 'Nelson Enrique Gómez',
    cargo: 'Oficial Encofrador',
    imageFallback: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
    detections: {
      helmet: { key: 'helmet', label: 'Casco de Seguridad', detected: true, confidence: 98.9, box: [0.08, 0.32, 0.22, 0.68], required: true },
      goggles: { key: 'goggles', label: 'Gafas de Protección', detected: true, confidence: 94.6, box: [0.22, 0.38, 0.28, 0.62], required: true },
      reflective_vest: { key: 'reflective_vest', label: 'Chaleco Reflectivo', detected: true, confidence: 99.2, box: [0.30, 0.22, 0.65, 0.78], required: true },
      safety_harness: { key: 'safety_harness', label: 'Arnés 4 Argollas', detected: true, confidence: 95.8, box: [0.32, 0.25, 0.70, 0.75], required: true },
      gloves: { key: 'gloves', label: 'Guantes Vaqueta', detected: true, confidence: 93.4, box: [0.55, 0.15, 0.68, 0.30], required: true },
      safety_boots: { key: 'safety_boots', label: 'Botas de Seguridad', detected: true, confidence: 97.1, box: [0.82, 0.30, 0.96, 0.70], required: true },
    }
  }
];

// Función para dibujar los Bounding Boxes de YOLOv11 en el Canvas HTML5
export function renderYoloBoundingBoxes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  detections: EPPDetectionsMap
) {
  ctx.save();

  // Bounding box styling
  ctx.lineWidth = 2;
  ctx.font = 'bold 12px "JetBrains Mono", monospace';

  Object.values(detections).forEach((item: EPPItemState) => {
    if (!item.box) return;

    const [ymin, xmin, ymax, xmax] = item.box;
    const x = xmin * width;
    const y = ymin * height;
    const w = (xmax - xmin) * width;
    const h = (ymax - ymin) * height;

    const isOk = item.detected;
    const strokeColor = isOk ? '#10B981' : '#EF4444';
    const fillBadge = isOk ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)';

    // Rectángulo del implemento
    ctx.strokeStyle = strokeColor;
    ctx.strokeRect(x, y, w, h);

    // Corner brackets tácticos
    const corner = 10;
    ctx.lineWidth = 3;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(x, y + corner);
    ctx.lineTo(x, y);
    ctx.lineTo(x + corner, y);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + w - corner, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + corner);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x, y + h - corner);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + corner, y + h);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x + w - corner, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y + h - corner);
    ctx.stroke();

    // Etiqueta superior con nombre y % confianza
    const labelText = `${item.label} · ${item.confidence.toFixed(1)}%`;
    const textMetrics = ctx.measureText(labelText);
    const badgeW = textMetrics.width + 14;
    const badgeH = 20;

    ctx.fillStyle = fillBadge;
    ctx.fillRect(x, Math.max(0, y - badgeH), badgeW, badgeH);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(labelText, x + 6, Math.max(14, y - 5));
  });

  ctx.restore();
}
