from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.services.chat_storage import save_chat
from backend.app.services.patient_context import (
    get_patient_context
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

    # Detect PAT001, PAT002, PAT003 etc.
    match = re.search(
        r"(PAT\d+)",
        question.upper()
    )

    if match:

        patient_code = match.group(1)

        context = get_patient_context(
            patient_code
        )

        if context:

            question = f"""
You are a maternal healthcare clinical assistant.

Patient Context:

{context}

User Question:
{payload.question}

Use the patient information above to answer accurately.
"""

    result = ask_rag(question)

    save_chat(
        payload.question,
        result["answer"]
    )

    return result