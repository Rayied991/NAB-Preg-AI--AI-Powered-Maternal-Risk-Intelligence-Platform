import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}


def save_prediction(data):
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/predictions",
        headers=headers,
        json=data,
    )

    print(response.status_code)
    print(response.text)

    return response.json()