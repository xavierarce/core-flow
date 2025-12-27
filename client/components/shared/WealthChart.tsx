"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { AppCard } from "./AppCard";

interface WealthChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ["#059669", "#3b82f6", "#6366f1", "#8b5cf6"];

export const WealthChart = ({ data }: WealthChartProps) => {
  return (
    <AppCard title="Asset Allocation" subtitle="Distribution by Account">
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
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | string | undefined) =>
                `€${Number(value || 0).toLocaleString()}`
              }
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              itemStyle={{ color: "#1e293b", fontWeight: "bold" }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              itemSorter={(item) => -1 * (item.payload?.value ?? 0)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </AppCard>
  );
};
