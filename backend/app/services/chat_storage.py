import os
import requests

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)


def save_chat(
    question: str,
    answer: str
):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }

    requests.post(
        f"{SUPABASE_URL}/rest/v1/clinical_chats",
        headers=headers,
        json={
            "question": question,
            "answer": answer,
        },
    )


def get_chat_history():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    return requests.get(
        f"{SUPABASE_URL}/rest/v1/clinical_chats"
        "?order=created_at.desc"
        "&limit=50",
        headers=headers,
    ).json()