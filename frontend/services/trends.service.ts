import { API_URL } from "@/lib/config";

export async function getPatientTrends(patientId: string) {
  try {
    const response = await fetch(
      `${API_URL}/api/patient-trends/${patientId}`
    );

    if (!response.ok) {
      return {
        hemoglobin: [],
        blood_sugar: [],
        heart_rate: [],
        error: true,
      };
    }

    return await response.json();
  } catch (error) {
    console.error(error);

    return {
      hemoglobin: [],
      blood_sugar: [],
      heart_rate: [],
      error: true,
    };
  }
}