from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.predictions import (
    router as prediction_router
)
from backend.app.api.routes.analytics import router as analytics_router
from backend.app.api.routes.village_analytics import router as village_router
from backend.app.api.routes.patients import (
    router as patient_router
)
from backend.app.api.routes.patient_history import (
    router as patient_history_router
)
from backend.app.api.routes.heatmap import (
    router as heatmap_router
)
from backend.app.api.routes.insights import (
    router as insights_router
)
from backend.app.api.routes.copilot import (
    router as copilot_router
)
from backend.app.api.routes.patient_trends import (
    router as patient_trends_router
)
from backend.app.api.routes.report import (
    router as report_router
)
from backend.app.api.routes.risk_trend import (
    router as risk_trend_router
)
from backend.app.api.routes.risk_progression import (
    router as risk_progression_router
)
from backend.app.api.routes import rag
from backend.app.api.routes.ocr import router as ocr_router
from backend.app.api.chat_history import router as chat_router
app = FastAPI(
    title="NAB Preg AI API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    prediction_router,
    prefix="/api"
)

app.include_router(
    analytics_router,
    prefix="/api"
)
app.include_router(
    village_router,
    prefix="/api"
)
app.include_router(
    patient_router,
    prefix="/api"
)
app.include_router(
    patient_history_router,
    prefix="/api"
)
app.include_router(
    heatmap_router,
    prefix="/api"
)
app.include_router(
    insights_router,
    prefix="/api"
)
app.include_router(
    rag.router,
    prefix="/api"
)
app.include_router(
    copilot_router,
    prefix="/api"
)
app.include_router(
    patient_trends_router,
    prefix="/api"
)
app.include_router(
    report_router,
    prefix="/api"
)
app.include_router(
    chat_router,
    prefix="/api"
)
app.include_router(
    ocr_router,
    prefix="/api/ocr"
)
app.include_router(
    risk_trend_router,
    prefix="/api",
    tags=["Risk Trend"]
)
app.include_router(
    risk_progression_router,
    prefix="/api"
)

@app.get("/")
def root():
    return {
        "message": "NAB Preg AI Backend Running"
    }