from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.language_detector import (
    detect_language,
)
from backend.app.services.chat_storage import save_chat

from backend.app.services.patient_context import (
    get_patient_context,
    get_patient_context_by_name,
    find_patient_in_text,
)

from backend.app.services.session_memory import (
    set_last_patient,
    get_last_patient,
)

from backend.rag.chain import ask_rag

import re
import logging

router = APIRouter()


class AskRequest(BaseModel):
    question: str


@router.post("/ask")
async def ask_question(
    payload: AskRequest
):
    question = payload.question
    q = question.lower()
    
    language = detect_language(
    question
    )
    
    # Hindi keywords
    if any(
        word in q
        for word in [
            "kya",
            "ka",
            "ki",
            "hai",
            "risk kya hai",
            "salah",
            "uska",
            "uski",
        ]
    ):
        language = "hi"

    # Bengali keywords
    elif any(
        word in q
        for word in [
            "বাংলায়",
            "সারাংশ",
            "ঝুঁকি",
            "তার",
            "কি",
            "দাও",
        ]
    ):
        language = "bn"
    print(
    "Detected Language:",
    language
)
    
    
    #-----------------------------
    # Language
    #-------------------------------
    
    language_instruction = ""

    if language == "bn":

        language_instruction = """
    Respond entirely in Bengali.
    Use natural healthcare terminology.
    """

    elif language == "hi":

        language_instruction = """
    Respond entirely in Hindi.
    Use simple medical language.
    """

    else:

        language_instruction = """
    Respond entirely in English.
    """

    context = None
    metric_focus = None
    intent = "summary"

    # --------------------------------
    # Intent Detection
    # --------------------------------

    if any(
    word in q
    for word in [
        "risk",
        "risks",
        "danger",
        "high risk",
        "risk level",

        "khatra",
        "risk kya hai",
        "joakhim",
        "ঝুঁকি",
    ]
):
        intent = "risk"

    elif any(
    word in q
    for word in [
        "recommend",
        "recommendation",
        "treatment",
        "advice",
        "management",

        "salah",
        "treatment kya",
        "পরামর্শ",
    ]
):
        intent = "recommendation"

    elif any(
    word in q
    for word in [
        "summary",
        "summarize",
        "overview",
        "patient summary",

        "saransh",
        "summary do",
        "সারাংশ",
        "বাংলায়",
    ]
):
        intent = "summary"

    # --------------------------------
    # Metric Detection
    # --------------------------------

    if any(
    k in q
    for k in [
        "blood pressure",
        "bp",
        "pressure",
        "रक्तचाप",
        "ব্লাড প্রেসার",
    ]
):
        metric_focus = "blood_pressure"

    elif any(
    k in q
    for k in [
        "hemoglobin",
        "hb",
        "haemoglobin",
        "হিমোগ্লোবিন",
        "हीमोग्लोबिन",
    ]
):
        metric_focus = "hemoglobin"

    elif any(
    k in q
    for k in [
        "blood sugar",
        "sugar",
        "glucose",
        "গ্লুকোজ",
        "শর্করা",
        "ग्लूकोज",
    ]
):
        metric_focus = "blood_sugar"

    elif any(
    k in q
    for k in [
        "heart rate",
        "pulse",
        "hr",
        "নাড়ির গতি",
        "পালস",
        "नाड़ी",
    ]
):
        metric_focus = "heart_rate"

    # --------------------------------
    # Follow-up Memory
    # --------------------------------

    follow_up_keywords = [
    "her",
    "his",
    "what about",
    "and",

    # Hindi
    "uska",
    "uski",
    "kya hai",

    # Bengali
    "তার",
    "কি",
]

    remembered = get_last_patient()

    if remembered:

        if (
            any(k in q for k in follow_up_keywords)
            or metric_focus is not None
        ):
            context = remembered

    # --------------------------------
    # Patient Code Lookup
    # --------------------------------

    if context is None:

        code_match = re.search(
            r"(PAT\d+)",
            question.upper()
        )

        if code_match:

            patient_code = code_match.group(1)

            context = get_patient_context(
                patient_code
            )

            if context:
                set_last_patient(
                    context
                )

# --------------------------------
# Patient Name Lookup
# --------------------------------

    if context is None:

        patient = find_patient_in_text(
            question
        )

        if patient:
            print(
    "PATIENT FOUND:",
    patient["patient"]["full_name"]
)

            context = patient

            set_last_patient(
                patient
            )

    # --------------------------------
    # Prompt Building
    # --------------------------------

    if context:

        # --------------------------------
        # Metric Question
        # --------------------------------

        if metric_focus:

            question = f"""
You are a maternal healthcare clinical assistant.

{language_instruction}

Patient Data:
{context}

User Question:
{payload.question}

Focus ONLY on:
{metric_focus}

IMPORTANT:
- The patient data above contains the answer.
- Never answer using generic WHO guidance.
- Use the patient's actual value.
- Answer ONLY about this metric.
- Do NOT provide a full patient summary.
- Do NOT discuss unrelated patient details.

Return markdown.

Format:

# {metric_focus.replace('_', ' ').title()} Assessment

## Current Value

## Interpretation

## Risk Level

## Recommendations
"""

        # --------------------------------
        # Risk Question
        # --------------------------------

        elif intent == "risk":

            question = f"""
You are a maternal healthcare clinical assistant.

{language_instruction}
Patient Data:
{context}

User Question:
{payload.question}

Return ONLY a risk assessment.

Return markdown.

Format:

# Risk Assessment

## Overall Risk

## Key Risk Factors

## Immediate Action
"""

        # --------------------------------
        # Recommendation Question
        # --------------------------------

        elif intent == "recommendation":

            question = f"""
You are a maternal healthcare clinical assistant.

{language_instruction}
Patient Data:
{context}

User Question:
{payload.question}

Return ONLY recommendations.

Return markdown.

Format:

# Recommendations

## Immediate Actions

## Monitoring

## Follow Up
"""

        # --------------------------------
        # Summary Question
        # --------------------------------

        else:

            question = f"""
You are a maternal healthcare clinical assistant.

{language_instruction}
Patient Data:
{context}

User Question:
{payload.question}

Return a complete patient summary.

Return markdown.

Format:

# Patient Summary

## Patient Details

## Key Clinical Findings

## Risk Assessment

## Recommendations

## Follow Up Plan
"""

    # --------------------------------
    # Ask RAG
    # --------------------------------

    result = ask_rag(
        question
    )

    # --------------------------------
    # Save Chat
    # --------------------------------

    try:

        save_chat(
            payload.question,
            result["answer"]
        )

    except Exception as e:

        logging.error(
            f"Failed to save chat history: {e}"
        )

    return result