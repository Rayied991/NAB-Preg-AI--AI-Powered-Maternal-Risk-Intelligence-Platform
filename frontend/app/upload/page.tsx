"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function UploadPage() {
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

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-semibold text-white">
              AI Prediction Result
            </h2>

            <p className="text-zinc-400 mt-1">
              Maternal risk intelligence analysis
            </p>
          </div>

          <span className="
            bg-red-500/20
            text-red-400
            px-4 py-2 rounded-full
            font-medium
          ">
            HIGH RISK
          </span>
        </div>

        <div className="mt-6 space-y-4">

          <div className="bg-zinc-950 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">
              Hypertension Risk
            </p>

            <p className="text-2xl font-bold text-red-400 mt-2">
              87%
            </p>
          </div>

          <div className="bg-zinc-950 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">
              AI Recommendation
            </p>

            <p className="text-zinc-300 mt-2">
              Immediate medical attention recommended.
              High blood pressure and low hemoglobin levels
              indicate severe maternal risk conditions.
            </p>
          </div>

        </div>
      </div>

    </DashboardLayout>
  );
}