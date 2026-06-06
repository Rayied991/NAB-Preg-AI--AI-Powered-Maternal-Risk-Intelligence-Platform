from fastapi import APIRouter
import requests
import os
import json
from backend.app.services.village_ai_report_storage import save_village_ai_report
from backend.app.langgraph.village_graph import graph
from backend.app.services.village_relationship_storage import save_relationship

router = APIRouter()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

@router.get("/village-ai-reports")
async def get_village_ai_reports():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/village_analytics?select=*",
        headers=headers,
    )

    villages = response.json()
    reports = []

    for village in villages:
        result = graph.invoke({"village_data": village})
        summary_text = result["summary"]
        summary_text = summary_text.replace("```json", "").replace("```", "").strip()
        summary = json.loads(summary_text)

        # Save graph relationships to Supabase
        relationships = {
            "STATUS": summary["status"],
            "FORECAST": summary["forecast"],
            "DRIVER": summary["drivers"],
            "RECOMMENDATION": summary["recommendation"]
        }

        for rel_type, rel_value in relationships.items():
            save_relationship(
                village["village_name"],
                rel_type,
                rel_value
            )

        # Save AI report
        save_village_ai_report({
            "village_name": village["village_name"],
            "status": summary["status"],
            "confidence": summary["confidence"],
            "forecast": summary["forecast"],
            "key_drivers": summary["drivers"],
            "recommendation": summary["recommendation"],
        })

        reports.append({
    "village":
        village["village_name"],

    "status":
        summary["status"],

    "confidence":
        summary["confidence"],

    "forecast":
        summary["forecast"],

    "drivers":
        summary["drivers"],

    "recommendation":
        summary["recommendation"],
})

    return reports