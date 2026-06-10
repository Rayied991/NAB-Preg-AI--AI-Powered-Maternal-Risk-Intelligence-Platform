import os
import requests
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

env_path = (
    Path(__file__)
    .resolve()
    .parents[0]
    / ".env"
)
load_dotenv(env_path)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# We need to get a valid patient_id first
res = requests.get(f"{SUPABASE_URL}/rest/v1/patients?select=id&limit=1", headers=headers)
patient_id = res.json()[0]["id"] if res.status_code == 200 and len(res.json()) > 0 else "00000000-0000-0000-0000-000000000000"

payload = {
    "patient_id": patient_id,
    "report_url": None,
    "extracted_text": "test",
    "parsed_json": {"test": "test"},
    "uploaded_at": datetime.utcnow().isoformat(),
}

response = requests.post(
    f"{SUPABASE_URL}/rest/v1/ocr_reports",
    headers=headers,
    json=payload,
)

print("OCR STATUS:", response.status_code)
print("OCR BODY:", response.text)
