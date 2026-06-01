export async function fetchAlerts() {

  const response = await fetch(
    "http://127.0.0.1:8000/api/alerts"
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch alerts"
    );
  }

  return response.json();
}