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

    if response.status_code != 200:
        return {
            "error": response.text
        }

    history = response.json()

    if len(history) < 2:
        return {
            "trend": "insufficient_data",
            "count": len(history),
            "history": history,
        }

    # Use last 5 predictions
    recent_history = history[-5:]

    scores = [
        item["clinical_score"]
        for item in recent_history
    ]

    first_score = scores[0]
    latest_score = scores[-1]

    highest_score = max(scores)
    lowest_score = min(scores)

    avg_score = (
        sum(scores) / len(scores)
    )

    delta = (
        latest_score
        - first_score
    )

    # Trend
    if delta > 0:
        trend = "worsening"
    elif delta < 0:
        trend = "improving"
    else:
        trend = "stable"

    # Alert Logic
    if latest_score >= 6:

        alert = (
            "High risk maternal case"
        )

    elif avg_score >= 4:

        alert = (
            "Risk increasing"
        )

    else:

        alert = (
            "Stable"
        )

    return {
        "trend": trend,
        "change": delta,
        "first_score": first_score,
        "latest_score": latest_score,
        "highest_score": highest_score,
        "lowest_score": lowest_score,
        "average_score": round(
            avg_score,
            2
        ),
        "alert": alert,
        "message": (
            f"Clinical score changed from "
            f"{first_score} to {latest_score}"
        ),
        "history": history,
    }