
import React, { useState } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface UsageFilterProps {
    onFilterChange: (filters: any) => void;
    services: string[];
    models: string[];
}

export const UsageFilter: React.FC<UsageFilterProps> = ({
    onFilterChange,
    services,
    models,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        service: '',
        model: '',
        dateRange: '7d',
        minCost: '',
        maxCost: '',
    });

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
    };

    const applyFilters = () => {
        onFilterChange(filters);
        setIsOpen(false);
    };

    const resetFilters = () => {
        const defaultFilters = {
            service: '',
            model: '',
            dateRange: '7d',
            minCost: '',
            maxCost: '',
        };
        setFilters(defaultFilters);
        onFilterChange(defaultFilters);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-6 z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Filter Usage</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Service
                            </label>
                            <select
                                value={filters.service}
                                onChange={(e) => handleFilterChange('service', e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="">All Services</option>
                                {services.map((service) => (
                                    <option key={service} value={service}>
                                        {service}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Model
                            </label>
                            <select
                                value={filters.model}
                                onChange={(e) => handleFilterChange('model', e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="">All Models</option>
                                {models.map((model) => (
                                    <option key={model} value={model}>
                                        {model}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Date Range
                            </label>
                            <select
                                value={filters.dateRange}
                                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="1d">Last 24 hours</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Min Cost ($)
                                </label>
                                <input
                                    type="number"
                                    value={filters.minCost}
                                    onChange={(e) => handleFilterChange('minCost', e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    placeholder="0.00"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Max Cost ($)
                                </label>
                                <input
                                    type="number"
                                    value={filters.maxCost}
                                    onChange={(e) => handleFilterChange('maxCost', e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    placeholder="100.00"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Reset
                            </button>
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};