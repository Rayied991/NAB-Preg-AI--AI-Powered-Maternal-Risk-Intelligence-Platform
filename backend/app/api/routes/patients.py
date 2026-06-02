from fastapi import APIRouter
import requests
import os
from dotenv import load_dotenv
from backend.app.services.village_analytics_storage import (
    get_patient_village
)

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)

@router.get("/patients")
async def get_patients():

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/patients"
        "?select=id,full_name,patient_code,village"
        "&order=full_name.asc",
        headers=headers,
    )

    return response.json()

@router.get("/test-village/{patient_id}")
async def test_village(patient_id: str):

    village = get_patient_village(
        patient_id
    )

    return {
        "village": village
    }