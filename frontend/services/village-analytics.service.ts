import { API_URL } from "@/lib/config";

export async function fetchVillageAnalytics() {
  const response = await fetch(
    `${API_URL}/api/village-analytics`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch village analytics"
    );
  }

  return response.json();
}