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

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/village_relationships?select=*",
        headers=headers,
    )

    relationships = response.json()

    nodes = []
    edges = []
    node_set = set()

    for rel in relationships:

        village = rel["village_name"]
        target = rel["relationship_value"]
        rel_type = rel["relationship_type"]

        if village not in node_set:
            nodes.append({
                "id": village,
                "label": village
            })
            node_set.add(village)

        if target not in node_set:
            nodes.append({
                "id": target,
                "label": target
            })
            node_set.add(target)

        edges.append({
            "source": village,
            "target": target,
            "label": rel_type
        })

    return {
        "nodes": nodes,
        "edges": edges
    }