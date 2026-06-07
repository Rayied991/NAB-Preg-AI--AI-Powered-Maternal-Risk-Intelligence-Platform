import datetime
from backend.app.services.village_alert_storage import (
    save_alert,
    alert_exists,
)

def alert_agent(state):
    print("ALERT AGENT RUNNING")

    village_name = state["village_data"]["village_name"]
    summary = state["summary_json"]
    forecast = state["forecast"]
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"

    # Current hotspot
    if summary["status"] == "HOTSPOT":
        msg = f"{village_name} is currently a HOTSPOT"
        if not alert_exists(village_name, "CRITICAL", msg):
            save_alert({
                "village_name": village_name,
                "severity": "CRITICAL",
                "message": msg,
                "created_at": timestamp,
            })

    # Forecast hotspot
    if forecast["forecast_status"] == "HOTSPOT":
        msg = f"{village_name} predicted HOTSPOT in {forecast['forecast_days']} days"
        if not alert_exists(village_name, "HIGH", msg):
            save_alert({
                "village_name": village_name,
                "severity": "HIGH",
                "message": msg,
                "created_at": timestamp,
            })

    # Forecast watchlist
    if (
        forecast["forecast_status"] == "WATCHLIST"
        and forecast["confidence"] >= 80
    ):
        msg = f"{village_name} showing escalation risk"
        if not alert_exists(village_name, "MEDIUM", msg):
            save_alert({
                "village_name": village_name,
                "severity": "MEDIUM",
                "message": msg,
                "created_at": timestamp,
            })
        print("Forecast:", forecast["forecast_status"], forecast["confidence"])
        print("Creating MEDIUM alert for", village_name)

    return state