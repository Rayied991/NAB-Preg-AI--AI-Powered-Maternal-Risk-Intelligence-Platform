from fastapi import APIRouter
import os
import requests

router = APIRouter()

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)


@router.get(
    "/risk-progression/{patient_id}"
)
def risk_progression(
    patient_id: str
):

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/predictions"
        f"?patient_id=eq.{patient_id}"
        "&select=clinical_score,predicted_at"
        "&order=predicted_at.asc",
        headers=headers,
    )

    history = response.json()

    if len(history) < 2:
        return {
            "trend": "insufficient_data"
        }

    first_score = history[0][
        "clinical_score"
    ]

    latest_score = history[-1][
        "clinical_score"
    ]

    delta = (
        latest_score
        - first_score
    )

    if delta > 0:
        trend = "worsening"

    elif delta < 0:
        trend = "improving"

    else:
        trend = "stable"

    return {
        "trend": trend,
        "change": delta,
        "first_score": first_score,
        "latest_score": latest_score,
        "history": history,
    }