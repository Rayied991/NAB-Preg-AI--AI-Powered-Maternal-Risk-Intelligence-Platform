"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
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
      date: new Date(item.predicted_at)
        .toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      score: item.clinical_score,
    })
  );

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid
            stroke="var(--border-color)"
            strokeDasharray="3 3"
          />

          <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} />

          <YAxis
            tick={{
              fill: "#94a3b8",
              fontSize: 12,
            }}
            label={{
              value: "Clinical Score",
              angle: -90,
              position: "insideLeft",
              fill: "#94a3b8",
            }}
            domain={[
              (dataMin) => Math.max(0, dataMin - 2),
              (dataMax) => dataMax + 2,
            ]}
          />

          <Tooltip
            contentStyle={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              color: "var(--text-main)",
            }}
            formatter={(value) => {
              const score = Number(value);

              const risk =
                score >= 6
                  ? "High"
                  : score >= 3
                    ? "Medium"
                    : "Low";

              return [
                `${score} (${risk})`,
                "Clinical Score",
              ];
            }}
          />

          <ReferenceArea
            y1={0}
            y2={3}
            fill="#22c55e"
            fillOpacity={0.08}
          />

          <ReferenceArea
            y1={3}
            y2={6}
            fill="#eab308"
            fillOpacity={0.08}
          />

          <ReferenceArea
            y1={6}
            y2={10}
            fill="#ef4444"
            fillOpacity={0.08}
          />
          <Legend
            wrapperStyle={{
              color: "#94a3b8",
              fontSize: "12px",
            }}
          />

          <Line
            type="stepAfter"
            dataKey="score"
            name="Clinical Score"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
            animationDuration={1200}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}