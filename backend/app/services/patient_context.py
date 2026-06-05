import os
import requests

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)


def get_patient_context(patient_code: str):

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    patient = requests.get(
        f"{SUPABASE_URL}/rest/v1/patients"
        f"?patient_code=eq.{patient_code}"
        "&select=*",
        headers=headers,
    ).json()

    if not patient:
        return None

    patient = patient[0]

    patient_id = patient["id"]

    prediction = requests.get(
        f"{SUPABASE_URL}/rest/v1/predictions"
        f"?patient_id=eq.{patient_id}"
        "&order=predicted_at.desc"
        "&limit=1",
        headers=headers,
    ).json()

    report = requests.get(
        f"{SUPABASE_URL}/rest/v1/ocr_reports"
        f"?patient_id=eq.{patient_id}"
        "&order=uploaded_at.desc"
        "&limit=1",
        headers=headers,
    ).json()

    alerts = requests.get(
        f"{SUPABASE_URL}/rest/v1/alerts"
        f"?patient_id=eq.{patient_id}"
        "&order=triggered_at.desc"
        "&limit=5",
        headers=headers,
    ).json()

    return {
        "patient": patient,
        "prediction": prediction[0] if prediction else {},
        "report": report[0] if report else {},
        "alerts": alerts,
    }
    
def get_patient_context_by_name(
    patient_name: str
):

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    patient = requests.get(
        f"{SUPABASE_URL}/rest/v1/patients"
        f"?full_name=ilike.*{patient_name}*"
        "&select=*",
        headers=headers,
    ).json()

    if not patient:
        return None

    patient = patient[0]

    patient_id = patient["id"]

    prediction = requests.get(
        f"{SUPABASE_URL}/rest/v1/predictions"
        f"?patient_id=eq.{patient_id}"
        "&order=predicted_at.desc"
        "&limit=1",
        headers=headers,
    ).json()

    report = requests.get(
        f"{SUPABASE_URL}/rest/v1/ocr_reports"
        f"?patient_id=eq.{patient_id}"
        "&order=uploaded_at.desc"
        "&limit=1",
        headers=headers,
    ).json()

    alerts = requests.get(
        f"{SUPABASE_URL}/rest/v1/alerts"
        f"?patient_id=eq.{patient_id}"
        "&order=triggered_at.desc"
        "&limit=5",
        headers=headers,
    ).json()

    return {
        "patient": patient,
        "prediction": prediction[0] if prediction else {},
        "report": report[0] if report else {},
        "alerts": alerts,
    }    
    
    
def find_patient_in_text(
    question: str
):

    words = question.split()

    suffixes = [
        "এর",
        "র",
        "কে",
        "'s",
    ]

    for word in words:

        cleaned = (
            word.replace("?", "")
            .replace(",", "")
            .replace(".", "")
            .strip()
        )

        for suffix in suffixes:

            if cleaned.endswith(
                suffix
            ):
                cleaned = cleaned[
                    :-len(suffix)
                ]

        patient = (
            get_patient_context_by_name(
                cleaned
            )
        )

        if patient:
            return patient

    return None    