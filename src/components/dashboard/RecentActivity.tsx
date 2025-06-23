import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { formatCurrency, formatPrompt, formatRelativeTime } from '@/utils/formatters';
import { TopPrompt } from '@/types';

interface RecentActivityProps {
    topPrompts: TopPrompt[];
    optimizationOpportunities: number;
    loading?: boolean;
}

export const RecentActivity = ({
    topPrompts,
    optimizationOpportunities,
    loading
}: RecentActivityProps) => {
    if (loading) {
        return (
            <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Recent Activity
                </h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-16" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
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

            {optimizationOpportunities > 0 && (
                <div className="mb-4 rounded-lg bg-warning-50 dark:bg-warning-900/20 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-warning-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-warning-800 dark:text-warning-200">
                                Optimization Opportunities
                            </h3>
                            <p className="mt-1 text-sm text-warning-700 dark:text-warning-300">
                                You have {optimizationOpportunities} prompts that could be optimized to reduce costs.
                            </p>
                            <div className="mt-3">
                                <Link
                                    to="/optimizations"
                                    className="inline-flex items-center text-sm font-medium text-warning-800 hover:text-warning-900 dark:text-warning-200 dark:hover:text-warning-100"
                                >
                                    View opportunities
                                    <ArrowRightIcon className="ml-1 h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {topPrompts.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                        No recent activity to display
                    </p>
                ) : (
                    topPrompts.map((prompt, index) => (
                        <div
                            key={index}
                            className="flex items-start justify-between gap-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {formatPrompt(prompt.prompt)}
                                </p>
                                <div className="mt-1 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <span>{prompt.totalCalls} calls</span>
                                    <span>•</span>
                                    <span>{prompt.services.join(', ')}</span>
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