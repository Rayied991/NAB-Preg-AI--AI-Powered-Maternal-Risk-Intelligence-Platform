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


def safe_float(value: str):
    try:
        return float(value)
    except:
        return None


@router.get("/patient-trends/{patient_id}")
async def get_patient_trends(
    patient_id: str
):
    try:
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

        hemoglobin = []
        blood_sugar = []
        heart_rate = []

        for r in reports:

            parsed = r.get("parsed_json")

            if not parsed:
                continue

            # Hemoglobin
            hb = parsed.get("hemoglobin")

            if hb:
                value = safe_float(
                    str(hb)
                    .replace("g/dL", "")
                    .strip()
                )

                if value is not None:
                    hemoglobin.append({
                        "date": r["uploaded_at"],
                        "value": value,
                    })

            # Blood Sugar
            bs = parsed.get("blood_sugar")

            if bs:
                value = safe_float(
                    str(bs)
                    .replace("mg/dL", "")
                    .strip()
                )

                if value is not None:
                    blood_sugar.append({
                        "date": r["uploaded_at"],
                        "value": value,
                    })

            # Heart Rate
            hr = parsed.get("heart_rate")

            if hr:
                value = safe_float(
                    str(hr)
                    .replace("bpm", "")
                    .strip()
                )

                if value is not None:
                    heart_rate.append({
                        "date": r["uploaded_at"],
                        "value": value,
                    })

        return {
            "hemoglobin": hemoglobin,
            "blood_sugar": blood_sugar,
            "heart_rate": heart_rate,
        }

    except Exception as e:
        print("Patient trends error:", e)

        return {
            "hemoglobin": [],
            "blood_sugar": [],
            "heart_rate": [],
            "error": "Unable to load patient trends"
        }