import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    LightBulbIcon,
} from '@heroicons/react/24/outline';
import { trackerService } from '../services/tracker.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { CostTrendChart } from '../components/analytics/CostTrendChart';
import { ServiceAnalytics } from '../components/analytics/ServiceAnalytics';
import { ModelComparison } from '../components/analytics/ModelComparison';
import { InsightCard } from '../components/analytics/InsightCard';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { OptimizationSuggestion } from 'ai-cost-tracker/dist/types';

export const TrackerAnalytics: React.FC = () => {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const { data: analytics, isLoading, error } = useQuery(
        ['trackerAnalytics', dateRange],
        () => trackerService.getAnalytics({
            startDate: dateRange.start || undefined,
            endDate: dateRange.end || undefined,
        }),
        {
            enabled: !!dateRange.start && !!dateRange.end,
        }
    );

    const { data: suggestions } = useQuery(
        ['optimizationSuggestions', dateRange],
        () => trackerService.getOptimizationSuggestions({
            startDate: dateRange.start || undefined,
            endDate: dateRange.end || undefined,
        }),
        {
            enabled: !!dateRange.start && !!dateRange.end,
        }
    );

    useEffect(() => {
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
    
    if (isLoading) return <LoadingSpinner />;
    if (error) return <div>Error loading analytics</div>;

    const mappedServiceBreakdown = analytics?.data.costByProvider.map((s: any) => ({
        service: s.provider,
        cost: s.totalCost,
        calls: 0, 
        percentage: s.percentage,
    })) || [];

    const mappedModelBreakdown = analytics?.data.mostUsedModels.map((m: any) => ({
        model: m.model,
        cost: m.totalCost,
        calls: m.requestCount,
        avgTokens: m.averageTokensPerRequest,
        avgCost: m.averageCostPerRequest,
    })) || [];

    const mappedTimeSeries = analytics?.data.usageOverTime.map((d: any) => ({
        date: new Date(d.timestamp).toLocaleDateString(),
        cost: d.cost,
        tokens: d.tokens,
        calls: d.requests
    })) || [];

    return (
        <ErrorBoundary>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Tracker Analytics</h1>
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
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(analytics?.data.totalCost || 0)}
                                </p>
                            </div>
                            <CurrencyDollarIcon className="h-12 w-12 text-indigo-600 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Tokens</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatNumber(analytics?.data.totalTokens || 0)}
                                </p>
                            </div>
                            <ChartBarIcon className="h-12 w-12 text-green-600 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Tokens/Call</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatNumber(analytics?.data.averageTokensPerRequest || 0)}
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
                                    {analytics?.data.mostUsedModels.length || 0}
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
                        <CostTrendChart data={mappedTimeSeries} />
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4">Service Breakdown</h2>
                        <ServiceAnalytics data={mappedServiceBreakdown} />
                    </div>
                </div>

                {/* Model Comparison */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Model Performance</h2>
                    <ModelComparison data={mappedModelBreakdown} />
                </div>

                {/* AI-Powered Suggestions */}
                {suggestions?.data && suggestions.data.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4">Optimization Suggestions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {suggestions.data.map((suggestion: OptimizationSuggestion, index: number) => (
                                <InsightCard
                                    key={index}
                                    insight={{
                                        type: suggestion.type,
                                        title: suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1) + ' Suggestion',
                                        description: suggestion.explanation,
                                        recommendation: suggestion.implementation,
                                        impact: `${suggestion.estimatedSavings}% saving`
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
}; 