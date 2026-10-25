# SafeEntry Pro · Sistema Inteligente de Control Biométrico, EPP y Vigencias SST

> **Sistema de Misión Crítica Nivel Producción** para Portería de Obra Civil y Gestión Legal SG-SST  
> Basado en la **Resolución 0312 de 2019** y **Resolución 4272 de 2021 (Trabajo Seguro en Alturas)**.

---

## 1. Arquitectura Técnica de Alto Nivel

El sistema implementa una arquitectura **Híbrida Edge-Cloud**:

```
 ┌─────────────────────────────────────────────────────────┐
 │                   PORTERÍA DE OBRA                      │
 │                                                         │
 │  [Biométrico Facial]    [Cámara IP RTSP Cuerpo Entero]  │
 │            │                          │                 │
 │            ▼                          ▼                 │
 │     [Rostro + Cédula]      [YOLOv11-EPP Inference]      │
 │    (Hora Atómica NTP)      (Casco, Gafas, Chaleco,      │
 │                             Arnés, Guantes, Botas)      │
 │            │                          │                 │
 │            └────────────┬─────────────┘                 │
 │                         ▼                               │
 │            [SafeEntry Edge Controller]                  │
 │      - Motor de Vigencias SST (ARL + Alturas)           │
 │      - Semáforo Kiosco: Verde / Amarillo / Rojo         │
 │      - Pulso 24V PLC a Torniquete Industrial            │
 │      - NoSQL Edge Local (Dexie IndexedDB / SQLite)      │
 │        * Opera 100% desconectado si se cae internet     │
 └─────────────────────────┬───────────────────────────────┘
                           │ Sincronización en segundo plano
                           ▼ (WebSocket / REST con backoff)
 ┌─────────────────────────────────────────────────────────┐
 │                  NUBE / DATA CENTER                     │
 │                                                         │
 │             [Supabase (PostgreSQL 15+)]                 │
 │  - `trabajadores_vigencias` (Censo y Fechas PILA)       │
 │  - `bitacora_ingresos_diarios` (Append-Only Ledger)     │
 │    * Disparador SQL: REVOKE UPDATE, DELETE              │
 │    * Hash Encadenado SHA-256 tipo Blockchain            │
 │  - `auditoria_rechazos_sst` (Alertas para SISO)         │
 │  - `historial_mensual_persona` (Nómina Octubre...)      │
 └─────────────────────────────────────────────────────────┘
```

---

## 2. Bases de Datos: Supabase (SQL) y NoSQL Edge

### A. Base de Datos en la Nube: Supabase (PostgreSQL)
Ubicación del script completo: [`supabase/schema.sql`](./supabase/schema.sql) y [`supabase/seed.sql`](./supabase/seed.sql).
- **Tablas:**
  1. `trabajadores_vigencias`: Cédula, datos demográficos, aseguradora ARL, fecha de vencimiento de planilla PILA, certificación de alturas, matriz de EPP requerida.
  2. `bitacora_ingresos_diarios`: Registro inmutable de llegadas a portería. Incluye estampa de tiempo NTP, resultado de acceso, foto forense y **Hash SHA-256 encadenado**.
  3. `auditoria_rechazos_sst`: Bitácora inalterable de incidentes para el inspector SISO.
  4. `historial_mensual_persona`: Expedientes mensuales consolidados para liquidación de nómina.
- **Blindaje Legal Inmutable:**
  Disparador PostgreSQL `trg_blindar_bitacora` que intercepta y aborta cualquier intento de `UPDATE` o `DELETE` con error:
  ```sql
  RAISE EXCEPTION 'VIOLACION DE INTEGRIDAD SST: La bitácora de ingreso es inmutable (Append-Only Ledger)...';
  ```

### B. Base de Datos Local: NoSQL Edge (IndexedDB)
Ubicación: [`src/services/edgeNoSqlDb.ts`](./src/services/edgeNoSqlDb.ts) y [`src/services/syncEngine.ts`](./src/services/syncEngine.ts).
- Diseñada para la **hora pico de las 6:30 AM** cuando decenas de trabajadores hacen fila y el internet en obra suele fallar.
- Almacena localmente las capturas, valida las vigencias en menos de 50ms y encola los registros (`offline_queue`).
- Cuando la red regresa, el motor `SyncEngine` vacía la cola hacia Supabase automáticamente sin pérdida de datos.

---

## 3. Módulos y Pantallas del Sistema

1. **Terminal Kiosco de Portería:**
   - Viewfinder de cámara en tiempo real (soporta simulación o Webcam física real).
   - Detección de los 6 implementos EPP mediante cajas tácticas con porcentaje de confianza.
   - Semáforo dinámico de gran tamaño (Verde / Amarillo / Rojo).
   - Control visual y sonoro del torniquete (Chimes armónicos y buzzer de bloqueo mediante Web Audio API nativo).
   - Selector de escenarios de prueba (Obrero conforme, sin botas, ARL por vencer, alturas vencido).
2. **Dashboard Ejecutivo SG-SST:**
   - KPIs en vivo: Asistencia del día, Apego a EPP (%), Alertas de vigencia (&le; 15 días) y Bloqueos.
   - Radar de vigencias con conteo regresivo día a día.
   - Feed de novedades y alertas al inspector SISO.
3. **Bitacora Inmutable (Ledger Forense):**
   - Tabla auditable con hora exacta estampada al segundo.
   - Sello criptográfico SHA-256 por registro.
   - Modal de inspección de foto forense con detección de implementos.
   - Exportación a Excel/CSV con firma probatoria.
4. **Censo & Motor de Vigencias:**
   - Lista completa de obreros con días calculados automáticamente (`Fecha Vencimiento - Hoy`).
   - Formulario de actualización de planilla PILA o curso de alturas con recálculo inmediato.
5. **Expediente Mensual por Trabajador:**
   - Consolidado mensual (Octubre 2026, Septiembre 2026) con días laborados, puntualidad, apego a EPP.
   - Formato oficial con firmas para archivo y nómina.
6. **Configuración de Persistencia:**
   - Panel para conectar credenciales de Supabase en caliente o alternar al modo NoSQL local.
   - Botón para simular caída de internet y probar la resiliencia offline.

---

## 4. Cómo Ejecutar el Proyecto

### Opción Rápida (1 Clic en Windows)
Haz doble clic en el archivo [`iniciar_proyecto.bat`](../iniciar_proyecto.bat) ubicado en la carpeta principal `Proyecto SO`.

### Opción Manual por Consola
```bash
# 1. Entrar a la carpeta del proyecto web
cd "C:\Users\ayola\OneDrive\Desktop\Proyecto SO\sistema-control-sst"

# 2. Iniciar el servidor Vite
npm run dev

# 3. Abrir en el navegador:
# http://localhost:5173
```

### Ejecutar el Microservicio Edge (Python FastAPI)
```bash
cd "C:\Users\ayola\OneDrive\Desktop\Proyecto SO\sistema-control-sst\edge-service"
pip install -r requirements.txt
python main.py
# Servidor activo en http://127.0.0.1:8000
```
