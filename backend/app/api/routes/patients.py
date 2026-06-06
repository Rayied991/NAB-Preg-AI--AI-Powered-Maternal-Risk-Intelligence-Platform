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

class UpdatePatientRequest(BaseModel):
    full_name: str | None = None
    age: int | None = None
    trimester: int | None = None
    pregnancy_week: int | None = None
    village: str | None = None
    blood_group: str | None = None
    contact_number: str | None = None
    emergency_contact: str | None = None
    height_cm: float | None = None
    
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

@router.patch("/patients/{patient_id}")
async def update_patient(
    patient_id: str,
    payload: UpdatePatientRequest
):
    update_data = payload.dict(exclude_unset=True)
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    
    if "village" in update_data:
        # Fetch current to see if village changed
        current_res = requests.get(
            f"{SUPABASE_URL}/rest/v1/patients?id=eq.{patient_id}",
            headers=headers
        )
        if current_res.status_code == 200 and current_res.json():
            current_village = current_res.json()[0].get("village")
            
            if update_data["village"] != current_village:
                coords = get_coordinates(update_data["village"])
                if coords:
                    update_data["latitude"] = coords["latitude"]
                    update_data["longitude"] = coords["longitude"]
                else:
                    # Clear coordinates so it doesn't show in the old location
                    update_data["latitude"] = None
                    update_data["longitude"] = None
        else:
            # Fallback if we couldn't fetch current
            coords = get_coordinates(update_data["village"])
            if coords:
                update_data["latitude"] = coords["latitude"]
                update_data["longitude"] = coords["longitude"]

    response = requests.patch(
        f"{SUPABASE_URL}/rest/v1/patients?id=eq.{patient_id}",
        headers=headers,
        json=update_data
    )

    return response.json()