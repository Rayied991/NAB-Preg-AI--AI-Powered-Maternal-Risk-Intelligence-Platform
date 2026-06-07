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
    relationships = response.json() if response.ok else []

    # Fetch AI interventions
    intervention_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/ai_interventions?select=*",
        headers=headers,
    )
    interventions = intervention_response.json() if intervention_response.ok else []

    nodes = []
    edges = []
    node_set = set()

    # Build nodes and edges from relationships
    for rel in relationships:
        village = rel["village_name"]
        target = rel["relationship_value"]
        rel_type = rel["relationship_type"]

        # Village node
        if village not in node_set:
            nodes.append({
                "id": village,
                "label": village,
                "type": "village"
            })
            node_set.add(village)

        # Relationship node
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

    # Build nodes and edges for interventions
    for intervention in interventions:
        village = intervention.get("village_name")
        message = intervention.get("message")

        if not village or not message:
            continue

        # Intervention node
        if message not in node_set:
            nodes.append({
                "id": message,
                "label": message,
                "type": "intervention"
            })
            node_set.add(message)

        edges.append({
            "id": f"{village}-INTERVENTION-{message}",
            "source": village,
            "target": message,
            "label": "INTERVENTION"
        })

    return {
        "nodes": nodes,
        "edges": edges
    }