import { start } from "workflow/api";
import { defineEventHandler } from "nitro/h3";
import { workflowAuditoriaSST } from "../workflows/sst-audit.js";

export default defineEventHandler(async (event: any) => {
  const body = (await event.req.json()) as { cedula: string; nombre: string; cargo: string };
  
  // Inicia la ejecución duradera del workflow en segundo plano sin bloquear la respuesta
  const run = await start(workflowAuditoriaSST, [
    body.cedula || "1045821900", 
    body.nombre || "Carlos Andrés Pérez", 
    body.cargo || "Oficial de Alturas"
  ]);

  return {
    success: true,
    message: "Workflow de Auditoría SST iniciado exitosamente",
    runId: (run as any)?.id || "run-local",
    plataforma: "SafeEntry Enterprise OS"
  };
});
