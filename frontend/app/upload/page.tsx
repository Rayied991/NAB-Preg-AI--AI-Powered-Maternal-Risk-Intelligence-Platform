"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { predictRisk } from "@/services/prediction.service";
import { useState } from "react";
export default function UploadPage() {
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

const [prediction, setPrediction] =
  useState<PredictionResponse | null>(null);

  const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
  return (
    <DashboardLayout>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Upload Medical Report
        </h1>

        <p className="text-zinc-400 mt-1">
          OCR-powered maternal report analysis
        </p>
      </div>

      {/* Upload Box */}
      <div className="
        bg-zinc-900
        border border-zinc-800
        rounded-2xl
        p-10
      ">

        <div className="
          border-2 border-dashed border-zinc-700
          rounded-2xl
          p-16
          text-center
        ">

          <p className="text-zinc-300 text-lg">
            Drag & Drop Report Here
          </p>

          <p className="text-zinc-500 mt-2">
            JPG, PNG, PDF supported
          </p>

          <input
            type="file"
            id="reportUpload"
            className="hidden"
          />

          <label
            htmlFor="reportUpload"
            className="
              mt-6 inline-block
              bg-blue-600 hover:bg-blue-700
              px-6 py-3 rounded-xl
              transition-all cursor-pointer
              text-white
            "
          >
            Choose Report
          </label>

        </div>
      </div>

      {/* OCR Extracted Data */}
      <div className="
        mt-10
        bg-zinc-900
        border border-zinc-800
        rounded-2xl
        p-6
      ">

        <h2 className="text-xl font-semibold text-white mb-4">
          OCR Extracted Data
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="bg-zinc-950 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">
              Hemoglobin
            </p>

            <p className="text-2xl font-bold text-white mt-2">
              8.5 g/dL
            </p>
          </div>

          <div className="bg-zinc-950 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">
              Blood Pressure
            </p>

            <p className="text-2xl font-bold text-white mt-2">
              150/95
            </p>
          </div>

          <div className="bg-zinc-950 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">
              Blood Sugar
            </p>

            <p className="text-2xl font-bold text-white mt-2">
              132 mg/dL
            </p>
          </div>

          <div className="bg-zinc-950 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">
              Heart Rate
            </p>

            <p className="text-2xl font-bold text-white mt-2">
              110 bpm
            </p>
          </div>

        </div>
      </div>

      {/* AI Prediction */}
      <div className="
        mt-10
        bg-zinc-900
        border border-zinc-800
        rounded-2xl
        p-6
      ">
        {/* header row */}

        <div className="flex items-center justify-between">

  <div>
    <h2 className="text-xl font-semibold text-white">
      AI Prediction Result
    </h2>

    <p className="text-zinc-400 mt-1">
      Maternal risk intelligence analysis
    </p>
  </div>

  <span
    className={`
      px-4 py-2 rounded-full font-medium
      ${
        prediction?.patient_status?.overall_risk === "HIGH"
          ? "bg-red-500/20 text-red-400"
          : prediction?.patient_status?.overall_risk === "MEDIUM"
          ? "bg-yellow-500/20 text-yellow-400"
          : "bg-green-500/20 text-green-400"
      }
    `}
  >
    {prediction?.patient_status?.overall_risk}
  </span>

</div>
             
        <div className="mt-6 space-y-4">

           {/* CARD 1 — Confidence Score */}
          <div className="bg-zinc-950 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">Confidence Score</p>
            <p className="text-2xl font-bold text-red-400 mt-2">
              {prediction?.patient_status?.confidence_score != null
                ? `${prediction.patient_status.confidence_score}%`
                : "—"}
            </p>
          </div>
 
          {/* CARD 2 — AI Recommendations */}
          <div className="bg-zinc-950 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">AI Recommendations</p>
            <div className="text-zinc-300 mt-2 space-y-2">
              {prediction?.ai_recommendations?.length ? (
                prediction.ai_recommendations.map((item, index) => (
                  <p key={index}>• {item}</p>
                ))
              ) : (
                <p className="text-zinc-500 italic">No recommendations yet.</p>
              )}
            </div>
          </div>
 
          {/* CARD 3 — AI Summary */}
          <div className="bg-zinc-950 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">AI Summary</p>
            <p className="text-zinc-300 mt-2 leading-7">
              {prediction?.ai_summary ?? (
                <span className="text-zinc-500 italic">No summary yet.</span>
              )}
            </p>
          </div>
 
          {/* CARD 4 — Clinical Findings */}
          <div className="bg-zinc-950 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">Clinical Findings</p>
            <div className="text-zinc-300 mt-2 space-y-2">
              {prediction?.clinical_findings?.length ? (
                prediction.clinical_findings.map((item, index) => (
                  <p key={index}>• {item}</p>
                ))
              ) : (
                <p className="text-zinc-500 italic">No findings yet.</p>
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