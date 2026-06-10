import os
import requests
import uuid
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

env_path = (
    Path(__file__)
    .resolve()
    .parents[2]
    / ".env"
)

if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)


def save_ocr_report(
    patient_id,
    extracted_text,
    parsed_json,
):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    payload = {
        "id": str(uuid.uuid4()),
        "patient_id": patient_id,
        "extracted_text": extracted_text,
        "parsed_json": parsed_json,
        "uploaded_at": datetime.utcnow().isoformat(),
    }

    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/ocr_reports",
        headers=headers,
        json=payload,
    )

    print("OCR STATUS:", response.status_code)
    print("OCR BODY:", response.text)
    
    response.raise_for_status()

    return response