from fastapi import APIRouter
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)


@router.get("/patient-history/{patient_id}")
async def get_patient_history(patient_id: str):

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    patient = requests.get(
        f"{SUPABASE_URL}/rest/v1/patients"
        f"?id=eq.{patient_id}"
        "&select=*",
        headers=headers,
    ).json()

    predictions = requests.get(
        f"{SUPABASE_URL}/rest/v1/predictions"
        f"?patient_id=eq.{patient_id}"
        "&order=predicted_at.desc",
        headers=headers,
    ).json()

    alerts = requests.get(
        f"{SUPABASE_URL}/rest/v1/alerts"
        f"?patient_id=eq.{patient_id}"
        "&order=triggered_at.desc",
        headers=headers,
    ).json()

    reports = requests.get(
        f"{SUPABASE_URL}/rest/v1/ocr_reports"
        f"?patient_id=eq.{patient_id}"
        "&order=uploaded_at.desc",
        headers=headers,
    ).json()

    return {
        "patient": patient[0] if patient else None,
        "predictions": predictions,
        "alerts": alerts,
        "ocr_reports": reports,
    }