export async function fetchVillageGraph() {
  const res = await fetch(
    "http://127.0.0.1:8000/api/village-graph"
  );

  return res.json();
}