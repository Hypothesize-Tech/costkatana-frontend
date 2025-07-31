import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/utils/formatters";

interface ServiceAnalyticsProps {
  data: Array<{
    service: string;
    cost: number;
    calls: number;
    percentage: number;
  }>;
}

const COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#14b8a6", // Teal
];

export const ServiceAnalytics: React.FC<ServiceAnalyticsProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Cost: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {data.payload.percentage.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            Calls: {data.payload.calls.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={CustomLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="cost"
        >
          {data.map((_entry: unknown, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value: string, entry: any) => (
            <span className="text-sm">
              {value} ({formatCurrency(entry.payload.cost)})
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
