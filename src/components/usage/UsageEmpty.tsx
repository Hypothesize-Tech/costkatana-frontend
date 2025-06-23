// src/components/usage/UsageEmpty.tsx
import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface UsageEmptyProps {
    onImport?: () => void;
    hasFilters?: boolean;
    onClearFilters?: () => void;
}

export const UsageEmpty: React.FC<UsageEmptyProps> = ({
    onImport,
    hasFilters = false,
    onClearFilters
}) => {
    if (hasFilters) {
        return (
            <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your filters or search query
                </p>
                {onClearFilters && (
                    <div className="mt-6">
                        <button
                            onClick={onClearFilters}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No usage data yet</h3>
            <p className="mt-1 text-sm text-gray-500">
                Get started by tracking your AI API usage
            </p>
            <div className="mt-6 space-y-4">
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Start:</h4>
                    <ol className="text-sm text-gray-600 space-y-2 text-left inline-block">
                        <li>1. Add your API keys in Settings</li>
                        <li>2. Install our SDK or browser extension</li>
                        <li>3. Make API calls - usage will be tracked automatically</li>
                    </ol>
                </div>

                {onImport && (
                    <div>
                        <p className="text-sm text-gray-500 mb-3">Or import existing usage data:</p>
                        <button
                            onClick={onImport}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Import Usage Data
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};