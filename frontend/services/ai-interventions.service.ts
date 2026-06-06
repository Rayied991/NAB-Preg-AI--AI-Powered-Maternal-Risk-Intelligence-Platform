export async function fetchAIInterventions() {
  const response = await fetch("http://localhost:8000/api/ai-interventions");
  return response.json();
}