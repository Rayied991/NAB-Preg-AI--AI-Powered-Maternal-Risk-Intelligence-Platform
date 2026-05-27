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
 */

import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

const data = [
  { name: "High Risk", value: 12 },
  { name: "Medium Risk", value: 28 },
  { name: "Low Risk", value: 45 },
];

const COLORS = [
  "#ef4444",
  "#facc15",
  "#22c55e",
];

export default function RiskPieChart() {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border-custom shadow-premium transition-all duration-300">

      <h2 className="text-xl font-semibold text-text-primary mb-6 transition-colors duration-300">
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
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

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

          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}