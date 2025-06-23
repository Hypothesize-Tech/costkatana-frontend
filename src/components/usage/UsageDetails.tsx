import React, { useState } from 'react';
import { ChevronDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { ChevronUpIcon } from '@heroicons/react/24/solid';
import { Usage } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface UsageDetailsProps {
    usage: Usage;
    onOptimize?: (usage: Usage) => void;
}

export const UsageDetails: React.FC<UsageDetailsProps> = ({ usage, onOptimize }) => {
    const [expanded, setExpanded] = useState(false);

    const getServiceColor = (service: string) => {
        const colors: Record<string, string> = {
            openai: 'bg-green-100 text-green-800',
            anthropic: 'bg-purple-100 text-purple-800',
            google: 'bg-blue-100 text-blue-800',
            'aws-bedrock': 'bg-orange-100 text-orange-800',
            azure: 'bg-cyan-100 text-cyan-800',
            cohere: 'bg-pink-100 text-pink-800',
        };
        return colors[service] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getServiceColor(usage.service)}`}>
                                {usage.service}
                            </span>
                            <span className="text-sm text-gray-600">{usage.model}</span>
                            <span className="text-xs text-gray-500">
                                {formatDate(usage.createdAt)}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Cost:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                    {formatCurrency(usage.cost)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Tokens:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                    {usage.totalTokens.toLocaleString()}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Response Time:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                    {usage.responseTime}ms
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Prompt/Completion:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                    {usage.promptTokens}/{usage.completionTokens}
                                </span>
                            </div>
                        </div>

                        {usage.metadata && (usage.metadata.project || usage.metadata.tags) && (
                            <div className="mt-2 flex items-center space-x-2">
                                {usage.metadata.project && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                        {usage.metadata.project}
                                    </span>
                                )}
                                {usage.metadata.tags && usage.metadata.tags.split(',').map((tag: string, index: number) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                                    >
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        {onOptimize && usage.promptTokens > 100 && (
                            <button
                                onClick={() => onOptimize(usage)}
                                className="px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                            >
                                Optimize
                            </button>
                        )}
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                        >
                            {expanded ? (
                                <ChevronUpIcon className="h-5 w-5" />
                            ) : (
                                <ChevronDownIcon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {expanded && (
                    <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                        {usage.prompt && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                                    Prompt
                                </h4>
                                <div className="p-3 bg-gray-50 rounded-md">
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                        {usage.prompt}
                                    </p>
                                </div>
                            </div>
                        )}

                        {usage.completion && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                                    Response
                                </h4>
                                <div className="p-3 bg-gray-50 rounded-md">
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                        {usage.completion}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">ID:</span>
                                <span className="ml-2 font-mono text-xs text-gray-600">
                                    {usage._id}
                                </span>
                            </div>
                            {usage.errorOccurred && usage.errorMessage && (
                                <div>
                                    <span className="text-gray-500">Error:</span>
                                    <span className="ml-2 text-red-600">
                                        {usage.errorMessage}
                                    </span>
                                </div>
                            )}
                            {usage.metadata?.requestId && (
                                <div>
                                    <span className="text-gray-500">Request ID:</span>
                                    <span className="ml-2 font-mono text-xs text-gray-600">
                                        {usage.metadata.requestId}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};