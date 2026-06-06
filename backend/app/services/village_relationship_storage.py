import requests
import os

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}


def save_relationship(
    village_name: str,
    relationship_type: str,
    relationship_value: str,
):
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

    if response.status_code >= 400:
        print(
            "RELATIONSHIP BODY:",
            response.text
        )


def clear_village_relationships(
    village_name: str
):
    response = requests.delete(
        f"{SUPABASE_URL}/rest/v1/village_relationships"
        f"?village_name=eq.{village_name}",
        headers=headers,
    )

    print(
        "RELATIONSHIP DELETE:",
        response.status_code
    )

    if response.status_code >= 400:
        print(
            "DELETE ERROR:",
            response.text
        )