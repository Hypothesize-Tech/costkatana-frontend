import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  PhoneIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
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
  "#06ec9e", // Primary green
  "#009454", // Dark green
  "#f59e0b", // Accent yellow
  "#3b82f6", // Highlight blue
  "#10b981", // Success green
  "#ef4444", // Danger red
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
];

export const ServiceAnalytics: React.FC<ServiceAnalyticsProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const serviceName = data.payload?.service || data.name || 'Unknown Service';
      return (
        <div className="p-3 glass backdrop-blur-xl shadow-xl border border-primary-200/30 rounded-lg bg-gradient-to-br from-white/95 to-white/90 dark:from-dark-card/95 dark:to-dark-card/90">
          <div className="flex items-center gap-2 mb-3">
            <WrenchScrewdriverIcon className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
            <p className="text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{serviceName}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4 text-success-600 dark:text-success-400 shrink-0" />
              <p className="text-xs font-display font-semibold gradient-text-success">
                Cost: {formatCurrency(data.value)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
              <p className="text-xs font-display font-semibold text-primary-600 dark:text-primary-400">
                Percentage: {data.payload?.percentage?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="w-4 h-4 text-accent-600 dark:text-accent-400 shrink-0" />
              <p className="text-xs font-display font-semibold gradient-text-accent">
                Calls: {data.payload?.calls?.toLocaleString() || 0}
              </p>
            </div>
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
    <div className="chart-container p-4">
      <ResponsiveContainer width="100%" height={280}>
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
              fontFamily: 'Inter, system-ui, sans-serif',
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
