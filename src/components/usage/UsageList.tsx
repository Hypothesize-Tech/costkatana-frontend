import { useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Usage } from '@/types';
import { Pagination } from '@/components/common/Pagination';
import {
    formatCurrency,
    formatNumber,
    formatDateTime,
    formatServiceName,
    formatPrompt,
    formatResponseTime
} from '@/utils/formatters';
import { AI_SERVICES } from '@/utils/constant';

interface UsageListProps {
    usage: Usage[];
    pagination: any;
    onPageChange: (page: number) => void;
    onRefresh: () => void;
}

export const UsageList = ({ usage, pagination, onPageChange, onRefresh }: UsageListProps) => {
    const [selectedUsage, setSelectedUsage] = useState<Usage | null>(null);

    if (usage.length === 0) {
        return (
            <div className="card p-12 text-center">
                <div className="mx-auto h-24 w-24 text-gray-400">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    No usage data yet
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Start tracking your AI API usage to see it here.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            Usage History
                        </h3>
                        <button
                            onClick={onRefresh}
                            className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                            <ArrowPathIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Service / Model
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Prompt
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Tokens
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Cost
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Time
                                </th>
                                <th className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {usage.map((item) => {
                                const service = AI_SERVICES[item.service as keyof typeof AI_SERVICES];

                                return (
                                    <tr
                                        key={item._id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                        onClick={() => setSelectedUsage(item)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div
                                                        className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-lg"
                                                        style={{ backgroundColor: service?.color || '#999' }}
                                                    >
                                                        {service?.icon || '?'}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {formatServiceName(item.service)}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {item.model}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                                {formatPrompt(item.prompt, 60)}
                                            </div>
                                            {item.tags && item.tags.length > 0 && (
                                                <div className="mt-1 flex gap-1">
                                                    {item.tags.slice(0, 3).map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {item.tags.length > 3 && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            +{item.tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {formatNumber(item.totalTokens)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatResponseTime(item.responseTime)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatCurrency(item.cost)}
                                            </div>
                                            {item.optimizationApplied && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200">
                                                    Optimized
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatDateTime(item.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {pagination && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={onPageChange}
                        />
                    </div>
                )}
            </div>

            {/* Usage Details Modal */}
            {selectedUsage && (
                <div>Details Placeholder</div>
            )}
        </>
    );
};