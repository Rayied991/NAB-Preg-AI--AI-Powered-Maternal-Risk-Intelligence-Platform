from backend.app.langgraph.llm import llm

def summary_agent(state):

    prompt = f"""
You are a maternal health intelligence assistant.

Village Data:
{state['village_data']}

Task:
- Analyze maternal health risk.
- Determine concise status: STABLE, WATCHLIST, or HOTSPOT.
- Assign confidence score 0-100.
- Provide short forecast summary (1 line).
- List top risk drivers as an array.
- List recommended interventions as an array.

Return only JSON in this format:

{{
    "status": "...",
    "confidence": ...,
    "forecast": "...",
    "drivers": ["...", "..."],
    "recommendations": ["...", "..."]
}}
"""

    result = llm.invoke(prompt)

    state["summary"] = result.content

    return state