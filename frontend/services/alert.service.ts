import { API_URL } from "@/lib/config";
export async function resolveAlert(
  alertId: string
) {
  const response = await fetch(
    `${API_URL}/api/alerts/${alertId}/resolve`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to resolve alert"
    );
  }

  return response.json();
}