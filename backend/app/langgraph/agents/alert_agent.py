from backend.app.services.alert_storage import (
    save_alert
)

def alert_agent(state):
    
    print("ALERT AGENT RUNNING")

    village_name = state["village_data"]["village_name"]

    summary = state["summary_json"]

    forecast = state["forecast"]

    # Current hotspot

    if summary["status"] == "HOTSPOT":

        save_alert({
            "village_name": village_name,
            "severity": "CRITICAL",
            "message":
                f"{village_name} is currently a HOTSPOT"
        })

    # Forecast hotspot

    if forecast["forecast_status"] == "HOTSPOT":

        save_alert({
            "village_name": village_name,
            "severity": "HIGH",
            "message":
                f"{village_name} predicted HOTSPOT in {forecast['forecast_days']} days"
        })

    # Forecast watchlist

    if (
        forecast["forecast_status"] == "WATCHLIST"
        and
        forecast["confidence"] >= 80
    ):

        save_alert({
            "village_name": village_name,
            "severity": "MEDIUM",
            "message":
                f"{village_name} showing escalation risk"
        })
        print(
    "Forecast:",
    forecast["forecast_status"],
    forecast["confidence"]
)
    print(
        "Creating MEDIUM alert for",
        village_name
    )
    return state