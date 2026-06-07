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
    clear_village_relationships,
)

from backend.app.langgraph.agents.forecast_agent import (
    forecast_agent,
)

from backend.app.langgraph.agents.intervention_agent import (
    intervention_agent,
)

router = APIRouter()

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)


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

        # Clear old graph relationships
        clear_village_relationships(
            village["village_name"]
        )

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

        summary = json.loads(
            summary_text
        )

        # Build state
        state = {
            "village_data": village,
            "summary_json": summary,
        }

        # Run Forecast Agent
        state = forecast_agent(
            state
        )

        # Run Intervention Agent
        intervention_agent(
            state
        )

        forecast = state["forecast"]

        # STATUS
        save_relationship(
            village["village_name"],
            "STATUS",
            summary["status"],
        )

        # FORECAST TEXT
        save_relationship(
            village["village_name"],
            "FORECAST",
            summary["forecast"],
        )

        # FORECAST STATUS
        save_relationship(
            village["village_name"],
            "FORECAST_STATUS",
            forecast["forecast_status"],
        )

        # FORECAST CONFIDENCE
        save_relationship(
            village["village_name"],
            "FORECAST_CONFIDENCE",
            str(
                forecast["confidence"]
            ),
        )

        # FORECAST DAYS
        save_relationship(
            village["village_name"],
            "FORECAST_DAYS",
            str(
                forecast["forecast_days"]
            ),
        )

        # DRIVERS
        for driver in summary["drivers"]:

            save_relationship(
                village["village_name"],
                "DRIVER",
                driver,
            )

        # RECOMMENDATIONS
        for recommendation in summary[
            "recommendations"
        ]:

            save_relationship(
                village["village_name"],
                "RECOMMENDATION",
                recommendation,
            )

        # Refresh AI Report
        clear_village_ai_report(
            village["village_name"]
        )

        save_village_ai_report({

            "village_name":
                village["village_name"],

            "status":
                summary["status"],

            "confidence":
                summary["confidence"],

            "forecast":
                summary["forecast"],

            "key_drivers":
                json.dumps(
                    summary["drivers"]
                ),

            "recommendation":
                json.dumps(
                    summary[
                        "recommendations"
                    ]
                ),
        })

        # API Response
        reports.append({

            "village":
                village["village_name"],

            "status":
                summary["status"],

            "confidence":
                summary["confidence"],

            "forecast":
                summary["forecast"],

            "forecast_status":
                forecast[
                    "forecast_status"
                ],

            "forecast_confidence":
                forecast[
                    "confidence"
                ],

            "forecast_days":
                forecast[
                    "forecast_days"
                ],

            "drivers":
                summary["drivers"],

            "recommendations":
                summary[
                    "recommendations"
                ],
        })

    return reports