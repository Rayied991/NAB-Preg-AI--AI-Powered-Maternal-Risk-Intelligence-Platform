"use client";

import ForecastCard from "@/components/cards/ForecastCard";
import InterventionList from "@/components/cards/InterventionList";
import VillageKnowledgeGraph from "@/components/graph/villageKnowledgeGraph";

const LEGEND = [
  { label: "Village", color: "#3b82f6" },
  { label: "Status", color: "#10b981" },
  { label: "Risk Driver", color: "#f59e0b" },
  { label: "Recommendation", color: "#8b5cf6" },
  { label: "Forecast", color: "#f97316" },
];

export default function GraphPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Accent bar */}
          <div className="w-0.5 h-10 bg-gradient-to-b from-sky-400 to-sky-600 rounded-full mt-0.5 shrink-0" />
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-medium mb-0.5">
              Analytics · Knowledge Graph
            </p>
            <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
              Village Intelligence Map
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Risk drivers, interventions & AI-powered forecasts
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 lg:shrink-0">
          {LEGEND.map(({ label, color }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-full px-2.5 py-1"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: color,
                  boxShadow: `0 0 5px ${color}99`,
                }}
              />
              <span className="text-slate-400 text-[11px] font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-slate-800 via-slate-700/50 to-transparent" />

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 flex-1">
        {/* Knowledge Graph panel */}
        <div className="xl:col-span-3 bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {/* Panel header */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]" />
              <span className="text-xs font-semibold text-slate-300 tracking-tight">
                Relationship Graph
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700 hover:bg-slate-600 cursor-pointer transition-colors" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700 hover:bg-slate-600 cursor-pointer transition-colors" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700 hover:bg-slate-600 cursor-pointer transition-colors" />
            </div>
          </div>
          <div className="w-full h-full min-h-[500px]">
            <VillageKnowledgeGraph />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="xl:col-span-1 flex flex-col gap-0">
          {/* Interventions */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.7)]" />
              <span className="text-xs font-semibold text-slate-300 tracking-tight">
                Active Interventions
              </span>
            </div>
            <InterventionList />
          </div>

          {/* Forecast card — sits flush below */}
          <ForecastCard />
        </div>
      </div>
    </div>
  );
}