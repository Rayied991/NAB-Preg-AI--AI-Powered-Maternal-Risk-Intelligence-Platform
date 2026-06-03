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


@router.get("/insights")
async def get_insights():

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    analytics_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/village_analytics"
        "?select=*",
        headers=headers,
    )

    alerts_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/alerts"
        "?select=*",
        headers=headers,
    )

    analytics = analytics_response.json()
    alerts = alerts_response.json()

    insights = []

    if analytics:

        top_village = max(
            analytics,
            key=lambda x: x["high_risk_cases"]
        )

        insights.append(
            f"{top_village['village_name']} currently has the highest maternal risk concentration."
        )

        total_high_risk = sum(
            row["high_risk_cases"]
            for row in analytics
        )

        insights.append(
            f"There are {total_high_risk} high-risk maternal cases being monitored."
        )

    open_alerts = [
        alert
        for alert in alerts
        if alert["status"] == "OPEN"
    ]

    insights.append(
        f"{len(open_alerts)} active emergency alerts require follow-up."
    )

    return insights