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

  {/* Recent Alerts */}
  <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-premium transition-colors duration-300">

    <h2 className="text-xl font-semibold text-text-primary mb-4 transition-colors duration-300">
      Recent Alerts
    </h2>

   <div className="space-y-4">

  {alerts.map((alert) => (

    <div
      key={alert.id}
      className="p-4 bg-panel border border-border-custom rounded-xl transition-all duration-300"
    >

      <p className="text-red-600 dark:text-red-400 font-semibold transition-colors duration-300">
        {alert.alert_message}
      </p>

<p
  className={`text-sm mt-1 font-medium transition-colors duration-300 ${
    alert.status === "RESOLVED"
      ? "text-green-500"
      : "text-red-500"
  }`}
>
  {alert.severity} • {alert.status}
</p>

<button
  onClick={() =>
    handleResolve(alert.id)
  }
  disabled={
    alert.status === "RESOLVED"
  }
  className="
    mt-3
    px-3
    py-1
    rounded-lg
    text-sm
    bg-green-600
    text-white
    hover:bg-green-700
    disabled:opacity-50
    disabled:cursor-not-allowed
  "
>
  {alert.status === "RESOLVED"
    ? "Resolved"
    : "Resolve"}
</button>

    </div>

  ))}

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