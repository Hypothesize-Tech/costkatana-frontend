// src/components/optimization/OptimizationStats.tsx
import React from "react";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "../../utils/formatters";

interface OptimizationStatsProps {
  stats: {
    total: number;
    applied: number;
    totalSaved: number;
    avgImprovement: number;
    totalTokensSaved: number;
    applicationRate: number;
  };
}

export const OptimizationStats: React.FC<OptimizationStatsProps> = ({
  stats,
}) => {
  const cards = [
    {
      title: "Total Saved",
      value: formatCurrency(stats.totalSaved),
      icon: CurrencyDollarIcon,
      gradient: "bg-gradient-success",
      textGradient: "gradient-text-success",
      borderColor: "border-success-200/30",
      glowClass: "glow-success",
    },
    {
      title: "Tokens Saved",
      value: stats.totalTokensSaved.toLocaleString(),
      icon: ChartBarIcon,
      gradient: "bg-gradient-primary",
      textGradient: "gradient-text",
      borderColor: "border-primary-200/30",
      glowClass: "glow-primary",
    },
    {
      title: "Avg Improvement",
      value: `${stats.avgImprovement.toFixed(1)}%`,
      icon: ArrowTrendingUpIcon,
      gradient: "bg-gradient-secondary",
      textGradient: "gradient-text-secondary",
      borderColor: "border-secondary-200/30",
      glowClass: "glow-secondary",
    },
    {
      title: "Application Rate",
      value: `${stats.applicationRate.toFixed(0)}%`,
      icon: ClockIcon,
      gradient: "bg-gradient-accent",
      textGradient: "gradient-text-accent",
      borderColor: "border-accent-200/30",
      glowClass: "glow-accent",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`glass rounded-xl p-6 shadow-lg border ${card.borderColor} backdrop-blur-xl hover:scale-105 transition-all duration-300 hover:border-opacity-50`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${card.gradient} flex items-center justify-center ${card.glowClass}`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm mb-1">
                {card.title}
              </p>
              <p className={`text-2xl font-display font-bold ${card.textGradient}`}>
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
