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
    result = ask_rag(
        payload.question
    )

    return result