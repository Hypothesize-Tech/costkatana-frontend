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
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-indigo-600">
              Total Cost: {formatCurrency(payload[0].payload.cost)}
            </p>
            <p className="text-sm text-green-600">
              Total Calls: {payload[0].payload.calls.toLocaleString()}
            </p>
            <p className="text-sm text-blue-600">
              Avg Cost/Call: {formatCurrency(payload[0].payload.avgCost)}
            </p>
            <p className="text-sm text-purple-600">
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
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={sortedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="displayModel"
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          dataKey="cost"
          fill="#6366f1"
          radius={[8, 8, 0, 0]}
          name="Total Cost"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
