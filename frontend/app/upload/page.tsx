"use client";

/**
 * UploadPage Component
 * 
 * Group Project Documentation:
 * Refactored static dark theme styles (`bg-zinc-900`, `bg-zinc-950`, etc.) to semantic theme properties:
 * 1. Swapped panels (Upload Box, OCR Data, AI Prediction) from zinc-900 to `bg-card border-border-custom shadow-premium`.
 * 2. Upload dashed border changed from zinc-700 to theme-aware `border-border-dashed`.
 * 3. Individual grid info boxes changed from zinc-950 to `bg-panel border border-border-custom` for high contrast in light mode.
 * 4. High risk label badge and predicted percentages changed to use light/dark variants:
 *    - Badge: `text-red-700 bg-red-50 dark:bg-red-500/20 dark:text-red-400`
 *    - Percentage text: `text-red-600 dark:text-red-400`
 * 5. General text colors mapped to `text-text-primary`, `text-text-secondary`, and `text-text-muted`.
 */

import DashboardLayout from "@/components/layout/DashboardLayout";
import { predictRisk } from "@/services/prediction.service";
import { handleFileUpload } from "@/services/upload.service";
import { OCRExtractedData } from "@/services/ocr.service";
import { useState, useRef } from "react";

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sampleData = {
    age: 29,
    hemoglobin: 8.2,
    systolic_bp: 150,
    diastolic_bp: 95,
    blood_sugar: 132,
    heart_rate: 110,
    weight: 65,
    height_cm: 160,
    meals_per_day: 2,
    veg_freq: 1,
  };

  type PredictionResponse = {
    patient_status: {
      overall_risk: string;
      anemia_risk: string;
      hypertension_risk: string;
      confidence_score: number;
    };
    clinical_findings: string[];
    ai_recommendations: string[];
    ai_summary: string;
  };

  const [ocrData, setOcrData] = useState<OCRExtractedData | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);

  /**
   * Handle file selection and perform OCR
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setError("");
    
    try {
      const result = await handleFileUpload(file);
      setOcrData(result.ocrData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process file";
      setError(errorMessage);
      setOcrData(null);
      console.error("File upload error:", err);
    } finally {
      setOcrLoading(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  return (
    <DashboardLayout>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary transition-colors duration-300">
          Upload Medical Report
        </h1>

        <p className="text-text-muted mt-1 transition-colors duration-300">
          OCR-powered maternal report analysis
        </p>
      </div>

      {/* Upload Box */}
      <div className="
        bg-card
        border border-border-custom
        rounded-2xl
        p-10
        shadow-premium
        transition-all
        duration-300
      ">

        <div className="
          border-2 border-dashed border-border-dashed
          rounded-2xl
          p-16
          text-center
          transition-all
          duration-300
        ">

          <p className="text-text-secondary text-lg font-medium transition-colors duration-300">
            Drag & Drop Report Here
          </p>

          <p className="text-text-muted mt-2 transition-colors duration-300">
            JPG, PNG, PDF supported
          </p>

          <input
            ref={fileInputRef}
            type="file"
            id="reportUpload"
            className="hidden"
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            disabled={ocrLoading}
          />

          <label
            htmlFor="reportUpload"
            className="
              mt-6 inline-block
              bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
              text-white
              px-6 py-3 rounded-xl
              transition-all cursor-pointer shadow-sm active:scale-95
              disabled:cursor-not-allowed
            "
          >
            {ocrLoading ? "Processing..." : "Choose Report"}
          </label>

        </div>
      </div>

      {/* OCR Extracted Data */}
      <div className="
        mt-10
        bg-card
        border border-border-custom
        rounded-2xl
        p-6
        shadow-premium
        transition-all
        duration-300
      ">

        <h2 className="text-xl font-semibold text-text-primary mb-4 transition-colors duration-300">
          OCR Extracted Data
        </h2>

        {ocrLoading && (
          <div className="text-center py-8">
            <p className="text-text-secondary animate-pulse">Processing file with OCR...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 mb-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {ocrData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-panel border border-border-custom rounded-xl p-4 transition-all duration-300">
              <p className="text-text-muted text-sm transition-colors duration-300">
                Hemoglobin
              </p>
              <p className="text-2xl font-bold text-text-primary mt-2 transition-colors duration-300">
                {ocrData.hemoglobin || "—"}
              </p>
            </div>

            <div className="bg-panel border border-border-custom rounded-xl p-4 transition-all duration-300">
              <p className="text-text-muted text-sm transition-colors duration-300">
                Blood Pressure
              </p>
              <p className="text-2xl font-bold text-text-primary mt-2 transition-colors duration-300">
                {ocrData.blood_pressure || "—"}
              </p>
            </div>

            <div className="bg-panel border border-border-custom rounded-xl p-4 transition-all duration-300">
              <p className="text-text-muted text-sm transition-colors duration-300">
                Blood Sugar
              </p>
              <p className="text-2xl font-bold text-text-primary mt-2 transition-colors duration-300">
                {ocrData.blood_sugar || "—"}
              </p>
            </div>

            <div className="bg-panel border border-border-custom rounded-xl p-4 transition-all duration-300">
              <p className="text-text-muted text-sm transition-colors duration-300">
                Heart Rate
              </p>
              <p className="text-2xl font-bold text-text-primary mt-2 transition-colors duration-300">
                {ocrData.heart_rate || "—"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-muted italic">Upload a medical report to see extracted data here.</p>
          </div>
        )}
      </div>

      {/* AI Prediction */}
      <div className="
        mt-10
        bg-card
        border border-border-custom
        rounded-2xl
        p-6
        shadow-premium
        transition-all
        duration-300
      ">
        {/* header row */}
    {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary transition-colors duration-300">
              AI Prediction Result
            </h2>
            <p className="text-text-muted mt-1 transition-colors duration-300">
              Maternal risk intelligence analysis
            </p>
          </div>

          <span
            className={`
              px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300
              ${
                prediction?.patient_status?.overall_risk === "HIGH"
                  ? "bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                  : prediction?.patient_status?.overall_risk === "MEDIUM"
                  ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
                  : "bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400"
              }
            `}
          >
            {prediction?.patient_status?.overall_risk ?? "NO DATA"}
          </span>
        </div>

      
             
         <div className="mt-6 space-y-4">

          {/* CARD 1 — Confidence Score */}
          <div className="bg-panel border border-border-custom rounded-xl p-4">
            <p className="text-text-muted text-sm">Confidence Score</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
              {prediction?.patient_status?.confidence_score != null
                ? `${prediction.patient_status.confidence_score}%`
                : "—"}
            </p>
          </div>

          {/* CARD 2 — AI Recommendations */}
          <div className="bg-panel border border-border-custom rounded-xl p-4">
            <p className="text-text-muted text-sm">AI Recommendations</p>
            <div className="text-text-secondary mt-2 space-y-2">
              {prediction?.ai_recommendations?.length ? (
                prediction.ai_recommendations.map((item, index) => (
                  <p key={index}>• {item}</p>
                ))
              ) : (
                <p className="text-text-muted italic">No recommendations yet.</p>
              )}
            </div>
          </div>

          {/* CARD 3 — AI Summary */}
          <div className="bg-panel border border-border-custom rounded-xl p-4">
            <p className="text-text-muted text-sm">AI Summary</p>
            <p className="text-text-secondary mt-2 leading-7">
              {prediction?.ai_summary ?? (
                <span className="text-text-muted italic">No summary yet.</span>
              )}
            </p>
          </div>

          {/* CARD 4 — Clinical Findings */}
          <div className="bg-panel border border-border-custom rounded-xl p-4">
            <p className="text-text-muted text-sm">Clinical Findings</p>
            <div className="text-text-secondary mt-2 space-y-2">
              {prediction?.clinical_findings?.length ? (
                prediction.clinical_findings.map((item, index) => (
                  <p key={index}>• {item}</p>
                ))
              ) : (
                <p className="text-text-muted italic">No findings yet.</p>
              )}
            </div>
          </div>
             

 
          {/* Button  */}
              <button
              onClick={async () => {
                try {
                  setLoading(true);
                  setError("");

                  const result = await predictRisk(sampleData);

                  setPrediction(result);

                } catch (error) {
                  console.error(error);

                  setError("Prediction failed.");
                } finally {
                  setLoading(false);
                }
              }}
              className="
                mt-6
                bg-blue-600 hover:bg-blue-700
                px-6 py-3 rounded-xl
                transition-all
                text-white font-medium
              "
            >
              {loading ? "Analyzing..." : "Test AI Prediction"}
            </button>
            {error && (
            <p className="text-red-400 mt-4">
              {error}
            </p>
          )}
                  </div>
      
           </div>
    </DashboardLayout>
  );
}