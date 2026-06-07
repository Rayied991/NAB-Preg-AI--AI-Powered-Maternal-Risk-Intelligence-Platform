import os
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)


def create_alert(
    patient_id,
    severity,
    alert_message,
    status="OPEN"
):

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    payload = {
        "patient_id": patient_id,
        "severity": severity,
        "alert_message": alert_message,
        "status": status,
        "triggered_at": datetime.utcnow().isoformat(),
    }

    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/alerts",
        headers=headers,
        json=payload,
    )

    print("ALERT STATUS:", response.status_code)
    print("ALERT BODY:", response.text)

    return response