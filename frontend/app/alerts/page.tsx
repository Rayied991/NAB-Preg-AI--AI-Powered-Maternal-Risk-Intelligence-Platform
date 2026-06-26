"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { fetchAlerts } from "@/services/alerts.service";
import { resolveAlert } from "@/services/alert.service";
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
      badge: "bg-white dark:bg-[#2a0e0e] text-red-600 dark:text-[#f06060] border border-red-500 dark:border-[#5a1a1a]",
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
  if (severity === "MEDIUM")
    return {
      badge: "bg-white dark:bg-[#2a1e06] text-yellow-600 dark:text-[#e0a040] border border-yellow-500 dark:border-[#5a3a10]",
      dot: "bg-[#e0a040]",
      ring: "border-yellow-300 dark:border-[#3a2a08] shadow-[0_0_10px_rgba(253,224,71,0.15)] dark:shadow-none",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
    };
  return {
    badge: "bg-white dark:bg-[#0e2a14] text-green-600 dark:text-[#60f080] border border-green-500 dark:border-[#1a5a22]",
    dot: "bg-[#60f080]",
    ring: "border-green-300 dark:border-[#103a16] shadow-[0_0_10px_rgba(74,222,128,0.15)] dark:shadow-none",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    ),
  };
};

export default function AlertsPage() {

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchAlerts();
        setAlerts(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadAlerts();
  }, []);

  const handleResolve = async (alertId: string) => {
    try {
      await resolveAlert(alertId);
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, status: "RESOLVED" } : alert
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === "OPEN");
  const filteredAlerts = activeAlerts.filter((a) => {
    if (activeTab === "All") return true;
    return a.severity === activeTab.toUpperCase();
  });
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
      <div className="bg-white dark:bg-[#131720] border border-gray-200 dark:border-[#1e2535] rounded-2xl p-4 md:p-6 shadow-sm transition-colors duration-300">

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            Active Alerts
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white dark:bg-[#2a0e0e] text-red-600 dark:text-[#f06060] border border-red-200 dark:border-[#5a1a1a] text-[10px] font-bold tracking-wider shadow-sm">
              {activeAlerts.length}
            </span>
          </p>

          <div className="flex flex-wrap bg-gray-100 dark:bg-[#0d1118] p-1 rounded-xl w-full md:w-auto">
            {["All", "High", "Medium", "Low"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-2 sm:px-4 py-1.5 rounded-lg text-[12px] sm:text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white dark:bg-[#1e2535] text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {filteredAlerts.map((alert) => {
            const config = severityConfig(alert.severity);
            return (
              <div
                key={alert.id}
                className={`bg-gray-50 dark:bg-[#0d1118] border rounded-xl p-4 transition-all duration-200 ${config.ring}`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                  {/* Left — avatar + info */}
                  <div className="flex items-start gap-3 w-full sm:w-auto">

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

                  {/* Right — severity badge and resolve button */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase ${config.badge}`}
                    >
                      {config.icon}
                      {alert.severity}
                    </span>
                    {alert.severity === "HIGH" && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
                      >
                        Resolve
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

    </DashboardLayout>
  );
}