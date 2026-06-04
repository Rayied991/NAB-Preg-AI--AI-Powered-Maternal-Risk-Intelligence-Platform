from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.chat_storage import save_chat
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
    save_chat(
    payload.question,
    result["answer"]
    )

    return result