export async function getCopilotSummary(
  patientId: string
) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/copilot/${patientId}`
  );

  return response.json();
}
