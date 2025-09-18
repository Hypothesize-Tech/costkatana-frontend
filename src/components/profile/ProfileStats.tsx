// src/components/profile/ProfileStats.tsx
import React from "react";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  SparklesIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
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
      borderColor: "border-primary-200/30",
      glowClass: "shadow-lg",
    },
    {
      title: "Total Saved",
      value: formatCurrency(stats.totalSaved || 0),
      subValue: `${formatCurrency(stats.currentMonthSaved || 0)} this month`,
      icon: SparklesIcon,
      gradient: "bg-gradient-success",
      textGradient: "gradient-text-success",
      borderColor: "border-success-200/30",
      glowClass: "shadow-lg",
    },
    {
      title: "API Calls",
      value: (stats.apiCalls || 0).toLocaleString(),
      subValue: `${stats.avgDailyCost ? formatCurrency(stats.avgDailyCost) : "$0"}/day avg`,
      icon: ChartBarIcon,
      gradient: "bg-gradient-secondary",
      textGradient: "gradient-text-secondary",
      borderColor: "border-secondary-200/30",
      glowClass: "shadow-lg",
    },
    {
      title: "Optimizations",
      value: (stats.optimizations || 0).toLocaleString(),
      subValue: `${stats.totalSpent > 0 ? (((stats.totalSaved || 0) / stats.totalSpent) * 100).toFixed(1) : '0.0'}% savings rate`,
      icon: ClockIcon,
      gradient: "bg-gradient-accent",
      textGradient: "gradient-text-accent",
      borderColor: "border-accent-200/30",
      glowClass: "shadow-lg",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`glass rounded-xl shadow-lg border ${card.borderColor} backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-300 hover:border-opacity-50 p-6`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${card.gradient} flex items-center justify-center ${card.glowClass}`}>
              <card.icon className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm mb-1">
                {card.title}
              </p>
              <p className={`text-2xl font-display font-bold ${card.textGradient} mb-1`}>
                {card.value}
              </p>
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-xs">
                {card.subValue}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Additional Stats */}
      <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-white text-sm">🏢</span>
            </div>
            <p className="font-display font-semibold gradient-text-primary">Most Used Service</p>
          </div>
          <p className="text-xl font-display font-bold text-light-text-primary dark:text-dark-text-primary capitalize">
            {stats.mostUsedService || 'N/A'}
          </p>
        </div>
        <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
              <span className="text-white text-sm">🤖</span>
            </div>
            <p className="font-display font-semibold gradient-text-secondary">Most Used Model</p>
          </div>
          <p className="text-xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
            {stats.mostUsedModel || 'N/A'}
          </p>
        </div>
        <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
              <span className="text-white text-sm">📅</span>
            </div>
            <p className="font-display font-semibold gradient-text-accent">Account Age</p>
          </div>
          <p className="text-xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
            {stats.accountAge || 0} days
          </p>
        </div>
      </div>
    </div>
  );
};
