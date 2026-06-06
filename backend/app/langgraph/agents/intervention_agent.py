from backend.app.services.ai_intervention_storage import save_intervention

def intervention_agent(state):
    """
    Auto-create interventions for villages identified as HOTSPOT
    """

    summary = state.get("summary_json")
    if not summary:
        return state

    village_name = state["village_data"]["village_name"]

    # Only act if village is HOTSPOT
    if summary["status"] != "HOTSPOT":
        return state

    # Create alert
    save_intervention({
        "village_name": village_name,
        "intervention_type": "ALERT",
        "message": f"{village_name} identified as HOTSPOT"
    })

    # Save recommended interventions
    for recommendation in summary["recommendations"]:
        save_intervention({
            "village_name": village_name,
            "intervention_type": "RECOMMENDATION",
            "message": recommendation
        })

    return state