import { API_URL } from "@/lib/config";

export async function getRiskTrend(
  patientId: string
) {
  const response = await fetch(
    `${API_URL}/api/patient-risk-trend/${patientId}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch risk trend"
    );
  }

  return response.json();
}