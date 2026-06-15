import { API_URL } from "@/lib/config";
const API_BASE_URL = `${API_URL}/api`;

interface PredictionRequest {
  age: number;
  hemoglobin: number;
  systolic_bp: number;
  diastolic_bp: number;
  blood_sugar: number;
  heart_rate: number;
  weight: number;
  height_cm: number;
  meals_per_day: number;
  veg_freq: number;
}

export async function predictRisk(
  data: PredictionRequest
) {
  const response = await fetch(
    `${API_BASE_URL}/predict`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Prediction failed");
  }

  return response.json();
}