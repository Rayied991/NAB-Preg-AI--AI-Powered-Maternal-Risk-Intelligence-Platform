import { API_URL } from "@/lib/config";
export async function fetchPredictions() {
  const response = await fetch(
    `${API_URL}/api/predictions`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch predictions");
  }

  return response.json();
}