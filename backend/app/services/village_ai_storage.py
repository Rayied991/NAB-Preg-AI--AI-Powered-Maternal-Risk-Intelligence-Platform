import os
import requests

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)

def save_village_ai_report(data):

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }

    requests.post(
        f"{SUPABASE_URL}/rest/v1/village_ai_reports",
        headers=headers,
        json=data,
    )