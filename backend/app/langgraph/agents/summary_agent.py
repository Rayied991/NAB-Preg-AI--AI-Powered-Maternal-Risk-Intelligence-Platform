from backend.app.langgraph.llm import llm

def summary_agent(state):

    prompt = f"""
Create a final village intelligence report.

Risk:
{state['risk_analysis']}

Nutrition:
{state['nutrition_analysis']}

Forecast:
{state['forecast']}

Return ONLY valid JSON:

{{
  "status":"",
  "confidence":0,
  "forecast":"",
  "drivers":"",
  "recommendation":""
}}
"""

    result = llm.invoke(prompt)

    state["summary"] = result.content

    return state