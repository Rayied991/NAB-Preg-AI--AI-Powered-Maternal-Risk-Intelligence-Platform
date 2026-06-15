import { API_URL } from "@/lib/config";

export async function askAssistant(
  question: string
) {
  const response = await fetch(
    `${API_URL}/api/ask`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to get AI response"
    );
  }

  return response.json();
}