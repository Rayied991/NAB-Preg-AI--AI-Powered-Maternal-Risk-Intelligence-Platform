/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { fetchPredictions } from "@/services/history.service";
import { useEffect, useState } from "react";

const riskConfig = (risk: string) => {
  if (risk === "HIGH")
    return {
      badge: "bg-[#2a0e0e] text-[#f06060] border border-[#5a1a1a]",
      dot: "bg-[#f06060]",
    };
  if (risk === "MEDIUM")
    return {
      badge: "bg-[#2a1e06] text-[#e0a040] border border-[#5a3a10]",
      dot: "bg-[#e0a040]",
    };
  return {
    badge: "bg-[#0a2010] text-[#40c070] border border-[#1a5030]",
    dot: "bg-[#40c070]",
  };
};

const clinicalRiskLabel = (score: number) => {
  if (score >= 2) return { label: "High Risk", color: "text-[#f06060]" };
  if (score === 1) return { label: "Medium Risk", color: "text-[#e0a040]" };
  return { label: "Low Risk", color: "text-[#40c070]" };
};

export default function HistoryPage() {
const [predictions, setPredictions] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      const data = await fetchPredictions();
      setPredictions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);



  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">

        {/* ── Page Header ── */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-1">
            Maternal Health AI
          </p>
          <h1 className="text-[26px] font-semibold text-[#f0f2f6] leading-tight">
            Prediction History
          </h1>
          <p className="text-[13px] text-[#5a6478] mt-1">
            Past maternal risk assessments
          </p>
        </div>

        {/* ── Table Section ── */}
        <div className="bg-[#131720] border border-[#1e2535] rounded-2xl overflow-hidden mb-8">

          {/* Section label */}
          <div className="px-6 py-4 border-b border-[#1e2535] flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              All Records
            </p>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0f1f32] border border-[#1e3350] text-[#4a6fa0] text-[11px] font-bold font-mono">
              {predictions.length}
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-16">
              <p className="text-[13px] text-[#3d4e68] animate-pulse">
                Loading prediction history...
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading && predictions.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[13px] text-[#2a3548] italic">
                No prediction records found.
              </p>
            </div>
          )}

          {/* Table */}
          {!loading && predictions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">

                <thead>
                  <tr className="bg-[#0d1118]">
                    <th className="text-left px-6 py-3 text-[11px] font-semibold tracking-widest uppercase text-[#2d3a50]">
                      Date & Time
                    </th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold tracking-widest uppercase text-[#2d3a50]">
                      Overall Risk
                    </th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold tracking-widest uppercase text-[#2d3a50]">
                      Confidence
                    </th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold tracking-widest uppercase text-[#2d3a50]">
                      Clinical Score
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {predictions.map((prediction: any, index: number) => {
                    const config = riskConfig(prediction.overall_risk);
                    const clinical = clinicalRiskLabel(prediction.clinical_score);
                    return (
                      <tr
                        key={prediction.id}
                        className={`border-t border-[#1a2235] transition-colors duration-150 hover:bg-[#0f1520] ${
                          index % 2 === 0 ? "bg-[#0d1118]" : "bg-[#0b0f16]"
                        }`}
                      >
                        {/* Date */}
                        <td className="px-6 py-4">
                          <span className="text-[13px] font-mono text-[#5a6a84]">
                            {new Date(prediction.predicted_at).toLocaleString()}
                          </span>
                        </td>

                        {/* Risk */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
                            <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${config.badge}`}>
                              {prediction.overall_risk}
                            </span>
                          </div>
                        </td>

                        {/* Confidence */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-[13px] font-semibold font-mono text-[#3a6a9a] w-12">
                              {prediction.confidence_score}%
                            </span>
                            <div className="w-20 h-1 bg-[#0f1620] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#1a4fa8]"
                                style={{ width: `${prediction.confidence_score}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Clinical Score */}
                        <td className="px-6 py-4">
                          <div>
                            <span className="text-[13px] font-semibold font-mono text-[#4a7fa8]">
                              {prediction.clinical_score} pts
                            </span>
                            <p className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${clinical.color}`}>
                              {clinical.label}
                            </p>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}