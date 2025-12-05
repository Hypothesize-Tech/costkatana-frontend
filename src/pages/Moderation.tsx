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
import { ModerationShimmer } from '../components/shimmer/ModerationShimmer';

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

interface Pagination {
    currentPage: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
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
        queryFn: () => moderationService.getAnalytics(getDateRange())
    });

    // Fetch threat logs
    const {
        data: threats,
        isLoading: threatsLoading,
        refetch: refetchThreats
    } = useQuery<{ data: { threats: ThreatLog[]; pagination: Pagination } }>({
        queryKey: ['moderationThreats', selectedCategory, selectedStage, threatPage, refreshTrigger],
        queryFn: () => moderationService.getThreats({
            page: threatPage,
            limit: 20,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            stage: selectedStage !== 'all' ? selectedStage : undefined,
            ...getDateRange()
        })
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
            'violence_and_hate': 'text-danger-700 bg-danger-50 border-danger-200 dark:text-danger-300 dark:bg-danger-900/20 dark:border-danger-700',
            'sexual_content': 'text-pink-700 bg-pink-50 border-pink-200 dark:text-pink-300 dark:bg-pink-900/20 dark:border-pink-700',
            'self_harm': 'text-warning-700 bg-warning-50 border-warning-200 dark:text-warning-300 dark:bg-warning-900/20 dark:border-warning-700',
            'prompt_injection': 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-900/20 dark:border-purple-700',
            'jailbreak_attempt': 'text-primary-700 bg-primary-50 border-primary-200 dark:text-primary-300 dark:bg-primary-900/20 dark:border-primary-700',
            'privacy_violations': 'text-secondary-700 bg-secondary-50 border-secondary-200 dark:text-secondary-300 dark:bg-secondary-900/20 dark:border-secondary-700',
            'harmful_content': 'text-highlight-700 bg-highlight-50 border-highlight-200 dark:text-highlight-300 dark:bg-highlight-900/20 dark:border-highlight-700',
        };
        return colors[category] || 'text-secondary-700 bg-secondary-50 border-secondary-200 dark:text-secondary-300 dark:bg-secondary-900/20 dark:border-secondary-700';
    };

    const getStageIcon = (stage: string) => {
        switch (stage) {
            case 'prompt-guard':
                return <ShieldCheckIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />;
            case 'llama-guard':
                return <ShieldExclamationIcon className="w-4 h-4 text-warning-600 dark:text-warning-400" />;
            case 'output-guard':
                return <EyeIcon className="w-4 h-4 text-success-600 dark:text-success-400" />;
            default:
                return <ExclamationTriangleIcon className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />;
        }
    };

    if (analyticsLoading) {
        return <ModerationShimmer />;
    }

    if (analyticsError) {
        return (
            <div className="p-4 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient sm:p-6">
                <div className="mx-auto max-w-4xl">
                    <div className="p-4 bg-gradient-to-br rounded-xl border shadow-xl backdrop-blur-xl glass border-danger-200/30 from-danger-50/80 to-danger-100/80 dark:from-danger-900/20 dark:to-danger-800/20 sm:p-6">
                        <div className="flex items-start sm:items-center">
                            <ExclamationTriangleIcon className="mr-3 w-5 h-5 flex-shrink-0 text-danger-600 dark:text-danger-400 sm:w-6 sm:h-6" />
                            <div>
                                <h3 className="text-base font-semibold text-danger-800 dark:text-danger-200 sm:text-lg">
                                    Failed to load moderation data
                                </h3>
                                <p className="mt-1 text-sm text-danger-700 dark:text-danger-300 sm:text-base">
                                    Please try refreshing the page or contact support if the issue persists.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const data = analytics?.data;

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="px-3 py-4 mx-auto max-w-7xl sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">
                {/* Header */}
                <div className="p-4 mb-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6 md:p-8 md:mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="mb-4 lg:mb-0 sm:mb-6">
                            <h1 className="mb-2 text-2xl font-bold font-display gradient-text-primary sm:text-3xl">
                                Moderation Dashboard
                            </h1>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300 sm:text-base">
                                Monitor AI safety and content moderation across your system
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <select
                                value={selectedTimeRange}
                                onChange={(e) => setSelectedTimeRange(e.target.value as '24h' | '7d' | '30d')}
                                className="w-full text-sm input sm:w-auto"
                            >
                                <option value="24h">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                            </select>

                            <button
                                onClick={handleRefresh}
                                className="flex gap-2 items-center justify-center px-4 py-2 text-sm rounded-xl transition-all duration-200 btn-primary hover:scale-105 sm:justify-start"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 mb-6 sm:gap-5 sm:mb-6 md:gap-6 md:grid-cols-2 md:mb-8 lg:grid-cols-4">
                    <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:shadow-2xl sm:p-5 md:p-6 lg:hover:scale-105">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-br rounded-xl from-danger-500/20 to-danger-600/20 sm:w-12 sm:h-12">
                                    <ShieldExclamationIcon className="w-5 h-5 text-danger-600 dark:text-danger-400 sm:w-6 sm:h-6" />
                                </div>
                            </div>
                            <div className="ml-3 sm:ml-4">
                                <p className="text-xs font-medium text-secondary-600 dark:text-secondary-300 sm:text-sm">Total Threats Blocked</p>
                                <p className="text-xl font-bold font-display text-secondary-900 dark:text-white sm:text-2xl">
                                    {data?.summary.totalThreats?.toLocaleString() || '0'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:shadow-2xl sm:p-5 md:p-6 lg:hover:scale-105">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-br rounded-xl from-primary-500/20 to-secondary-500/20 sm:w-12 sm:h-12">
                                    <ChartBarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 sm:w-6 sm:h-6" />
                                </div>
                            </div>
                            <div className="ml-3 sm:ml-4">
                                <p className="text-xs font-medium text-secondary-600 dark:text-secondary-300 sm:text-sm">Overall Block Rate</p>
                                <p className="text-xl font-bold font-display text-secondary-900 dark:text-white sm:text-2xl">
                                    {formatPercentage(data?.summary.overallBlockRate || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:shadow-2xl sm:p-5 md:p-6 lg:hover:scale-105">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-br rounded-xl from-success-500/20 to-success-600/20 sm:w-12 sm:h-12">
                                    <DocumentTextIcon className="w-5 h-5 text-success-600 dark:text-success-400 sm:w-6 sm:h-6" />
                                </div>
                            </div>
                            <div className="ml-3 sm:ml-4">
                                <p className="text-xs font-medium text-secondary-600 dark:text-secondary-300 sm:text-sm">Cost Saved</p>
                                <p className="text-xl font-bold font-display text-secondary-900 dark:text-white sm:text-2xl">
                                    {formatCurrency(data?.summary.totalCostSaved || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:shadow-2xl sm:p-5 md:p-6 lg:hover:scale-105">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-br rounded-xl from-highlight-500/20 to-highlight-600/20 sm:w-12 sm:h-12">
                                    <ClockIcon className="w-5 h-5 text-highlight-600 dark:text-highlight-400 sm:w-6 sm:h-6" />
                                </div>
                            </div>
                            <div className="ml-3 sm:ml-4">
                                <p className="text-xs font-medium text-secondary-600 dark:text-secondary-300 sm:text-sm">Last Updated</p>
                                <p className="text-xs font-medium text-secondary-900 dark:text-white sm:text-sm">
                                    {data?.summary.lastUpdated ?
                                        new Date(data.summary.lastUpdated).toLocaleTimeString() :
                                        'Never'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Moderation Breakdown */}
                <div className="grid grid-cols-1 gap-4 mb-6 sm:gap-5 sm:mb-6 md:gap-6 md:mb-8 lg:grid-cols-2">
                    {/* Input Moderation */}
                    <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-6">
                        <div className="flex items-center mb-4 sm:mb-5 md:mb-6">
                            <ShieldCheckIcon className="mr-2 w-4 h-4 text-primary-600 dark:text-primary-400 sm:w-5 sm:h-5" />
                            <h3 className="text-base font-semibold font-display text-secondary-900 dark:text-white sm:text-lg">Pre-LLM Moderation (Input)</h3>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-primary-200/20 dark:border-primary-700/20 sm:py-3">
                                <span className="text-xs text-secondary-600 dark:text-secondary-300 sm:text-sm">Total Requests Processed</span>
                                <span className="text-sm font-semibold text-secondary-900 dark:text-white sm:text-base">{data?.input?.totalRequests?.toLocaleString() || '0'}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-primary-200/20 dark:border-primary-700/20 sm:py-3">
                                <span className="text-xs text-secondary-600 dark:text-secondary-300 sm:text-sm">Blocked Requests</span>
                                <span className="text-sm font-semibold text-danger-600 dark:text-danger-400 sm:text-base">{data?.input?.blockedRequests?.toLocaleString() || '0'}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-primary-200/20 dark:border-primary-700/20 sm:py-3">
                                <span className="text-xs text-secondary-600 dark:text-secondary-300 sm:text-sm">Cost Saved</span>
                                <span className="text-sm font-semibold text-success-600 dark:text-success-400 sm:text-base">{formatCurrency(data?.input?.costSaved || 0)}</span>
                            </div>

                            {/* Top Threat Categories */}
                            <div className="pt-3 sm:pt-4">
                                <h4 className="mb-2 text-xs font-semibold text-secondary-900 dark:text-white sm:mb-3 sm:text-sm">Top Threat Categories</h4>
                                <div className="space-y-2 sm:space-y-3">
                                    {Object.entries(data?.input?.threatsByCategory || {})
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 5)
                                        .map(([category, count]) => (
                                            <div key={category} className="flex justify-between items-center flex-wrap gap-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getThreatCategoryColor(category)} sm:px-3`}>
                                                    {category.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-xs font-medium text-secondary-900 dark:text-white sm:text-sm">{count}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Output Moderation */}
                    <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-6">
                        <div className="flex items-center mb-4 sm:mb-5 md:mb-6">
                            <EyeIcon className="mr-2 w-4 h-4 text-success-600 dark:text-success-400 sm:w-5 sm:h-5" />
                            <h3 className="text-base font-semibold font-display text-secondary-900 dark:text-white sm:text-lg">Post-LLM Moderation (Output)</h3>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-primary-200/20 dark:border-primary-700/20 sm:py-3">
                                <span className="text-xs text-secondary-600 dark:text-secondary-300 sm:text-sm">Total Responses Processed</span>
                                <span className="text-sm font-semibold text-secondary-900 dark:text-white sm:text-base">{data?.output?.totalResponses?.toLocaleString() || '0'}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-primary-200/20 dark:border-primary-700/20 sm:py-3">
                                <span className="text-xs text-secondary-600 dark:text-secondary-300 sm:text-sm">Blocked Responses</span>
                                <span className="text-sm font-semibold text-danger-600 dark:text-danger-400 sm:text-base">{data?.output?.blockedResponses?.toLocaleString() || '0'}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-primary-200/20 dark:border-primary-700/20 sm:py-3">
                                <span className="text-xs text-secondary-600 dark:text-secondary-300 sm:text-sm">Redacted Responses</span>
                                <span className="text-sm font-semibold text-warning-600 dark:text-warning-400 sm:text-base">{data?.output?.redactedResponses?.toLocaleString() || '0'}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-primary-200/20 dark:border-primary-700/20 sm:py-3">
                                <span className="text-xs text-secondary-600 dark:text-secondary-300 sm:text-sm">Annotated Responses</span>
                                <span className="text-sm font-semibold text-highlight-600 dark:text-highlight-400 sm:text-base">{data?.output?.annotatedResponses?.toLocaleString() || '0'}</span>
                            </div>

                            {/* Block Rate by Model */}
                            <div className="pt-3 sm:pt-4">
                                <h4 className="mb-2 text-xs font-semibold text-secondary-900 dark:text-white sm:mb-3 sm:text-sm">Block Rate by Model</h4>
                                <div className="space-y-2 sm:space-y-3">
                                    {Object.entries(data?.output?.blockRateByModel || {})
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 5)
                                        .map(([model, rate]) => (
                                            <div key={model} className="flex justify-between items-center flex-wrap gap-2">
                                                <span className="text-xs text-secondary-600 dark:text-secondary-300 sm:text-sm break-words">{model}</span>
                                                <span className="text-xs font-semibold text-secondary-900 dark:text-white sm:text-sm whitespace-nowrap">{formatPercentage(rate)}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Threat Log */}
                <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="px-3 py-3 border-b border-primary-200/30 dark:border-primary-700/30 sm:px-4 sm:py-4 md:px-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <h3 className="mb-3 text-base font-semibold font-display text-secondary-900 dark:text-white sm:text-lg lg:mb-0">Recent Threats</h3>

                            <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full text-sm input sm:w-auto"
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
                                    className="w-full text-sm input sm:w-auto"
                                >
                                    <option value="all">All Stages</option>
                                    <option value="prompt-guard">Prompt Guard</option>
                                    <option value="llama-guard">Llama Guard</option>
                                    <option value="output-guard">Output Guard</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto -mx-3 sm:-mx-4 md:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden border-b border-primary-200/20 dark:border-primary-700/20">
                                <table className="min-w-full divide-y divide-primary-200/20 dark:divide-primary-700/20">
                                    <thead className="bg-gradient-to-r from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-600 dark:text-secondary-300 whitespace-nowrap md:px-6">
                                                Timestamp
                                            </th>
                                            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-600 dark:text-secondary-300 whitespace-nowrap md:px-6">
                                                Stage
                                            </th>
                                            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-600 dark:text-secondary-300 whitespace-nowrap md:px-6">
                                                Category
                                            </th>
                                            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-600 dark:text-secondary-300 whitespace-nowrap md:px-6">
                                                Confidence
                                            </th>
                                            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-600 dark:text-secondary-300 whitespace-nowrap md:px-6">
                                                Cost Saved
                                            </th>
                                            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-600 dark:text-secondary-300 md:px-6">
                                                Prompt Preview
                                            </th>
                                            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-600 dark:text-secondary-300 md:px-6">
                                                Reason
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-gradient-to-br divide-y from-light-bg-100/50 to-light-bg-200/50 dark:from-dark-bg-100/50 dark:to-dark-bg-200/50 divide-primary-200/20 dark:divide-primary-700/20">
                                        {threatsLoading ? (
                                            <>
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                                    <tr key={row}>
                                                        <td className="px-4 py-4 md:px-6">
                                                            <div className="w-32 h-4 rounded skeleton" />
                                                        </td>
                                                        <td className="px-4 py-4 md:px-6">
                                                            <div className="flex items-center">
                                                                <div className="w-4 h-4 rounded skeleton" />
                                                                <div className="ml-2 w-24 h-4 rounded skeleton" />
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 md:px-6">
                                                            <div className="w-32 h-6 rounded-full skeleton" />
                                                        </td>
                                                        <td className="px-4 py-4 md:px-6">
                                                            <div className="w-16 h-4 rounded skeleton" />
                                                        </td>
                                                        <td className="px-4 py-4 md:px-6">
                                                            <div className="w-20 h-4 rounded skeleton" />
                                                        </td>
                                                        <td className="px-4 py-4 md:px-6">
                                                            <div className="w-48 h-4 rounded skeleton" />
                                                        </td>
                                                        <td className="px-4 py-4 md:px-6">
                                                            <div className="w-64 h-4 rounded skeleton" />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </>
                                        ) : (threats?.data?.threats?.length ?? 0) > 0 ? (
                                            threats!.data!.threats!.map((threat) => (
                                                <tr key={threat.id} className="transition-colors duration-200 hover:bg-gradient-to-r hover:from-primary-500/5 hover:to-secondary-500/5">
                                                    <td className="px-4 py-4 text-sm whitespace-nowrap overflow-hidden text-secondary-900 dark:text-white md:px-6">
                                                        <div className="truncate">
                                                            <span className="hidden sm:inline">{new Date(threat.timestamp).toLocaleString()}</span>
                                                            <span className="sm:hidden">{new Date(threat.timestamp).toLocaleDateString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 overflow-hidden md:px-6">
                                                        <div className="flex items-center min-w-0">
                                                            <div className="flex-shrink-0">
                                                                {getStageIcon(threat.stage)}
                                                            </div>
                                                            <span className="ml-2 text-sm truncate text-secondary-600 dark:text-secondary-300">{threat.stage}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 overflow-hidden md:px-6">
                                                        <div className="inline-block max-w-full">
                                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getThreatCategoryColor(threat.threatCategory)}`}>
                                                                {threat.threatCategory.replace(/_/g, ' ')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm whitespace-nowrap overflow-hidden text-secondary-900 dark:text-white md:px-6">
                                                        <div className="truncate">
                                                            {formatPercentage(threat.confidence * 100)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-medium whitespace-nowrap overflow-hidden text-success-600 dark:text-success-400 md:px-6">
                                                        <div className="truncate">
                                                            {formatCurrency(threat.costSaved)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 overflow-hidden text-sm text-secondary-600 dark:text-secondary-300 md:px-6">
                                                        <div className="min-w-0">
                                                            {threat.promptPreview ? (
                                                                <div>
                                                                    <p className="px-2 py-1 font-mono text-xs truncate rounded text-secondary-800 dark:text-secondary-200 bg-light-bg-300 dark:bg-dark-bg-300">
                                                                        {threat.promptPreview}
                                                                    </p>
                                                                    {threat.promptHash && (
                                                                        <p className="mt-1 text-xs truncate text-secondary-500 dark:text-secondary-400">
                                                                            Hash: {threat.promptHash}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs italic text-secondary-400 dark:text-secondary-500">No prompt preview</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 overflow-hidden text-sm text-secondary-600 dark:text-secondary-300 md:px-6">
                                                        <div className="truncate min-w-0" title={threat.reason}>
                                                            {threat.reason}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-sm text-secondary-500 dark:text-secondary-400 md:px-6">
                                                    No threats found for the selected criteria
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Pagination */}
                    {threats?.data?.pagination && threats.data.pagination.totalPages > 1 && (
                        <div className="flex flex-col px-3 py-3 border-t border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:px-4 sm:flex-row sm:justify-between sm:items-center md:px-6">
                            <div className="mb-2 text-xs text-secondary-600 dark:text-secondary-300 sm:mb-0 sm:text-sm">
                                Page {threats.data.pagination.currentPage} of {threats.data.pagination.totalPages}
                            </div>
                            <div className="flex gap-2 sm:space-x-2">
                                <button
                                    onClick={() => setThreatPage(prev => Math.max(1, prev - 1))}
                                    disabled={!threats.data.pagination.hasPrev}
                                    className="flex-1 px-3 py-2 text-xs btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed sm:flex-none sm:text-sm sm:py-1"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setThreatPage(prev => prev + 1)}
                                    disabled={!threats.data.pagination.hasNext}
                                    className="flex-1 px-3 py-2 text-xs btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed sm:flex-none sm:text-sm sm:py-1"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};