import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChartBarIcon, CurrencyDollarIcon, ClockIcon, HashtagIcon } from '@heroicons/react/24/outline';
import { usageService } from '@/services/usage.service';
import { useProject } from '@/contexts/ProjectContext';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface PropertyAnalyticsProps {
    dateRange?: {
        startDate?: string;
        endDate?: string;
    };
}

function renderPropertyValue(property: string, value: any) {
    // For tags, join with comma if it's an array
    if (property === 'tags' && Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : '(empty)';
    }
    // For costAllocation, show key-value pairs
    if (property === 'costAllocation' && typeof value === 'object' && value !== null) {
        return Object.entries(value)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
    }
    // For metadata, show JSON stringified (shortened)
    if (property === 'metadata' && typeof value === 'object' && value !== null) {
        return JSON.stringify(value, null, 0);
    }
    // For other arrays, join with comma
    if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : '(empty)';
    }
    // For objects, show JSON string
    if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
    }
    // Fallback
    return value || '(empty)';
}

export const PropertyAnalytics: React.FC<PropertyAnalyticsProps> = ({ dateRange }) => {
    const [selectedProperty, setSelectedProperty] = useState<string>('');
    const [availableProperties, setAvailableProperties] = useState<Array<{
        property: string;
        count: number;
        sampleValues: any[];
    }>>([]);
    const { selectedProject } = useProject();

    // Load available properties
    const { data: properties } = useQuery({
        queryKey: ['available-properties', selectedProject, dateRange],
        queryFn: () => usageService.getAvailableProperties({
            projectId: selectedProject !== 'all' ? selectedProject : undefined,
            startDate: dateRange?.startDate,
            endDate: dateRange?.endDate,
        }),
        enabled: true,
    });

    // Load analytics for selected property
    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['property-analytics', selectedProperty, selectedProject, dateRange],
        queryFn: () => usageService.getPropertyAnalytics({
            groupBy: selectedProperty,
            projectId: selectedProject !== 'all' ? selectedProject : undefined,
            startDate: dateRange?.startDate,
            endDate: dateRange?.endDate,
        }),
        enabled: !!selectedProperty,
    });

    useEffect(() => {
        if (properties && properties.length > 0) {
            setAvailableProperties(properties);
            if (!selectedProperty) {
                setSelectedProperty(properties[0].property);
            }
        }
    }, [properties, selectedProperty]);

    if (!availableProperties.length) {
        return (
            <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
                <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-2xl glow-primary animate-pulse">
                        <ChartBarIcon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-display font-bold gradient-text mb-2">No Custom Properties</h3>
                    <p className="text-lg font-body text-light-text-secondary dark:text-dark-text-secondary">
                        Start using custom properties in your API calls to see analytics here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Property Selector */}
            <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg glow-primary">
                            <ChartBarIcon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-display font-bold gradient-text">Property Analytics</h3>
                    </div>
                    <div className="flex items-center space-x-4">
                        <label className="label">Group by:</label>
                        <select
                            value={selectedProperty}
                            onChange={(e) => setSelectedProperty(e.target.value)}
                            className="input"
                        >
                            {availableProperties.map((prop) => (
                                <option key={prop.property} value={prop.property}>
                                    {prop.property} ({prop.count} uses)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Analytics Summary */}
            {analytics && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="card card-hover p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 border-primary-200/30">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                                    <HashtagIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Unique Values</p>
                                    <p className="text-3xl font-display font-bold gradient-text">
                                        {analytics.summary.uniqueValues}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card card-hover p-6 bg-gradient-to-br from-success-50/50 to-success-100/50 border-success-200/30">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
                                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Total Cost</p>
                                    <p className="text-3xl font-display font-bold gradient-text-success">
                                        {formatCurrency(analytics.summary.totalCost)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card card-hover p-6 bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 border-secondary-200/30">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-lg">
                                    <HashtagIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Total Tokens</p>
                                    <p className="text-3xl font-display font-bold text-secondary-600 dark:text-secondary-400">
                                        {formatNumber(analytics.summary.totalTokens)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card card-hover p-6 bg-gradient-to-br from-accent-50/50 to-accent-100/50 border-accent-200/30">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center shadow-lg">
                                    <ClockIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Total Requests</p>
                                    <p className="text-3xl font-display font-bold gradient-text-accent">
                                        {formatNumber(analytics.summary.totalRequests)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="card card-gradient shadow-2xl backdrop-blur-xl">
                        <div className="px-8 py-6 border-b border-primary-200/30">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center mr-3 shadow-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-display font-bold gradient-text">
                                    Breakdown by {selectedProperty}
                                </h3>
                            </div>
                        </div>
                        <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-primary-200/20">
                                <thead className="glass bg-gradient-to-r from-primary-50/30 to-secondary-50/30">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-display font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                                            {selectedProperty}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-display font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                                            Requests
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-display font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                                            Total Cost
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-display font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                                            Avg Cost
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-display font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                                            Total Tokens
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-display font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                                            Avg Response Time
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-display font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                                            Cost Share
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary-200/20">
                                    {analyticsLoading ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center">
                                                <div className="flex justify-center items-center space-x-2">
                                                    <div className="spinner w-5 h-5"></div>
                                                    <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Loading analytics...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        analytics.data.map((item, index) => {
                                            const costShare = analytics.summary.totalCost > 0
                                                ? (item.totalCost / analytics.summary.totalCost) * 100
                                                : 0;

                                            return (
                                                <tr key={index} className="hover:bg-primary-500/5 transition-colors duration-200">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                            {renderPropertyValue(selectedProperty, item.propertyValue)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                                        {formatNumber(item.totalRequests)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-bold gradient-text">
                                                            {formatCurrency(item.totalCost)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                                        {formatCurrency(item.averageCost)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                                        {formatNumber(item.totalTokens)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                                        {item.averageResponseTime}ms
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-1 bg-primary-200/30 rounded-full h-3 mr-3">
                                                                <div
                                                                    className="progress-bar h-3"
                                                                    style={{ width: `${costShare}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-display font-bold gradient-text min-w-[3rem]">
                                                                {costShare.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};