import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChartBarIcon, CurrencyDollarIcon, ClockIcon, HashtagIcon, TableCellsIcon } from '@heroicons/react/24/outline';
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
            <div className="glass backdrop-blur-xl rounded-xl p-6 border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 glow-primary shadow-lg">
                        <ChartBarIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-display font-bold gradient-text-primary mb-2">No Custom Properties</h3>
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                        Start using custom properties in your API calls to see analytics here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Property Selector */}
            <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl glow-primary shadow-lg">
                            <ChartBarIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-display font-bold gradient-text-primary">Property Analytics</h3>
                            <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                                Analyze usage by custom properties
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Group by:</label>
                        <select
                            value={selectedProperty}
                            onChange={(e) => setSelectedProperty(e.target.value)}
                            className="input text-xs py-2 px-3 min-w-[200px] bg-white/80 dark:bg-gray-800/80 border-primary-200/30"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-lg glow-primary shadow-lg shrink-0">
                                    <HashtagIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">Unique Values</p>
                                    <p className="text-xl font-display font-bold gradient-text-primary truncate">
                                        {analytics.summary.uniqueValues}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-success-500 to-success-600 p-2.5 rounded-lg glow-success shadow-lg shrink-0">
                                    <CurrencyDollarIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">Total Cost</p>
                                    <p className="text-xl font-display font-bold gradient-text-success truncate">
                                        {formatCurrency(analytics.summary.totalCost)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 p-2.5 rounded-lg shadow-lg shrink-0">
                                    <HashtagIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">Total Tokens</p>
                                    <p className="text-xl font-display font-bold text-secondary-600 dark:text-secondary-400 truncate">
                                        {formatNumber(analytics.summary.totalTokens)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-accent-500 to-accent-600 p-2.5 rounded-lg glow-accent shadow-lg shrink-0">
                                    <ClockIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">Total Requests</p>
                                    <p className="text-xl font-display font-bold gradient-text-accent truncate">
                                        {formatNumber(analytics.summary.totalRequests)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
                        <div className="px-5 py-4 border-b border-primary-200/30">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-lg glow-primary shadow-lg">
                                    <TableCellsIcon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-display font-bold gradient-text-primary">
                                        Breakdown by {selectedProperty}
                                    </h3>
                                    <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                                        Detailed analytics by property value
                                    </p>
                                </div>
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