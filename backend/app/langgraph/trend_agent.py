def trend_agent(state):

    prediction = state["patient_context"].get(
        "prediction",
        {}
    )

    state["trend_summary"] = (
        f"Current clinical score: "
        f"{prediction.get('clinical_score')}"
    )

    return state
