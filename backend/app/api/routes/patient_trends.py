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
        blood_pressure = []
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

            # Blood Pressure
            bp = parsed.get("blood_pressure")
            sys_val = None
            dia_val = None

            if bp:
                if isinstance(bp, dict):
                    if "systolic" in bp and "diastolic" in bp:
                        sys_val = safe_float(str(bp["systolic"]).replace("mmHg", "").strip())
                        dia_val = safe_float(str(bp["diastolic"]).replace("mmHg", "").strip())
                    elif "sys" in bp and "dia" in bp:
                        sys_val = safe_float(str(bp["sys"]).replace("mmHg", "").strip())
                        dia_val = safe_float(str(bp["dia"]).replace("mmHg", "").strip())
                    elif "value" in bp:
                        val_str = str(bp["value"])
                        if "/" in val_str:
                            parts = val_str.split("/")
                            sys_val = safe_float(parts[0].replace("mmHg", "").strip())
                            dia_val = safe_float(parts[1].replace("mmHg", "").strip())
                elif isinstance(bp, str):
                    if "/" in bp:
                        parts = bp.split("/")
                        sys_val = safe_float(parts[0].replace("mmHg", "").strip())
                        dia_val = safe_float(parts[1].replace("mmHg", "").strip())
            
            # fallback
            if sys_val is None:
                sys_bp = parsed.get("systolic_bp")
                if sys_bp is not None:
                    sys_val = safe_float(str(sys_bp).replace("mmHg", "").strip())
            if dia_val is None:
                dia_bp = parsed.get("diastolic_bp")
                if dia_bp is not None:
                    dia_val = safe_float(str(dia_bp).replace("mmHg", "").strip())

            if sys_val is not None and dia_val is not None:
                blood_pressure.append({
                    "date": r["uploaded_at"],
                    "systolic": sys_val,
                    "diastolic": dia_val,
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
            "blood_pressure": blood_pressure,
            "blood_sugar": blood_sugar,
            "heart_rate": heart_rate,
        }

    except Exception as e:
        print("Patient trends error:", e)

        return {
            "hemoglobin": [],
            "blood_pressure": [],
            "blood_sugar": [],
            "heart_rate": [],
            "error": "Unable to load patient trends"
        }