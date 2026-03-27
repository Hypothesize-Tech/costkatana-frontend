import { apiClient } from '@/config/api';
import React, { useEffect, useState } from 'react';
import {
    XCircleIcon,
    ArrowPathIcon,
    ServerIcon,
    ChartBarIcon,
    CheckCircleIcon,
    XMarkIcon,
    ArrowTrendingUpIcon,
    BanknotesIcon,
    CpuChipIcon,
    ClockIcon,
    SparklesIcon,
    BoltIcon,
    ServerStackIcon,
    CircleStackIcon,
} from '@heroicons/react/24/outline';
import { CacheShimmer } from '../shimmer/CacheShimmer';

interface GatewayUsagePayload {
    appLevelCacheHits: number;
    totalProviderCacheSavingsUsd: number;
    gatewayProxyRequests: number;
    anthropicCacheReadInputTokens: number;
    anthropicCacheCreationInputTokens: number;
    openaiCachedPromptTokens: number;
    geminiCachedContentTokenCount: number;
    appLevelCacheHitRatePercent: number;
}

interface CacheMetrics {
    success: boolean;
    data: {
        redis: {
            hits: number;
            misses: number;
            totalRequests: number;
            hitRate: number;
            avgResponseTime: number;
            costSaved: number;
            tokensSaved: number;
            deduplicationCount: number;
            semanticMatches: number;
            cacheSize: number;
            topModels: { model: string; hits: number }[];
            topUsers: { userId: string; hits: number }[];
        };
        gateway?: GatewayUsagePayload;
        config: {
            defaultTTL: number;
            defaultTTLHours: number;
        };
    };
}

