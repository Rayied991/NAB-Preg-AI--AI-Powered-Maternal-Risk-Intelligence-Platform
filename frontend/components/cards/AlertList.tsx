"use client";

import { API_URL } from "@/lib/config";
import { useEffect, useState } from "react";
export type Alert = {
  id: string;
  village_name: string;
  severity: string;
  message: string;
  created_at: string;
};

const SEVERITY_CONFIG: Record<string, { label: string; dot: string; border: string; bg: string }> = {
  CRITICAL: {
    label: "text-red-400",
    dot: "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.9)]",
    border: "border-red-500/20",
    bg: "bg-red-500/5",
  },
  HIGH: {
    label: "text-orange-400",
    dot: "bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.9)]",
    border: "border-orange-500/20",
    bg: "bg-orange-500/5",
  },
  MEDIUM: {
    label: "text-yellow-400",
    dot: "bg-yellow-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]",
    border: "border-yellow-500/20",
    bg: "bg-yellow-500/5",
  },
  LOW: {
    label: "text-emerald-400",
    dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/5",
  },
};

function SkeletonRow() {
  return (
    <li className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-lg p-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-14 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-2.5 w-20 bg-slate-200 dark:bg-slate-700/60 rounded-full" />
      </div>
      <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700/50 rounded-full" />
    </li>
  );
}

export default function AlertList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/ai-alerts`)
      .then((res) => res.json())
      .then((data) => setAlerts(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-300">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 tracking-tight">Active Alerts</span>
        </div>
        {!loading && alerts.length > 0 && (
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-0.5 tabular-nums">
            {alerts.length}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3 max-h-72 overflow-y-auto flex flex-col gap-1.5">
        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-1.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 text-xs">✓</span>
            </div>
            <p className="text-slate-600 dark:text-slate-500 text-xs">No active alerts</p>
          </div>
        ) : (
          alerts.map((a) => {
            const cfg = SEVERITY_CONFIG[a.severity.toUpperCase()] ?? {
              label: "text-slate-400",
              dot: "bg-slate-400",
              border: "border-slate-700",
              bg: "bg-slate-800/20",
            };
            return (
              <li
                key={a.id}
                className={`list-none flex flex-col gap-1 ${cfg.bg} border ${cfg.border} rounded-lg px-3 py-2.5`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${cfg.label}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                    {a.severity}
                  </span>
                  <span className="text-slate-500 dark:text-slate-600 text-[9px] tabular-nums">
                    {new Date(a.created_at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{a.village_name}:</span>{" "}
                  {a.message}
                </p>
              </li>
            );
          })
        )}
      </div>
    </div>
  );
}