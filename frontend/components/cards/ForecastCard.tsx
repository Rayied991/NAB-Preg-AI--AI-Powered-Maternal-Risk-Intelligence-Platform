"use client";

import { fetchVillageAIReports } from "@/services/village-ai-reports.service";
import { useEffect, useState } from "react";

type VillageReport = {
  village: string;
  status: string;
  forecast_status: string;
  forecast_confidence: number;
  forecast_days: number;
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; dot: string }> = {
  critical: {
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    dot: "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]",
  },
  high: {
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    dot: "bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.8)]",
  },
  moderate: {
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    dot: "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]",
  },
  low: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]",
  },
  stable: {
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
    dot: "bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]",
  },
};

function getStatusConfig(status: string) {
  const key = status?.toLowerCase();
  return STATUS_CONFIG[key] ?? {
    color: "text-slate-400",
    bg: "bg-slate-700/30 border-slate-600/30",
    dot: "bg-slate-400",
  };
}

function ConfidenceBar({ value }: { value: number }) {
  const color =
    value >= 80
      ? "from-emerald-500 to-emerald-400"
      : value >= 60
      ? "from-amber-500 to-amber-400"
      : "from-red-500 to-red-400";

  return (
    <div className="mt-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
          Confidence
        </span>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
          {value}%
        </span>
      </div>
      <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-linear-to-r ${color} transition-all duration-700 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function ForecastCard() {
  const [reports, setReports] = useState<VillageReport[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVillageAIReports()
      .then((data) => {
        setReports(data);
        if (data.length > 0) setSelected(data[0].village);
      })
      .finally(() => setLoading(false));
  }, []);

  const active = reports.find((r) => r.village === selected);

  return (
    <div className="mt-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-300">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-slate-500 font-medium mb-0.5">
            AI Engine
          </p>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">
            Forecast Center
          </h2>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-full px-2.5 py-1 border border-slate-200 dark:border-slate-700/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Live</span>
        </div>
      </div>

      {loading ? (
        <div className="px-4 py-8 flex flex-col items-center gap-2">
          <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-sky-500 animate-spin" />
          <p className="text-slate-500 text-xs">Loading forecasts…</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-slate-500 text-sm">No forecast data available.</p>
        </div>
      ) : (
        <>
          {/* Village pill selector */}
          <div className="px-3 py-2.5 flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-800/60">
            {reports.map((r) => {
              const cfg = getStatusConfig(r.forecast_status);
              const isActive = selected === r.village;
              return (
                <button
                  key={r.village}
                  onClick={() => setSelected(r.village)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-slate-800 dark:bg-slate-700 border-slate-600 dark:border-slate-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                  {r.village}
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          {active && (
            <div className="px-4 pt-3 pb-4 space-y-3">
              {/* Current → Forecast */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700/40">
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1.5">
                    Current
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        getStatusConfig(active.status).dot
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold capitalize ${
                        getStatusConfig(active.status).color
                      }`}
                    >
                      {active.status}
                    </span>
                  </div>
                </div>
                <div
                  className={`rounded-lg p-2.5 border ${
                    getStatusConfig(active.forecast_status).bg
                  }`}
                >
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1.5">
                    Forecast
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        getStatusConfig(active.forecast_status).dot
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold capitalize ${
                        getStatusConfig(active.forecast_status).color
                      }`}
                    >
                      {active.forecast_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confidence bar */}
              <ConfidenceBar value={active.forecast_confidence} />

              {/* Horizon badge */}
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-500">
                  Horizon
                </span>
                <span className="bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  {active.forecast_days}-day window
                </span>
              </div>
            </div>
          )}

          {/* Footer summary strip */}
          <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between">
            <span className="text-[10px] text-slate-600">
              {reports.length} villages tracked
            </span>
            <span className="text-[10px] text-slate-600">
              Avg confidence:{" "}
              <span className="text-slate-700 dark:text-slate-400 font-medium">
                {Math.round(
                  reports.reduce((s, r) => s + r.forecast_confidence, 0) /
                    reports.length
                )}
                %
              </span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}