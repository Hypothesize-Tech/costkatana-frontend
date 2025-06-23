// src/components/optimization/BulkOptimizer.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { optimizationService } from '../../services/optimization.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useNotification } from '../../contexts/NotificationContext';

export const BulkOptimizer: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        service: '',
        minCalls: 5,
        timeframe: '7d',
    });

    const { showNotification } = useNotification();

    const bulkOptimizeMutation = useMutation(
        () => optimizationService.bulkOptimize({
            service: filters.service || undefined,
            minCalls: filters.minCalls,
            timeframe: filters.timeframe,
        }),
        {
            onSuccess: (result) => {
                showNotification(
                    `Successfully analyzed ${result.data.total} prompts. ${result.data.successful} optimizations created.`,
                    'success'
                );
                setIsOpen(false);
            },
            onError: () => {
                showNotification('Bulk optimization failed', 'error');
            },
        }
    );

    const handleOptimize = () => {
        bulkOptimizeMutation.mutate();
    };

    return (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold flex items-center">
                        <RocketLaunchIcon className="h-6 w-6 mr-2" />
                        Bulk Optimization
                    </h3>
                    <p className="mt-1 text-indigo-100">
                        Automatically analyze and optimize your most frequently used prompts
                    </p>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-indigo-50 font-medium"
                >
                    {isOpen ? 'Cancel' : 'Start Analysis'}
                </button>
            </div>

            {isOpen && (
                <div className="mt-6 bg-white/10 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-indigo-100">
                                Service (Optional)
                            </label>
                            <select
                                value={filters.service}
                                onChange={(e) => setFilters({ ...filters, service: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white"
                            >
                                <option value="">All Services</option>
                                <option value="openai">OpenAI</option>
                                <option value="anthropic">Anthropic</option>
                                <option value="google">Google AI</option>
                                <option value="aws-bedrock">AWS Bedrock</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-indigo-100">
                                Minimum Calls
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={filters.minCalls}
                                onChange={(e) => setFilters({ ...filters, minCalls: parseInt(e.target.value) })}
                                className="mt-1 block w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-indigo-100">
                                Timeframe
                            </label>
                            <select
                                value={filters.timeframe}
                                onChange={(e) => setFilters({ ...filters, timeframe: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white"
                            >
                                <option value="1d">Last 24 hours</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="all">All time</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleOptimize}
                            disabled={bulkOptimizeMutation.isLoading}
                            className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-indigo-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {bulkOptimizeMutation.isLoading ? (
                                <>
                                    <LoadingSpinner size="small" className="mr-2" />
                                    Analyzing...
                                </>
                            ) : (
                                'Analyze & Optimize'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};