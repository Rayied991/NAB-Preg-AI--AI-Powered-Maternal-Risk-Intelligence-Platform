from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

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
from backend.app.api.routes.village_hotspots import (
    router as village_hotspots_router
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
from backend.app.api.village_graph import (
    router as village_graph_router
)
from backend.app.api.routes.village_ai_reports import (
    router as village_ai_reports_router
)
from backend.app.api.routes import (
    village_relationships
)
from backend.app.api.routes.ai_interventions import (
    router as intervention_router
)
from backend.app.api.routes import rag
from backend.app.api.routes.ocr import router as ocr_router
from backend.app.api.chat_history import router as chat_router
from backend.app.api.alerts import (
    router as alert_router
)

# Import the auto-intervention generator
from backend.app.services.auto_intervention_generator import start_scheduler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown events
    """
    # STARTUP
    logger.info("🚀 Starting NAB Preg AI Backend...")
    
    # Start auto-generation scheduler
    try:
        start_scheduler()
        logger.info("✅ Auto-intervention generator started")
    except Exception as e:
        logger.error(f"❌ Failed to start auto-generator: {e}")
    
    yield
    
    # SHUTDOWN
    logger.info("🛑 Shutting down backend...")

app = FastAPI(
    title="NAB Preg AI API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://nab-preg-ai-ai-powered-maternal-ris.vercel.app"],
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
app.include_router(
    village_hotspots_router,
    prefix="/api"
)
app.include_router(
    village_ai_reports_router,
    prefix="/api"
)
app.include_router(
    village_graph_router,
    prefix="/api"
)
app.include_router(
    intervention_router,
    prefix="/api"
)

app.include_router(
    village_relationships.router,
    prefix="/api"
)
app.include_router(
    alert_router,
    prefix="/api",
    tags=["Alerts"]
)

@app.get("/")
def root():
    return {
        "message": "NAB Preg AI Backend Running",
        "auto_generation": "enabled"
    }