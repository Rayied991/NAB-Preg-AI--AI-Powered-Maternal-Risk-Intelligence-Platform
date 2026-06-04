from fastapi import APIRouter
import requests
import os

from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)

llm = ChatMistralAI(
    model="mistral-small-latest",
    temperature=0
)


@router.get("/clinical-assistant/{patient_id}")
async def clinical_assistant(
    patient_id: str
):

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    patient = requests.get(
        f"{SUPABASE_URL}/rest/v1/patients"
        f"?id=eq.{patient_id}"
        "&select=*",
        headers=headers,
    ).json()

    predictions = requests.get(
        f"{SUPABASE_URL}/rest/v1/predictions"
        f"?patient_id=eq.{patient_id}"
        "&order=predicted_at.desc"
        "&limit=1",
        headers=headers,
    ).json()

    reports = requests.get(
        f"{SUPABASE_URL}/rest/v1/ocr_reports"
        f"?patient_id=eq.{patient_id}"
        "&order=uploaded_at.desc"
        "&limit=1",
        headers=headers,
    ).json()

    if not patient:
        return {
            "error": "Patient not found"
        }

    patient = patient[0]

    latest_prediction = (
        predictions[0]
        if predictions
        else {}
    )

    latest_report = (
        reports[0]
        if reports
        else {}
    )

    prompt = f"""
You are a maternal healthcare specialist.

Patient Information:

Name: {patient.get('full_name')}
Age: {patient.get('age')}
Trimester: {patient.get('trimester')}
Pregnancy Week: {patient.get('pregnancy_week')}
Blood Group: {patient.get('blood_group')}

Latest OCR Data:
{latest_report.get('parsed_json')}

Latest Prediction:
{latest_prediction}

Provide:

1. Clinical Assessment
2. Key Risks
3. Recommendations
4. Follow-up Plan
5. Emergency Warning Signs

Keep response concise.
Return plain text only.
"""

    response = llm.invoke(
        prompt
    )

    return {
        "advice": response.content
    }