export async function getPatientTrends(patientId: string) {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/patient-trends/${patientId}`
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