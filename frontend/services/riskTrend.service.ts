export async function getRiskTrend(
  patientId: string
) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/patient-risk-trend/${patientId}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch risk trend"
    );
  }

  return response.json();
}