import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ShieldCheckIcon,
    ShieldExclamationIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    ClockIcon,
    DocumentTextIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { moderationService } from '../services/moderation.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface ModerationAnalytics {
    input: {
        totalRequests: number;
        blockedRequests: number;
        costSaved: number;
        threatsByCategory: Record<string, number>;
    };
    output: {
        totalResponses: number;
        blockedResponses: number;
        redactedResponses: number;
        annotatedResponses: number;
        violationsByCategory: Record<string, number>;
        blockRateByModel: Record<string, number>;
    };
    trends: Array<{
        date: string;
        count: number;
        avgConfidence: number;
    }>;
    categories: Array<{
        category: string;
        count: number;
        avgConfidence: number;
        totalCostSaved: number;
    }>;
    summary: {
        totalThreats: number;
        totalCostSaved: number;
        overallBlockRate: number;
        lastUpdated: string;
    };
}

interface ThreatLog {
    id: string;
    requestId: string;
    threatCategory: string;
    confidence: number;
    stage: string;
    reason: string;
    costSaved: number;
    timestamp: string;
    promptPreview?: string;
    promptHash?: string;
    ipAddress?: string;
    details: {
        method?: string;
        threatLevel?: string;
        action?: string;
        violationCategories?: string[];
        matchedPatterns?: number;
    };
}

