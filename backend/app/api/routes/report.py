from fastapi import APIRouter
from fastapi.responses import FileResponse

import requests
import os

from dotenv import load_dotenv

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
)

from reportlab.lib.styles import (
    getSampleStyleSheet,
)

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)


@router.get("/report/{patient_id}")
async def generate_report(
    patient_id: str
):

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    # -----------------------------
    # Patient
    # -----------------------------

    patient = requests.get(
        f"{SUPABASE_URL}/rest/v1/patients"
        f"?id=eq.{patient_id}"
        "&select=*",
        headers=headers,
    ).json()

    if not patient:
        return {
            "error": "Patient not found"
        }

    patient = patient[0]

    # -----------------------------
    # Latest Prediction
    # -----------------------------

    predictions = requests.get(
        f"{SUPABASE_URL}/rest/v1/predictions"
        f"?patient_id=eq.{patient_id}"
        "&order=predicted_at.desc"
        "&limit=1",
        headers=headers,
    ).json()

    latest_prediction = (
        predictions[0]
        if predictions
        else {}
    )

    # -----------------------------
    # Latest OCR Report
    # -----------------------------

    reports = requests.get(
        f"{SUPABASE_URL}/rest/v1/ocr_reports"
        f"?patient_id=eq.{patient_id}"
        "&order=uploaded_at.desc"
        "&limit=1",
        headers=headers,
    ).json()

    latest_report = (
        reports[0]
        if reports
        else {}
    )

    parsed = latest_report.get(
        "parsed_json",
        {}
    )

    # -----------------------------
    # Create PDF
    # -----------------------------

    pdf_path = f"report_{patient_id}.pdf"

    doc = SimpleDocTemplate(
        pdf_path
    )

    styles = getSampleStyleSheet()

    content = []

    # =============================
    # TITLE
    # =============================

    content.append(
        Paragraph(
            "NAB Preg AI Clinical Report",
            styles["Title"]
        )
    )

    content.append(
        Spacer(1, 12)
    )

    # =============================
    # PATIENT INFORMATION
    # =============================

    content.append(
        Paragraph(
            "Patient Information",
            styles["Heading2"]
        )
    )

    content.append(
        Paragraph(
            f"Patient Name: {patient.get('full_name', 'N/A')}",
            styles["BodyText"]
        )
    )

    content.append(
        Paragraph(
            f"Patient Code: {patient.get('patient_code', 'N/A')}",
            styles["BodyText"]
        )
    )

    content.append(
        Paragraph(
            f"Age: {patient.get('age', 'N/A')}",
            styles["BodyText"]
        )
    )

    content.append(
        Paragraph(
            f"Trimester: {patient.get('trimester', 'N/A')}",
            styles["BodyText"]
        )
    )

    content.append(
        Paragraph(
            f"Pregnancy Week: {patient.get('pregnancy_week', 'N/A')}",
            styles["BodyText"]
        )
    )

    content.append(
        Paragraph(
            f"Village: {patient.get('village', 'N/A')}",
            styles["BodyText"]
        )
    )

    content.append(
        Paragraph(
            f"Blood Group: {patient.get('blood_group', 'N/A')}",
            styles["BodyText"]
        )
    )

    # =============================
    # OCR CLINICAL DATA
    # =============================

    content.append(
        Spacer(1, 12)
    )

    content.append(
        Paragraph(
            "OCR Clinical Data",
            styles["Heading2"]
        )
    )

    content.append(
        Paragraph(
            f"Hemoglobin: {parsed.get('hemoglobin', 'N/A')}",
            styles["BodyText"]
        )
    )

    content.append(
        Paragraph(
            f"Blood Pressure: {parsed.get('blood_pressure', 'N/A')}",
            styles["BodyText"]
        )
    )

    content.append(
        Paragraph(
            f"Blood Sugar: {parsed.get('blood_sugar', 'N/A')}",
            styles["BodyText"]
        )
    )

    content.append(
        Paragraph(
            f"Heart Rate: {parsed.get('heart_rate', 'N/A')}",
            styles["BodyText"]
        )
    )

    # =============================
    # AI RISK ASSESSMENT
    # =============================

    content.append(
        Spacer(1, 12)
    )

    content.append(
        Paragraph(
            "AI Risk Assessment",
            styles["Heading2"]
        )
    )

    content.append(
        Paragraph(
            f"Overall Risk: {latest_prediction.get('overall_risk', 'N/A')}",
            styles["BodyText"]
        )
    )

    content.append(
        Paragraph(
            f"Anemia Risk: {latest_prediction.get('anemia_risk', 'N/A')}",
            styles["BodyText"]
        )
    )

    content.append(
        Paragraph(
            f"Hypertension Risk: {latest_prediction.get('hypertension_risk', 'N/A')}",
            styles["BodyText"]
        )
    )

    content.append(
        Paragraph(
            f"Confidence Score: {latest_prediction.get('confidence_score', 'N/A')}%",
            styles["BodyText"]
        )
    )

    content.append(
        Paragraph(
            f"Clinical Score: {latest_prediction.get('clinical_score', 'N/A')}",
            styles["BodyText"]
        )
    )

    # =============================
    # CLINICAL FINDINGS
    # =============================

    findings = latest_prediction.get(
        "clinical_findings",
        []
    )

    if findings:
        content.append(
            Spacer(1, 12)
        )

        content.append(
            Paragraph(
                "Clinical Findings",
                styles["Heading2"]
            )
        )

        for finding in findings:
            content.append(
                Paragraph(
                    f"• {finding}",
                    styles["BodyText"]
                )
            )

    # =============================
    # RECOMMENDATIONS
    # =============================

    recommendations = latest_prediction.get(
        "ai_recommendations",
        []
    )

    if recommendations:
        content.append(
            Spacer(1, 12)
        )

        content.append(
            Paragraph(
                "Recommendations",
                styles["Heading2"]
            )
        )

        for recommendation in recommendations:
            content.append(
                Paragraph(
                    f"• {recommendation}",
                    styles["BodyText"]
                )
            )

    # =============================
    # AI SUMMARY
    # =============================

    content.append(
        Spacer(1, 12)
    )

    content.append(
        Paragraph(
            "AI Summary",
            styles["Heading2"]
        )
    )

    content.append(
        Paragraph(
            latest_prediction.get(
                "ai_summary",
                "No summary available"
            ),
            styles["BodyText"]
        )
    )

    # =============================
    # BUILD PDF
    # =============================

    doc.build(content)

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"{patient.get('patient_code')}_report.pdf"
    )