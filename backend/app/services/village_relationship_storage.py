import requests
import os

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)

def save_relationship(
    village_name: str,
    relationship_type: str,
    relationship_value: str,
):

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/village_relationships",
        headers=headers,
        json={
            "village_name": village_name,
            "relationship_type": relationship_type,
            "relationship_value": relationship_value,
        },
    )

    print(
        "RELATIONSHIP SAVE:",
        response.status_code
    )

    print(
        "RELATIONSHIP BODY:",
        response.text
    )