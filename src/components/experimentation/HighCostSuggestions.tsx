import React, { useState, useEffect } from 'react';
import {
    ExclamationTriangleIcon,
    BeakerIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    XMarkIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import { Usage } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface HighCostSuggestionsProps {
    usages: Usage[];
    onSimulate: (usage: Usage) => void;
    className?: string;
}

interface HighCostSuggestion {
    usage: Usage;
    reason: string;
    potentialSavings: string;
    priority: 'high' | 'medium' | 'low';
}

export const HighCostSuggestions: React.FC<HighCostSuggestionsProps> = ({
    usages,
    onSimulate,
    className = '',
}) => {
    const [suggestions, setSuggestions] = useState<HighCostSuggestion[]>([]);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    useEffect(() => {
        analyzeCosts();
    }, [usages]);

    const analyzeCosts = () => {
        if (!usages || usages.length === 0) return;

        // Calculate cost statistics
        const costs = usages.map(u => u.cost).filter(c => c > 0);
        if (costs.length === 0) return;

        const avgCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
        const maxCost = Math.max(...costs);
        const highCostThreshold = Math.max(avgCost * 2, 0.05); // 2x average or $0.05 minimum

        const newSuggestions: HighCostSuggestion[] = [];

        usages.forEach(usage => {
            if (dismissed.has(usage._id)) return;

            // High cost detection
            if (usage.cost > highCostThreshold) {
                let reason = '';
                let potentialSavings = '';
                let priority: 'high' | 'medium' | 'low' = 'medium';

                if (usage.cost > maxCost * 0.8) {
                    reason = `Highest cost request (${formatCurrency(usage.cost)}) - likely candidate for optimization`;
                    potentialSavings = '40-60% savings possible';
                    priority = 'high';
                } else if (usage.cost > avgCost * 3) {
                    reason = `3x above average cost (${formatCurrency(usage.cost)} vs ${formatCurrency(avgCost)})`;
                    potentialSavings = '30-50% savings possible';
                    priority = 'high';
                } else {
                    reason = `Above average cost (${formatCurrency(usage.cost)} vs ${formatCurrency(avgCost)})`;
                    potentialSavings = '20-40% savings possible';
                    priority = 'medium';
                }

                newSuggestions.push({
                    usage,
                    reason,
                    potentialSavings,
                    priority,
                });
            }

            // High token count detection
            if (usage.totalTokens > 8000) {
                let reason = '';
                let potentialSavings = '';
                let priority: 'high' | 'medium' | 'low' = 'medium';

                if (usage.totalTokens > 15000) {
                    reason = `Very high token usage (${usage.totalTokens.toLocaleString()}) - context trimming recommended`;
                    potentialSavings = '50-70% savings with context optimization';
                    priority = 'high';
                } else {
                    reason = `High token usage (${usage.totalTokens.toLocaleString()}) - optimization opportunity`;
                    potentialSavings = '30-50% savings with context optimization';
                    priority = 'medium';
                }

                // Don't duplicate if already added for high cost
                if (!newSuggestions.find(s => s.usage._id === usage._id)) {
                    newSuggestions.push({
                        usage,
                        reason,
                        potentialSavings,
                        priority,
                    });
                }
            }

            // Expensive model detection
            const expensiveModels = ['gpt-4', 'claude-3-opus', 'claude-opus-4'];
            if (expensiveModels.some(model => usage.model.toLowerCase().includes(model.toLowerCase()))) {
                const reason = `Using premium model (${usage.model}) - cheaper alternatives available`;
                const potentialSavings = '60-80% savings with model switching';

                // Don't duplicate if already added
                if (!newSuggestions.find(s => s.usage._id === usage._id)) {
                    newSuggestions.push({
                        usage,
                        reason,
                        potentialSavings,
                        priority: 'high',
                    });
                }
            }
        });

        // Sort by priority and cost
        newSuggestions.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return b.usage.cost - a.usage.cost;
        });

        setSuggestions(newSuggestions.slice(0, 5)); // Show top 5 suggestions
    };

    const handleDismiss = (usageId: string) => {
        setDismissed(prev => new Set([...prev, usageId]));
        setSuggestions(prev => prev.filter(s => s.usage._id !== usageId));
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'border-red-200 bg-red-50';
            case 'medium':
                return 'border-yellow-200 bg-yellow-50';
            case 'low':
                return 'border-blue-200 bg-blue-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const getPriorityIconColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-500';
            case 'medium':
                return 'text-yellow-500';
            case 'low':
                return 'text-blue-500';
            default:
                return 'text-gray-500';
        }
    };

    if (suggestions.length === 0) return null;

    // Add a sticky banner at the top for high-priority opportunities
    const highPriorityCount = suggestions.filter(s => s.priority === 'high').length;

    return (
        <>
            <div className={`space-y-3 ${className}`} id="cost-opportunities">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 mr-3" />
                            <div>
                                <h3 className="text-lg font-semibold text-orange-900">
                                    🚨 High-Cost Optimization Opportunities
                                </h3>
                                <p className="text-sm text-orange-700 mt-1">
                                    We found {suggestions.length} expensive requests that could save you money
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-orange-600">
                                {suggestions.length}
                            </div>
                            <div className="text-xs text-orange-600">Opportunities</div>
                        </div>
                    </div>
                </div>

                {suggestions.map((suggestion) => (
                    <div
                        key={suggestion.usage._id}
                        className={`border rounded-lg p-4 ${getPriorityColor(suggestion.priority)} transition-all hover:shadow-md`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center mb-2">
                                    <ExclamationTriangleIcon
                                        className={`h-4 w-4 mr-2 ${getPriorityIconColor(suggestion.priority)}`}
                                    />
                                    <span className="text-sm font-medium text-gray-900 capitalize">
                                        {suggestion.priority} Priority
                                    </span>
                                    <span className="ml-2 text-xs text-gray-500">
                                        {suggestion.usage.model}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-700 mb-2">
                                    {suggestion.reason}
                                </p>

                                <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
                                    <div className="flex items-center">
                                        <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                                        {formatCurrency(suggestion.usage.cost)}
                                    </div>
                                    <div className="flex items-center">
                                        <ChartBarIcon className="h-3 w-3 mr-1" />
                                        {suggestion.usage.totalTokens.toLocaleString()} tokens
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-green-600">
                                        💰 {suggestion.potentialSavings}
                                    </span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => onSimulate(suggestion.usage)}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                        >
                                            <BeakerIcon className="h-3 w-3 mr-1" />
                                            Simulate
                                        </button>
                                        <button
                                            onClick={() => handleDismiss(suggestion.usage._id)}
                                            className="inline-flex items-center px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                                        >
                                            <XMarkIcon className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {suggestions.length > 0 && (
                    <div className="text-center pt-2">
                        <p className="text-xs text-gray-500">
                            💡 Tip: Run simulations to see exact savings potential for your specific use case
                        </p>
                    </div>
                )}
            </div>

            {/* Floating Action Button for Quick Access */}
            {suggestions.length > 0 && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={() => document.getElementById('cost-opportunities')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex items-center px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        title="View cost optimization opportunities"
                    >
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        <span className="font-medium">
                            {suggestions.length} Savings
                        </span>
                        <div className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">
                            {highPriorityCount > 0 ? '🚨' : '💰'}
                        </div>
                    </button>
                </div>
            )}
        </>
    );
};