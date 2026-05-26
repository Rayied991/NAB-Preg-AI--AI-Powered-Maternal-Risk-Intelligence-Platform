export interface Patient {
  id: number;

  name: string;

  village: string;

  trimester: number;

  risk: "High" | "Medium" | "Low";
}