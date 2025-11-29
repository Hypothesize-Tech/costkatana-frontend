import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    pricingService,
    ModelComparisonRow,
    ComparisonTableResponse
} from '@/services/pricing.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ChatBubbleLeftRightIcon,
    CodeBracketIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

interface ModelComparisonTableProps {
    taskType?: 'chat' | 'code' | 'vision' | 'all';
    onModelSelect?: (model: ModelComparisonRow) => void;
}

type SortField = 'modelName' | 'provider' | 'inputPricePer1M' | 'outputPricePer1M' | 'contextWindow';
type SortDirection = 'asc' | 'desc';

export const ModelComparisonTable: React.FC<ModelComparisonTableProps> = ({
    taskType = 'all',
    onModelSelect
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProvider, setSelectedProvider] = useState<string>('all');
    const [selectedTaskType, setSelectedTaskType] = useState<'chat' | 'code' | 'vision' | 'all'>(taskType);
    const [sortField, setSortField] = useState<SortField>('inputPricePer1M');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const { data, isLoading, error } = useQuery<ComparisonTableResponse>({
        queryKey: ['modelComparisonTable', selectedTaskType],
        queryFn: async () => {
            const result = await pricingService.getModelComparisonTable(selectedTaskType);
            if (result.success && result.data) {
                return result.data;
            }
            throw new Error(result.error || 'Failed to fetch models');
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Extract unique providers
    const providers = useMemo(() => {
        if (!data?.models) return [];
        return Array.from(new Set(data.models.map(m => m.provider))).sort();
    }, [data?.models]);

    // Filter and sort models
    const filteredAndSortedModels = useMemo(() => {
        if (!data?.models) return [];

        let filtered = data.models;

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(model =>
                model.modelName.toLowerCase().includes(query) ||
                model.provider.toLowerCase().includes(query) ||
                model.modelId.toLowerCase().includes(query)
            );
        }

        // Filter by provider
        if (selectedProvider !== 'all') {
            filtered = filtered.filter(model => model.provider === selectedProvider);
        }

        // Sort
        const sorted = [...filtered].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortField) {
                case 'modelName':
                    aValue = a.modelName.toLowerCase();
                    bValue = b.modelName.toLowerCase();
                    break;
                case 'provider':
                    aValue = a.provider.toLowerCase();
                    bValue = b.provider.toLowerCase();
                    break;
                case 'inputPricePer1M':
                    aValue = a.inputPricePer1M;
                    bValue = b.inputPricePer1M;
                    break;
                case 'outputPricePer1M':
                    aValue = a.outputPricePer1M;
                    bValue = b.outputPricePer1M;
                    break;
                case 'contextWindow':
                    aValue = a.contextWindow;
                    bValue = b.contextWindow;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [data?.models, searchQuery, selectedProvider, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? (
            <ArrowUpIcon className="w-4 h-4" />
        ) : (
            <ArrowDownIcon className="w-4 h-4" />
        );
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
            {/* Filters */}
            <div className="p-4 sm:p-6 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Search */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                        <input
                            type="text"
                            placeholder="Search models..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        />
                    </div>

                    {/* Provider Filter */}
                    <div className="relative">
                        <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                        <select
                            value={selectedProvider}
                            onChange={(e) => setSelectedProvider(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none"
                        >
                            <option value="all">All Providers</option>
                            {providers.map(provider => (
                                <option key={provider} value={provider}>{provider}</option>
                            ))}
                        </select>
                    </div>

                    {/* Task Type Filter */}
                    <div className="relative">
                        <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                        <select
                            value={selectedTaskType}
                            onChange={(e) => setSelectedTaskType(e.target.value as any)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none"
                        >
                            <option value="all">All Task Types</option>
                            <option value="chat">Chat</option>
                            <option value="code">Code</option>
                            <option value="vision">Vision</option>
                        </select>
                    </div>
                </div>

                {/* Results count */}
                <div className="mt-4 text-sm text-secondary-600 dark:text-secondary-300">
                    Showing {filteredAndSortedModels.length} of {data?.totalModels || 0} models
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/10 border-b border-primary-200/30 dark:border-primary-700/30">
                        <tr>
                            <th
                                className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 cursor-pointer hover:bg-primary-100/50 dark:hover:bg-primary-800/20 transition-colors"
                                onClick={() => handleSort('modelName')}
                            >
                                <div className="flex items-center gap-2">
                                    Model Name
                                    <SortIcon field="modelName" />
                                </div>
                            </th>
                            <th
                                className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 cursor-pointer hover:bg-primary-100/50 dark:hover:bg-primary-800/20 transition-colors"
                                onClick={() => handleSort('provider')}
                            >
                                <div className="flex items-center gap-2">
                                    Provider
                                    <SortIcon field="provider" />
                                </div>
                            </th>
                            <th
                                className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 cursor-pointer hover:bg-primary-100/50 dark:hover:bg-primary-800/20 transition-colors"
                                onClick={() => handleSort('inputPricePer1M')}
                            >
                                <div className="flex items-center gap-2">
                                    Input (per 1M)
                                    <SortIcon field="inputPricePer1M" />
                                </div>
                            </th>
                            <th
                                className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 cursor-pointer hover:bg-primary-100/50 dark:hover:bg-primary-800/20 transition-colors"
                                onClick={() => handleSort('outputPricePer1M')}
                            >
                                <div className="flex items-center gap-2">
                                    Output (per 1M)
                                    <SortIcon field="outputPricePer1M" />
                                </div>
                            </th>
                            <th
                                className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 cursor-pointer hover:bg-primary-100/50 dark:hover:bg-primary-800/20 transition-colors"
                                onClick={() => handleSort('contextWindow')}
                            >
                                <div className="flex items-center gap-2">
                                    Context Window
                                    <SortIcon field="contextWindow" />
                                </div>
                            </th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300">
                                Task Types
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-200/30 dark:divide-primary-700/30">
                        {filteredAndSortedModels.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-secondary-600 dark:text-secondary-300">
                                    No models found matching your filters
                                </td>
                            </tr>
                        ) : (
                            filteredAndSortedModels.map((model, index) => (
                                <tr
                                    key={`${model.provider}-${model.modelId}`}
                                    className={`hover:bg-primary-50/30 dark:hover:bg-primary-900/20 transition-colors ${onModelSelect ? 'cursor-pointer' : ''
                                        }`}
                                    onClick={() => onModelSelect?.(model)}
                                >
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-secondary-900 dark:text-white">
                                                {model.modelName}
                                            </span>
                                            {model.isLatest && (
                                                <span className="px-2 py-0.5 text-xs font-bold text-white uppercase rounded-full bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454]">
                                                    Latest
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="text-sm text-secondary-700 dark:text-secondary-300">
                                            {model.provider}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono font-semibold gradient-text-primary">
                                            {pricingService.formatPricePer1M(model.inputPricePer1M)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono font-semibold gradient-text-primary">
                                            {pricingService.formatPricePer1M(model.outputPricePer1M)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="text-sm text-secondary-700 dark:text-secondary-300">
                                            {model.contextWindow > 0
                                                ? `${(model.contextWindow / 1000).toFixed(0)}K`
                                                : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {model.taskTypes.includes('chat') && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                                                    <ChatBubbleLeftRightIcon className="w-3 h-3" />
                                                    Chat
                                                </span>
                                            )}
                                            {model.taskTypes.includes('code') && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700">
                                                    <CodeBracketIcon className="w-3 h-3" />
                                                    Code
                                                </span>
                                            )}
                                            {model.taskTypes.includes('vision') && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                                                    <EyeIcon className="w-3 h-3" />
                                                    Vision
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

