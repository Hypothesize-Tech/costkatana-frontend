// src/components/usage/UsageStats.tsx
import React from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/formatters';


export const UsageStats: React.FC<{ stats: { totalCost: number, costTrend: number, totalCalls: number, callsTrend: number, avgResponseTime: number, responseTrend: number, totalTokens: number, tokensTrend: number }, period: string }> = ({ stats, period }) => {
  const cards: { title: string, value: string, change: number, icon: React.ElementType, color: string, bgColor: string, inverse?: boolean }[] = [
    {
      title: 'Total Cost',
      value: formatCurrency(stats.totalCost),       
      change: stats.costTrend,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
    },
    {
      title: 'API Calls',
      value: stats.totalCalls.toLocaleString(),
      change: stats.callsTrend,
      icon: ChartBarIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Avg Response Time',
      value: `${stats.avgResponseTime}ms`,
      change: stats.responseTrend,
      icon: ClockIcon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      inverse: true, // Lower is better
    },
    {
      title: 'Tokens Used',
      value: stats.totalTokens.toLocaleString(),
      change: stats.tokensTrend,
      icon: SparklesIcon,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-6 w-6 ${card.color.replace('bg-', 'text-')}`} />
            </div>
            {card.change !== undefined && card.change !== 0 && (
              <div
                className={`flex items-center text-sm ${
                  (card.change > 0 && !card.inverse) || (card.change < 0 && card.inverse)
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {card.change > 0 ? '+' : ''}
                {card.change.toFixed(1)}%
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{card.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">
              {period === '24h' && 'Last 24 hours'}
              {period === '7d' && 'Last 7 days'}
              {period === '30d' && 'Last 30 days'}
              {period === '90d' && 'Last 90 days'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};