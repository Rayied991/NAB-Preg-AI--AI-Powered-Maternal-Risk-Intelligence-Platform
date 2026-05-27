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

export default function UploadPage() {
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
            type="file"
            id="reportUpload"
            className="hidden"
          />

          <label
            htmlFor="reportUpload"
            className="
              mt-6 inline-block
              bg-blue-600 hover:bg-blue-700
              text-white
              px-6 py-3 rounded-xl
              transition-all cursor-pointer shadow-sm active:scale-95
            "
          >
            Choose Report
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="bg-panel border border-border-custom rounded-xl p-4 transition-all duration-300">
            <p className="text-text-muted text-sm transition-colors duration-300">
              Hemoglobin
            </p>

            <p className="text-2xl font-bold text-text-primary mt-2 transition-colors duration-300">
              8.5 g/dL
            </p>
          </div>

          <div className="bg-panel border border-border-custom rounded-xl p-4 transition-all duration-300">
            <p className="text-text-muted text-sm transition-colors duration-300">
              Blood Pressure
            </p>

            <p className="text-2xl font-bold text-text-primary mt-2 transition-colors duration-300">
              150/95
            </p>
          </div>

          <div className="bg-panel border border-border-custom rounded-xl p-4 transition-all duration-300">
            <p className="text-text-muted text-sm transition-colors duration-300">
              Blood Sugar
            </p>

            <p className="text-2xl font-bold text-text-primary mt-2 transition-colors duration-300">
              132 mg/dL
            </p>
          </div>

          <div className="bg-panel border border-border-custom rounded-xl p-4 transition-all duration-300">
            <p className="text-text-muted text-sm transition-colors duration-300">
              Heart Rate
            </p>

            <p className="text-2xl font-bold text-text-primary mt-2 transition-colors duration-300">
              110 bpm
            </p>
          </div>

        </div>
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

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-semibold text-text-primary transition-colors duration-300">
              AI Prediction Result
            </h2>

            <p className="text-text-muted mt-1 transition-colors duration-300">
              Maternal risk intelligence analysis
            </p>
          </div>

          <span className="
            bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400
            px-4 py-2 rounded-full
            font-semibold text-sm transition-all duration-300
          ">
            HIGH RISK
          </span>
        </div>

        <div className="mt-6 space-y-4">

          <div className="bg-panel border border-border-custom rounded-xl p-4 transition-all duration-300">
            <p className="text-text-muted text-sm transition-colors duration-300">
              Hypertension Risk
            </p>

            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2 transition-colors duration-300">
              87%
            </p>
          </div>

          <div className="bg-panel border border-border-custom rounded-xl p-4 transition-all duration-300">
            <p className="text-text-muted text-sm transition-colors duration-300">
              AI Recommendation
            </p>

            <p className="text-text-secondary mt-2 leading-relaxed transition-colors duration-300">
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