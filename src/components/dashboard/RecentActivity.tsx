import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { formatCurrency, formatPrompt, formatRelativeTime } from '@/utils/formatters';
import { TopPrompt } from '@/types';

interface RecentActivityProps {
    topPrompts?: TopPrompt[];
    optimizationOpportunities?: number;
    loading?: boolean;
}

export const RecentActivity = ({
    topPrompts,
    optimizationOpportunities,
    loading
}: RecentActivityProps) => {
    // Defensive fallback for undefined/null/invalid topPrompts
    const safeTopPrompts: TopPrompt[] = Array.isArray(topPrompts) ? topPrompts : [];
    // Defensive fallback for undefined/null optimizationOpportunities
    const safeOptimizationOpportunities: number = typeof optimizationOpportunities === 'number' ? optimizationOpportunities : 0;

    if (loading) {
        return (
            <div className="p-6 card">
                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                    Recent Activity
                </h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 skeleton" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 card">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Recent Activity
                </h3>
                <Link
                    to="/usage"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                    View all
                </Link>
            </div>

            {safeOptimizationOpportunities > 0 && (
                <div className="p-4 mb-4 rounded-lg bg-warning-50 dark:bg-warning-900/20">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-warning-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1 ml-3">
                            <h3 className="text-sm font-medium text-warning-800 dark:text-warning-200">
                                Optimization Opportunities
                            </h3>
                            <p className="mt-1 text-sm text-warning-700 dark:text-warning-300">
                                You have {safeOptimizationOpportunities} prompts that could be optimized to reduce costs.
                            </p>
                            <div className="mt-3">
                                <Link
                                    to="/optimizations"
                                    className="inline-flex items-center text-sm font-medium text-warning-800 hover:text-warning-900 dark:text-warning-200 dark:hover:text-warning-100"
                                >
                                    View opportunities
                                    <ArrowRightIcon className="ml-1 w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {safeTopPrompts.length === 0 ? (
                    <p className="py-8 text-sm text-center text-gray-500 dark:text-gray-400">
                        No recent activity to display
                    </p>
                ) : (
                    safeTopPrompts.map((prompt, index) => (
                        <div
                            key={index}
                            className="flex gap-4 justify-between items-start py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                    {formatPrompt(prompt.prompt)}
                                </p>
                                <div className="flex gap-4 items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span>{prompt.totalCalls} calls</span>
                                    <span>•</span>
                                    <span>{Array.isArray(prompt.services) ? prompt.services.join(', ') : ''}</span>
                                    <span>•</span>
                                    <span>{formatRelativeTime(prompt.lastUsed)}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(prompt.totalCost)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatCurrency(prompt.avgCost)}/call
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};