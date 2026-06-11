import { API_URL } from "@/lib/config";
export async function getChatHistory() {
  const response = await fetch(
    `${API_URL}/api/chat-history`
  );

  if (!response.ok) {
    throw new Error("Failed to load chat history");
  }

  return response.json();
}