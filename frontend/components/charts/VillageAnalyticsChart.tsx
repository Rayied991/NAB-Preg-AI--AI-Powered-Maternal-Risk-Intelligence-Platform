"use client";

/**
 * VillageAnalyticsChart Component
 * 
 * Group Project Documentation:
 * Refactored static dark theme styles to theme variables:
 * 1. Card container changed from static `bg-zinc-900 border-zinc-800` to `bg-card border-border-custom shadow-premium`.
 * 2. Swapped text header from `text-white` to `text-text-primary`.
 * 3. Changed Recharts XAxis/YAxis label stroke from `#888` to CSS property `var(--text-muted)`.
 * 4. Customised Recharts Tooltip using CSS variables (`var(--bg-card)`, `var(--border-color)`, `var(--text-main)`)
 *    for dynamic readability in light/dark modes.
 */

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
    <div className="bg-card rounded-2xl p-6 border border-border-custom shadow-premium transition-all duration-300">
      <h2 className="text-xl font-semibold text-text-primary mb-6 transition-colors duration-300">
        Village Risk Analytics
      </h2>

      <div className="w-full h-75">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="village" stroke="var(--text-muted)" tickLine={false} />
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