def nutrition_agent(state):

    prediction = state["patient_context"].get(
        "prediction",
        {}
    )

    score = prediction.get(
        "clinical_score",
        0
    )

    if score >= 6:

        recommendation = """
Increase iron-rich foods:
- Spinach
- Lentils
- Eggs
"""

    else:

        recommendation = """
Balanced maternal diet.
"""

    state[
        "nutrition_summary"
    ] = recommendation

    return state