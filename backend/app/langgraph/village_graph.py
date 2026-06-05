from langgraph.graph import StateGraph
from backend.app.langgraph.village_state import (
    VillageState
)

from backend.app.langgraph.agents.risk_agent import (
    risk_agent
)

from backend.app.langgraph.agents.nutrition_agent import (
    nutrition_agent
)

from backend.app.langgraph.agents.forecast_agent import (
    forecast_agent
)

from backend.app.langgraph.agents.summary_agent import (
    summary_agent
)

builder = StateGraph(
    VillageState
)

builder.add_node(
    "risk",
    risk_agent
)

builder.add_node(
    "nutrition",
    nutrition_agent
)

builder.add_node(
    "forecast",
    forecast_agent
)

builder.add_node(
    "summary",
    summary_agent
)

builder.set_entry_point(
    "risk"
)

builder.add_edge(
    "risk",
    "nutrition"
)

builder.add_edge(
    "nutrition",
    "forecast"
)

builder.add_edge(
    "forecast",
    "summary"
)

graph = builder.compile()