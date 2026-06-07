"use client";

import AlertList from "@/components/cards/AlertList";
import ForecastCard from "@/components/cards/ForecastCard";
import InterventionList from "@/components/cards/InterventionList";
import VillageKnowledgeGraph from "@/components/graph/villageKnowledgeGraph";

const LEGEND = [
  { label: "Village",        color: "#3b82f6" },
  { label: "Status",         color: "#10b981" },
  { label: "Risk Driver",    color: "#f59e0b" },
  { label: "Recommendation", color: "#8b5cf6" },
  { label: "Forecast",       color: "#f97316" },
  { label: "Intervention",   color: "#818cf8" },  
  { label: "Alert",          color: "#ef4444" },  
];

export default function GraphPage() {
  return (
    <div
      className="min-h-screen bg-slate-950 p-5 flex flex-col gap-5"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56,189,248,0.06) 0%, transparent 70%), " +
          "linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px), " +
          "linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 32px 32px, 32px 32px",
      }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-0.5 h-10 bg-linear-to-b from-sky-400 to-sky-600 rounded-full mt-0.5 shrink-0" />
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-medium mb-0.5">
              Analytics · Knowledge Graph
            </p>
            <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
              Village Intelligence Map
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Risk drivers, interventions &amp; AI-powered forecasts
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 lg:shrink-0">
          {LEGEND.map(({ label, color }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/80 rounded-full px-2.5 py-1 hover:border-slate-700 transition-colors"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: color, boxShadow: `0 0 6px ${color}bb` }}
              />
              <span className="text-slate-400 text-[10px] font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-linear-to-r from-slate-800 via-slate-700/40 to-transparent" />

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 flex-1">
        {/* Knowledge Graph panel */}
        <div className="xl:col-span-3 bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]" />
              <span className="text-xs font-semibold text-slate-300 tracking-tight">
                Relationship Graph
              </span>
            </div>
            <div className="flex items-center gap-1">
              {["bg-red-500/60", "bg-yellow-500/60", "bg-emerald-500/60"].map((c, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full ${c} hover:opacity-100 opacity-60 cursor-pointer transition-opacity`} />
              ))}
            </div>
          </div>
          <div className="w-full h-full min-h-125">
            <VillageKnowledgeGraph />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="xl:col-span-1 flex flex-col gap-3">
          <AlertList />

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

          <ForecastCard />
        </div>
      </div>
    </div>
  );
}