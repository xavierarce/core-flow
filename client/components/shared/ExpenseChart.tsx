"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AppCard } from "./AppCard";

interface ExpenseChartProps {
  data: { name: string; value: number; color: string }[];
}

export const ExpenseChart = ({ data }: ExpenseChartProps) => {
  if (data.length === 0) {
    return (
      <AppCard title="Expenses Breakdown" subtitle="By Category">
        <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm">
          No expenses this month
        </div>
      </AppCard>
    );
  }

  return (
    <AppCard title="Expenses Breakdown" subtitle="Where your money goes">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | string | undefined) =>
                `€${Number(value || 0).toLocaleString()}`
              }
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              formatter={(value) => <span className="text-sm ">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </AppCard>
  );
};
