from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.services.chat_storage import save_chat

from backend.app.services.patient_context import (
    get_patient_context,
    get_patient_context_by_name,
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
        ]
    ):
        metric_focus = "blood_pressure"

    elif any(
        k in q
        for k in [
            "hemoglobin",
            "hb",
            "haemoglobin",
        ]
    ):
        metric_focus = "hemoglobin"

    elif any(
        k in q
        for k in [
            "blood sugar",
            "sugar",
            "glucose",
        ]
    ):
        metric_focus = "blood_sugar"

    elif any(
        k in q
        for k in [
            "heart rate",
            "pulse",
            "hr",
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

        name_match = re.search(
            r"(?:analyze|summarize|summary of|overview of|risk level of|risk of|risks for|recommendations for|recommendation for)\s+(.+)",
            question,
            re.IGNORECASE,
        )

        if name_match:

            patient_name = (
                name_match.group(1)
                .strip()
            )

            context = get_patient_context_by_name(
                patient_name
            )

            if context:
                set_last_patient(
                    context
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