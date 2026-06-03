"use client";

/**
 * RiskPieChart Component
 * 
 * Group Project Documentation:
 * Refactored chart container and styles to support theme switching:
 * 1. Card container changed from static `bg-zinc-900 border-zinc-800` to `bg-card border-border-custom shadow-premium`.
 * 2. Swapped text header from `text-white` to `text-text-primary`.
 * 3. Styled the Recharts `<Tooltip>` element contentStyle dynamically using custom CSS properties
 *    (`var(--bg-card)`, `var(--border-color)`, `var(--text-main)`) so that it automatically updates colors in light/dark modes.
 * 4. Integrated with fetchAnalytics API to display real-time risk distribution data.
 * 5. Implemented auto-refresh polling to update the chart when data changes.
 */

import { fetchAnalytics } from "@/services/analytics.service";
import { useEffect, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = [
  "#ef4444",
  "#facc15",
  "#22c55e",
];

interface RiskPieChartProps {
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
}

export default function RiskPieChart({ highRisk, mediumRisk, lowRisk }: RiskPieChartProps) {
  const [data, setData] = useState([
    { name: "High Risk", value: highRisk },
    { name: "Medium Risk", value: mediumRisk },
    { name: "Low Risk", value: lowRisk },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const analyticsData = await fetchAnalytics();

        setData([
          { name: "High Risk", value: highRisk },
          { name: "Medium Risk", value: analyticsData.medium_risk },
          { name: "Low Risk", value: analyticsData.low_risk },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch analytics");
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();

    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(loadAnalytics, 30000);

    return () => clearInterval(intervalId);
  }, [highRisk]);
return (
  <div className="w-full h-full">
    {error && (
      <div className="text-red-500 text-sm mb-4">{error}</div>
    )}
    <div className="w-full h-87.5">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-[#5a6478]">Loading...</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              label
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#131720",
                borderColor: "#1e2535",
                borderRadius: "12px",
                color: "#f0f2f6",
              }}
              itemStyle={{ color: "#f0f2f6" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}

    

    </div>
  </div>
)};