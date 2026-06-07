from fastapi import APIRouter
import requests
import os

router = APIRouter()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

@router.get("/village-graph")
async def get_village_graph():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    # Fetch village relationships
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/village_relationships?select=*",
        headers=headers,
    )
    relationships = response.json()

    # Fetch AI interventions
    intervention_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/ai_interventions?select=*",
        headers=headers,
    )
    interventions = intervention_response.json()

    # Fetch AI alerts
    alert_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/ai_alerts?select=*",
        headers=headers,
    )
    alerts = alert_response.json()

    nodes = []
    edges = []
    node_set = set()

    # Build nodes and edges from village relationships
    for rel in relationships:
        village = rel["village_name"]
        target = rel["relationship_value"]
        rel_type = rel["relationship_type"]

        if village not in node_set:
            nodes.append({"id": village, "label": village, "type": "village"})
            node_set.add(village)

        if target not in node_set:
            nodes.append({"id": target, "label": target, "type": rel_type.lower()})
            node_set.add(target)

        edges.append({
            "id": f"{village}-{rel_type}-{target}",
            "source": village,
            "target": target,
            "label": rel_type,
        })

    # Add nodes and edges for interventions
    for intervention in interventions:
        village = intervention["village_name"]
        target = intervention["message"]

        if target not in node_set:
            nodes.append({"id": target, "label": target, "type": "intervention"})
            node_set.add(target)

        edges.append({
            "id": f"{village}-INTERVENTION-{target}",
            "source": village,
            "target": target,
            "label": "INTERVENTION",
        })

    # Add nodes and edges for alerts
    for alert in alerts:
        village = alert["village_name"]
        alert_id = f"alert__{alert['id']}"
        target_label = f"{alert['severity']}: {alert['message']}"

        if alert_id not in node_set:          # ← inside the for loop
            nodes.append({
                "id": alert_id,
                "label": target_label,
                "type": "alert",
                "severity": alert["severity"],
            })
            node_set.add(alert_id)

        edges.append({                        # ← inside the for loop
            "id": f"{village}-ALERT-{alert_id}",
            "source": village,
            "target": alert_id,
            "label": "ALERT",
        })

    return {"nodes": nodes, "edges": edges}