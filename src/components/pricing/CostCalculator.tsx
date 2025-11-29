import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    pricingService,
    ModelComparisonRow,
    ComparisonTableResponse,
    CostCalculationResult
} from '@/services/pricing.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import {
    CalculatorIcon,
    ArrowDownTrayIcon,
    TrophyIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

interface CostCalculatorProps {
    taskType?: 'chat' | 'code' | 'vision' | 'all';
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({ taskType = 'all' }) => {
    const [inputTokens, setInputTokens] = useState<number>(1000);
    const [outputTokens, setOutputTokens] = useState<number>(500);
    const [selectedTaskType, setSelectedTaskType] = useState<'chat' | 'code' | 'vision' | 'all'>(taskType);
    const [outputRatio, setOutputRatio] = useState<'auto' | 'custom'>('auto');

    const { data, isLoading, error } = useQuery<ComparisonTableResponse>({
        queryKey: ['modelComparisonTable', 'all'], // Get all models for calculator
        queryFn: async () => {
            const result = await pricingService.getModelComparisonTable('all');
            if (result.success && result.data) {
                return result.data;
            }
            throw new Error(result.error || 'Failed to fetch models');
        },
        staleTime: 5 * 60 * 1000,
    });

    // Calculate costs for all models
    const costResults = useMemo(() => {
        if (!data?.models || inputTokens <= 0) return [];

        const calculatedOutput = outputRatio === 'auto'
            ? Math.round(inputTokens * 0.5) // Default 50% output ratio
            : outputTokens;

        return pricingService.calculateCostForModels(
            data.models,
            inputTokens,
            calculatedOutput,
            selectedTaskType !== 'all' ? selectedTaskType : undefined
        );
    }, [data?.models, inputTokens, outputTokens, outputRatio, selectedTaskType]);

    const cheapestModel = costResults[0];
    const mostExpensiveModel = costResults[costResults.length - 1];

    const handleExport = () => {
        const csv = [
            ['Model', 'Provider', 'Input Tokens', 'Output Tokens', 'Input Cost', 'Output Cost', 'Total Cost'],
            ...costResults.map(result => [
                result.modelName,
                result.provider,
                result.inputTokens.toString(),
                result.outputTokens.toString(),
                `$${result.inputCost.toFixed(6)}`,
                `$${result.outputCost.toFixed(6)}`,
                `$${result.totalCost.toFixed(6)}`
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cost-calculation-${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <div className="mb-4 text-red-600">
                    <p className="text-lg font-semibold">Failed to load models</p>
                    <p className="mt-2 text-sm text-gray-600">
                        {error instanceof Error ? error.message : 'An error occurred'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <div className="p-4 sm:p-6 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg">
                        <CalculatorIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold font-display gradient-text-primary">
                            Cost Calculator
                        </h2>
                        <p className="text-sm text-secondary-600 dark:text-secondary-300">
                            Calculate costs across all models for your token usage
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Input Tokens */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                            Input Tokens
                        </label>
                        <input
                            type="number"
                            value={inputTokens}
                            onChange={(e) => setInputTokens(Math.max(0, parseInt(e.target.value) || 0))}
                            min="0"
                            className="w-full px-4 py-2.5 rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                            placeholder="1000"
                        />
                    </div>

                    {/* Output Ratio Mode */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                            Output Mode
                        </label>
                        <select
                            value={outputRatio}
                            onChange={(e) => setOutputRatio(e.target.value as 'auto' | 'custom')}
                            className="w-full px-4 py-2.5 rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        >
                            <option value="auto">Auto (50% of input)</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    {/* Output Tokens (if custom) */}
                    {outputRatio === 'custom' && (
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                                Output Tokens
                            </label>
                            <input
                                type="number"
                                value={outputTokens}
                                onChange={(e) => setOutputTokens(Math.max(0, parseInt(e.target.value) || 0))}
                                min="0"
                                className="w-full px-4 py-2.5 rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                placeholder="500"
                            />
                        </div>
                    )}

                    {/* Task Type Filter */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                            Task Type Filter
                        </label>
                        <select
                            value={selectedTaskType}
                            onChange={(e) => setSelectedTaskType(e.target.value as any)}
                            className="w-full px-4 py-2.5 rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        >
                            <option value="all">All Task Types</option>
                            <option value="chat">Chat</option>
                            <option value="code">Code</option>
                            <option value="vision">Vision</option>
                        </select>
                    </div>
                </div>

                {/* Summary Stats */}
                {costResults.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
                        <div className="p-4 rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-900/20 dark:to-emerald-800/10">
                            <div className="flex items-center gap-2 mb-2">
                                <TrophyIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                                    Cheapest
                                </span>
                            </div>
                            <p className="text-lg font-bold text-secondary-900 dark:text-white">
                                {cheapestModel?.modelName}
                            </p>
                            <p className="text-2xl font-bold gradient-text-primary">
                                {cheapestModel ? pricingService.formatPrice(cheapestModel.totalCost) : '$0.00'}
                            </p>
                        </div>

                        <div className="p-4 rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-br from-red-50/50 to-red-100/30 dark:from-red-900/20 dark:to-red-800/10">
                            <div className="flex items-center gap-2 mb-2">
                                <ChartBarIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                                <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                                    Most Expensive
                                </span>
                            </div>
                            <p className="text-lg font-bold text-secondary-900 dark:text-white">
                                {mostExpensiveModel?.modelName}
                            </p>
                            <p className="text-2xl font-bold gradient-text-primary">
                                {mostExpensiveModel ? pricingService.formatPrice(mostExpensiveModel.totalCost) : '$0.00'}
                            </p>
                        </div>

                        <div className="p-4 rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-900/20 dark:to-blue-800/10">
                            <div className="flex items-center gap-2 mb-2">
                                <CalculatorIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                                    Models Compared
                                </span>
                            </div>
                            <p className="text-3xl font-bold gradient-text-primary">
                                {costResults.length}
                            </p>
                            {cheapestModel && mostExpensiveModel && (
                                <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1">
                                    Savings: {pricingService.formatPrice(mostExpensiveModel.totalCost - cheapestModel.totalCost)}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Results Table */}
            {costResults.length > 0 && (
                <div className="rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex justify-between items-center p-4 border-b border-primary-200/30 dark:border-primary-700/30">
                        <h3 className="text-lg font-bold font-display gradient-text-primary">
                            Cost Comparison Results
                        </h3>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/10 border-b border-primary-200/30 dark:border-primary-700/30">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300">
                                        Rank
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300">
                                        Model
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300">
                                        Provider
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300">
                                        Input Cost
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300">
                                        Output Cost
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300">
                                        Total Cost
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-200/30 dark:divide-primary-700/30">
                                {costResults.slice(0, 50).map((result, index) => (
                                    <tr
                                        key={`${result.provider}-${result.modelId}`}
                                        className={`hover:bg-primary-50/30 dark:hover:bg-primary-900/20 transition-colors ${index === 0 ? 'bg-emerald-50/50 dark:bg-emerald-900/20' : ''
                                            }`}
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {index === 0 && (
                                                    <TrophyIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                )}
                                                <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                                                    #{index + 1}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-secondary-900 dark:text-white">
                                                {result.modelName}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm text-secondary-700 dark:text-secondary-300">
                                                {result.provider}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <span className="text-sm font-mono text-secondary-700 dark:text-secondary-300">
                                                {pricingService.formatPrice(result.inputCost)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <span className="text-sm font-mono text-secondary-700 dark:text-secondary-300">
                                                {pricingService.formatPrice(result.outputCost)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <span className={`text-sm font-mono font-bold ${index === 0 ? 'gradient-text-primary' : 'text-secondary-900 dark:text-white'
                                                }`}>
                                                {pricingService.formatPrice(result.totalCost)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {costResults.length > 50 && (
                        <div className="p-4 text-center text-sm text-secondary-600 dark:text-secondary-300 border-t border-primary-200/30 dark:border-primary-700/30">
                            Showing top 50 of {costResults.length} models. Export CSV to see all results.
                        </div>
                    )}
                </div>
            )}

            {costResults.length === 0 && inputTokens > 0 && (
                <div className="p-6 text-center rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <p className="text-secondary-600 dark:text-secondary-300">
                        No models found matching your criteria. Try adjusting the task type filter.
                    </p>
                </div>
            )}
        </div>
    );
};

