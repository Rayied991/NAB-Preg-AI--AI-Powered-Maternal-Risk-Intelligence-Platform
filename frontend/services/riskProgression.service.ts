export async function fetchRiskProgression(
  patientId: string
) {
  const res = await fetch(
    `http://localhost:8000/api/risk-progression/${patientId}`
  );

  return res.json();
}