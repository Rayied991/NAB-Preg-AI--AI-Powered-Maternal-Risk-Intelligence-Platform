import { API_URL } from "@/lib/config";
export async function getCopilotSummary(
  patientId: string
) {
  const response = await fetch(
    `${API_URL}/api/copilot/${patientId}`
  );

  return response.json();
}
