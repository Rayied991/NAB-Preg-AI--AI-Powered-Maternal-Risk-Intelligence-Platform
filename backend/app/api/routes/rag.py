from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.services.chat_storage import save_chat

from backend.app.services.patient_context import (
    get_patient_context,
    get_patient_context_by_name,
)

from backend.rag.chain import ask_rag

import re

router = APIRouter()


class AskRequest(BaseModel):
    question: str


@router.post("/ask")
async def ask_question(
    payload: AskRequest
):

    question = payload.question

    context = None

    # -----------------------------
    # PATIENT CODE LOOKUP
    # Example: PAT001
    # -----------------------------

    code_match = re.search(
        r"(PAT\d+)",
        question.upper()
    )

    if code_match:

        patient_code = code_match.group(1)

        context = get_patient_context(
            patient_code
        )

    # -----------------------------
    # PATIENT NAME LOOKUP
    # Example:
    # Analyze Raida
    # Summarize Raida
    # Risks for Raida
    # Recommendations for Raida
    # -----------------------------

    else:

        name_match = re.search(
            r"(?:analyze|summarize|summary of|risk for|risks for|recommendations for|recommendation for)\s+(.+)",
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

    # -----------------------------
    # BUILD PATIENT-AWARE PROMPT
    # -----------------------------

    if context:

        question = f"""
You are a maternal healthcare clinical assistant.

Patient Context:

{context}

User Question:
{payload.question}

Instructions:
- Use the patient information above.
- Explain risks clearly.
- Provide recommendations.
- Mention abnormal findings.
- Keep response concise and clinical.
"""

    # -----------------------------
    # ASK RAG
    # -----------------------------

    result = ask_rag(
        question
    )

    # -----------------------------
    # SAVE CHAT HISTORY
    # -----------------------------

    try:
        save_chat(
            payload.question,
            result["answer"]
        )
    except Exception as e:
        print(
            "Failed to save chat:",
            e
        )

    return result