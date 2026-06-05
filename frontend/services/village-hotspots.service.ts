export async function fetchVillageHotspots() {

  const response = await fetch(
    "http://127.0.0.1:8000/api/village-hotspots"
  );

  return response.json();
}