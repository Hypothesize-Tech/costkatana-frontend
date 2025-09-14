// src/components/analytics/ModelComparison.tsx
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
        <div className="p-4 card shadow-2xl backdrop-blur-xl border border-primary-200/30 animate-scale-in">
          <p className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">{label}</p>
          <div className="space-y-2">
            <p className="text-sm font-medium gradient-text">
              Total Cost: {formatCurrency(payload[0].payload.cost)}
            </p>
            <p className="text-sm font-medium gradient-text-success">
              Total Calls: {payload[0].payload.calls.toLocaleString()}
            </p>
            <p className="text-sm font-medium gradient-text-accent">
              Avg Cost/Call: {formatCurrency(payload[0].payload.avgCost)}
            </p>
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
              Avg Tokens: {payload[0].payload.avgTokens}
            </p>
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
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(155, 93, 229, 0.1)" />
          <XAxis
            dataKey="displayModel"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(155, 93, 229, 0.2)' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'currentColor' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(155, 93, 229, 0.2)' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontFamily: 'Outfit, system-ui, sans-serif',
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
              <stop offset="0%" stopColor="#9B5DE5" />
              <stop offset="100%" stopColor="#F15BB5" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
