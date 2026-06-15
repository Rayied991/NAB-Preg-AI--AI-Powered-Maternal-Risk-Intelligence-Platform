import { API_URL } from "@/lib/config";
export async function saveOCRReport(
    patientId: string,
  extractedText: string,
  parsedJson: unknown
) {

  const response = await fetch(
    `${API_URL}/api/ocr-report`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patient_id: patientId,
        extracted_text: extractedText,
        parsed_json: parsedJson,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to save OCR report");
  }

  return response.json();
}