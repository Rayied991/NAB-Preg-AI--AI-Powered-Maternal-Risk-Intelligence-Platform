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

    # Try to extract patient code (e.g., PAT001)
    code_match = re.search(r"(PAT\d+)", question.upper())
    if code_match:
        patient_code = code_match.group(1)
        context = get_patient_context(patient_code)
    else:
        # Try to extract patient name from common keywords
        name_match = re.search(
            r"(?:analyze|summarize|summary of|risk for|risks for|recommendations for|recommendation for)\s+(.+)",
            question,
            re.IGNORECASE,
        )
        if name_match:
            patient_name = name_match.group(1).strip()
            context = get_patient_context_by_name(patient_name)

    # Build patient-aware context if patient found
    if context:
        question = f"""You are a maternal healthcare clinical assistant.

Patient Information:
{context}

User Question: {payload.question}

Provide clear, actionable clinical guidance using markdown formatting."""

    # Query RAG system
    result = ask_rag(question)

    # Save to chat history
    try:
        save_chat(payload.question, result["answer"])
    except Exception as e:
        import logging
        logging.error(f"Failed to save chat history: {e}")

    return result