export const Moderation: React.FC = () => {
    const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStage, setSelectedStage] = useState<string>('all');
    const [threatPage, setThreatPage] = useState(1);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Calculate date range
    const getDateRange = () => {
        const end = new Date();
        const start = new Date();

        switch (selectedTimeRange) {
            case '24h':
                start.setHours(start.getHours() - 24);
                break;
            case '7d':
                start.setDate(start.getDate() - 7);
                break;
            case '30d':
                start.setDate(start.getDate() - 30);
                break;
        }

        return {
            startDate: start.toISOString(),
            endDate: end.toISOString()
        };
    };

    // Fetch moderation analytics
    const {
        data: analytics,
        isLoading: analyticsLoading,
        error: analyticsError,
        refetch: refetchAnalytics
    } = useQuery<{ data: ModerationAnalytics }>({
        queryKey: ['moderationAnalytics', selectedTimeRange, refreshTrigger],
        queryFn: () => moderationService.getAnalytics(getDateRange()),
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    // Fetch threat logs
    const {
        data: threats,
        isLoading: threatsLoading,
        refetch: refetchThreats
    } = useQuery<{ data: { threats: ThreatLog[]; pagination: any } }>({
        queryKey: ['moderationThreats', selectedCategory, selectedStage, threatPage, refreshTrigger],
        queryFn: () => moderationService.getThreats({
            page: threatPage,
            limit: 20,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            stage: selectedStage !== 'all' ? selectedStage : undefined,
            ...getDateRange()
        }),
        refetchInterval: 30000,
    });

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
        refetchAnalytics();
        refetchThreats();
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
        }).format(amount);
    };

    const formatPercentage = (value: number): string => {
        return `${value.toFixed(1)}%`;
    };

    const getThreatCategoryColor = (category: string): string => {
        const colors: Record<string, string> = {
            'violence_and_hate': 'text-red-600 bg-red-50',
            'sexual_content': 'text-pink-600 bg-pink-50',
            'self_harm': 'text-orange-600 bg-orange-50',
            'prompt_injection': 'text-purple-600 bg-purple-50',
            'jailbreak_attempt': 'text-indigo-600 bg-indigo-50',
            'privacy_violations': 'text-blue-600 bg-blue-50',
            'harmful_content': 'text-yellow-600 bg-yellow-50',
        };
        return colors[category] || 'text-gray-600 bg-gray-50';
    };

    const getStageIcon = (stage: string) => {
        switch (stage) {
            case 'prompt-guard':
                return <ShieldCheckIcon className="w-4 h-4 text-blue-500" />;
            case 'llama-guard':
                return <ShieldExclamationIcon className="w-4 h-4 text-orange-500" />;
            case 'output-guard':
                return <EyeIcon className="w-4 h-4 text-green-500" />;
            default:
                return <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />;
        }
    };

    if (analyticsLoading) {
        return <LoadingSpinner />;
    }

    if (analyticsError) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Failed to load moderation data
                            </h3>
                            <p className="mt-1 text-sm text-red-700">
                                Please try refreshing the page or contact support if the issue persists.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const data = analytics?.data;

    return (
        <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-display font-bold gradient-text-primary">Moderation Dashboard</h1>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">
                                Monitor AI safety and content moderation across your system
                            </p>
                        </div>

                        <div className="flex space-x-3">
                            <select
                                value={selectedTimeRange}
                                onChange={(e) => setSelectedTimeRange(e.target.value as '24h' | '7d' | '30d')}
                                className="input text-sm"
                            >
                                <option value="24h">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                            </select>

                            <button
                                onClick={handleRefresh}
                                className="btn-primary px-4 py-2 text-sm rounded-xl flex items-center space-x-2"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-error-50/30 to-error-100/30 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ShieldExclamationIcon className="w-8 h-8 text-error-600 dark:text-error-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary truncate">
                                    Total Threats Blocked
                                </dt>
                                <dd className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                                    {data?.summary.totalThreats?.toLocaleString() || '0'}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-primary-100/30 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ChartBarIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary truncate">
                                    Overall Block Rate
                                </dt>
                                <dd className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                                    {formatPercentage(data?.summary.overallBlockRate || 0)}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <DocumentTextIcon className="w-8 h-8 text-green-500" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Cost Saved
                                </dt>
                                <dd className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(data?.summary.totalCostSaved || 0)}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ClockIcon className="w-8 h-8 text-purple-500" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Last Updated
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                    {data?.summary.lastUpdated ?
                                        new Date(data.summary.lastUpdated).toLocaleTimeString() :
                                        'Never'
                                    }
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Moderation Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Moderation */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <ShieldCheckIcon className="w-5 h-5 mr-2 text-blue-500" />
                        Pre-LLM Moderation (Input)
                    </h3>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Requests Processed</span>
                            <span className="font-medium">{data?.input?.totalRequests?.toLocaleString() || '0'}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Blocked Requests</span>
                            <span className="font-medium text-red-600">{data?.input?.blockedRequests?.toLocaleString() || '0'}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Cost Saved</span>
                            <span className="font-medium text-green-600">{formatCurrency(data?.input?.costSaved || 0)}</span>
                        </div>

                        {/* Top Threat Categories */}
                        <div className="pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Top Threat Categories</h4>
                            <div className="space-y-2">
                                {Object.entries(data?.input?.threatsByCategory || {})
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 5)
                                    .map(([category, count]) => (
                                        <div key={category} className="flex justify-between items-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThreatCategoryColor(category)}`}>
                                                {category.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-sm text-gray-600">{count}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Output Moderation */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <EyeIcon className="w-5 h-5 mr-2 text-green-500" />
                        Post-LLM Moderation (Output)
                    </h3>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Responses Processed</span>
                            <span className="font-medium">{data?.output?.totalResponses?.toLocaleString() || '0'}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Blocked Responses</span>
                            <span className="font-medium text-red-600">{data?.output?.blockedResponses?.toLocaleString() || '0'}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Redacted Responses</span>
                            <span className="font-medium text-yellow-600">{data?.output?.redactedResponses?.toLocaleString() || '0'}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Annotated Responses</span>
                            <span className="font-medium text-blue-600">{data?.output?.annotatedResponses?.toLocaleString() || '0'}</span>
                        </div>

                        {/* Block Rate by Model */}
                        <div className="pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Block Rate by Model</h4>
                            <div className="space-y-2">
                                {Object.entries(data?.output?.blockRateByModel || {})
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 5)
                                    .map(([model, rate]) => (
                                        <div key={model} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{model}</span>
                                            <span className="text-sm font-medium">{formatPercentage(rate)}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Threat Log */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Recent Threats</h3>

                        <div className="flex space-x-3">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md"
                            >
                                <option value="all">All Categories</option>
                                <option value="violence_and_hate">Violence & Hate</option>
                                <option value="sexual_content">Sexual Content</option>
                                <option value="self_harm">Self Harm</option>
                                <option value="prompt_injection">Prompt Injection</option>
                                <option value="privacy_violations">Privacy Violations</option>
                            </select>

                            <select
                                value={selectedStage}
                                onChange={(e) => setSelectedStage(e.target.value)}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md"
                            >
                                <option value="all">All Stages</option>
                                <option value="prompt-guard">Prompt Guard</option>
                                <option value="llama-guard">Llama Guard</option>
                                <option value="output-guard">Output Guard</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Confidence
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cost Saved
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Prompt Preview
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reason
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {threatsLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center">
                                        <LoadingSpinner />
                                        <p className="text-sm text-gray-500 mt-2">Loading threats...</p>
                                    </td>
                                </tr>
                            ) : (threats?.data?.threats?.length ?? 0) > 0 ? (
                                threats!.data!.threats!.map((threat) => (
                                    <tr key={threat.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(threat.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getStageIcon(threat.stage)}
                                                <span className="ml-2 text-sm text-gray-600">{threat.stage}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThreatCategoryColor(threat.threatCategory)}`}>
                                                {threat.threatCategory.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatPercentage(threat.confidence * 100)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                            {formatCurrency(threat.costSaved)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-sm">
                                            {threat.promptPreview ? (
                                                <div className="group relative">
                                                    <p className="truncate text-gray-800 bg-gray-50 px-2 py-1 rounded font-mono text-xs">
                                                        {threat.promptPreview}
                                                    </p>
                                                    {threat.promptHash && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Hash: {threat.promptHash}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">No prompt preview</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                            {threat.reason}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                        No threats found for the selected criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {threats?.data?.pagination && threats.data.pagination.totalPages > 1 && (
                    <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                            Page {threats.data.pagination.currentPage} of {threats.data.pagination.totalPages}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setThreatPage(prev => Math.max(1, prev - 1))}
                                disabled={!threats.data.pagination.hasPrev}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setThreatPage(prev => prev + 1)}
                                disabled={!threats.data.pagination.hasNext}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
