export async function resolveAlert(
  alertId: string
) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/alerts/${alertId}/resolve`,
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