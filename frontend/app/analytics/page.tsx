/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import BPTrendChart from "@/components/charts/BPTrendChart";
import RiskPieChart from "@/components/charts/RiskPieChart";
import VillageAnalyticsChart from "@/components/charts/VillageAnalyticsChart";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { fetchAnalytics } from "@/services/analytics.service";
import { fetchAlerts } from "@/services/alerts.service";
import { fetchVillageAnalytics } from "@/services/village-analytics.service";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * AnalyticsPage Component
 * 
 * Group Project Documentation:
 * Refactored page headers and subtitles from hardcoded colors to semantic theme classes:
 * - Title heading mapped to `text-text-primary`.
 * - Subtitle description mapped to `text-text-muted`.
 */
const VillageHeatmap = dynamic(
  () => import("@/components/maps/VillageHeatmap"),
  {
    ssr: false,
  }
);

export default function AnalyticsPage() {
 const [villages, setVillages] = useState<any[]>([]);
 const [analytics, setAnalytics] = useState<any>(null);
 const [alerts, setAlerts] = useState<any[]>([]);

 useEffect(() => {
  const loadAnalytics = async () => {
    try {
      const [analyticsData, alertData] = await Promise.all([
          fetchAnalytics(),
          fetchAlerts()
        ]);
      setAnalytics(analyticsData);
      setAlerts(alertData);
    } catch (error) {
      console.error(error);
    }
  };
  loadAnalytics();
}, []);

useEffect(() => {
  const loadVillageAnalytics = async () => {
    try {
      const data =
        await fetchVillageAnalytics();

      setVillages(data);

    } catch (error) {
      console.error(error);
    }
  };

  loadVillageAnalytics();
}, []);

  const unresolvedHigh = alerts.filter(
    (a) => a.severity?.toLowerCase().includes("high") && a.status !== "RESOLVED"
  ).length;

  return (
    <DashboardLayout>

      {/* ── Page Header ── */}
      <div className="mb-8">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-1">
        Maternal Health AI
      </p>

      <h1 className="text-3xl font-bold text-text-primary transition-colors duration-300">
        Analytics Dashboard
      </h1>

      <p className="text-text-muted mt-1 transition-colors duration-300">
        AI-powered maternal health intelligence
      </p>
    </div>

      {/* ── Top Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Risk Pie Chart */}
        <div className="bg-white dark:bg-[#131720] border border-gray-200 dark:border-[#1e2535] rounded-2xl p-6 shadow-sm transition-colors duration-300">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
              <path d="M22 12A10 10 0 0 0 12 2v10z"/>
            </svg>
            Risk Distribution
          </p>
          <RiskPieChart
        highRisk={unresolvedHigh}
        mediumRisk={analytics?.medium_risk || 0}
        lowRisk={analytics?.low_risk || 0}
      />

        </div>

        {/* BP Trend Chart */}
        <div className="bg-white dark:bg-[#131720] border border-gray-200 dark:border-[#1e2535] rounded-2xl p-6 shadow-sm transition-colors duration-300">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Blood Pressure Trend
          </p>
          <BPTrendChart />
        </div>

      </div>

      {/* ── Village Analytics ── */}
      <div className="mt-5 mb-8 bg-white dark:bg-[#131720] border border-gray-200 dark:border-[#1e2535] rounded-2xl p-6 shadow-sm transition-colors duration-300">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Village-Level Analytics
        </p>
        <VillageAnalyticsChart   data={villages}/>
      </div>

      <div className="mt-6 overflow-x-auto">

  <table className="w-full text-sm">

    <thead>
      <tr className="border-b border-gray-200 dark:border-[#1e2535] text-gray-700 dark:text-gray-300">
        <th className="text-left p-2">Village</th>
        <th className="text-left p-2">High Risk</th>
        <th className="text-left p-2">Medium Risk</th>
        <th className="text-left p-2">Low Risk</th>
      </tr>
    </thead>

    <tbody>

      {villages.map((village) => (

        <tr
          key={village.id}
          className="border-b border-gray-200 dark:border-[#1e2535] text-gray-800 dark:text-gray-200"
        >

          <td className="p-2">
            {village.village_name}
          </td>

          <td className="p-2 text-red-600 dark:text-red-400">
            {village.high_risk_cases}
          </td>

          <td className="p-2 text-yellow-600 dark:text-yellow-400">
            {village.medium_risk_cases}
          </td>

          <td className="p-2 text-green-600 dark:text-green-400">
            {village.low_risk_cases}
          </td>

        </tr>

      ))}

    </tbody>

  </table>

  <div className="mt-6 bg-white dark:bg-[#131720] border border-gray-200 dark:border-[#1e2535] rounded-2xl p-6 shadow-sm transition-colors duration-300">
  <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-4">
    Village Risk Heatmap
  </p>

  <VillageHeatmap />
</div>

</div>

    </DashboardLayout>
  );
}