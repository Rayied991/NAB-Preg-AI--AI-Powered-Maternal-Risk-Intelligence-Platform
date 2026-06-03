import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)
def get_patient_village(patient_id):

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/patients"
        f"?id=eq.{patient_id}"
        "&select=village",
        headers=headers,
    )

    data = response.json()

    if not data:
        return None

    return data[0]["village"]
def update_village_analytics(
    patient_id,
    overall_risk
):

    village = get_patient_village(
        patient_id
    )

    if not village:
        return

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/village_analytics"
        f"?village_name=eq.{village}",
        headers=headers,
    )

    rows = response.json()

    if not rows:

        create_payload = {
            "village_name": village,
            "high_risk_cases": 0,
            "medium_risk_cases": 0,
            "low_risk_cases": 0,
            "anemia_cases": 0,
            "hypertension_cases": 0,
        }

        requests.post(
            f"{SUPABASE_URL}/rest/v1/village_analytics",
            headers=headers,
            json=create_payload,
        )

        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/village_analytics"
            f"?village_name=eq.{village}",
            headers=headers,
        )

    rows = response.json()

    row = rows[0]
    
    high_risk = row["high_risk_cases"]
    medium_risk = row["medium_risk_cases"]
    low_risk = row["low_risk_cases"]

    if overall_risk == "HIGH":
        high_risk += 1

    elif overall_risk == "MEDIUM":
        medium_risk += 1

    elif overall_risk == "LOW":
        low_risk += 1

    payload = {
        "high_risk_cases": high_risk,
        "medium_risk_cases": medium_risk,
        "low_risk_cases": low_risk,
    }

    update_response = requests.patch(
        f"{SUPABASE_URL}/rest/v1/village_analytics"
        f"?id=eq.{row['id']}",
        headers=headers,
        json=payload,
    )

    print(
        "VILLAGE ANALYTICS STATUS:",
        update_response.status_code
    )

    print(
        "VILLAGE ANALYTICS BODY:",
        update_response.text
    )

    return update_response