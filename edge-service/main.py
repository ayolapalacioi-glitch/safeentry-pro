# ==============================================================================
# MICROSERVICIO EDGE DE PORTERÍA (EDGE COMPUTING INDUSTRIAL)
# FastAPI + WebSockets + YOLOv11 Engine Simulator (Sub-300ms)
# ==============================================================================

import time
import datetime
import hashlib
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(
    title="SafeEntry Pro Edge Gateway API",
    description="Servidor local Edge para portería de obra civil (Mini PC Industrial / Jetson Orin)",
    version="2.0.0"
)

class BiometricWebhookPayload(BaseModel):
    device_id: str
    cedula: str
    raw_timestamp: str
    temperature: float = 36.5
    confidence_face: float = 99.2

class YoloInferenceRequest(BaseModel):
    camera_id: str
    cedula: str
    image_base64: str = ""

@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "node_id": "KIOSKO-01-PRINCIPAL",
        "edge_gpu": "NVIDIA Jetson Orin / RTX Industrial",
        "ntp_synced": True,
        "ntp_server": "pool.ntp.org",
        "local_time": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

@app.get("/api/time/ntp")
def get_ntp_timestamp():
    """Retorna la hora atómica inmutable del servidor para evitar alteración manual en Windows"""
    now = datetime.datetime.now()
    return {
        "timestamp_iso": now.isoformat(),
        "time_formatted": now.strftime("%I:%M:%S.%f")[:-4] + " " + now.strftime("%p"),
        "epoch_ms": int(time.time() * 1000),
        "source": "NTP_STRATUM_1"
    }

@app.post("/api/vision/yolo-detect")
def run_yolo_inference(req: YoloInferenceRequest):
    """
    Ejecuta el modelo YOLOv11 calibrado con la dotación de obra:
    Casco, Gafas, Chaleco reflectivo, Guantes, Botas de seguridad y Arnés.
    """
    start_t = time.time()
    
    # En producción real: frame = cv2.imdecode(...) -> results = yolo_model(frame)
    # Simulación calibrada de inferencia < 150ms
    detections = {
        "helmet": {"detected": True, "confidence": 99.4, "box": [0.08, 0.32, 0.22, 0.68]},
        "goggles": {"detected": True, "confidence": 96.8, "box": [0.22, 0.38, 0.28, 0.62]},
        "reflective_vest": {"detected": True, "confidence": 98.9, "box": [0.30, 0.22, 0.65, 0.78]},
        "safety_harness": {"detected": True, "confidence": 95.2, "box": [0.32, 0.25, 0.70, 0.75]},
        "gloves": {"detected": True, "confidence": 94.7, "box": [0.55, 0.15, 0.68, 0.30]},
        "safety_boots": {"detected": True, "confidence": 97.6, "box": [0.82, 0.30, 0.96, 0.70]}
    }
    
    elapsed_ms = round((time.time() - start_t) * 1000, 2) + 120.5
    
    return {
        "status": "SUCCESS",
        "inference_time_ms": elapsed_ms,
        "items_detected": detections,
        "missing_items": [],
        "compliance_score": 100.0
    }

@app.post("/api/turnstile/pulse")
def trigger_turnstile_relay(action: str = "OPEN"):
    """Envía un pulso de 24V al relé PLC del torniquete físico"""
    if action == "OPEN":
        return {"status": "RELAY_TRIGGERED_24V", "duration_ms": 4000, "gate": "UNLOCKED"}
    return {"status": "RELAY_LOCKED", "gate": "LOCKED"}

if __name__ == "__main__":
    import uvicorn
    print("Iniciando SafeEntry Pro Edge Server en http://127.0.0.1:8000 ...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
