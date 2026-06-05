from backend.app.langgraph.llm import llm

def risk_agent(state):

    data = state["village_data"]

    prompt = f"""
You are a maternal health risk analyst.

Village Data:

{data}

Analyze:

1. Current maternal risk level
2. Main risk drivers
3. Whether village is:
   - STABLE
   - WATCHLIST
   - HOTSPOT

Return concise reasoning.
"""

    result = llm.invoke(prompt)

    state["risk_analysis"] = result.content

    return state