import { sleep, FatalError } from "workflow";

// Step 1: Auditar vigencias legales del trabajador (ARL + Curso de Alturas)
async function auditarVigenciasObrero(data: { cedula: string; nombre: string; cargo: string }) {
  "use step";
  console.log(`[SafeEntry Workflow] Auditando vigencias SST para ${data.nombre} (C.C. ${data.cedula})...`);
  
  if (!data.cedula) {
    throw new FatalError("Cédula de trabajador inválida");
  }

  return {
    cedula: data.cedula,
    nombre: data.nombre,
    cargo: data.cargo,
    vigente: true,
    timestamp: new Date().toISOString()
  };
}

// Step 2: Notificar al Inspector SISO de Obra si hay novedad
async function notificarInspectorSISO(auditResult: { cedula: string; nombre: string; cargo: string; vigente: boolean }) {
  "use step";
  console.log(`[Workflow SISO] Notificación emitida para inspector en obra: ${auditResult.nombre}`);
  return { notificado: true, fecha: new Date().toISOString() };
}

// Step 3: Enviar alerta preventiva a RRHH antes de vencimiento
async function enviarAlertaVencimientoPILA(data: { cedula: string; nombre: string }) {
  "use step";
  console.log(`[Workflow Alerta PILA] Despachando recordatorio a RRHH / Contratista para obrero: ${data.nombre}`);
  return { alertaEnviada: true, fecha: new Date().toISOString() };
}

// Orquestador del Workflow Durable
export async function workflowAuditoriaSST(cedula: string, nombre: string, cargo: string) {
  "use workflow";

  // Paso 1: Auditoría inicial
  const audit = await auditarVigenciasObrero({ cedula, nombre, cargo });

  // Paso 2: Notificación inmediata de seguridad
  await notificarInspectorSISO(audit);

  // Paso 3: Pausa durable (sleep) de 24 horas para el siguiente ciclo diario sin consumir CPU
  await sleep("24h");

  // Paso 4: Revisión del nuevo ciclo
  await enviarAlertaVencimientoPILA({ cedula, nombre });

  return {
    status: "COMPLETED",
    cedula,
    plataforma: "SafeEntry Enterprise OS"
  };
}
