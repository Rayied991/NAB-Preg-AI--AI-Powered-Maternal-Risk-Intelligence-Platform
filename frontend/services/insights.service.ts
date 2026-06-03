export async function fetchInsights() {

  const response = await fetch(
    "http://127.0.0.1:8000/api/insights"
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch insights"
    );
  }

  return response.json();
}