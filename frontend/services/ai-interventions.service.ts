import { API_URL } from "@/lib/config";
export async function fetchAIInterventions() {
  const response = await fetch(`${API_URL}/api/ai-interventions`);
  return response.json();
}