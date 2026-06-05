from typing import TypedDict


class ClinicalState(TypedDict):
    question: str
    patient_context: dict

    risk_summary: str
    trend_summary: str
    nutrition_summary: str
    alert_summary: str

    final_answer: str
    