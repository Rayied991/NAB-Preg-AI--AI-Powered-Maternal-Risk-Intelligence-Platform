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
app = FastAPI(
    title="NAB Preg AI API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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

@app.get("/")
def root():
    return {
        "message": "NAB Preg AI Backend Running"
    }