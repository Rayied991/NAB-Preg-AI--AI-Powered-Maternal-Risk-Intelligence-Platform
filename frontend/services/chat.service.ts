export async function getChatHistory() {
  const response = await fetch(
    "http://127.0.0.1:8000/api/chat-history"
  );

  if (!response.ok) {
    throw new Error("Failed to load chat history");
  }

  return response.json();
}