import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

print("URL:", SUPABASE_URL)
print("KEY PREFIX:", SUPABASE_KEY[:20])
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
}

response = requests.get(
    f"{SUPABASE_URL}/rest/v1/",
    headers=headers,
)

print("Status:", response.status_code)
print("Response:", response.text)
