export async function fetchPatients() {

  const response = await fetch(
    "http://127.0.0.1:8000/api/patients"
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch patients"
    );
  }

  return response.json();
}