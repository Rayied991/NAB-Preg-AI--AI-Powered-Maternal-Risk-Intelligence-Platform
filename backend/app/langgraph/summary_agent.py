def summary_agent(state):

    state["final_answer"] = f"""
# Clinical Review

{state['risk_summary']}

{state['trend_summary']}

{state['alert_summary']}

Nutrition:

{state['nutrition_summary']}
"""

    return state