"use client";

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
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
            Analytics
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Village Knowledge Graph
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Relationship map of village status, risk drivers, and interventions
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-start lg:justify-end">
          {LEGEND.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: color, boxShadow: `0 0 6px ${color}` }}
              />
              <span className="text-slate-400 text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Graph + Interventions */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Knowledge Graph */}
        <div className="xl:col-span-3">
          <VillageKnowledgeGraph />
        </div>

        {/* Interventions */}
        <div className="xl:col-span-1">
          <InterventionList />
        </div>
      </div>
    </div>
  );
}