import { API_URL } from "@/lib/config";
export async function fetchHeatmap() {

  const response = await fetch(
    `${API_URL}/api/heatmap`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch heatmap data"
    );
  }

  return response.json();
}