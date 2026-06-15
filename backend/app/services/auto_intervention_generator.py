from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import requests
import os
import logging

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

BACKEND_BASE_URL = os.getenv(
    "BACKEND_BASE_URL",
    "http://localhost:8000"
)

logger = logging.getLogger(__name__)

def check_and_generate_interventions():
    """
    Check if village AI reports (and consequently interventions) need to be generated.
    """
    try:
        logger.info("🔄 [AUTO] Checking if report generation is needed...")
        
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
        }
        
        # Check if we have recent AI reports
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/village_ai_reports?select=village_name&limit=1",
            headers=headers,
        )
        
        if response.status_code != 200:
            logger.error(f"❌ [AUTO] Failed to check AI reports: {response.status_code}")
            return
        
        reports = response.json()
        
        # If no reports exist, trigger generation
        if len(reports) == 0:
            logger.info("⚠️ [AUTO] No AI reports found. Triggering generation...")
            
            # Call the village-ai-reports endpoint to generate everything.
            # This endpoint automatically runs the LangGraph pipeline, 
            # which includes the intervention_agent.
            gen_response = requests.get(
                f"{BACKEND_BASE_URL}/api/village-ai-reports",
                timeout=120  # 2 minute timeout for generation
            )
            
            if gen_response.status_code == 200:
                logger.info("✅ [AUTO] Successfully generated AI reports and interventions")
            else:
                logger.error(f"❌ [AUTO] Failed to generate: {gen_response.status_code}")
        else:
            logger.info(f"✅ [AUTO] AI reports exist ({len(reports)} villages). No generation needed.")
            
    except Exception as e:
        logger.error(f"❌ [AUTO] Error in auto-generation: {e}")

def start_scheduler():
    """
    Start the background scheduler for automatic intervention generation
    """
    scheduler = BackgroundScheduler()
    
    # Run immediately on startup
    scheduler.add_job(
        check_and_generate_interventions,
        trigger='date',
        run_date=datetime.now(),
        id='startup_generation',
        name='Startup Intervention Generation'
    )
    
    # Run every 6 hours to keep data fresh
    scheduler.add_job(
        check_and_generate_interventions,
        trigger=IntervalTrigger(hours=6),
        id='periodic_generation',
        name='Periodic Intervention Generation'
    )
    
    scheduler.start()
    logger.info("🚀 [AUTO] Background scheduler started. Will auto-generate interventions.")
    logger.info("⏰ [AUTO] Schedule: Immediate + Every 6 hours")