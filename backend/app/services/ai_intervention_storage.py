import requests
import os

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

def save_intervention(intervention: dict):
    """
    Save intervention to Supabase
    """
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/ai_interventions",
        headers=headers,
        json=intervention,
    )
    print("Saved Intervention:", response.status_code, response.text)