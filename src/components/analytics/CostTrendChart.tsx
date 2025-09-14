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
        <div className="p-4 card shadow-2xl backdrop-blur-xl border border-primary-200/30 animate-scale-in">
          <p className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm font-medium gradient-text">
              Cost: {formatCurrency(payload[0].value)}
            </p>
            <p className="text-sm font-medium gradient-text-success">Calls: {payload[1].value}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(155, 93, 229, 0.1)" />
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 12, fill: 'currentColor' }} 
            tickLine={false} 
            axisLine={{ stroke: 'rgba(155, 93, 229, 0.2)' }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: 'currentColor' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(155, 93, 229, 0.2)' }}
            tickFormatter={(value) => `$${value}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: 'currentColor' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(155, 93, 229, 0.2)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '20px',
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontWeight: '600'
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="cost"
            stroke="url(#costGradient)"
            strokeWidth={3}
            dot={{ fill: "#9B5DE5", r: 5, strokeWidth: 2, stroke: "#F15BB5" }}
            activeDot={{ r: 8, fill: "#9B5DE5", stroke: "#F15BB5", strokeWidth: 3 }}
            name="Cost ($)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="calls"
            stroke="url(#callsGradient)"
            strokeWidth={3}
            dot={{ fill: "#00F5D4", r: 5, strokeWidth: 2, stroke: "#3DBE8B" }}
            activeDot={{ r: 8, fill: "#00F5D4", stroke: "#3DBE8B", strokeWidth: 3 }}
            name="API Calls"
          />
          <defs>
            <linearGradient id="costGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9B5DE5" />
              <stop offset="100%" stopColor="#F15BB5" />
            </linearGradient>
            <linearGradient id="callsGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00F5D4" />
              <stop offset="100%" stopColor="#3DBE8B" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
