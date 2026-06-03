"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface VillageAnalyticsChartProps {
  data: {
    id: string;
    village_name: string;
    high_risk_cases: number;
  }[];
}

export default function VillageAnalyticsChart({
  data,
}: VillageAnalyticsChartProps) {

  const chartData = data.map((village) => ({
    village: village.village_name,
    cases: village.high_risk_cases,
  }));

  return (
    <div className="bg-card rounded-2xl p-6 border border-border-custom shadow-premium transition-all duration-300">

      <h2 className="text-xl font-semibold text-text-primary mb-6 transition-colors duration-300">
        High Risk Cases by Village
      </h2>

      <div className="w-full h-75">

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={chartData}>

            <XAxis
              dataKey="village"
              stroke="var(--text-muted)"
              tickLine={false}
            />

            <YAxis
              stroke="var(--text-muted)"
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)",
                borderRadius: "12px",
                color: "var(--text-main)",
              }}
              itemStyle={{
                color: "var(--text-main)",
              }}
            />

            <Bar
              dataKey="cases"
              fill="#ef4444"
              radius={[10, 10, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}