import { API_URL } from "@/lib/config";
export async function fetchVillageGraph() {
  const response = await fetch(
    `${API_URL}/api/village-graph`
  );

  return response.json();
}