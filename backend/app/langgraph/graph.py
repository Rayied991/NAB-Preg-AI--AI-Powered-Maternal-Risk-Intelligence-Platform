from langgraph.graph import StateGraph

from .state import ClinicalState

from .risk_agent import risk_agent
from .trend_agent import trend_agent
from .alert_agent import alert_agent
from .nutrition_agent import nutrition_agent
from .summary_agent import summary_agent


builder = StateGraph(
    ClinicalState
)

builder.add_node(
    "risk",
    risk_agent
)

builder.add_node(
    "trend",
    trend_agent
)

builder.add_node(
    "alerts",
    alert_agent
)

builder.add_node(
    "nutrition",
    nutrition_agent
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
    "trend"
)

builder.add_edge(
    "trend",
    "alerts"
)

builder.add_edge(
    "alerts",
    "nutrition"
)

builder.add_edge(
    "nutrition",
    "summary"
)

builder.set_finish_point(
    "summary"
)

clinical_graph = builder.compile()