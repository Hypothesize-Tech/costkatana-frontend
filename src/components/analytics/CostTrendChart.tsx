// src/components/analytics/CostTrendChart.tsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency, formatDate } from "../../utils/formatters";

interface CostTrendChartProps {
  data: Array<{
    date: string;
    cost: number;
    calls: number;
  }>;
}

export const CostTrendChart: React.FC<CostTrendChartProps> = ({ data }) => {
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: formatDate(item.date, "MMM dd"),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white rounded border border-gray-200 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-indigo-600">
            Cost: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-green-600">Calls: {payload[1].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} tickLine={false} />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12 }}
          tickLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="cost"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ fill: "#6366f1", r: 4 }}
          activeDot={{ r: 6 }}
          name="Cost ($)"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="calls"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: "#10b981", r: 4 }}
          activeDot={{ r: 6 }}
          name="API Calls"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
