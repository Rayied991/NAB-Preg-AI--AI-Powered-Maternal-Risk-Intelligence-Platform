"use client";

import AlertList from "@/components/cards/AlertList";
import ForecastCard from "@/components/cards/ForecastCard";
import InterventionList from "@/components/cards/InterventionList";
import TopRiskVillages from "@/components/cards/TopRiskVillages";
import Copilot from "@/components/copilot/Copilot";
import VillageKnowledgeGraph from "@/components/graph/villageKnowledgeGraph";
import { useState } from "react";

const LEGEND = [
  { label: "Village", color: "#3b82f6" },
  { label: "Status", color: "#10b981" },
  { label: "Risk Driver", color: "#f59e0b" },
  { label: "Recommendation", color: "#8b5cf6" },
  { label: "Forecast", color: "#f97316" },
  { label: "Intervention", color: "#818cf8" },
  { label: "Alert", color: "#ef4444" },
];

export default function GraphPage() {
  const [copilotQuery, setCopilotQuery] = useState("");

  return (
    <div
      className="min-h-screen bg-slate-950 p-6 flex flex-col gap-6"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56,189,248,0.06) 0%, transparent 70%), " +
          "linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px), " +
          "linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 32px 32px, 32px 32px",
      }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-gradient-to-r from-slate-900/40 to-transparent border border-slate-800/40 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="w-1 h-12 bg-gradient-to-b from-sky-400 to-sky-600 rounded-full mt-1 shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-sky-400 font-semibold mb-1">
              Analytics · Intelligence Graph
            </p>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Village Knowledge Map
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl">
              Explore relationships between risk drivers, interventions, forecasts and AI-powered insights
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 lg:shrink-0 justify-start lg:justify-end">
          {LEGEND.map(({ label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/60 rounded-full px-3.5 py-2 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all cursor-help backdrop-blur-sm"
              title={label}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0 ring-2 ring-offset-2 ring-offset-slate-950 transition-all"
                style={{
                  background: color,
                  boxShadow: `0 0 12px ${color}66`,
                  border: `2px solid ${color}`,
                }}
              />
              <span className="text-slate-300 text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1">
        {/* Knowledge Graph panel */}
        <div className="xl:col-span-3 bg-gradient-to-br from-slate-900/20 to-slate-950/40 border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm flex flex-col">
          {/* Graph Header */}
          <div className="px-6 py-4 border-b border-slate-800/40 flex items-center justify-between bg-gradient-to-r from-slate-900/60 to-transparent">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-sky-500/20 rounded-lg blur" />
                <div className="w-3 h-3 rounded-lg bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">Knowledge Graph</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Interactive relationship explorer</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {["bg-gradient-to-r from-red-500/60 to-red-600/60", "bg-gradient-to-r from-yellow-500/60 to-yellow-600/60", "bg-gradient-to-r from-emerald-500/60 to-emerald-600/60"].map((c, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${c} hover:opacity-100 opacity-60 cursor-pointer transition-all hover:scale-125 shadow-lg`} />
              ))}
            </div>
          </div>

          {/* Graph Container */}
          <div className="flex-1 w-full overflow-hidden [&>div]:!h-full">
            <VillageKnowledgeGraph copilotQuery={copilotQuery} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          {/* Top Risk Villages */}
          <div className="bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-slate-900/20 dark:to-slate-950/40 border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl backdrop-blur-sm transition-colors duration-300">
            <TopRiskVillages />
          </div>

          {/* FIX 2: Suggested Prompt Chips */}
          <div className="bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-slate-900/20 dark:to-slate-950/40 border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl backdrop-blur-sm p-6 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-sky-500/20 rounded-lg blur" />
                <div className="w-3 h-3 rounded-lg bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-white">Try Asking</span>
                <p className="text-[11px] text-slate-500 mt-0.5">AI Copilot suggestions</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                "Which village requires immediate intervention?",
                "Why is Pabna risky?",
                "Compare Pabna and New York",
                "Show alerts for New York",
                "What if we increase ANC visits in Pabna?"
              ].map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => setCopilotQuery(query)}
                  className="w-full text-left text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 transition-all flex items-center gap-2 shadow-sm dark:shadow-none"
                >
                  <span className="text-sky-400">▸</span> {query}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-gradient-to-br from-slate-900/20 to-slate-950/40 border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="px-6 py-4 border-b border-slate-800/40 flex items-center gap-3 bg-gradient-to-r from-red-900/30 to-transparent">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-lg blur" />
                <div className="w-3 h-3 rounded-lg bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.8)]" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">Active Alerts</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Critical & high priority</p>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[300px]">
              <AlertList />
            </div>
          </div>

          {/* Interventions */}
          <div className="bg-gradient-to-br from-slate-900/20 to-slate-950/40 border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="px-6 py-4 border-b border-slate-800/40 flex items-center gap-3 bg-gradient-to-r from-violet-900/30 to-transparent">
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500/20 rounded-lg blur" />
                <div className="w-3 h-3 rounded-lg bg-violet-400 shadow-[0_0_12px_rgba(196,181,253,0.8)]" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">Active Interventions</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Recommended actions</p>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[300px]">
              <InterventionList />
            </div>
          </div>

          {/* Forecast */}
          <div className="flex-1 bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-slate-900/20 dark:to-slate-950/40 border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl backdrop-blur-sm transition-colors duration-300">
            <ForecastCard />
          </div>
        </div>
      </div>

      {/* Copilot Floating Button */}
      <Copilot onQuery={setCopilotQuery} />
    </div>
  );
}