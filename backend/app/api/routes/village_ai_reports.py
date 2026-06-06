from fastapi import APIRouter
import requests
import os
import json
from backend.app.services.village_ai_report_storage import (
    save_village_ai_report,
    clear_village_ai_report,
)
from backend.app.langgraph.village_graph import graph
from backend.app.services.village_relationship_storage import (
    save_relationship,
    clear_village_relationships
)
from backend.app.langgraph.agents.intervention_agent import intervention_agent

router = APIRouter()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")


@router.get("/village-ai-reports")
async def get_village_ai_reports():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    # Fetch village analytics from Supabase
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/village_analytics?select=*",
        headers=headers,
    )
    villages = response.json()
    reports = []

    for village in villages:
        # Clear previous relationships
        clear_village_relationships(village["village_name"])

        # Generate AI summary using LangGraph
        result = graph.invoke({"village_data": village})
        summary_text = result["summary"].replace("```json", "").replace("```", "").strip()
        summary = json.loads(summary_text)

        # Store summary in result state for Intervention Agent
        result["summary_json"] = summary

        # Trigger interventions (HOTSPOT detection + recommendations)
        intervention_agent(result)

        # Save relationships
        save_relationship(village["village_name"], "STATUS", summary["status"])
        save_relationship(village["village_name"], "FORECAST", summary["forecast"])
        for driver in summary["drivers"]:
            save_relationship(village["village_name"], "DRIVER", driver)
        for recommendation in summary["recommendations"]:
            save_relationship(village["village_name"], "RECOMMENDATION", recommendation)

        # Clear previous AI report and save new
        clear_village_ai_report(village["village_name"])
        save_village_ai_report({
            "village_name": village["village_name"],
            "status": summary["status"],
            "confidence": summary["confidence"],
            "forecast": summary["forecast"],
            "key_drivers": json.dumps(summary["drivers"]),
            "recommendation": json.dumps(summary["recommendations"]),
        })

        # Append to API response
        reports.append({
            "village": village["village_name"],
            "status": summary["status"],
            "confidence": summary["confidence"],
            "forecast": summary["forecast"],
            "drivers": summary["drivers"],
            "recommendations": summary["recommendations"],
        })

    return reports