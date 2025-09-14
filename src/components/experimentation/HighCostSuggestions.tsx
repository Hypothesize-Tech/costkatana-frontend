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
                return 'border-l-4 border-danger-500 glass backdrop-blur-xl';
            case 'medium':
                return 'border-l-4 border-accent-500 glass backdrop-blur-xl';
            case 'low':
                return 'border-l-4 border-success-500 glass backdrop-blur-xl';
            default:
                return 'border-l-4 border-primary-200/30 glass backdrop-blur-xl';
        }
    };

    const getPriorityIconColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-danger-500';
            case 'medium':
                return 'text-accent-500';
            case 'low':
                return 'text-success-500';
            default:
                return 'text-primary-500';
        }
    };

    if (suggestions.length === 0) return null;

    // Add a sticky banner at the top for high-priority opportunities
    const highPriorityCount = suggestions.filter(s => s.priority === 'high').length;

    return (
        <>
            <div className={`space-y-6 ${className}`} id="cost-opportunities">
                <div className="card p-8 shadow-2xl backdrop-blur-xl border border-danger-200/30 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-gradient-danger p-3 rounded-xl glow-danger shadow-lg mr-4">
                                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-bold gradient-text">
                                    🚨 High-Cost Optimization Opportunities
                                </h3>
                                <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                    We found {suggestions.length} expensive requests that could save you money
                                </p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-display font-bold gradient-text">
                                {suggestions.length}
                            </div>
                            <div className="text-sm font-display font-semibold text-danger-500">Opportunities</div>
                        </div>
                    </div>
                </div>

                {suggestions.map((suggestion) => (
                    <div
                        key={suggestion.usage._id}
                        className={`card p-6 shadow-lg ${getPriorityColor(suggestion.priority)} hover:scale-105 transition-all duration-300 animate-fade-in`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center mb-3">
                                    <ExclamationTriangleIcon
                                        className={`h-5 w-5 mr-3 ${getPriorityIconColor(suggestion.priority)}`}
                                    />
                                    <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary capitalize">
                                        {suggestion.priority} Priority
                                    </span>
                                    <span className="ml-3 px-2 py-1 bg-primary-100/50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-lg text-xs font-display font-medium border border-primary-200/30">
                                        {suggestion.usage.model}
                                    </span>
                                </div>

                                <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-3 leading-relaxed">
                                    {suggestion.reason}
                                </p>

                                <div className="flex items-center space-x-6 text-sm mb-4">
                                    <div className="flex items-center glass p-2 rounded-lg border border-primary-200/30">
                                        <CurrencyDollarIcon className="h-4 w-4 mr-2 text-success-500" />
                                        <span className="font-display font-semibold gradient-text">
                                            {formatCurrency(suggestion.usage.cost)}
                                        </span>
                                    </div>
                                    <div className="flex items-center glass p-2 rounded-lg border border-primary-200/30">
                                        <ChartBarIcon className="h-4 w-4 mr-2 text-primary-500" />
                                        <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                            {suggestion.usage.totalTokens.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-light-text-muted dark:text-dark-text-muted ml-1">tokens</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="glass p-3 rounded-xl border border-success-200/30 bg-gradient-success/10">
                                        <span className="text-sm font-display font-bold text-success-600 dark:text-success-400">
                                            💰 {suggestion.potentialSavings}
                                        </span>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => onSimulate(suggestion.usage)}
                                            className="btn-primary text-sm font-display font-semibold hover:scale-105 transition-all duration-300"
                                        >
                                            <BeakerIcon className="h-4 w-4 mr-2" />
                                            Simulate
                                        </button>
                                        <button
                                            onClick={() => handleDismiss(suggestion.usage._id)}
                                            className="p-2 rounded-xl text-light-text-muted dark:text-dark-text-muted hover:text-danger-500 hover:bg-danger-500/10 transition-all duration-300 hover:scale-110"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {suggestions.length > 0 && (
                    <div className="text-center pt-4">
                        <div className="glass p-4 rounded-xl border border-primary-200/30 bg-primary-500/5">
                            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                💡 <span className="font-display font-semibold">Tip:</span> Run simulations to see exact savings potential for your specific use case
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Action Button for Quick Access */}
            {suggestions.length > 0 && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={() => document.getElementById('cost-opportunities')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex items-center px-6 py-4 bg-gradient-primary text-white rounded-2xl shadow-2xl glow-primary hover:scale-110 transition-all duration-300 backdrop-blur-xl"
                        title="View cost optimization opportunities"
                    >
                        <SparklesIcon className="h-6 w-6 mr-3" />
                        <span className="font-display font-bold text-lg">
                            {suggestions.length} Savings
                        </span>
                        <div className="ml-3 px-3 py-2 bg-white/20 rounded-xl text-sm font-display font-semibold animate-pulse">
                            {highPriorityCount > 0 ? '🚨' : '💰'}
                        </div>
                    </button>
                </div>
            )}
        </>
    );
};