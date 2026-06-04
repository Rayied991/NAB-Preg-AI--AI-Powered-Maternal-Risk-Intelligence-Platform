from fastapi import APIRouter
import requests
import os

from dotenv import load_dotenv
from backend.copilot.summary import (
    generate_patient_summary
)

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)


@router.get("/copilot/{patient_id}")
async def get_copilot_summary(
    patient_id: str
):

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization":
            f"Bearer {SUPABASE_KEY}",
    }

    patient_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/patients"
        f"?id=eq.{patient_id}",
        headers=headers,
    )

    patient = patient_response.json()[0]

    summary = generate_patient_summary(
        patient
    )

    return {
        "summary": summary
    }