// src/components/optimization/BulkOptimizer.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { optimizationService } from '../../services/optimization.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useNotification } from '../../contexts/NotificationContext';

interface OptimizablePrompt {
    prompt: string;
    count: number;
    promptId: string;
}

export const BulkOptimizer: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        service: '',
        minCalls: 5,
        timeframe: '7d',
    });
    const [prompts, setPrompts] = useState<OptimizablePrompt[]>([]);
    const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);

    const { showNotification } = useNotification();
    const queryClient = useQueryClient();

    const fetchPromptsMutation = useMutation({
        mutationFn: () => optimizationService.getPromptsForBulkOptimization(filters),
        onSuccess: (result) => {
            if (result.length === 0) {
                showNotification('No prompts found matching the criteria.', 'info');
            }
            setPrompts(result);
            setSelectedPrompts(result.map((p: any) => p.promptId)); // auto-select all
        },
        onError: () => {
            showNotification('Failed to fetch prompts for optimization.', 'error');
        }
    });

    const bulkOptimizeMutation = useMutation({
        mutationFn: (promptIds: string[]) => optimizationService.bulkOptimize({ promptIds }),
        onSuccess: (result) => {
            showNotification(
                `Successfully optimized ${result.successful} out of ${result.total} prompts.`,
                'success'
            );
            setIsOpen(false);
            setPrompts([]);
            setSelectedPrompts([]);
            queryClient.invalidateQueries({ queryKey: ['optimizations'] });
        },
        onError: () => {
            showNotification('Bulk optimization failed', 'error');
        },
    });

    const handleFetchPrompts = () => {
        fetchPromptsMutation.mutate();
    };

    const handleOptimize = () => {
        if (selectedPrompts.length === 0) {
            showNotification('Please select at least one prompt to optimize.', 'warning');
            return;
        }
        bulkOptimizeMutation.mutate(selectedPrompts);
    };

    const handleSelectPrompt = (promptId: string) => {
        setSelectedPrompts(prev =>
            prev.includes(promptId)
                ? prev.filter(id => id !== promptId)
                : [...prev, promptId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedPrompts(prompts.map(p => p.promptId));
        } else {
            setSelectedPrompts([]);
        }
    };

    return (
        <div className="p-6 text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="flex items-center text-xl font-semibold">
                        <RocketLaunchIcon className="mr-2 w-6 h-6" />
                        Bulk Optimization
                    </h3>
                    <p className="mt-1 text-indigo-100">
                        Automatically analyze and optimize your most frequently used prompts
                    </p>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-4 py-2 font-medium text-indigo-600 bg-white rounded-md hover:bg-indigo-50"
                >
                    {isOpen ? 'Cancel' : 'Start Analysis'}
                </button>
            </div>

            {isOpen && (
                <div className="p-4 mt-6 rounded-lg bg-white/10">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-indigo-100">
                                Service (Optional)
                            </label>
                            <select
                                value={filters.service}
                                onChange={(e) => setFilters({ ...filters, service: e.target.value })}
                                className="block px-3 py-2 mt-1 w-full placeholder-indigo-200 text-white rounded-md border bg-white/20 border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
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
                                onChange={(e) => setFilters({ ...filters, minCalls: parseInt(e.target.value) || 1 })}
                                className="block px-3 py-2 mt-1 w-full placeholder-indigo-200 text-white rounded-md border bg-white/20 border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-indigo-100">
                                Timeframe
                            </label>
                            <select
                                value={filters.timeframe}
                                onChange={(e) => setFilters({ ...filters, timeframe: e.target.value })}
                                className="block px-3 py-2 mt-1 w-full placeholder-indigo-200 text-white rounded-md border bg-white/20 border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                            >
                                <option value="1d">Last 24 hours</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="all">All time</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleFetchPrompts}
                            disabled={fetchPromptsMutation.isLoading}
                            className="inline-flex items-center px-4 py-2 font-medium text-indigo-600 bg-white rounded-md hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {fetchPromptsMutation.isLoading ? (
                                <>
                                    <LoadingSpinner size="small" className="mr-2" />
                                    Analyzing...
                                </>
                            ) : (
                                'Find Prompts'
                            )}
                        </button>
                    </div>

                    {prompts.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-lg font-medium text-white">Select prompts to optimize</h4>
                            <div className="overflow-y-auto pr-2 mt-4 max-h-60">
                                <div className="flex items-center p-2 mb-2 rounded-md bg-white/20">
                                    <input
                                        type="checkbox"
                                        id="select-all"
                                        checked={selectedPrompts.length === prompts.length}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="select-all" className="ml-3 text-sm font-medium text-white">Select All ({selectedPrompts.length} / {prompts.length})</label>
                                </div>
                                {prompts.map(p => (
                                    <div key={p.promptId} className="flex justify-between items-start p-2 rounded-md hover:bg-white/20">
                                        <div className="flex items-start">
                                            <input
                                                type="checkbox"
                                                id={p.promptId}
                                                checked={selectedPrompts.includes(p.promptId)}
                                                onChange={() => handleSelectPrompt(p.promptId)}
                                                className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                            />
                                            <label htmlFor={p.promptId} className="ml-3 text-sm text-white">
                                                <span className="font-medium">Count: {p.count}</span>
                                                <p className="w-full max-w-lg text-indigo-100 truncate">{p.prompt}</p>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={handleOptimize}
                                    disabled={bulkOptimizeMutation.isLoading || selectedPrompts.length === 0}
                                    className="inline-flex items-center px-4 py-2 font-medium text-indigo-600 bg-white rounded-md hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {bulkOptimizeMutation.isLoading ? (
                                        <>
                                            <LoadingSpinner size="small" className="mr-2" />
                                            Optimizing...
                                        </>
                                    ) : (
                                        `Optimize ${selectedPrompts.length} Selected`
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};