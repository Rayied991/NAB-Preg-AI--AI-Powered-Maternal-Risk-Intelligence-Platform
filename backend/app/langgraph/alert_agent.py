def alert_agent(state):

    alerts = state["patient_context"].get(
        "alerts",
        []
    )

    state["alert_summary"] = (
        f"{len(alerts)} alerts found"
    )

    return state