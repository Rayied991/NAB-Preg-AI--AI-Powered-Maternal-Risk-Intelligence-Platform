export async function fetchPredictions() {
  const response = await fetch(
    "http://127.0.0.1:8000/api/predictions"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch predictions");
  }

  return response.json();
}