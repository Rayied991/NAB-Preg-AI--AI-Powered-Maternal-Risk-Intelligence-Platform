export async function fetchVillageAnalytics() {
  const response = await fetch(
    "http://127.0.0.1:8000/api/village-analytics"
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch village analytics"
    );
  }

  return response.json();
}