export const CacheDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<CacheMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = async () => {
        setError(null);
        try {
            const response = await apiClient.get('/gateway/cache/stats');
            const body = response.data as Record<string, unknown>;
            const payload = (body?.data ?? body) as Record<string, unknown> | undefined;
            const redisRaw = (payload?.redis ?? payload) as Record<string, unknown> | undefined;
            const gatewayRaw = payload?.gateway as Record<string, unknown> | undefined;
            const configRaw = payload?.config as Record<string, unknown> | undefined;
            const data: CacheMetrics['data'] = {
                redis: {
                    hits: Number(redisRaw?.hits ?? 0),
                    misses: Number(redisRaw?.misses ?? 0),
                    totalRequests: Number(redisRaw?.totalRequests ?? 0),
                    hitRate: Number(redisRaw?.hitRate ?? 0),
                    avgResponseTime: Number(redisRaw?.avgResponseTime ?? 0),
                    costSaved: Number(redisRaw?.costSaved ?? 0),
                    tokensSaved: Number(redisRaw?.tokensSaved ?? 0),
                    deduplicationCount: Number(redisRaw?.deduplicationCount ?? 0),
                    semanticMatches: Number(redisRaw?.semanticMatches ?? 0),
                    cacheSize: Number(redisRaw?.cacheSize ?? 0),
                    topModels: Array.isArray(redisRaw?.topModels) ? (redisRaw.topModels as { model: string; hits: number }[]) : [],
                    topUsers: Array.isArray(redisRaw?.topUsers) ? (redisRaw.topUsers as { userId: string; hits: number }[]) : [],
                },
                gateway: gatewayRaw
                    ? {
                          appLevelCacheHits: Number(gatewayRaw.appLevelCacheHits ?? 0),
                          totalProviderCacheSavingsUsd: Number(
                              gatewayRaw.totalProviderCacheSavingsUsd ?? 0,
                          ),
                          gatewayProxyRequests: Number(gatewayRaw.gatewayProxyRequests ?? 0),
                          anthropicCacheReadInputTokens: Number(
                              gatewayRaw.anthropicCacheReadInputTokens ?? 0,
                          ),
                          anthropicCacheCreationInputTokens: Number(
                              gatewayRaw.anthropicCacheCreationInputTokens ?? 0,
                          ),
                          openaiCachedPromptTokens: Number(
                              gatewayRaw.openaiCachedPromptTokens ?? 0,
                          ),
                          geminiCachedContentTokenCount: Number(
                              gatewayRaw.geminiCachedContentTokenCount ?? 0,
                          ),
                          appLevelCacheHitRatePercent: Number(
                              gatewayRaw.appLevelCacheHitRatePercent ?? 0,
                          ),
                      }
                    : undefined,
                config: {
                    defaultTTL: Number(configRaw?.defaultTTL ?? 3600),
                    defaultTTLHours: Number(configRaw?.defaultTTLHours ?? 1),
                },
            };
            setMetrics({ success: true, data });
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, []);

    if (error) {
        return (
            <div className="p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-danger-200/30 dark:border-danger-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel animate-fade-in">
                <div className="flex items-center">
                    <div className="flex justify-center items-center mr-3 md:mr-4 w-10 h-10 md:w-12 md:h-12 rounded-xl shadow-lg bg-gradient-danger">
                        <XCircleIcon className="w-5 h-5 md:w-7 md:h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="mb-1 text-lg md:text-xl font-bold font-display gradient-text-danger">Error Loading Cache Metrics</h3>
                        <p className="text-sm md:text-base font-body text-light-text-secondary dark:text-dark-text-secondary">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!metrics?.data?.redis) {
        return <CacheShimmer />;
    }

    const redis = metrics.data.redis;
    const gateway = metrics.data.gateway;
    const config = metrics.data.config ?? { defaultTTL: 3600, defaultTTLHours: 1 };

    return (
        <div className="p-3 md:p-5 lg:p-6 mx-auto space-y-4 md:space-y-5 lg:space-y-6 max-w-7xl animate-fade-in">
            {/* Header */}
            <div className="p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 justify-between items-start lg:flex-row lg:items-center">
                    <div className="flex gap-3 md:gap-4 lg:gap-5 items-center">
                        <div className="p-3 md:p-3.5 lg:p-4 rounded-2xl shadow-xl bg-gradient-primary glow-primary shrink-0">
                            <CircleStackIcon className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="mb-1 md:mb-2 text-2xl md:text-2xl lg:text-3xl font-bold font-display gradient-text-primary">Cache Dashboard</h1>
                            <p className="text-sm md:text-base font-body text-light-text-secondary dark:text-dark-text-secondary">Real-time cache performance and optimization metrics</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchMetrics}
                        className="flex gap-2 items-center btn btn-primary w-full lg:w-auto justify-center"
                    >
                        <ArrowPathIcon className="w-4 h-4 md:w-5 md:h-5" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Cache Provider Info */}
            <div className="p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex items-center mb-4 md:mb-5 lg:mb-6">
                    <div className="p-2.5 md:p-3 lg:p-3.5 rounded-xl shadow-lg bg-gradient-primary glow-primary mr-3 md:mr-4">
                        <ServerIcon className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold font-display gradient-text-primary">Cache Provider</h2>
                </div>
                <p className="mb-4 md:mb-5 text-base md:text-lg font-semibold font-body text-light-text-primary dark:text-dark-text-primary">Redis Cache</p>
                <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-5 lg:mb-6">
                    <span className="inline-flex items-center gap-1 md:gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold font-display bg-gradient-success text-white shadow-lg border border-success-300/30 dark:border-success-500/20">
                        <SparklesIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Semantic Caching
                    </span>
                    <span className="inline-flex items-center gap-1 md:gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold font-display bg-gradient-primary text-white shadow-lg border border-primary-300/30 dark:border-primary-500/20">
                        <BoltIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Deduplication
                    </span>
                    <span className="inline-flex items-center gap-1 md:gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold font-display bg-gradient-secondary text-white shadow-lg border border-secondary-300/30 dark:border-secondary-500/20">
                        <ServerStackIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        User Scoped
                    </span>
                    <span className="inline-flex items-center gap-1 md:gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold font-display bg-gradient-accent text-white shadow-lg border border-accent-300/30 dark:border-accent-500/20">
                        <CpuChipIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Model Specific
                    </span>
                </div>
                <div className="p-3 md:p-4 lg:p-5 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-bg-300/50">
                    <div className="flex gap-2 items-center">
                        <ClockIcon className="w-4 h-4 md:w-5 md:h-5 text-primary-500 dark:text-primary-400 shrink-0" />
                        <p className="text-xs md:text-sm font-medium font-body text-light-text-secondary dark:text-dark-text-secondary">
                            Default TTL: <span className="font-bold gradient-text-primary font-display">{config.defaultTTLHours ?? 1} hours</span> <span className="hidden sm:inline">({config.defaultTTL ?? 3600} seconds)</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Gateway proxy cache (Usage analytics: Redis response cache + provider prompt cache) */}
            {gateway && (
                <div className="p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-secondary-200/30 dark:border-secondary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex items-center mb-4 md:mb-5 lg:mb-6">
                        <div className="p-2.5 md:p-3 lg:p-3.5 rounded-xl shadow-lg bg-gradient-secondary mr-3 md:mr-4">
                            <BoltIcon className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold font-display gradient-text-secondary">Gateway cache</h2>
                            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                From your gateway proxy traffic: app-level Redis hits and provider-native prompt cache (Anthropic / OpenAI / Gemini)
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="p-3 md:p-4 rounded-xl border glass border-secondary-200/30">
                            <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">Gateway requests tracked</p>
                            <p className="text-2xl font-bold font-display gradient-text-secondary">
                                {gateway.gatewayProxyRequests.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 md:p-4 rounded-xl border glass border-success-200/30">
                            <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">App-level cache hits (Redis)</p>
                            <p className="text-2xl font-bold font-display gradient-text-success">
                                {gateway.appLevelCacheHits.toLocaleString()}
                            </p>
                            <p className="text-xs mt-1 text-light-text-secondary">
                                {gateway.appLevelCacheHitRatePercent.toFixed(1)}% of gateway requests
                            </p>
                        </div>
                        <div className="p-3 md:p-4 rounded-xl border glass border-accent-200/30">
                            <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">Provider cache savings (est. USD)</p>
                            <p className="text-2xl font-bold font-display gradient-text-accent">
                                ${gateway.totalProviderCacheSavingsUsd.toFixed(4)}
                            </p>
                        </div>
                        <div className="p-3 md:p-4 rounded-xl border glass border-primary-200/30">
                            <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">Cached tokens (provider-reported)</p>
                            <p className="text-sm font-mono text-light-text-primary dark:text-dark-text-primary">
                                Anthropic read: {gateway.anthropicCacheReadInputTokens.toLocaleString()}
                            </p>
                            <p className="text-sm font-mono text-light-text-primary dark:text-dark-text-primary">
                                OpenAI cached: {gateway.openaiCachedPromptTokens.toLocaleString()}
                            </p>
                            <p className="text-sm font-mono text-light-text-primary dark:text-dark-text-primary">
                                Gemini: {gateway.geminiCachedContentTokenCount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    {gateway.gatewayProxyRequests === 0 && (
                        <p className="mt-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            No gateway proxy usage with analytics in this account yet.
                        </p>
                    )}
                </div>
            )}

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 gap-3 md:gap-4 lg:gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 md:p-5 lg:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel lg:hover:scale-105 hover:shadow-2xl hover:border-primary-300/50 dark:hover:border-primary-400/30 animate-fade-in">
                    <div className="flex gap-3 md:gap-4 items-start">
                        <div className="p-2.5 md:p-3 lg:p-3.5 rounded-xl shadow-lg bg-gradient-primary shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <ChartBarIcon className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="mb-1 md:mb-2 text-2xl md:text-2xl lg:text-3xl font-bold font-display gradient-text-primary">{(redis.totalRequests ?? 0).toLocaleString()}</h3>
                            <p className="text-xs md:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Total Requests</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 md:p-5 lg:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-success-200/30 dark:border-success-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel lg:hover:scale-105 hover:shadow-2xl hover:border-success-300/50 dark:hover:border-success-400/30 animate-fade-in animation-delay-100">
                    <div className="flex gap-3 md:gap-4 items-start">
                        <div className="p-2.5 md:p-3 lg:p-3.5 rounded-xl shadow-lg bg-gradient-success glow-success shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <CheckCircleIcon className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="mb-1 md:mb-2 text-2xl md:text-2xl lg:text-3xl font-bold font-display gradient-text-success">{(redis.hits ?? 0).toLocaleString()}</h3>
                            <p className="text-xs md:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Cache Hits</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 md:p-5 lg:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-danger-200/30 dark:border-danger-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel lg:hover:scale-105 hover:shadow-2xl hover:border-danger-300/50 dark:hover:border-danger-400/30 animate-fade-in animation-delay-200">
                    <div className="flex gap-3 md:gap-4 items-start">
                        <div className="p-2.5 md:p-3 lg:p-3.5 rounded-xl shadow-lg bg-gradient-danger shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <XMarkIcon className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="mb-1 md:mb-2 text-2xl md:text-2xl lg:text-3xl font-bold font-display gradient-text-danger">{(redis.misses ?? 0).toLocaleString()}</h3>
                            <p className="text-xs md:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Cache Misses</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 md:p-5 lg:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-accent-200/30 dark:border-accent-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel lg:hover:scale-105 hover:shadow-2xl hover:border-accent-300/50 dark:hover:border-accent-400/30 animate-fade-in animation-delay-300">
                    <div className="flex gap-3 md:gap-4 items-start">
                        <div className="p-2.5 md:p-3 lg:p-3.5 rounded-xl shadow-lg bg-gradient-accent shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <ArrowTrendingUpIcon className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="mb-1 md:mb-2 text-2xl md:text-2xl lg:text-3xl font-bold font-display gradient-text-accent">{(redis.hitRate ?? 0).toFixed(1)}%</h3>
                            <p className="text-xs md:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Hit Rate</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 gap-3 md:gap-4 lg:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 md:p-5 lg:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-accent-200/30 dark:border-accent-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel lg:hover:scale-105 hover:shadow-2xl">
                    <div className="flex gap-3 md:gap-4 items-center">
                        <div className="p-2.5 md:p-2.5 lg:p-3 rounded-xl shadow-lg transition-transform duration-300 bg-gradient-accent shrink-0 group-hover:scale-110">
                            <BanknotesIcon className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="mb-1 text-xl md:text-xl lg:text-2xl font-bold font-display gradient-text-accent">${(redis.costSaved ?? 0).toFixed(4)}</h3>
                            <p className="text-xs md:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Cost Saved</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 md:p-5 lg:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-secondary-200/30 dark:border-secondary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel lg:hover:scale-105 hover:shadow-2xl">
                    <div className="flex gap-3 md:gap-4 items-center">
                        <div className="p-2.5 md:p-2.5 lg:p-3 rounded-xl shadow-lg transition-transform duration-300 bg-gradient-secondary shrink-0 group-hover:scale-110">
                            <CpuChipIcon className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="mb-1 text-xl md:text-xl lg:text-2xl font-bold font-display gradient-text-secondary">{(redis.tokensSaved ?? 0).toLocaleString()}</h3>
                            <p className="text-xs md:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Tokens Saved</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 md:p-5 lg:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel lg:hover:scale-105 hover:shadow-2xl">
                    <div className="flex gap-3 md:gap-4 items-center">
                        <div className="p-2.5 md:p-2.5 lg:p-3 rounded-xl shadow-lg transition-transform duration-300 bg-gradient-primary glow-primary shrink-0 group-hover:scale-110">
                            <ClockIcon className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="mb-1 text-xl md:text-xl lg:text-2xl font-bold font-display gradient-text-primary">{(redis.avgResponseTime ?? 0).toFixed(2)}ms</h3>
                            <p className="text-xs md:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Avg Response Time</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Metrics */}
            <div className="grid grid-cols-1 gap-4 md:gap-5 lg:gap-6 md:grid-cols-2">
                <div className="p-4 md:p-5 lg:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex gap-2 md:gap-3 items-center mb-4 md:mb-5">
                        <div className="p-2.5 md:p-2.5 lg:p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary">
                            <SparklesIcon className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <h2 className="text-lg md:text-xl font-bold font-display gradient-text-primary">Advanced Cache Metrics</h2>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                        <div className="flex justify-between items-center p-3 md:p-4 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                            <span className="text-xs md:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Semantic Matches:</span>
                            <span className="text-base md:text-lg font-bold font-display gradient-text-primary">{(redis.semanticMatches ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 md:p-4 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                            <span className="text-xs md:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Deduplication Count:</span>
                            <span className="text-base md:text-lg font-bold font-display gradient-text-primary">{(redis.deduplicationCount ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 md:p-4 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                            <span className="text-xs md:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Cache Size:</span>
                            <span className="text-base md:text-lg font-bold font-display gradient-text-primary">{((redis.cacheSize ?? 0) / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-5 lg:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex gap-2 md:gap-3 items-center mb-4 md:mb-5">
                        <div className="p-2.5 md:p-2.5 lg:p-3 rounded-xl shadow-lg bg-gradient-success glow-success">
                            <ChartBarIcon className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <h2 className="text-lg md:text-xl font-bold font-display gradient-text-success">Top Performing Models</h2>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                        {(redis.topModels ?? []).slice(0, 5).map((model: { model: string; hits: number }, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 md:p-4 rounded-xl border glass border-success-200/30 dark:border-success-500/20">
                                <span className="mr-2 text-xs md:text-sm font-semibold truncate font-display text-light-text-secondary dark:text-dark-text-secondary">{model.model}</span>
                                <span className="text-base md:text-lg font-bold font-display gradient-text-success shrink-0">{model.hits.toLocaleString()} hits</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CacheDashboard;
