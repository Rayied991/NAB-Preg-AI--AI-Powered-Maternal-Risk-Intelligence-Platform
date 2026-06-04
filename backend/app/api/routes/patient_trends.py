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


@router.get("/patient-trends/{patient_id}")
async def get_patient_trends(
    patient_id: str
):

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    reports = requests.get(
        f"{SUPABASE_URL}/rest/v1/ocr_reports"
        f"?patient_id=eq.{patient_id}"
        "&order=uploaded_at.asc",
        headers=headers,
    ).json()

    return {
    "hemoglobin": [
        {
            "date": r["uploaded_at"],
            "value": float(
                r["parsed_json"]["hemoglobin"]
                .replace("g/dL", "")
                .strip()
            )
        }
        for r in reports
        if r.get("parsed_json")
        and r["parsed_json"].get("hemoglobin")
    ],

    "blood_sugar": [
        {
            "date": r["uploaded_at"],
            "value": float(
                r["parsed_json"]["blood_sugar"]
                .replace("mg/dL", "")
                .strip()
            )
        }
        for r in reports
        if r.get("parsed_json")
        and r["parsed_json"].get("blood_sugar")
    ],

    "heart_rate": [
        {
            "date": r["uploaded_at"],
            "value": float(
                r["parsed_json"]["heart_rate"]
                .replace("bpm", "")
                .strip()
            )
        }
        for r in reports
        if r.get("parsed_json")
        and r["parsed_json"].get("heart_rate")
    ]
}