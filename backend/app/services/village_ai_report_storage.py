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
    "Prefer": "resolution=merge-duplicates",
}


def save_village_ai_report(report):

    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/village_ai_reports"
        "?on_conflict=village_name",
        headers=headers,
        json=report,
    )

    print(
        "SAVE REPORT:",
        response.status_code
    )

    print(response.text)


def clear_village_ai_report(
    village_name: str
):

    response = requests.delete(
        f"{SUPABASE_URL}/rest/v1/village_ai_reports"
        f"?village_name=eq.{village_name}",
        headers=headers,
    )

    print(
        "CLEAR REPORT:",
        response.status_code
    )

    print(response.text)