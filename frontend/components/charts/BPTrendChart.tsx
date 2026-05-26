"use client";

import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const data = [
  { day: "Mon", bp: 120 },
  { day: "Tue", bp: 130 },
  { day: "Wed", bp: 145 },
  { day: "Thu", bp: 138 },
  { day: "Fri", bp: 150 },
];

export default function BPTrendChart() {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
      <h2 className="text-xl font-semibold text-white mb-6">
        Blood Pressure Trend
      </h2>

      <div className="w-full h-75">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="bp"
              stroke="#3b82f6"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}