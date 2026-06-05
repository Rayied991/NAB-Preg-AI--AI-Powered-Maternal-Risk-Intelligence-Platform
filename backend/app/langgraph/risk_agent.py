def risk_agent(state):

    prediction = state["patient_context"].get(
        "prediction",
        {}
    )

    state["risk_summary"] = f"""
Overall Risk:
{prediction.get('overall_risk')}

Clinical Score:
{prediction.get('clinical_score')}
"""

    return state