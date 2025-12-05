import React from "react";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  SparklesIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Building2, Bot, Calendar } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

interface ProfileStatsProps {
  stats: {
    totalSpent: number;
    totalSaved: number;
    apiCalls: number;
    optimizations: number;
    currentMonthSpent: number;
    currentMonthSaved: number;
    avgDailyCost: number;
    mostUsedService: string;
    mostUsedModel: string;
    accountAge: number; // days
  };
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  const cards = [
    {
      title: "Total Spent",
      value: formatCurrency(stats.totalSpent || 0),
      subValue: `${formatCurrency(stats.currentMonthSpent || 0)} this month`,
      icon: CurrencyDollarIcon,
      gradient: "bg-gradient-primary",
      textGradient: "gradient-text-primary",
      borderColor: "border-primary-200/30 dark:border-primary-700/30",
      glowClass: "shadow-lg",
    },
    {
      title: "Total Saved",
      value: formatCurrency(stats.totalSaved || 0),
      subValue: `${formatCurrency(stats.currentMonthSaved || 0)} this month`,
      icon: SparklesIcon,
      gradient: "bg-gradient-success",
      textGradient: "gradient-text-success",
      borderColor: "border-success-200/30 dark:border-success-700/30",
      glowClass: "shadow-lg",
    },
    {
      title: "API Calls",
      value: (stats.apiCalls || 0).toLocaleString(),
      subValue: `${stats.avgDailyCost ? formatCurrency(stats.avgDailyCost) : "$0"}/day avg`,
      icon: ChartBarIcon,
      gradient: "bg-gradient-secondary",
      textGradient: "gradient-text-secondary",
      borderColor: "border-secondary-200/30 dark:border-secondary-700/30",
      glowClass: "shadow-lg",
    },
    {
      title: "Optimizations",
      value: (stats.optimizations || 0).toLocaleString(),
      subValue: `${stats.totalSpent > 0 ? (((stats.totalSaved || 0) / stats.totalSpent) * 100).toFixed(1) : '0.0'}% savings rate`,
      icon: ClockIcon,
      gradient: "bg-gradient-accent",
      textGradient: "gradient-text-accent",
      borderColor: "border-accent-200/30 dark:border-accent-700/30",
      glowClass: "shadow-lg",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`glass rounded-xl shadow-lg border ${card.borderColor} backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-300 hover:border-opacity-50 p-4 sm:p-5 md:p-6`}
        >
          <div className="flex gap-3 sm:gap-4 items-center">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${card.gradient} flex items-center justify-center ${card.glowClass} flex-shrink-0`}>
              <card.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="mb-1 text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                {card.title}
              </p>
              <p className={`text-lg sm:text-xl md:text-2xl font-display font-bold ${card.textGradient} mb-1 truncate`}>
                {card.value}
              </p>
              <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary truncate">
                {card.subValue}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Additional Stats */}
      <div className="grid grid-cols-1 col-span-full gap-4 sm:gap-5 md:gap-6 mt-4 sm:mt-6 md:mt-8 sm:grid-cols-2 md:grid-cols-3">
        <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105">
          <div className="flex gap-2 sm:gap-3 items-center mb-2">
            <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-lg bg-gradient-primary flex-shrink-0">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <p className="text-sm sm:text-base font-semibold font-display gradient-text-primary">
              Most Used Service
            </p>
          </div>
          <p className="text-lg sm:text-xl font-bold capitalize font-display text-light-text-primary dark:text-dark-text-primary truncate">
            {stats.mostUsedService || "N/A"}
          </p>
        </div>
        <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-300 glass border-secondary-200/30 dark:border-secondary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105">
          <div className="flex gap-2 sm:gap-3 items-center mb-2">
            <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-lg bg-gradient-secondary flex-shrink-0">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <p className="text-sm sm:text-base font-semibold font-display gradient-text-secondary">
              Most Used Model
            </p>
          </div>
          <p className="text-lg sm:text-xl font-bold font-display text-light-text-primary dark:text-dark-text-primary truncate">
            {stats.mostUsedModel || "N/A"}
          </p>
        </div>
        <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-300 glass border-accent-200/30 dark:border-accent-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 sm:col-span-2 md:col-span-1">
          <div className="flex gap-2 sm:gap-3 items-center mb-2">
            <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-lg bg-gradient-accent flex-shrink-0">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <p className="text-sm sm:text-base font-semibold font-display gradient-text-accent">
              Account Age
            </p>
          </div>
          <p className="text-lg sm:text-xl font-bold font-display text-light-text-primary dark:text-dark-text-primary">
            {stats.accountAge || 0} days
          </p>
        </div>
      </div>
    </div>
  );
};
