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

export async function updatePatient(patientId: string, data: any) {
  const response = await fetch(`http://127.0.0.1:8000/api/patients/${patientId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update patient");
  }

  return response.json();
}