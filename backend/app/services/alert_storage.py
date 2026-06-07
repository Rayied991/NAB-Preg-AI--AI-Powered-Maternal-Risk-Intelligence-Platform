import requests
import os

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

def save_alert(alert: dict):
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/ai_alerts",
        headers=headers,
        json=alert,
    )

    print("SAVE ALERT:", response.status_code)
    print(response.text)