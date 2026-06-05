"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { AppCard } from "../AppCard/AppCard";
import type { CashFlowChartProps } from "./CashFlowChart.types";

/**
 * @component CashFlowChart
 * Bar chart comparing income vs expenses over time.
 * @param data - Array of data points with name, income, and expense values.
 */
export const CashFlowChart = ({ data }: CashFlowChartProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0";
  const tickColor = isDark ? "#94a3b8" : "#64748b";
  const tooltipBg = isDark ? "#1e293b" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";
  const cursorFill = isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9";

  return (
    <AppCard title="Cash Flow" subtitle="Income vs Expenses">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={gridColor}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              cursor={{ fill: cursorFill }}
              contentStyle={{
                backgroundColor: tooltipBg,
                borderRadius: "8px",
                border: `1px solid ${tooltipBorder}`,
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)",
              }}
              formatter={(value: number | string | undefined) =>
                `€${Number(value ?? 0).toLocaleString()}`
              }
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              height={36}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
            <Bar
              dataKey="expense"
              name="Expenses"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AppCard>
  );
};
