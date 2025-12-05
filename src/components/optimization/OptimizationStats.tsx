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
      glowClass: "shadow-lg",
    },
    {
      title: "Tokens Saved",
      value: stats.totalTokensSaved.toLocaleString(),
      icon: ChartBarIcon,
      gradient: "bg-gradient-primary",
      textGradient: "gradient-text-primary",
      borderColor: "border-primary-200/30",
      glowClass: "shadow-lg",
    },
    {
      title: "Avg Improvement",
      value: `${stats.avgImprovement.toFixed(1)}%`,
      icon: ArrowTrendingUpIcon,
      gradient: "bg-gradient-secondary",
      textGradient: "gradient-text-secondary",
      borderColor: "border-secondary-200/30",
      glowClass: "shadow-lg",
    },
    {
      title: "Application Rate",
      value: `${stats.applicationRate.toFixed(0)}%`,
      icon: ClockIcon,
      gradient: "bg-gradient-accent",
      textGradient: "gradient-text-accent",
      borderColor: "border-accent-200/30",
      glowClass: "shadow-lg",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6 lg:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`glass rounded-lg p-3 shadow-lg border ${card.borderColor} backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-300 hover:border-opacity-50 sm:p-4 md:p-6 md:rounded-xl`}
        >
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className={`w-10 h-10 rounded-lg ${card.gradient} flex items-center justify-center ${card.glowClass} sm:w-11 sm:h-11 md:w-12 md:h-12 md:rounded-xl`}>
              <card.icon className="h-5 w-5 text-white sm:h-5.5 sm:w-5.5 md:h-6 md:w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-xs mb-0.5 sm:text-sm sm:mb-1">
                {card.title}
              </p>
              <p className={`text-lg font-display font-bold ${card.textGradient} truncate sm:text-xl md:text-2xl`}>
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
