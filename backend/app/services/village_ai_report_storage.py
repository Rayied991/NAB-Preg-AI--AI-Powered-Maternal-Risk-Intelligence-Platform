import requests
import os

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)

def save_village_ai_report(report):

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/village_ai_reports"
        "?on_conflict=village_name",
        headers=headers,
        json=report,
    )

    print(response.status_code)
    print(response.text)