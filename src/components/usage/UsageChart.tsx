// src/components/usage/UsageChart.tsx
import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency, formatDate } from "../../utils/formatters";

interface UsageChartProps {
  data: Array<{
    date: string;
    cost: number;
    calls: number;
    tokens: number;
  }>;
  type?: "line" | "bar";
  metric?: "cost" | "calls" | "tokens";
}

export const UsageChart: React.FC<UsageChartProps> = ({
  data,
  type = "line",
  metric = "cost",
}) => {
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: formatDate(item.date, "short"),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <p className="text-sm font-medium font-display gradient-text-primary">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-body" style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.name === "Cost"
                ? formatCurrency(entry.value)
                : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getYAxisTickFormatter = (metric: string) => {
    if (metric === "cost") {
      return (value: number) => `$${value}`;
    }
    return (value: number) => value.toLocaleString();
  };

  const ChartComponent = type === "line" ? LineChart : BarChart;

  return (
    <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="mb-4">
        <h3 className="text-lg font-bold font-display gradient-text-primary">Usage Over Time</h3>
        <p className="text-sm text-secondary-600 dark:text-secondary-300">Track your API usage trends</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={formattedData}>
          <defs>
            <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(var(--primary-500))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="rgb(var(--primary-500))" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(var(--success-500))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="rgb(var(--success-500))" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="warningGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(var(--warning-500))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="rgb(var(--warning-500))" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.3)" />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 12, fill: 'currentColor' }}
            tickLine={false}
            className="text-secondary-500 dark:text-secondary-400"
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'currentColor' }}
            tickLine={false}
            tickFormatter={getYAxisTickFormatter(metric)}
            className="text-secondary-500 dark:text-secondary-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {metric === "cost" &&
            (type === "line" ? (
              <Line
                type="monotone"
                dataKey="cost"
                stroke="rgb(var(--primary-500))"
                strokeWidth={3}
                name="Cost"
                dot={{ fill: 'rgb(var(--primary-500))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'rgb(var(--primary-500))', stroke: 'rgb(var(--primary-300))', strokeWidth: 2 }}
              />
            ) : (
              <Bar dataKey="cost" fill="url(#primaryGradient)" name="Cost" />
            ))}

          {metric === "calls" &&
            (type === "line" ? (
              <Line
                type="monotone"
                dataKey="calls"
                stroke="rgb(var(--success-500))"
                strokeWidth={3}
                name="API Calls"
                dot={{ fill: 'rgb(var(--success-500))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'rgb(var(--success-500))', stroke: 'rgb(var(--success-300))', strokeWidth: 2 }}
              />
            ) : (
              <Bar dataKey="calls" fill="url(#successGradient)" name="API Calls" />
            ))}

          {metric === "tokens" &&
            (type === "line" ? (
              <Line
                type="monotone"
                dataKey="tokens"
                stroke="rgb(var(--warning-500))"
                strokeWidth={3}
                name="Tokens"
                dot={{ fill: 'rgb(var(--warning-500))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'rgb(var(--warning-500))', stroke: 'rgb(var(--warning-300))', strokeWidth: 2 }}
              />
            ) : (
              <Bar dataKey="tokens" fill="url(#warningGradient)" name="Tokens" />
            ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};
