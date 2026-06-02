export async function fetchHeatmap() {

  const response = await fetch(
    "http://127.0.0.1:8000/api/heatmap"
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch heatmap data"
    );
  }

  return response.json();
}