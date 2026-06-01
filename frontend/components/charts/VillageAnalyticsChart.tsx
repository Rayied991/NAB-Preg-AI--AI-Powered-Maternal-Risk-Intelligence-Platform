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
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">

      <h2 className="text-xl font-semibold text-white mb-6">
        High Risk Cases by Village
      </h2>

      <div className="w-full h-75">

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={chartData}>

            <XAxis
              dataKey="village"
              stroke="#888"
            />

            <YAxis stroke="#888" />

            <Tooltip />

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