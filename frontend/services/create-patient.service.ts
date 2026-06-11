import { API_URL } from "@/lib/config";
export async function createPatient(
  patient: {
  patient_code: string;
  full_name: string;
  age: number;
  trimester: number;
  pregnancy_week: number;
  village: string;
  blood_group: string;
  contact_number: string;
  emergency_contact: string;
  height_cm: number;
}
) {
  const response = await fetch(
    `${API_URL}/api/patients`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patient),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to create patient"
    );
  }

  return response.json();
}