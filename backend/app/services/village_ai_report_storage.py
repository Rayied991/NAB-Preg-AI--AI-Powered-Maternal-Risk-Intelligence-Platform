import requests
import os
import json

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates",
}

def get_all_village_ai_reports():
    """
    Fetches all cached AI reports from Supabase.
    Returns a list of formatted reports matching the API response structure.
    """
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/village_ai_reports?select=*",
        headers=headers,
    )
    
    if response.status_code == 200:
        raw_reports = response.json()
        formatted_reports = []
        
        for r in raw_reports:
            # Parse JSON strings back to lists for drivers and recommendations
            try:
                drivers = json.loads(r.get("key_drivers", "[]"))
            except (json.JSONDecodeError, TypeError):
                drivers = r.get("key_drivers", [])
                
            try:
                recommendations = json.loads(r.get("recommendation", "[]"))
            except (json.JSONDecodeError, TypeError):
                recommendations = r.get("recommendation", [])
                
            formatted_reports.append({
                "village": r.get("village_name"),
                "status": r.get("status"),
                "confidence": r.get("confidence"),
                "forecast": r.get("forecast"),
                "forecast_status": r.get("forecast_status"),
                "forecast_confidence": r.get("forecast_confidence"),
                "forecast_days": r.get("forecast_days"),
                "drivers": drivers,
                "recommendations": recommendations,
            })
            
        return formatted_reports
        
    return []

def save_village_ai_report(report):
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/village_ai_reports?on_conflict=village_name",
        headers=headers,
        json=report,
    )
    print("SAVE REPORT:", response.status_code)
    print(response.text)

def clear_village_ai_report(village_name: str):
    response = requests.delete(
        f"{SUPABASE_URL}/rest/v1/village_ai_reports?village_name=eq.{village_name}",
        headers=headers,
    )
    print("CLEAR REPORT:", response.status_code)
    print(response.text)