import { API_URL } from "@/lib/config";

export async function fetchVillageAIReports() {
  const response = await fetch(
    `${API_URL}/api/village-ai-reports`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch village AI reports"
    );
  }

  return response.json();
}