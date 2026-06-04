from fastapi import APIRouter

import os
import requests
from pathlib import Path
from dotenv import load_dotenv

env_path = (
    Path(__file__)
    .resolve()
    .parents[4]
    / ".env"
)

load_dotenv(env_path)
router = APIRouter()


SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)


@router.get(
    "/patient-risk-trend/{patient_id}"
)
def get_risk_trend(
    patient_id: str
):

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/predictions"
        f"?patient_id=eq.{patient_id}"
        "&select=overall_risk,clinical_score,predicted_at"
        "&order=predicted_at.asc",
        headers=headers,
    )

    return response.json()