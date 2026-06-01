from fastapi import APIRouter
from pydantic import BaseModel

from ai_engine.src.predictor import (
    predict_maternal_risk,
)
from backend.app.services.prediction_storage import (
    save_prediction
)
from backend.app.services.ocr_report_storage import (
    save_ocr_report
)
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)
router = APIRouter()

class OCRReportRequest(BaseModel):
    extracted_text: str
    parsed_json: dict
    
class PredictionRequest(BaseModel):
    age: int
    hemoglobin: float
    systolic_bp: float
    diastolic_bp: float
    blood_sugar: float
    heart_rate: float
    weight: float
    height_cm: float
    meals_per_day: int
    veg_freq: int
    
    
@router.post("/predict")
async def predict(payload: PredictionRequest):

    result = predict_maternal_risk(
        payload.dict()
    )

    save_prediction(result)

    return result

@router.get("/predictions")
async def get_predictions():

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/predictions"
        "?select=*"
        "&order=predicted_at.desc",
        headers=headers,
    )

    return response.json()

@router.get("/alerts")
async def get_alerts():

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/alerts"
        "?select=*"
        "&order=triggered_at.desc"
        "&limit=5",
        headers=headers,
    )

    return response.json()

@router.post("/ocr-report")
async def save_report(
    payload: OCRReportRequest
):

    save_ocr_report(
        payload.extracted_text,
        payload.parsed_json,
    )

    return {
        "message": "OCR report saved"
    }