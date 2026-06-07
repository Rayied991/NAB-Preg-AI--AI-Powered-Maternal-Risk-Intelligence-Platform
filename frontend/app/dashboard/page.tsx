"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import RiskCard from "@/components/cards/RiskCard";
import RiskPieChart from "@/components/charts/RiskPieChart";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  resolveAlert,
} from "@/services/alert.service";
import { fetchAlerts } from "@/services/alerts.service";
import { fetchAnalytics } from "@/services/analytics.service";
import {
  fetchInsights
} from "@/services/insights.service";
import { useEffect, useState } from "react";


/**
 * DashboardPage Component
 * 
 * Group Project Documentation:
 * Refactored layout colors to use semantic theme properties:
 * 1. Swapped panels (`Recent Alerts`, `AI Insights`) from `bg-zinc-900 border-zinc-800` to `bg-card border-border-custom shadow-premium`.
 * 2. Alert boxes changed from `bg-zinc-950` to `bg-panel border border-border-custom` for high contrast in light mode.
 * 3. Standard text mapped: headers to `text-text-primary`, descriptions/metadata to `text-text-muted`, insights to `text-text-secondary`.
 * 4. Alert levels customized with light/dark variants:
 *    - High risk: `text-red-600 dark:text-red-400`
 *    - Medium risk: `text-amber-600 dark:text-yellow-300`
 */

export default function DashboardPage() {

  const [analytics, setAnalytics] =useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [insights, setInsights] =
  useState<string[]>([]);

  const handleResolve = async (
  alertId: string
) => {

  try {

    await resolveAlert(alertId);

    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: "RESOLVED",
            }
          : alert
      )
    );

  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
  const loadData = async () => {
    try {
      const [analyticsData, alertData,insightsData] =
        await Promise.all([
          fetchAnalytics(),
          fetchAlerts(),
          fetchInsights()
        ]);

      setAnalytics(analyticsData);
      setAlerts(alertData);
      setInsights(insightsData);

    } catch (error) {
      console.error(error);
    }
  };

  loadData();
}, []);

  const unresolvedHigh = alerts.filter(
    (a) => a.severity?.toLowerCase().includes("high") && a.status !== "RESOLVED"
  ).length;

  const totalHigh = analytics?.high_risk || 0;
  const totalMedium = analytics?.medium_risk || 0;
  const totalLow = analytics?.low_risk || 0;
  const totalAlerts = totalHigh + totalMedium + totalLow;
  const totalAlertsDivisor = totalAlerts || 1;

  return (
    <DashboardLayout>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <RiskCard
        title="High Risk Cases"
        count={unresolvedHigh}
        color="red"
      />

      <RiskCard
        title="Medium Risk"
        count={analytics?.medium_risk || 0}
        color="yellow"
      />

      <RiskCard
        title="Low Risk"
        count={analytics?.low_risk || 0}
        color="green"
      />
      </div>

      <div className="mt-6 bg-card border border-border-custom rounded-2xl p-6 shadow-premium">
        <h2 className="text-xl font-semibold text-white mb-6">
          Risk Distribution
        </h2>
        <RiskPieChart
          highRisk={unresolvedHigh}
          mediumRisk={analytics?.medium_risk || 0}
          lowRisk={analytics?.low_risk || 0}
        />
</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">

  {/* Total Alerts */}
  <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-premium transition-colors duration-300 flex flex-col">

    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-text-primary transition-colors duration-300">
        Total Alerts
      </h2>
      <span className="bg-blue-500/10 text-blue-500 text-xs font-bold px-3 py-1 rounded-full">
        {totalAlerts} Total
      </span>
    </div>

    <div className="space-y-6 flex-1 justify-center flex flex-col">
      {/* High Risk */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            <span className="text-sm font-medium text-text-primary">High Risk</span>
          </div>
          <span className="text-sm font-bold text-red-500">{totalHigh}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2">
          <div className="bg-red-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${(totalHigh / totalAlertsDivisor) * 100}%` }}></div>
        </div>
      </div>

      {/* Medium Risk */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
            <span className="text-sm font-medium text-text-primary">Medium Risk</span>
          </div>
          <span className="text-sm font-bold text-amber-500">{totalMedium}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2">
          <div className="bg-amber-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${(totalMedium / totalAlertsDivisor) * 100}%` }}></div>
        </div>
      </div>

      {/* Low Risk */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <span className="text-sm font-medium text-text-primary">Low Risk</span>
          </div>
          <span className="text-sm font-bold text-green-500">{totalLow}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${(totalLow / totalAlertsDivisor) * 100}%` }}></div>
        </div>
      </div>

    </div>
  </div>

  {/* AI Summary */}
  <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-premium transition-colors duration-300">

    <h2 className="text-xl font-semibold text-text-primary mb-4 transition-colors duration-300">
      AI Insights
    </h2>

    <div className="space-y-4 text-text-secondary transition-colors duration-300">

       {insights.map(
    (insight, index) => (
      <p key={index}>
        • {insight}
      </p>
    )
  )}

     

    </div>
  </div>

</div>

    </DashboardLayout>
  );
}