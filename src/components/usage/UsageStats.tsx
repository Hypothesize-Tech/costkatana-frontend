// src/components/usage/UsageStats.tsx
import React from "react";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "../../utils/formatters";

export const UsageStats: React.FC<{
  stats: {
    totalCost: number;
    costTrend: number;
    totalCalls: number;
    callsTrend: number;
    avgResponseTime: number;
    responseTrend: number;
    totalTokens: number;
    tokensTrend: number;
  };
  period: string;
}> = ({ stats, period }) => {
  const cards: {
    title: string;
    value: string;
    change: number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    inverse?: boolean;
  }[] = [
      {
        title: "Total Cost",
        value: formatCurrency(stats.totalCost),
        change: stats.costTrend,
        icon: CurrencyDollarIcon,
        color: "text-success-500",
        bgColor: "bg-gradient-to-br from-success-400/20 to-success-500/20",
      },
      {
        title: "API Calls",
        value: stats.totalCalls.toLocaleString(),
        change: stats.callsTrend,
        icon: ChartBarIcon,
        color: "text-primary-500",
        bgColor: "bg-gradient-to-br from-primary-400/20 to-primary-500/20",
      },
      {
        title: "Avg Response Time",
        value: `${stats.avgResponseTime}ms`,
        change: stats.responseTrend,
        icon: ClockIcon,
        color: "text-secondary-500",
        bgColor: "bg-gradient-to-br from-secondary-400/20 to-secondary-500/20",
        inverse: true, // Lower is better
      },
      {
        title: "Tokens Used",
        value: stats.totalTokens.toLocaleString(),
        change: stats.tokensTrend,
        icon: SparklesIcon,
        color: "text-accent-500",
        bgColor: "bg-gradient-to-br from-accent-400/20 to-accent-500/20",
      },
    ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:shadow-2xl hover:scale-105"
        >
          <div className="flex justify-between items-center mb-4">
            <div className={`p-3 rounded-xl glass border border-primary-200/30 ${card.bgColor}`}>
              <card.icon
                className={`h-6 w-6 ${card.color}`}
              />
            </div>
            {card.change !== undefined && card.change !== 0 && (
              <div
                className={`flex items-center text-sm font-medium px-2 py-1 rounded-xl glass border border-primary-200/30 ${(card.change > 0 && !card.inverse) ||
                  (card.change < 0 && card.inverse)
                  ? "text-success-600 dark:text-success-400 bg-gradient-to-r from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20"
                  : "text-error-600 dark:text-error-400 bg-gradient-to-r from-error-50/30 to-error-100/30 dark:from-error-900/20 dark:to-error-800/20"
                  }`}
              >
                {card.change > 0 ? "+" : ""}
                {card.change.toFixed(1)}%
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">{card.title}</p>
            <p className="mt-1 text-2xl font-bold font-display gradient-text-primary">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              {period === "24h" && "Last 24 hours"}
              {period === "7d" && "Last 7 days"}
              {period === "30d" && "Last 30 days"}
              {period === "90d" && "Last 90 days"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
