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
  "#9B5DE5", // Primary purple
  "#F15BB5", // Secondary pink
  "#FF9500", // Accent orange
  "#FEE440", // Highlight yellow
  "#00F5D4", // Success cyan
  "#FF4F64", // Danger red
  "#A259FF", // Light purple
  "#00C4B4", // Teal
];

export const ServiceAnalytics: React.FC<ServiceAnalyticsProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const serviceName = data.payload?.service || data.name || 'Unknown Service';
      return (
        <div className="p-4 card shadow-2xl backdrop-blur-xl border border-primary-200/30 animate-scale-in">
          <p className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">{serviceName}</p>
          <div className="space-y-2">
            <p className="text-sm font-medium gradient-text">
              Cost: {formatCurrency(data.value)}
            </p>
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
              Percentage: {data.payload?.percentage?.toFixed(1) || 0}%
            </p>
            <p className="text-sm font-medium gradient-text-success">
              Calls: {data.payload?.calls?.toLocaleString() || 0}
            </p>
          </div>
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
    <div className="chart-container">
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
            nameKey="service"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={2}
          >
            {data.map((_entry: unknown, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontWeight: '600'
            }}
            formatter={(value: string, entry: any) => (
              <span className="text-sm font-display font-semibold">
                {entry.payload?.service || value} ({formatCurrency(entry.payload?.cost || 0)})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
