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
      color: "bg-blue-500",
    },
    {
      title: "Total Saved",
      value: formatCurrency(stats.totalSaved || 0),
      subValue: `${formatCurrency(stats.currentMonthSaved || 0)} this month`,
      icon: SparklesIcon,
      color: "bg-green-500",
    },
    {
      title: "API Calls",
      value: (stats.apiCalls || 0).toLocaleString(),
      subValue: `${stats.avgDailyCost ? formatCurrency(stats.avgDailyCost) : "$0"}/day avg`,
      icon: ChartBarIcon,
      color: "bg-purple-500",
    },
    {
      title: "Optimizations",
      value: (stats.optimizations || 0).toLocaleString(),
      subValue: `${stats.totalSpent > 0 ? (((stats.totalSaved || 0) / stats.totalSpent) * 100).toFixed(1) : '0.0'}% savings rate`,
      icon: ClockIcon,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
              <card.icon
                className={`h-6 w-6 ${card.color.replace("bg-", "text-")}`}
              />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.subValue}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Additional Stats */}
      <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600">Most Used Service</p>
          <p className="text-lg font-semibold text-gray-900 capitalize">
            {stats.mostUsedService}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600">Most Used Model</p>
          <p className="text-lg font-semibold text-gray-900">
            {stats.mostUsedModel}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600">Account Age</p>
          <p className="text-lg font-semibold text-gray-900">
            {stats.accountAge} days
          </p>
        </div>
      </div>
    </div>
  );
};
