from fastapi import APIRouter, BackgroundTasks
import requests
import os

router = APIRouter()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

@router.get("/ai-interventions")
async def get_ai_interventions():
    """Get all AI interventions"""
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/ai_interventions?select=*&order=created_at.desc",
        headers=headers,
    )
    
    return response.json()

@router.post("/ai-interventions/refresh")
async def refresh_interventions(background_tasks: BackgroundTasks):
    """
    Manually trigger intervention regeneration
    Runs in background so it doesn't block the response
    """
    from backend.app.services.auto_intervention_generator import check_and_generate_interventions
    
    # Run in background
    background_tasks.add_task(check_and_generate_interventions)
    
    return {
        "message": "Intervention refresh started in background",
        "status": "processing"
    }