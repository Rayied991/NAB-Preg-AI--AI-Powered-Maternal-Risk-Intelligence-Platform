import { API_URL } from "@/lib/config";
export async function fetchVillageRelationships() {
  const response = await fetch(
    `${API_URL}/api/village-relationships`
  );

  return response.json();
}