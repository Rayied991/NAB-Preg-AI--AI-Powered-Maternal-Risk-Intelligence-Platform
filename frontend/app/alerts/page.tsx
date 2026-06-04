"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { fetchAlerts } from "@/services/alerts.service";
import { useEffect, useState } from "react";

interface Alert {
  id: string;
  severity: string;
  status: string;
  alert_message: string;
  triggered_at: string;
}



const severityConfig = (severity: string) => {
  if (severity === "HIGH")
    return {
      badge: "bg-red-50 dark:bg-[#2a0e0e] text-red-600 dark:text-[#f06060] border border-red-200 dark:border-[#5a1a1a]",
      dot: "bg-[#f06060]",
      ring: "border-red-300 dark:border-[#3a1010] shadow-[0_0_10px_rgba(248,113,113,0.15)] dark:shadow-none",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
    };
  return {
    badge: "bg-orange-50 dark:bg-[#2a1e06] text-orange-600 dark:text-[#e0a040] border border-orange-200 dark:border-[#5a3a10]",
    dot: "bg-[#e0a040]",
    ring: "border-orange-300 dark:border-[#3a2a08] shadow-[0_0_10px_rgba(251,146,60,0.15)] dark:shadow-none",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  };
};

export default function AlertsPage() {

  const [alerts, setAlerts] =
    useState<Alert[]>([]);

  useEffect(() => {

    const loadAlerts = async () => {
      try {

        const data =
          await fetchAlerts();

        setAlerts(data);

      } catch (error) {
        console.error(error);
      }
    };

    loadAlerts();

  }, []);
  return (
    <DashboardLayout>

      {/* ── Page Header ── */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-1">
          Maternal Health AI
        </p>
        <h1 className="text-3xl font-bold text-text-primary transition-colors duration-300">
          Emergency Alerts
        </h1>
        <p className="text-text-muted mt-1 transition-colors duration-300">
          AI-detected maternal health risks
        </p>
      </div>

      {/* ── Alerts Section ── */}
      <div className="bg-white dark:bg-[#131720] border border-gray-200 dark:border-[#1e2535] rounded-2xl p-6 shadow-sm transition-colors duration-300">

        <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          Active Alerts
          <span className="ml-1 px-2 py-0.5 rounded-full bg-white dark:bg-[#2a0e0e] text-red-600 dark:text-[#f06060] border border-red-200 dark:border-[#5a1a1a] text-[10px] font-bold tracking-wider shadow-sm">
            {
  alerts.filter(
    (a) => a.status === "OPEN"
  ).length
}
          </span>
        </p>

        <div className="flex flex-col gap-3">
          {alerts.map((alert) => {
            const config = severityConfig(alert.severity);
            return (
              <div
                key={alert.id}
                className={`bg-gray-50 dark:bg-[#0d1118] border rounded-xl p-4 transition-all duration-200 ${config.ring}`}
              >
                <div className="flex items-start justify-between gap-4">

                  {/* Left — avatar + info */}
                  <div className="flex items-start gap-3">

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0a0d14] border border-gray-200 dark:border-[#1a2235] flex items-center justify-center">
                        <span className="text-[11px] font-bold text-[#4a7fa8] font-mono tracking-wider">
                          {alert.severity.substring(0, 2)}
                        </span>
                      </div>
                      {/* Live dot */}
                      <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${config.dot} ring-2 ring-gray-50 dark:ring-[#0d1118]`} />
                    </div>

                    {/* Text */}
                    <div>
                      <p className="text-[14px] font-semibold text-gray-800 dark:text-[#dce4f0] leading-tight">
                        {alert.alert_message}
                      </p>
                      <p className="text-[13px] text-gray-600 dark:text-[#5a6a84] mt-1 leading-relaxed">
                        {alert.status}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-[#2d3a50] mt-2 font-mono tracking-wide">
                        {new Date(
                          alert.triggered_at
                        ).toLocaleString()}
                      </p>
                    </div>

                  </div>

                  {/* Right — severity badge */}
                  <span
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase ${config.badge}`}
                  >
                    {config.icon}
                    {alert.severity}
                  </span>

                </div>
              </div>
            );
          })}
        </div>

      </div>

    </DashboardLayout>
  );
}