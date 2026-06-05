from fastapi import APIRouter
import requests
import os
from pydantic import BaseModel
from dotenv import load_dotenv
from backend.app.services.village_analytics_storage import (
    get_patient_village
)
from backend.app.services.geocoder import(
    get_coordinates
)
load_dotenv()

router = APIRouter()

class CreatePatientRequest(BaseModel):
    patient_code: str
    full_name: str
    age: int
    trimester: int
    pregnancy_week: int
    village: str
    blood_group: str
    contact_number: str
    emergency_contact: str
    height_cm: float
    
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
    
@router.post("/patients")
async def create_patient(
    payload: CreatePatientRequest
):

    
    coords=get_coordinates(
        payload.village
    )

    patient_data = {
        **payload.dict(),
        "latitude": (
            coords["latitude"]
            if coords else None
        ),
        "longitude": (
            coords["longitude"]
            if coords else None
        ),
    }
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/patients",
        headers=headers,
        json=patient_data
    )

    return response.json()    