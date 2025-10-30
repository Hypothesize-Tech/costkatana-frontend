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
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (analyticsError) {
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="glass rounded-xl border border-danger-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-danger-50/80 to-danger-100/80 dark:from-danger-900/20 dark:to-danger-800/20 p-6">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="w-6 h-6 text-danger-600 dark:text-danger-400 mr-3" />
                            <div>
                                <h3 className="text-lg font-semibold text-danger-800 dark:text-danger-200">
                                    Failed to load moderation data
                                </h3>
                                <p className="mt-1 text-danger-700 dark:text-danger-300">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="mb-6 lg:mb-0">
                            <h1 className="text-3xl font-display font-bold gradient-text-primary mb-2">
                                Moderation Dashboard
                            </h1>
                            <p className="text-secondary-600 dark:text-secondary-300">
                                Monitor AI safety and content moderation across your system
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
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
                                className="btn-primary px-4 py-2 text-sm rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-105"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-danger-500/20 to-danger-600/20 flex items-center justify-center">
                                    <ShieldExclamationIcon className="w-6 h-6 text-danger-600 dark:text-danger-400" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Total Threats Blocked</p>
                                <p className="text-2xl font-display font-bold text-secondary-900 dark:text-white">
                                    {data?.summary.totalThreats?.toLocaleString() || '0'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                                    <ChartBarIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Overall Block Rate</p>
                                <p className="text-2xl font-display font-bold text-secondary-900 dark:text-white">
                                    {formatPercentage(data?.summary.overallBlockRate || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-500/20 to-success-600/20 flex items-center justify-center">
                                    <DocumentTextIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Cost Saved</p>
                                <p className="text-2xl font-display font-bold text-secondary-900 dark:text-white">
                                    {formatCurrency(data?.summary.totalCostSaved || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-highlight-500/20 to-highlight-600/20 flex items-center justify-center">
                                    <ClockIcon className="w-6 h-6 text-highlight-600 dark:text-highlight-400" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Last Updated</p>
                                <p className="text-sm font-medium text-secondary-900 dark:text-white">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Input Moderation */}
                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                        <div className="flex items-center mb-6">
                            <ShieldCheckIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                            <h3 className="text-lg font-display font-semibold text-secondary-900 dark:text-white">Pre-LLM Moderation (Input)</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-primary-200/20 dark:border-primary-700/20">
                                <span className="text-sm text-secondary-600 dark:text-secondary-300">Total Requests Processed</span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{data?.input?.totalRequests?.toLocaleString() || '0'}</span>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b border-primary-200/20 dark:border-primary-700/20">
                                <span className="text-sm text-secondary-600 dark:text-secondary-300">Blocked Requests</span>
                                <span className="font-semibold text-danger-600 dark:text-danger-400">{data?.input?.blockedRequests?.toLocaleString() || '0'}</span>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b border-primary-200/20 dark:border-primary-700/20">
                                <span className="text-sm text-secondary-600 dark:text-secondary-300">Cost Saved</span>
                                <span className="font-semibold text-success-600 dark:text-success-400">{formatCurrency(data?.input?.costSaved || 0)}</span>
                            </div>

                            {/* Top Threat Categories */}
                            <div className="pt-4">
                                <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3">Top Threat Categories</h4>
                                <div className="space-y-3">
                                    {Object.entries(data?.input?.threatsByCategory || {})
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 5)
                                        .map(([category, count]) => (
                                            <div key={category} className="flex justify-between items-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getThreatCategoryColor(category)}`}>
                                                    {category.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-sm font-medium text-secondary-900 dark:text-white">{count}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Output Moderation */}
                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                        <div className="flex items-center mb-6">
                            <EyeIcon className="w-5 h-5 text-success-600 dark:text-success-400 mr-2" />
                            <h3 className="text-lg font-display font-semibold text-secondary-900 dark:text-white">Post-LLM Moderation (Output)</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-primary-200/20 dark:border-primary-700/20">
                                <span className="text-sm text-secondary-600 dark:text-secondary-300">Total Responses Processed</span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{data?.output?.totalResponses?.toLocaleString() || '0'}</span>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b border-primary-200/20 dark:border-primary-700/20">
                                <span className="text-sm text-secondary-600 dark:text-secondary-300">Blocked Responses</span>
                                <span className="font-semibold text-danger-600 dark:text-danger-400">{data?.output?.blockedResponses?.toLocaleString() || '0'}</span>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b border-primary-200/20 dark:border-primary-700/20">
                                <span className="text-sm text-secondary-600 dark:text-secondary-300">Redacted Responses</span>
                                <span className="font-semibold text-warning-600 dark:text-warning-400">{data?.output?.redactedResponses?.toLocaleString() || '0'}</span>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b border-primary-200/20 dark:border-primary-700/20">
                                <span className="text-sm text-secondary-600 dark:text-secondary-300">Annotated Responses</span>
                                <span className="font-semibold text-highlight-600 dark:text-highlight-400">{data?.output?.annotatedResponses?.toLocaleString() || '0'}</span>
                            </div>

                            {/* Block Rate by Model */}
                            <div className="pt-4">
                                <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3">Block Rate by Model</h4>
                                <div className="space-y-3">
                                    {Object.entries(data?.output?.blockRateByModel || {})
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 5)
                                        .map(([model, rate]) => (
                                            <div key={model} className="flex justify-between items-center">
                                                <span className="text-sm text-secondary-600 dark:text-secondary-300">{model}</span>
                                                <span className="text-sm font-semibold text-secondary-900 dark:text-white">{formatPercentage(rate)}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Threat Log */}
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="px-6 py-4 border-b border-primary-200/30 dark:border-primary-700/30">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <h3 className="text-lg font-display font-semibold text-secondary-900 dark:text-white mb-4 lg:mb-0">Recent Threats</h3>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="input text-sm"
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
                                    className="input text-sm"
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
                        <table className="min-w-full divide-y divide-primary-200/20 dark:divide-primary-700/20">
                            <thead className="bg-gradient-to-r from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 dark:text-secondary-300 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 dark:text-secondary-300 uppercase tracking-wider">
                                        Stage
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 dark:text-secondary-300 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 dark:text-secondary-300 uppercase tracking-wider">
                                        Confidence
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 dark:text-secondary-300 uppercase tracking-wider">
                                        Cost Saved
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 dark:text-secondary-300 uppercase tracking-wider">
                                        Prompt Preview
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 dark:text-secondary-300 uppercase tracking-wider">
                                        Reason
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-gradient-to-br from-light-bg-100/50 to-light-bg-200/50 dark:from-dark-bg-100/50 dark:to-dark-bg-200/50 divide-y divide-primary-200/20 dark:divide-primary-700/20">
                                {threatsLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center">
                                            <LoadingSpinner />
                                            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-2">Loading threats...</p>
                                        </td>
                                    </tr>
                                ) : (threats?.data?.threats?.length ?? 0) > 0 ? (
                                    threats!.data!.threats!.map((threat) => (
                                        <tr key={threat.id} className="hover:bg-gradient-to-r hover:from-primary-500/5 hover:to-secondary-500/5 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900 dark:text-white">
                                                {new Date(threat.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {getStageIcon(threat.stage)}
                                                    <span className="ml-2 text-sm text-secondary-600 dark:text-secondary-300">{threat.stage}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getThreatCategoryColor(threat.threatCategory)}`}>
                                                    {threat.threatCategory.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900 dark:text-white">
                                                {formatPercentage(threat.confidence * 100)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600 dark:text-success-400 font-medium">
                                                {formatCurrency(threat.costSaved)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-secondary-600 dark:text-secondary-300 max-w-sm">
                                                {threat.promptPreview ? (
                                                    <div>
                                                        <p className="truncate text-secondary-800 dark:text-secondary-200 bg-light-bg-300 dark:bg-dark-bg-300 px-2 py-1 rounded font-mono text-xs">
                                                            {threat.promptPreview}
                                                        </p>
                                                        {threat.promptHash && (
                                                            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                                                                Hash: {threat.promptHash}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-secondary-400 dark:text-secondary-500 text-xs italic">No prompt preview</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-secondary-600 dark:text-secondary-300 max-w-xs">
                                                <div className="truncate" title={threat.reason}>
                                                    {threat.reason}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-secondary-500 dark:text-secondary-400">
                                            No threats found for the selected criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {threats?.data?.pagination && threats.data.pagination.totalPages > 1 && (
                        <div className="px-6 py-3 border-t border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <div className="text-sm text-secondary-600 dark:text-secondary-300 mb-2 sm:mb-0">
                                Page {threats.data.pagination.currentPage} of {threats.data.pagination.totalPages}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setThreatPage(prev => Math.max(1, prev - 1))}
                                    disabled={!threats.data.pagination.hasPrev}
                                    className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setThreatPage(prev => prev + 1)}
                                    disabled={!threats.data.pagination.hasNext}
                                    className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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