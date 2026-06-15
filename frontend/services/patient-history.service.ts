import { API_URL } from "@/lib/config";

export async function fetchPatientHistory(
  patientId: string
) {
  const response = await fetch(
    `${API_URL}/api/patient-history/${patientId}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch patient history"
    );
  }

  return response.json();
}