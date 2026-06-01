"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RiskPieChartProps {
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
}

const COLORS = [
  "#ef4444",
  "#facc15",
  "#22c55e",
];

export default function RiskPieChart({
  highRisk,
  mediumRisk,
  lowRisk,
}: RiskPieChartProps) {

  const data = [
    {
      name: "High Risk",
      value: highRisk,
    },
    {
      name: "Medium Risk",
      value: mediumRisk,
    },
    {
      name: "Low Risk",
      value: lowRisk,
    },
  ];

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">

      <h2 className="text-xl font-semibold text-white mb-6">
        Maternal Risk Distribution
      </h2>

      <div className="w-full h-87.5">

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
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}