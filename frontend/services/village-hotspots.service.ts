import { API_URL } from "@/lib/config";
export async function fetchVillageHotspots() {
  const response = await fetch(
    `${API_URL}/api/village-hotspots`
  );

  return response.json();
}