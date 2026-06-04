"use client";

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type TrendPoint = {
  clinical_score: number;
  predicted_at: string;
};

type Props = {
  data: TrendPoint[];
};

export default function RiskTrendChart({
  data,
}: Props) {
  const chartData = data.map(
    (item) => ({
      date: new Date(
        item.predicted_at
      ).toLocaleDateString(),
      score: item.clinical_score,
    })
  );

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} />

          <YAxis
            domain={[0, 100]}
             tick={{ fill: "#94a3b8", fontSize: 12 }}
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="score"
             stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}