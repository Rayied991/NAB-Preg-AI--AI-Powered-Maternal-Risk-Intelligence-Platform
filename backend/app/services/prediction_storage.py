import os
import requests
from datetime import datetime
from dotenv import load_dotenv,find_dotenv

load_dotenv()


print("ENV FILE:", find_dotenv())
SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)


def save_prediction( patient_id,result):

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    payload = {
        "patient_id": patient_id,
        "overall_risk":
            result["patient_status"]["overall_risk"],

        "anemia_risk":
            result["patient_status"]["anemia_risk"],

        "hypertension_risk":
            result["patient_status"]["hypertension_risk"],

        "confidence_score":
            result["patient_status"]["confidence_score"],

        "clinical_score":
            result["patient_status"]["clinical_score"],

        "ai_summary":
            result["ai_summary"],

        "recommendation":
            "\n".join(
                result["ai_recommendations"]
            ),

        "model_version":
            "v1.0",

        "predicted_at":
            datetime.utcnow().isoformat(),
    }

    print("URL:", SUPABASE_URL)
    print("KEY EXISTS:", SUPABASE_KEY is not None)
    print("KEY LENGTH:", len(SUPABASE_KEY) if SUPABASE_KEY else 0)
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/predictions",
        headers=headers,
        json=payload,
    )

    print("STATUS:", response.status_code)
    print("BODY:", response.text)

    return response