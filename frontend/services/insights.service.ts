import { API_URL } from "@/lib/config";
export async function fetchInsights() {

  const response = await fetch(
    `${API_URL}/api/insights`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch insights"
    );
  }

  return response.json();
}