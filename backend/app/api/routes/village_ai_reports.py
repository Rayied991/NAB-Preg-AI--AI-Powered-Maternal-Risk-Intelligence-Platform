from fastapi import APIRouter
import requests
import os
import json

from backend.app.services.village_ai_report_storage import (
    save_village_ai_report,
    get_all_village_ai_reports,
)

from backend.app.langgraph.village_graph import graph

from backend.app.services.village_relationship_storage import (
    save_relationship,
    clear_village_relationships,
)

from backend.app.langgraph.agents.forecast_agent import forecast_agent
from backend.app.langgraph.agents.intervention_agent import intervention_agent
from backend.app.langgraph.agents.alert_agent import alert_agent

router = APIRouter()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

@router.get("/village-ai-reports")
async def get_village_ai_reports():
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    # Fetch all villages currently in analytics tracking
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/village_analytics?select=*",
        headers=headers,
    )
    villages = response.json() if response.ok else []

    # Check cache
    cached_reports = get_all_village_ai_reports() or []
    cached_village_names = {r.get("village", r.get("village_name")) for r in cached_reports}
    
    # Identify which villages don't have an AI report yet
    missing_villages = [v for v in villages if v["village_name"] not in cached_village_names]

    if not missing_villages and cached_reports:
        print("✅ Returning cached AI reports (Instant load)")
        return cached_reports

    print(f"⚠️ Cache miss for {len(missing_villages)} villages. Generating new AI reports...")
    
    # We will return the existing cached reports + the new ones
    reports = list(cached_reports)

    for village in missing_villages:
        village_name = village["village_name"]

        # Clear old graph relationships
        clear_village_relationships(village_name)

        # Run LangGraph
        result = graph.invoke({
            "village_data": village
        })

        summary_text = (
            result["summary"]
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        summary = json.loads(summary_text)

        # Build state for agents
        state = {
            "village_data": village,
            "summary_json": summary,
        }

        # Forecast Agent
        state = forecast_agent(state)

        # Intervention Agent
        intervention_agent(state)

        # Alert Agent
        alert_agent(state)

        forecast = state["forecast"]

        # STATUS
        save_relationship(village_name, "STATUS", summary["status"])

        # FORECAST TEXT
        save_relationship(village_name, "FORECAST", summary["forecast"])

        # FORECAST STATUS
        save_relationship(village_name, "FORECAST_STATUS", forecast["forecast_status"])

        # FORECAST CONFIDENCE
        save_relationship(village_name, "FORECAST_CONFIDENCE", str(forecast["confidence"]))

        # FORECAST DAYS
        save_relationship(village_name, "FORECAST_DAYS", str(forecast["forecast_days"]))

        # DRIVERS
        for driver in summary["drivers"]:
            save_relationship(village_name, "DRIVER", driver)

        # RECOMMENDATIONS
        for recommendation in summary["recommendations"]:
            save_relationship(village_name, "RECOMMENDATION", recommendation)

        # ── PRIORITY 2: REMOVED clear_village_ai_report ──
        # We rely on the UPSERT (on_conflict=village_name) in save_village_ai_report
        # to avoid unnecessary DELETE + INSERT database operations.
        
        save_village_ai_report({
            "village_name": village_name,
            "status": summary["status"],
            "confidence": summary["confidence"],
            "forecast": summary["forecast"],
            "forecast_status": forecast["forecast_status"],
            "forecast_confidence": forecast["confidence"],
            "forecast_days": forecast["forecast_days"],
            "key_drivers": json.dumps(summary["drivers"]),
            "recommendation": json.dumps(summary["recommendations"]),
        })

        # API Response
        reports.append({
            "village": village_name,
            "status": summary["status"],
            "confidence": summary["confidence"],
            "forecast": summary["forecast"],
            "forecast_status": forecast["forecast_status"],
            "forecast_confidence": forecast["confidence"],
            "forecast_days": forecast["forecast_days"],
            "drivers": summary["drivers"],
            "recommendations": summary["recommendations"],
        })

    return reports