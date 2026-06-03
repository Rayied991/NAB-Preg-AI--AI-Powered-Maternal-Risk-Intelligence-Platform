from fastapi import APIRouter
from pydantic import BaseModel

from backend.rag.chain import ask_rag

router = APIRouter()

class AskRequest(BaseModel):
    question: str


@router.post("/ask")
async def ask_question(
    payload: AskRequest
):
    answer = ask_rag(
        payload.question
    )

    return {
        "answer": answer
    }