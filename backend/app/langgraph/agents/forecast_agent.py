from datetime import datetime
from random import randint

def forecast_agent(state):
    """
    Predict future risk status for the village.
    """
    summary = state.get("summary_json")
    if not summary:
        # If summary not present, skip forecast
        return state

    current_status = summary.get("status", "STABLE")

    # Simple predictive trend (demo)
    future_status = current_status
    confidence = randint(70, 95)  # Mock confidence
    forecast_days = 7  # Default 1-week forecast

    if current_status == "WATCHLIST":
        future_status = "HOTSPOT" if randint(0, 100) > 60 else "WATCHLIST"
    elif current_status == "STABLE":
        future_status = "WATCHLIST" if randint(0, 100) > 70 else "STABLE"
    elif current_status == "HOTSPOT":
        future_status = "HOTSPOT"

    state["forecast"] = {
        "current_status": current_status,
        "forecast_status": future_status,
        "forecast_days": forecast_days,
        "confidence": confidence,
        "generated_at": datetime.utcnow().isoformat() + "Z"
    }

    return state