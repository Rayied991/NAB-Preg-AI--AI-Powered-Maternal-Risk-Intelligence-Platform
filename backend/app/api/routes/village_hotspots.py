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


@router.get("/village-hotspots")
def village_hotspots():

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/village_analytics"
        "?select=*",
        headers=headers,
    )

    villages = response.json()

    hotspots = []

    for village in villages:

        status = "STABLE"

        if village["high_risk_cases"] >= 5:
            status = "HOTSPOT"

        elif village["medium_risk_cases"] >= 3:
            status = "WATCHLIST"

        hotspots.append({
            "village": village["village_name"],
            "status": status,
            "high_risk_cases":
                village["high_risk_cases"],
            "medium_risk_cases":
                village["medium_risk_cases"],
        })

    return hotspots