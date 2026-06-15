import { API_URL } from "@/lib/config";
export async function fetchRiskProgression(
  patientId: string
) {
  const res = await fetch(
    `${API_URL}/api/risk-progression/${patientId}`
  );

  return res.json();
}