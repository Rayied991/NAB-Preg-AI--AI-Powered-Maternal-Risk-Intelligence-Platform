from backend.app.langgraph.llm import llm

def nutrition_agent(state):

    data = state["village_data"]

    prompt = f"""
You are a maternal nutrition expert.

Village Data:

{data}

Analyze:

- anemia burden
- nutrition deficiencies
- dietary concerns

Return concise reasoning.
"""

    result = llm.invoke(prompt)

    state["nutrition_analysis"] = result.content

    return state