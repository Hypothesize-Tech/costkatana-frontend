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
import {
  CurrencyDollarIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
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
        <div className="p-3 glass backdrop-blur-xl shadow-xl border border-primary-200/30 rounded-lg bg-gradient-to-br from-white/95 to-white/90 dark:from-dark-card/95 dark:to-dark-card/90">
          <p className="text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2.5">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4 text-success-600 dark:text-success-400 shrink-0" />
              <p className="text-xs font-display font-semibold gradient-text-success">
                Cost: {formatCurrency(payload[0].value)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
              <p className="text-xs font-display font-semibold gradient-text-primary">
                Calls: {payload[1].value?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container p-4">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 236, 158, 0.1)" />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 12, fill: 'currentColor' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(6, 236, 158, 0.2)' }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: 'currentColor' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(6, 236, 158, 0.2)' }}
            tickFormatter={(value) => `$${value}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: 'currentColor' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(6, 236, 158, 0.2)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: '600'
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="cost"
            stroke="url(#costGradient)"
            strokeWidth={3}
            dot={{ fill: "#06ec9e", r: 5, strokeWidth: 2, stroke: "#009454" }}
            activeDot={{ r: 8, fill: "#06ec9e", stroke: "#009454", strokeWidth: 3 }}
            name="Cost ($)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="calls"
            stroke="url(#callsGradient)"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", r: 5, strokeWidth: 2, stroke: "#1d4ed8" }}
            activeDot={{ r: 8, fill: "#3b82f6", stroke: "#1d4ed8", strokeWidth: 3 }}
            name="API Calls"
          />
          <defs>
            <linearGradient id="costGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06ec9e" />
              <stop offset="100%" stopColor="#009454" />
            </linearGradient>
            <linearGradient id="callsGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
