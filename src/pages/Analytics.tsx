// src/pages/Analytics.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    CalendarIcon,
    CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { analyticsService } from '../services/analytics.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { CostTrendChart } from '../components/analytics/CostTrendChart';
import { ServiceAnalytics } from '../components/analytics/ServiceAnalytics';
import { ModelComparison } from '../components/analytics/ModelComparison';
import { InsightCard } from '../components/analytics/InsightCard';
import { formatCurrency } from '../utils/formatters';

export const Analytics: React.FC = () => {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [comparison, setComparison] = useState(false);

    const { data: analytics, isLoading, error } = useQuery(
        ['analytics', dateRange],
        () => analyticsService.getAnalytics({
            startDate: dateRange.start || undefined,
            endDate: dateRange.end || undefined,
        }),
        {
            refetchInterval: 60000, // Refresh every minute
        }
    );

    useEffect(() => {
        // Set default date range to last 30 days
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0],
        });
    }, []);

    const handleDateChange = (type: 'start' | 'end', value: string) => {
        setDateRange({ ...dateRange, [type]: value });
    };

    const handleExport = async () => {
        try {
            const blob = await analyticsService.exportAnalytics({
                startDate: dateRange.start,
                endDate: dateRange.end,
                format: 'csv',
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-${new Date().toISOString()}.csv`;
            a.click();
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div>Error loading analytics</div>;

    return (
        <ErrorBoundary>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics</h1>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-5 w-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => handleDateChange('start', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => handleDateChange('end', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setComparison(!comparison)}
                                className={`px-4 py-2 rounded-md ${comparison
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300'
                                    }`}
                            >
                                Compare Periods
                            </button>
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Export Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(analytics?.data.summary.totalCost || 0)}
                                </p>
                            </div>
                            <CurrencyDollarIcon className="h-12 w-12 text-indigo-600 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Calls</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {analytics?.data.summary.totalCalls.toLocaleString() || 0}
                                </p>
                            </div>
                            <ChartBarIcon className="h-12 w-12 text-green-600 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Cost/Call</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(analytics?.data.summary.avgCost || 0)}
                                </p>
                            </div>
                            <ArrowTrendingUpIcon className="h-12 w-12 text-blue-600 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Unique Models</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {analytics?.data.modelBreakdown.length || 0}
                                </p>
                            </div>
                            <div className="h-12 w-12 text-purple-600 opacity-20">
                                <svg fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h2a1 1 0 100-2H6V7h4a1 1 0 100-2H6zm5 0a1 1 0 10-2 0v8a1 1 0 102 0V5zm5 0a1 1 0 10-2 0v8a1 1 0 102 0V5z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4">Cost Trend</h2>
                        <CostTrendChart data={analytics?.data.timeSeries || []} />
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4">Service Breakdown</h2>
                        <ServiceAnalytics data={analytics?.data.serviceBreakdown.map(s => ({
                            service: s.service,
                            cost: s.totalCost,
                            calls: s.totalCalls,
                            percentage: s.percentageChange,
                        })) || []} />
                    </div>
                </div>

                {/* Model Comparison */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Model Performance</h2>
                    <ModelComparison data={analytics?.data.modelBreakdown.map(m => ({
                        model: m.model,
                        cost: m.totalCost,
                        calls: m.totalCalls,
                        avgTokens: m.avgTokens,
                        avgCost: m.avgCost,
                    })) || []} />
                </div>

                {/* AI Insights */}
                {analytics?.data.trends.insights && analytics.data.trends.insights.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4">AI Insights</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {analytics.data.trends.insights.map((insight, index) => (
                                <InsightCard
                                    key={index}
                                    insight={{
                                        type: 'trend',
                                        title: 'Insight',
                                        description: insight,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Top Prompts */}
                {analytics?.data.topPrompts && analytics.data.topPrompts.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4">Top Prompts</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Prompt
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Count
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Cost
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avg Tokens
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {analytics.data.topPrompts.map((prompt, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="truncate max-w-xs" title={prompt.prompt}>
                                                    {prompt.prompt}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {prompt.totalCalls}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(prompt.totalCost)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {prompt.avgTokens ?? prompt.avgCost}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};