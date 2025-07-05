import { useState } from 'react';
import { ChevronRightIcon, XMarkIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
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
    const [copiedPrompt, setCopiedPrompt] = useState(false);

    const copyPromptToClipboard = async (prompt: string) => {
        try {
            await navigator.clipboard.writeText(prompt);
            setCopiedPrompt(true);
            setTimeout(() => setCopiedPrompt(false), 2000);
        } catch (err) {
            console.error('Failed to copy prompt:', err);
        }
    };

    if (usage.length === 0) {
        return (
            <div className="p-12 text-center card">
                <div className="mx-auto w-24 h-24 text-gray-400">
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
            <div className="overflow-hidden card">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            Usage History
                        </h3>
                        <button
                            onClick={onRefresh}
                            className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                                    Service / Model
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                                    Prompt
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                                    Tokens
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                                    Cost
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                                    Time
                                </th>
                                <th className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                            {usage.map((item) => {
                                const service = AI_SERVICES[item.service as keyof typeof AI_SERVICES];

                                return (
                                    <tr
                                        key={item._id}
                                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                        onClick={() => setSelectedUsage(item)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 w-10 h-10">
                                                    <div
                                                        className="flex justify-center items-center w-10 h-10 text-lg text-white rounded-lg"
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
                                            <div className="max-w-xs text-sm text-gray-900 truncate dark:text-white">
                                                {formatPrompt(item.prompt, 60)}
                                            </div>
                                            {item.tags && item.tags.length > 0 && (
                                                <div className="flex gap-1 mt-1">
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
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                                            {formatDateTime(item.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
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
                <div className="overflow-y-auto fixed inset-0 z-50">
                    <div className="flex justify-center items-center px-4 pt-4 pb-20 min-h-screen text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedUsage(null)} />
                        
                        <div className="inline-block overflow-hidden p-6 my-8 w-full max-w-2xl text-left align-middle bg-white rounded-lg shadow-xl transition-all transform dark:bg-gray-800">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Usage Details
                                </h3>
                                <button
                                    onClick={() => setSelectedUsage(null)}
                                    className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Service & Model */}
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div
                                            className="flex justify-center items-center w-12 h-12 text-xl text-white rounded-lg"
                                            style={{ backgroundColor: AI_SERVICES[selectedUsage.service as keyof typeof AI_SERVICES]?.color || '#999' }}
                                        >
                                            {AI_SERVICES[selectedUsage.service as keyof typeof AI_SERVICES]?.icon || '?'}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                            {formatServiceName(selectedUsage.service)}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {selectedUsage.model}
                                        </p>
                                    </div>
                                </div>

                                {/* Prompt */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                            Prompt
                                        </h5>
                                        <button
                                            onClick={() => copyPromptToClipboard(selectedUsage.prompt)}
                                            className="flex items-center px-2 py-1 space-x-1 text-xs text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            title="Copy prompt to clipboard"
                                        >
                                            {copiedPrompt ? (
                                                <>
                                                    <CheckIcon className="w-4 h-4 text-green-500" />
                                                    <span className="text-green-500">Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ClipboardIcon className="w-4 h-4" />
                                                    <span>Copy</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                                        <p className="text-sm text-gray-900 whitespace-pre-wrap dark:text-white">
                                            {selectedUsage.prompt}
                                        </p>
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                                        <h6 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Total Tokens
                                        </h6>
                                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatNumber(selectedUsage.totalTokens)}
                                        </p>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {formatNumber(selectedUsage.promptTokens)} prompt + {formatNumber(selectedUsage.completionTokens)} completion
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                                        <h6 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Cost
                                        </h6>
                                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(selectedUsage.cost)}
                                        </p>
                                        {selectedUsage.optimizationApplied && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200 mt-1">
                                                Optimized
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                                        <h6 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Response Time
                                        </h6>
                                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatResponseTime(selectedUsage.responseTime)}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                                        <h6 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Created At
                                        </h6>
                                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatDateTime(selectedUsage.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Tags */}
                                {selectedUsage.tags && selectedUsage.tags.length > 0 && (
                                    <div>
                                        <h5 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Tags
                                        </h5>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedUsage.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-200"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Status Indicators */}
                                <div className="flex space-x-4">
                                    <div className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${selectedUsage.errorOccurred ? 'bg-red-500' : 'bg-green-500'}`} />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {selectedUsage.errorOccurred ? 'Error Occurred' : 'Successful'}
                                        </span>
                                    </div>
                                    {selectedUsage.optimizationApplied && (
                                        <div className="flex items-center">
                                            <div className="mr-2 w-2 h-2 bg-blue-500 rounded-full" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Optimization Applied
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};