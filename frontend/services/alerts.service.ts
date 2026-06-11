import { API_URL } from "@/lib/config";
export async function fetchAlerts() {

  const response = await fetch(
    `${API_URL}/api/alerts`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch alerts"
    );
  }

  return response.json();
}