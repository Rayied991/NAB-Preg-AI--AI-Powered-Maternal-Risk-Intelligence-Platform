from fastapi import APIRouter

from backend.app.services.chat_storage import (
    get_chat_history
)

router = APIRouter()


@router.get("/chat-history")
async def chat_history():
    return get_chat_history()