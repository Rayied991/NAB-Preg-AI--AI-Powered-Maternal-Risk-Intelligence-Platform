from backend.app.langgraph.llm import llm

def forecast_agent(state):

    prompt = f"""
Risk Analysis:

{state['risk_analysis']}

Nutrition Analysis:

{state['nutrition_analysis']}

Forecast village risk for the next 14 days.

Return:
- confidence
- forecast
- escalation risk
"""

    result = llm.invoke(prompt)

    state["forecast"] = result.content

    return state