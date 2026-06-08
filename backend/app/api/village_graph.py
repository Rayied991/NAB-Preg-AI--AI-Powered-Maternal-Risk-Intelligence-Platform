from fastapi import APIRouter
import os
import requests

router = APIRouter()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

@router.get("/village-graph")
def get_village_graph():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    # 1. Fetch Relationships
    rel_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/village_relationships?select=*",
        headers=headers,
    )
    relationships = rel_response.json() if rel_response.ok else []

    # 2. Fetch Interventions
    int_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/ai_interventions?select=*",
        headers=headers,
    )
    interventions = int_response.json() if int_response.ok else []

    # 3. Fetch Alerts
    alert_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/ai_alerts?select=*",
        headers=headers,
    )
    alerts = alert_response.json() if alert_response.ok else []

    nodes = []
    edges = []
    node_set = set()

    # ── Process Relationships (FIXED) ──
    for rel in relationships:
        village = rel["village_name"]
        rel_type = rel.get("relationship_type", "UNKNOWN")
        
        # FIX 1: Use the correct column name from Supabase
        target = rel.get("relationship_value", "Unknown")

        if village not in node_set:
            nodes.append({"id": village, "label": village, "type": "village"})
            node_set.add(village)

        # FIX 2: Use 'target' directly as the node ID for a cleaner graph
        if target not in node_set:
            nodes.append({
                "id": target,
                "label": target,
                "type": rel_type.lower()
            })
            node_set.add(target)

        edges.append({
            "id": f"{village}-{rel_type}-{target}",
            "source": village,
            "target": target,
            "label": rel_type
        })

    # ── Process Interventions ──
    for intervention in interventions:
        village = intervention["village_name"]
        target = intervention["message"]

        # Ensure village node exists
        if village not in node_set:
            nodes.append({
                "id": village,
                "label": village,
                "type": "village"
            })
            node_set.add(village)

        if target not in node_set:
            nodes.append({
                "id": target,
                "label": target,
                "type": "intervention"
            })
            node_set.add(target)

        edges.append({
            "id": f"{village}-INTERVENTION-{target}",
            "source": village,
            "target": target,
            "label": "INTERVENTION",
        })

    # ── Process Alerts ──
    for alert in alerts:
        village = alert["village_name"]
        alert_id = alert.get("id") or alert.get("alert_id") or f"alert__{village}_{hash(alert.get('message', ''))}"
        message = alert.get("message", "Unknown Alert")
        severity = alert.get("severity", "MEDIUM")

        # Ensure village node exists
        if village not in node_set:
            nodes.append({
                "id": village,
                "label": village,
                "type": "village"
            })
            node_set.add(village)

        if alert_id not in node_set:
            nodes.append({
                "id": alert_id,
                "label": message,
                "type": "alert",
                "severity": severity
            })
            node_set.add(alert_id)

        edges.append({
            "id": f"{village}-ALERT-{alert_id}",
            "source": village,
            "target": alert_id,
            "label": "ALERT",
        })

    # ── Debug Logging ──
    print("\n📊 VILLAGE NODES IN GRAPH:")
    village_count = 0
    for n in nodes:
        if n.get("type") == "village":
            print(f"  ✅ {n['label']}")
            village_count += 1
    print(f"Total village nodes: {village_count}\n")

    return {"nodes": nodes, "edges": edges}