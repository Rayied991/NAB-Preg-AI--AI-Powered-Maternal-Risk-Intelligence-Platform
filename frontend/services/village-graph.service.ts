export async function fetchVillageGraph() {
  const response = await fetch(
    "http://localhost:8000/api/village-graph"
  );

  return response.json();
}