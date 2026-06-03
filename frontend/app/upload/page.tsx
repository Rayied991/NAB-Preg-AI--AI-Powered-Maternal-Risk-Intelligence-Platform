/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * UploadPage Component — Merge resolved
 * Imports + state: cleaned up (no duplicate OCRExtractedData, no unused sampleData/loading)
 * Logic: kept test-rayied (OCR → payload → predict in one flow)
 * UI: kept test-rayied entirely (redesigned dark UI with clinical score, explainability, progress bar)
 * Header: hybrid (eyebrow from test-rayied, text-text-primary/muted from HEAD for theme-awareness)
 */

import DashboardLayout from "@/components/layout/DashboardLayout";
import { saveOCRReport } from "@/services/ocr-report.service";
import { OCRExtractedData } from "@/services/ocr.service";
import { fetchPatients } from "@/services/patient.service";
import { predictRisk } from "@/services/prediction.service";
import { handleFileUpload } from "@/services/upload.service";
import { useEffect, useRef, useState } from "react";
type PredictionResponse = {
  patient_status: {
    overall_risk: string;
    anemia_risk: string;
    hypertension_risk: string;
    confidence_score: number;
    clinical_score: number;
  };
  clinical_findings: string[];
  ai_recommendations: string[];
  ai_summary: string;
};

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ocrData, setOcrData] = useState<OCRExtractedData | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [error, setError] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
const [selectedPatient, setSelectedPatient] =
  useState("");

  useEffect(() => {

  const loadPatients = async () => {
    try {

      const data =
        await fetchPatients();

      setPatients(data);

    } catch (error) {
      console.error(error);
    }
  };

  loadPatients();

}, []);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Patient Validation
    if (!selectedPatient) {
    setError("Please select a patient first.");
    return;
  }


    setOcrLoading(true);
    setError("");

    try {
      const result = await handleFileUpload(file);
      await saveOCRReport(
        selectedPatient,
      result.ocrData.raw_text,
      result.ocrData
    );
      setOcrData(result.ocrData);

     const payload = {
        patient_id: selectedPatient,
        // TODO: Extract age from OCR or collect manually
        age: 25,
        hemoglobin:
          Number(result.ocrData.hemoglobin?.replace(" g/dL", "")) || 12,
        systolic_bp:
          Number(result.ocrData.blood_pressure?.split("/")[0]) || 120,
        diastolic_bp:
          Number(result.ocrData.blood_pressure?.split("/")[1]) || 80,
        blood_sugar:
          Number(result.ocrData.blood_sugar?.replace(" mg/dL", "")) || 110,
        heart_rate:
          Number(result.ocrData.heart_rate?.replace(" bpm", "")) || 80,
        weight: 65,
        height_cm: 160,
        meals_per_day: 3,
        veg_freq: 2,
      };

      console.log("OCR DATA:", result.ocrData);
      console.log("PREDICTION PAYLOAD:", payload);

      setPredictionLoading(true);
      try {
        const predictionResult = await predictRisk(payload);
        setPrediction(predictionResult);
      } finally {
        setPredictionLoading(false);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process file";
      setError(errorMessage);
      setOcrData(null);
      console.error("File upload error:", err);
    } finally {
      setOcrLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const riskBadgeClass = (risk: string | undefined) => {
    if (risk === "HIGH")
      return "bg-[#2a0e0e] text-[#f06060] border border-[#5a1a1a]";
    if (risk === "MEDIUM")
      return "bg-[#2a1e06] text-[#e0a040] border border-[#5a3a10]";
    if (risk === "LOW")
      return "bg-[#0a2010] text-[#40c070] border border-[#1a5030]";
    return "bg-[#1a1e2a] text-[#3a5070] border border-[#1e2a40]";
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">

      {/* ── Page Header ── */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-1">
          Maternal Health AI
        </p>
        <h1 className="text-3xl font-bold text-text-primary transition-colors duration-300">
          Upload Medical Report
        </h1>
        <p className="text-text-muted mt-1 transition-colors duration-300">
          OCR-powered maternal report analysis
        </p>
      </div>

      <div className="mb-6">

  <label className="block mb-2 font-medium">
    Select Patient
  </label>

  <select
    value={selectedPatient}
    onChange={(e) =>
      setSelectedPatient(
        e.target.value
      )
    }
    className="w-full p-3 rounded-lg border"
  >

    <option value="">
      Choose Patient
    </option>

    {patients.map((patient) => (

      <option
        key={patient.id}
        value={patient.id}
      >
        {patient.full_name}
        {" ("}
        {patient.patient_code}
        {")"}
      </option>

    ))}

  </select>

</div>
      {/* ── Upload Section ── */}
      <div className="bg-[#131720] border border-[#1e2535] rounded-2xl p-6">

        <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><polyline points="7 9 12 4 17 9"/><line x1="12" y1="4" x2="12" y2="16"/></svg>
          Report Upload
        </p>

        {/* Drop zone */}
        <div className="relative overflow-hidden border-2 border-dashed border-[#1e3a5a] rounded-2xl p-12 text-center bg-linear-to-b from-[#0f1820] to-[#0d1118]">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(30,80,130,0.12) 0%, transparent 70%)" }}
          />

          <div className="relative w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0f1f32] border border-[#1e3a5a] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3a7fc1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          </div>

          <p className="text-[15px] font-semibold text-[#c8d0e0] mb-1 relative">
            Drag &amp; Drop Report Here
          </p>
          <p className="text-[12px] text-[#3d4a5e] mb-5 relative">
            or click below to browse your files
          </p>

          <div className="flex gap-2 justify-center mb-6 relative">
            {["JPG", "PNG", "PDF"].map((fmt) => (
              <span
                key={fmt}
                className="text-[10px] font-mono font-semibold px-3 py-1 rounded-full bg-[#0f1f32] border border-[#1e3350] text-[#4a6fa0] tracking-wider"
              >
                {fmt}
              </span>
            ))}
          </div>

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
            className={`relative inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold tracking-wide transition-all cursor-pointer
              ${ocrLoading
                ? "bg-[#0f1f32] text-[#2a4a6a] cursor-not-allowed"
                : "bg-[#1a4fa8] hover:bg-[#2060c8] active:scale-95 text-[#d8e8ff]"
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            {ocrLoading ? "Processing..." : "Choose Report"}
          </label>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mt-4 bg-[#2a0e0e] border border-[#5a1a1a] rounded-xl p-4">
          <p className="text-[#f06060] text-[13px]">{error}</p>
        </div>
      )}

      {/* ── OCR Extracted Data ── */}
      <div className="mt-5 bg-[#131720] border border-[#1e2535] rounded-2xl p-6">

        <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01"/></svg>
          OCR Extracted Data
        </p>

        {ocrLoading && (
          <div className="text-center py-10">
            <p className="text-[13px] text-[#3d4e68] animate-pulse">
              Processing file with OCR...
            </p>
          </div>
        )}

        {!ocrLoading && !ocrData && (
          <div className="text-center py-10">
            <p className="text-[13px] text-[#2a3548] italic">
              Upload a medical report to see extracted data here.
            </p>
          </div>
        )}

        {ocrData && (
          <div className="grid grid-cols-2 gap-3">

            <div className="bg-[#0d1118] border border-[#1a2235] rounded-xl p-4">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#2a5a8a] mb-2 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
                Hemoglobin
              </p>
              <p className="text-[22px] font-semibold text-[#c8d8ee] font-mono tracking-tight">
                {ocrData.hemoglobin || "—"}
              </p>
            </div>

            <div className="bg-[#0d1118] border border-[#1a2235] rounded-xl p-4">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#2a5a8a] mb-2 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Blood Pressure
              </p>
              <p className="text-[22px] font-semibold text-[#c8d8ee] font-mono tracking-tight">
                {ocrData.blood_pressure || "—"}
              </p>
            </div>

            <div className="bg-[#0d1118] border border-[#1a2235] rounded-xl p-4">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#2a5a8a] mb-2 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg>
                Blood Sugar
              </p>
              <p className="text-[22px] font-semibold text-[#c8d8ee] font-mono tracking-tight">
                {ocrData.blood_sugar || "—"}
              </p>
            </div>

            <div className="bg-[#0d1118] border border-[#1a2235] rounded-xl p-4">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#2a5a8a] mb-2 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Heart Rate
              </p>
              <p className="text-[22px] font-semibold text-[#c8d8ee] font-mono tracking-tight">
                {ocrData.heart_rate || "—"}
              </p>
            </div>

          </div>
        )}
      </div>

      {/* ── AI Prediction Result ── */}
      <div className="mt-5 mb-8 bg-[#131720] border border-[#1e2535] rounded-2xl p-6">

        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[16px] font-semibold text-[#dce4f0]">
              AI Prediction Result
            </p>
            <p className="text-[12px] text-[#3d4e68] mt-0.5">
              Maternal risk intelligence analysis
            </p>
          </div>

          <span
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase ${riskBadgeClass(
              prediction?.patient_status?.overall_risk
            )}`}
          >
            {predictionLoading
              ? "Analyzing..."
              : prediction?.patient_status?.overall_risk ?? "NO DATA"}
          </span>
        </div>

        <div className="flex flex-col gap-3">

          {/* Card 1 — Confidence Score */}
          <div className="bg-[#0d1118] border border-[#1a2235] rounded-xl p-4">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#2a5a8a] mb-2 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Model Confidence
            </p>
            <p className="text-[22px] font-semibold font-mono tracking-tight text-[#3a6a9a]">
              {prediction?.patient_status?.confidence_score != null
                ? `${prediction.patient_status.confidence_score}%`
                : "—"}
            </p>

            <div className="mt-3 h-1 bg-[#0f1620] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#1a4fa8] transition-all duration-700"
                style={{
                  width: prediction?.patient_status?.confidence_score
                    ? `${prediction.patient_status.confidence_score}%`
                    : "0%",
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
              <div className="bg-[#0a0d14] border border-[#141c28] rounded-lg p-3">
                <p className="text-[10px] text-[#2d3a50] uppercase tracking-widest font-semibold mb-1">
                  ML Anemia Risk
                </p>
                <p className="text-[13px] font-semibold font-mono text-[#4a7fa8]">
                  {prediction?.patient_status?.anemia_risk ?? "—"}
                </p>
              </div>
              <div className="bg-[#0a0d14] border border-[#141c28] rounded-lg p-3">
                <p className="text-[10px] text-[#2d3a50] uppercase tracking-widest font-semibold mb-1">
                  ML Hypertension Risk
                </p>
                <p className="text-[13px] font-semibold font-mono text-[#4a7fa8]">
                  {prediction?.patient_status?.hypertension_risk ?? "—"}
                </p>
              </div>

           <div className="bg-[#0a0d14] border border-[#141c28] rounded-lg p-3">
  <p className="text-[10px] text-[#2d3a50] uppercase tracking-widest font-semibold mb-1">
    Clinical Risk Score
  </p>

  <p className="text-[13px] font-semibold font-mono text-[#4a7fa8]">
    {prediction?.patient_status?.clinical_score != null
      ? `${prediction.patient_status.clinical_score} / 8`
      : "—"}
  </p>

  {prediction?.patient_status?.clinical_score != null && (
    <p
      className={`text-[10px] font-bold tracking-widest uppercase mt-1 ${
        prediction.patient_status.clinical_score >= 6
          ? "text-[#f06060]"
          : prediction.patient_status.clinical_score >= 3
          ? "text-[#e0a040]"
          : "text-[#40c070]"
      }`}
    >
      {prediction.patient_status.clinical_score >= 6
        ? "High Risk"
        : prediction.patient_status.clinical_score >= 3
        ? "Medium Risk"
        : "Low Risk"}
    </p>
  )}

  <div className="mt-2 pt-2 border-t border-[#1a2235]">
    <p className="text-[10px] text-[#2d3a50] mb-1">
      Risk factors evaluated:
    </p>

    <div className="flex flex-col gap-0.5">
      {[
        "Hemoglobin",
        "Blood Pressure",
        "Blood Sugar",
        "Heart Rate",
      ].map((factor) => (
        <div
          key={factor}
          className="flex items-center gap-1.5"
        >
          <span className="w-1 h-1 rounded-full bg-[#2d3a50] shrink-0" />
          <span className="text-[10px] text-[#2d3a50]">
            {factor}
          </span>
        </div>
      ))}
    </div>
  </div>

  {!prediction && (
    <p className="text-[10px] text-[#2d3a50] mt-1">
      Rule-based maternal risk score
    </p>
  )}
     </div>
          </div> {/* grid cols-3 */}
          </div> {/* Card 1 — Confidence Score */}


          {/* Card 2 — AI Recommendations */}
          <div className="bg-[#0d1118] border border-[#1a2235] rounded-xl p-4">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#3a6a38] mb-3 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              AI Recommendations
            </p>
            <div className="flex flex-col gap-2">
              {prediction?.ai_recommendations?.length ? (
                prediction.ai_recommendations.map((item, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <span className="mt-1.75 w-1.5 h-1.5 rounded-full bg-[#2a5a2a] shrink-0" />
                    <p className="text-[13px] text-[#5a6a84] leading-relaxed">{item}</p>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-[#2a3a2a] italic">
                  No recommendations yet.
                </p>
              )}
            </div>
          </div>

          {/* Card 3 — AI Summary */}
          <div className="bg-[#0d1118] border border-[#1a2235] rounded-xl p-4">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#2a4a6a] mb-3 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              AI Summary
            </p>
            <p className="text-[13px] text-[#4a5a72] leading-7 whitespace-pre-wrap">
              {prediction?.ai_summary ?? (
                <span className="italic text-[#2a3a2a]">No summary yet.</span>
              )}
            </p>
          </div>

          {/* Card 4 — Clinical Findings */}
          <div className="bg-[#0d1118] border border-[#1a2235] rounded-xl p-4">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6a4a28] mb-3 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              Clinical Findings
            </p>
            <div className="flex flex-col gap-2">
              {prediction?.clinical_findings?.length ? (
                prediction.clinical_findings.map((item, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <span className="mt-1.75 w-1.5 h-1.5 rounded-full bg-[#5a3a18] shrink-0" />
                    <p className="text-[13px] text-[#5a6a84] leading-relaxed">{item}</p>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-[#2a3a2a] italic">
                  No findings yet.
                </p>
              )}
            </div> {/* Clinical Findings list */}
          </div> {/* Card 4 — Clinical Findings */}

        </div> {/* flex flex-col gap-3 */}

      </div> {/* AI Prediction Result */}

      </div> {/* max-w-7xl mx-auto */}
    </DashboardLayout>
  );
}