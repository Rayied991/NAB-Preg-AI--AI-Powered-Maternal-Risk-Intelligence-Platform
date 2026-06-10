import requests
import os
from datetime import datetime, timedelta

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

def get_recent_intervention(
    village_name: str, 
    intervention_type: str, 
    message: str,
    hours: int = 24
) -> bool:
    """
    Check if an EXACT intervention (same village, type, AND message) exists 
    within the last N hours.
    
    Returns True if an exact duplicate exists, False otherwise.
    """
    try:
        # Calculate time threshold
        threshold = (datetime.utcnow() - timedelta(hours=hours)).isoformat() + "Z"
        
        # ✅ BEST PRACTICE: Use the params dictionary. 
        # The requests library will automatically and safely URL-encode the values.
        params = {
            "village_name": f"eq.{village_name}",
            "intervention_type": f"eq.{intervention_type}",
            "message": f"eq.{message}",
            "created_at": f"gte.{threshold}",
            "limit": 1,
        }
        
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/ai_interventions",
            headers=headers,
            params=params,
        )
        
        if response.status_code == 200:
            data = response.json()
            return len(data) > 0  # True if exact duplicate exists
        
        return False
        
    except Exception as e:
        print(f"❌ Error checking for duplicate intervention: {e}")
        return False  # Fail open - allow insertion if check fails


def save_intervention(intervention: dict, skip_duplicates: bool = True):
    """
    Save intervention to Supabase with optional deduplication.
    
    Args:
        intervention: Dict with village_name, intervention_type, message
        skip_duplicates: If True, check for existing interventions first
    """
    # Deduplication check
    if skip_duplicates:
        village_name = intervention.get("village_name")
        intervention_type = intervention.get("intervention_type")
        message = intervention.get("message")
        
        if village_name and intervention_type and message:
            if get_recent_intervention(village_name, intervention_type, message):
                print(f"⏭️ Skipping duplicate intervention for {village_name} ({intervention_type})")
                return False  # Indicate that insertion was skipped
    
    # Insert the intervention
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/ai_interventions",
        headers=headers,
        json=intervention,
    )
    
    if response.status_code == 201:
        print(f"✅ Saved Intervention: {intervention.get('village_name')} - {intervention.get('intervention_type')}")
        return True
    else:
        print(f"❌ Failed to save intervention: {response.status_code} - {response.text}")
        return False