
from fastapi import APIRouter
import requests
import os

router = APIRouter()

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)

@router.get("/ai-alerts")
async def get_ai_alerts():

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization":
            f"Bearer {SUPABASE_KEY}",
    }

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/ai_alerts"
        "?select=*"
        "&order=created_at.desc",
        headers=headers,
    )

    return response.json()