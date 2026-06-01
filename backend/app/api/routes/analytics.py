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


@router.get("/analytics")
async def get_analytics():

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/predictions?select=*",
        headers=headers,
    )

    predictions = response.json()

    high_risk = len([
        p for p in predictions
        if p["overall_risk"] == "HIGH"
    ])

    medium_risk = len([
        p for p in predictions
        if p["overall_risk"] == "MEDIUM"
    ])

    low_risk = len([
        p for p in predictions
        if p["overall_risk"] == "LOW"
    ])

    avg_confidence = 0

    if predictions:
        avg_confidence = round(
            sum(
                p["confidence_score"]
                for p in predictions
            ) / len(predictions),
            2,
        )

    return {
        "total_predictions": len(predictions),
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "average_confidence": avg_confidence,
    }