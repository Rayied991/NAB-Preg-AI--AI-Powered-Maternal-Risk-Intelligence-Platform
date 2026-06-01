"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import RiskCard from "@/components/cards/RiskCard";
import RiskPieChart from "@/components/charts/RiskPieChart";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { fetchAlerts } from "@/services/alerts.service";
import { fetchAnalytics } from "@/services/analytics.service";
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

  useEffect(() => {
  const loadData = async () => {
    try {
      const [analyticsData, alertData] =
        await Promise.all([
          fetchAnalytics(),
          fetchAlerts(),
        ]);

      setAnalytics(analyticsData);
      setAlerts(alertData);

    } catch (error) {
      console.error(error);
    }
  };

  loadData();
}, []);


  return (
    <DashboardLayout>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <RiskCard
        title="High Risk Cases"
        count={analytics?.high_risk || 0}
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

      <div className="mt-10">
        <RiskPieChart
        highRisk={analytics?.high_risk || 0}
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

      <p className="text-text-muted text-sm mt-1 transition-colors duration-300">
        {alert.severity} • {alert.status}
      </p>

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

      <p>
        • 18% increase in hypertension risk cases this week.
      </p>

      <p>
        • Most high-risk patients are from rural villages.
      </p>

      <p>
        • Nutrition deficiencies strongly correlate with anemia.
      </p>

    </div>
  </div>

</div>

    </DashboardLayout>
  );
}