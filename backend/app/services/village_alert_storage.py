import requests
import os

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

def alert_exists(village_name: str, severity: str, message: str) -> bool:
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/ai_alerts"
        f"?village_name=eq.{village_name}"
        f"&severity=eq.{severity}"
        f"&message=eq.{message}",
        headers=headers,
    )
    data = response.json()
    return len(data) > 0

def save_alert(alert: dict):
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/ai_alerts",
        headers=headers,
        json=alert,
    )
    print("SAVE ALERT:", response.status_code)
    print(response.text)