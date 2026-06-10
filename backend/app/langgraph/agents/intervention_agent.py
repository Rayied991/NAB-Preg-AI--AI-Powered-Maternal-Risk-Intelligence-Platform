from backend.app.services.ai_intervention_storage import save_intervention
import logging

logger = logging.getLogger(__name__)

def intervention_agent(state):
    """
    Auto-create interventions for villages based on risk status.
    Includes deduplication to prevent duplicate interventions.
    """
    logger.info("🎯 INTERVENTION AGENT RUNNING")
    
    summary = state.get("summary_json")
    if not summary:
        logger.warning("⚠️ No summary found, skipping interventions")
        return state

    village_data = state.get("village_data")
    if not village_data:
        logger.warning("⚠️ No village_data found, skipping interventions")
        return state
        
    village_name = village_data["village_name"]
    status = summary.get("status", "STABLE")
    
    logger.info(f"📍 Processing interventions for {village_name} (Status: {status})")

    # Generate interventions based on status
    if status == "HOTSPOT":
        logger.info(f"🚨 {village_name} is HOTSPOT - creating urgent interventions")
        
        # Create alert (with deduplication)
        save_intervention({
            "village_name": village_name,
            "intervention_type": "URGENT",
            "message": f"🚨 {village_name} identified as HIGH RISK HOTSPOT - Immediate action required"
        }, skip_duplicates=True)
        
        # Save recommended interventions (with deduplication)
        for recommendation in summary.get("recommendations", []):
            save_intervention({
                "village_name": village_name,
                "intervention_type": "RECOMMENDATION",
                "message": recommendation
            }, skip_duplicates=True)
    
    elif status == "WATCHLIST":
        logger.info(f"⚠️ {village_name} is WATCHLIST - creating preventive interventions")
        
        # Create monitoring intervention (with deduplication)
        save_intervention({
            "village_name": village_name,
            "intervention_type": "MONITORING",
            "message": f"⚠️ {village_name} under enhanced surveillance - Increased monitoring required"
        }, skip_duplicates=True)
        
        # Save preventive recommendations (with deduplication)
        for recommendation in summary.get("recommendations", []):
            save_intervention({
                "village_name": village_name,
                "intervention_type": "PREVENTIVE",
                "message": recommendation
            }, skip_duplicates=True)
    
    elif status == "STABLE":
        logger.info(f"✅ {village_name} is STABLE - creating routine interventions")
        
        # Create routine check intervention (with deduplication)
        save_intervention({
            "village_name": village_name,
            "intervention_type": "ROUTINE",
            "message": f"✅ {village_name} stable - Continue routine maternal health monitoring"
        }, skip_duplicates=True)
    
    else:
        logger.warning(f"❓ {village_name} has unknown status: {status}")

    logger.info(f"✅ Completed interventions for {village_name}")
    return state