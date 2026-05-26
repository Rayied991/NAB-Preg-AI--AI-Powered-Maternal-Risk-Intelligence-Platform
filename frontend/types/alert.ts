export interface Alert {
  id: number;

  patient: string;

  message: string;

  severity: "High" | "Medium";
}