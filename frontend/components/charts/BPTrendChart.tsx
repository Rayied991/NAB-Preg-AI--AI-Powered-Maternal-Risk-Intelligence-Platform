"use client";

/**
 * BPTrendChart Component
 * 
 * Group Project Documentation:
 * Refactored static dark theme values to semantic theme properties:
 * 1. Card container changed from static `bg-zinc-900 border-zinc-800` to `bg-card border-border-custom shadow-premium`.
 * 2. Text header mapped to `text-text-primary`.
 * 3. Changed Recharts XAxis/YAxis label stroke from `#888` to CSS property `var(--text-muted)`.
 * 4. Styled Recharts Tooltip using CSS variables (`var(--bg-card)`, `var(--border-color)`, `var(--text-main)`)
 *    for dynamic readability in light/dark modes.
 */

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
    <div className="bg-card rounded-2xl p-6 border border-border-custom shadow-premium transition-all duration-300">
      <h2 className="text-xl font-semibold text-text-primary mb-6 transition-colors duration-300">
        Blood Pressure Trend
      </h2>

      <div className="w-full h-75">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day" stroke="var(--text-muted)" tickLine={false} />
            <YAxis stroke="var(--text-muted)" tickLine={false} />
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