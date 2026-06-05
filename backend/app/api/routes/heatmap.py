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


@router.get("/heatmap")
async def get_heatmap():

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    # Patients with coordinates
    patients_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/patients"
        "?select=village,latitude,longitude",
        headers=headers,
    )

    # Village risk counts
    villages_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/village_analytics"
        "?select=village_name,high_risk_cases",
        headers=headers,
    )

    if (
        patients_response.status_code != 200
        or villages_response.status_code != 200
    ):
        return {
            "error": "Failed to fetch heatmap data"
        }

    patients = patients_response.json()
    villages = villages_response.json()

    result = []

    for patient in patients:

        if (
            patient.get("latitude") is None
            or patient.get("longitude") is None
        ):
            continue

        village_name = patient.get("village")

        analytics = next(
            (
                v
                for v in villages
                if v["village_name"] == village_name
            ),
            None,
        )

        result.append(
            {
                "village": village_name,
                "latitude": patient["latitude"],
                "longitude": patient["longitude"],
                "high_risk_cases": (
                    analytics["high_risk_cases"]
                    if analytics
                    else 0
                ),
            }
        )

    return result