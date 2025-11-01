import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  CurrencyDollarIcon,
  PhoneIcon,
  ChartBarIcon,
  HashtagIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "../../utils/formatters";

interface ModelComparisonProps {
  data: Array<{
    model: string;
    cost: number;
    calls: number;
    avgTokens: number;
    avgCost: number;
  }>;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 glass backdrop-blur-xl shadow-xl border border-primary-200/30 rounded-lg bg-gradient-to-br from-white/95 to-white/90 dark:from-dark-card/95 dark:to-dark-card/90">
          <div className="flex items-center gap-2 mb-3">
            <CpuChipIcon className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
            <p className="text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{label}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4 text-success-600 dark:text-success-400 shrink-0" />
              <p className="text-xs font-display font-semibold gradient-text-success">
                Total Cost: {formatCurrency(payload[0].payload.cost)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
              <p className="text-xs font-display font-semibold gradient-text-primary">
                Total Calls: {payload[0].payload.calls.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4 text-accent-600 dark:text-accent-400 shrink-0" />
              <p className="text-xs font-display font-semibold gradient-text-accent">
                Avg Cost/Call: {formatCurrency(payload[0].payload.avgCost)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <HashtagIcon className="w-4 h-4 text-secondary-600 dark:text-secondary-400 shrink-0" />
              <p className="text-xs font-display font-semibold text-secondary-600 dark:text-secondary-400">
                Avg Tokens: {payload[0].payload.avgTokens?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Sort data by cost descending and take top 10
  const sortedData = [...data]
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10)
    .map((item) => ({
      ...item,
      displayModel:
        item.model.length > 15
          ? item.model.substring(0, 15) + "..."
          : item.model,
    }));

  return (
    <div className="chart-container p-4">
      <ResponsiveContainer width="100%" height={380}>
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 236, 158, 0.1)" />
          <XAxis
            dataKey="displayModel"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(6, 236, 158, 0.2)' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'currentColor' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(6, 236, 158, 0.2)' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: '600'
            }}
          />
          <Bar
            dataKey="cost"
            fill="url(#barGradient)"
            radius={[12, 12, 0, 0]}
            name="Total Cost"
          />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06ec9e" />
              <stop offset="100%" stopColor="#009454" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
