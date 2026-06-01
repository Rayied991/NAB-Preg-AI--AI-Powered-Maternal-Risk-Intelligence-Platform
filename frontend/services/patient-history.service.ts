export async function fetchPatientHistory(
  patientId: string
) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/patient-history/${patientId}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch patient history"
    );
  }

  return response.json();
}