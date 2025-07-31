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
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Custom Properties</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Start using custom properties in your API calls to see analytics here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Property Selector */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Property Analytics</h3>
                    <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium text-gray-700">Group by:</label>
                        <select
                            value={selectedProperty}
                            onChange={(e) => setSelectedProperty(e.target.value)}
                            className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <HashtagIcon className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Unique Values</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {analytics.summary.uniqueValues}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Cost</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(analytics.summary.totalCost)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <HashtagIcon className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Tokens</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatNumber(analytics.summary.totalTokens)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ClockIcon className="h-8 w-8 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Requests</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatNumber(analytics.summary.totalRequests)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Breakdown by {selectedProperty}
                            </h3>
                        </div>
                        <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {selectedProperty}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Requests
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Cost
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avg Cost
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Tokens
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avg Response Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cost Share
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {analyticsLoading ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                                Loading analytics...
                                            </td>
                                        </tr>
                                    ) : (
                                        analytics.data.map((item, index) => {
                                            const costShare = analytics.summary.totalCost > 0
                                                ? (item.totalCost / analytics.summary.totalCost) * 100
                                                : 0;

                                            return (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {renderPropertyValue(selectedProperty, item.propertyValue)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatNumber(item.totalRequests)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {formatCurrency(item.totalCost)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(item.averageCost)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatNumber(item.totalTokens)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.averageResponseTime}ms
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full"
                                                                    style={{ width: `${costShare}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm text-gray-900">
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