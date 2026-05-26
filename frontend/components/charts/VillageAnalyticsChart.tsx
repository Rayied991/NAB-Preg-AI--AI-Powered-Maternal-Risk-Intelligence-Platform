"use client";

import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const data = [
  { village: "Dhaka", cases: 14 },
  { village: "Khulna", cases: 8 },
  { village: "Sylhet", cases: 11 },
  { village: "Rajshahi", cases: 5 },
];

export default function VillageAnalyticsChart() {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
      <h2 className="text-xl font-semibold text-white mb-6">
        Village Risk Analytics
      </h2>

      <div className="w-full h-75">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="village" stroke="#888" />
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