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
        "patient_id": patient_id,
        "report_url": None,
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

    return response