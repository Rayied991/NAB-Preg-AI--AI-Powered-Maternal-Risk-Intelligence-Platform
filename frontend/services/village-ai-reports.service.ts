export async function fetchVillageAIReports() {
  const response = await fetch(
    "http://127.0.0.1:8000/api/village-ai-reports"
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch village AI reports"
    );
  }

  return response.json();
}