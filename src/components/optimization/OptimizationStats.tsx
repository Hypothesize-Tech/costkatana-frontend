// src/components/optimization/OptimizationStats.tsx
import React from 'react';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    CurrencyDollarIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/formatters';

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

export const OptimizationStats: React.FC<OptimizationStatsProps> = ({ stats }) => {
    const cards = [
        {
            title: 'Total Saved',
            value: formatCurrency(stats.totalSaved),
            icon: CurrencyDollarIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Tokens Saved',
            value: stats.totalTokensSaved.toLocaleString(),
            icon: ChartBarIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Avg Improvement',
            value: `${stats.avgImprovement.toFixed(1)}%`,
            icon: ArrowTrendingUpIcon,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Application Rate',
            value: `${stats.applicationRate.toFixed(0)}%`,
            icon: ClockIcon,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                >
                    <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${card.bgColor}`}>
                            <card.icon className={`h-6 w-6 ${card.color}`} />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">{card.title}</p>
                            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};