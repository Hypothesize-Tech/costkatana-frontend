// src/components/alerts/AlertFilter.tsx
import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface AlertFilterProps {
    filters: {
        type: string;
        severity: string;
        read: string;
    };
    onFilterChange: (key: string, value: string) => void;
    onReset: () => void;
}

export const AlertFilter: React.FC<AlertFilterProps> = ({
    filters,
    onFilterChange,
    onReset,
}) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
                <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                    </label>
                    <select
                        value={filters.type}
                        onChange={(e) => onFilterChange('type', e.target.value)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">All Types</option>
                        <option value="cost_alert">Cost Alert</option>
                        <option value="optimization_available">Optimization Available</option>
                        <option value="anomaly_detected">Anomaly Detected</option>
                        <option value="usage_limit">Usage Limit</option>
                        <option value="system">System</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Severity
                    </label>
                    <select
                        value={filters.severity}
                        onChange={(e) => onFilterChange('severity', e.target.value)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        value={filters.read}
                        onChange={(e) => onFilterChange('read', e.target.value)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">All</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                    </select>
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <button
                    onClick={onReset}
                    className="text-sm text-gray-600 hover:text-gray-900"
                >
                    Reset filters
                </button>
            </div>
        </div>
    );
};