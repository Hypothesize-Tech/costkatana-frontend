import { apiClient } from '@/config/api';
import React, { useEffect, useState } from 'react';

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
        try {
            const response = await apiClient.get('/gateway/cache/stats', {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            });
            setMetrics(response.data);
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
            <div className="p-6 rounded-2xl border border-danger-200/50 bg-gradient-to-br from-danger-50 to-danger-100/50 glow-danger animate-scale-in">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-danger flex items-center justify-center mr-4 shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-display font-bold text-danger-800 dark:text-danger-200">Error!</h3>
                        <p className="text-sm font-body text-danger-700 dark:text-danger-300">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="text-center">
                    <div className="spinner w-16 h-16 mb-6"></div>
                    <h3 className="text-xl font-display font-bold gradient-text mb-2">Loading Cache Metrics</h3>
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Fetching cache performance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center mr-4 shadow-2xl glow-primary">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-display font-bold gradient-text">Cache Dashboard</h1>
                </div>
                <button
                    onClick={fetchMetrics}
                    className="btn-primary flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                </button>
            </div>

            {/* Cache Provider Info */}
            <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg glow-primary">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-display font-bold gradient-text">Cache Provider</h2>
                </div>
                <p className="text-lg font-body text-light-text-primary dark:text-dark-text-primary mb-4">Redis Cache</p>
                <div className="flex flex-wrap gap-3 mb-6">
                    <span className="badge bg-gradient-success text-white shadow-lg">Semantic Caching</span>
                    <span className="badge bg-gradient-primary text-white shadow-lg">Deduplication</span>
                    <span className="badge bg-gradient-to-br from-secondary-500 to-secondary-600 text-white shadow-lg">User Scoped</span>
                    <span className="badge bg-gradient-accent text-white shadow-lg">Model Specific</span>
                </div>
                <div className="p-4 rounded-xl glass border border-primary-200/20">
                    <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        Default TTL: <span className="gradient-text font-bold">{metrics.data.config.defaultTTLHours} hours</span> ({metrics.data.config.defaultTTL} seconds)
                    </p>
                </div>
            </div>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 border border-primary-200/30 hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">Total Requests</h2>
                    <p className="text-3xl font-display font-bold gradient-text">{metrics.data.redis.totalRequests.toLocaleString()}</p>
                </div>
                <div className="glass p-6 bg-gradient-to-br from-success-50/50 to-success-100/50 border border-success-200/30 hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">Cache Hits</h2>
                    <p className="text-3xl font-display font-bold gradient-text-success">{metrics.data.redis.hits.toLocaleString()}</p>
                </div>
                <div className="glass p-6 bg-gradient-to-br from-danger-50/50 to-danger-100/50 border border-danger-200/30 hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-danger flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">Cache Misses</h2>
                    <p className="text-3xl font-display font-bold text-danger-600 dark:text-danger-400">{metrics.data.redis.misses.toLocaleString()}</p>
                </div>
                <div className="glass p-6 bg-gradient-to-br from-accent-50/50 to-accent-100/50 border border-accent-200/30 hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">Hit Rate</h2>
                    <p className="text-3xl font-display font-bold gradient-text-accent">{metrics.data.redis.hitRate.toFixed(1)}%</p>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="glass p-4 rounded-xl shadow-lg border border-accent-200/30 bg-gradient-to-br from-accent-50/50 to-accent-100/50 backdrop-blur-xl">
                    <h2 className="text-lg font-display font-bold text-accent-700 dark:text-accent-300">Cost Saved</h2>
                    <p className="text-2xl font-display font-bold gradient-text-accent">${metrics.data.redis.costSaved.toFixed(4)}</p>
                </div>
                <div className="glass p-4 rounded-xl shadow-lg border border-secondary-200/30 bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 backdrop-blur-xl">
                    <h2 className="text-lg font-display font-bold text-secondary-700 dark:text-secondary-300">Tokens Saved</h2>
                    <p className="text-2xl font-display font-bold gradient-text-secondary">{metrics.data.redis.tokensSaved.toLocaleString()}</p>
                </div>
                <div className="glass p-4 rounded-xl shadow-lg border border-primary-200/30 bg-gradient-to-br from-primary-50/50 to-primary-100/50 backdrop-blur-xl">
                    <h2 className="text-lg font-display font-bold text-primary-700 dark:text-primary-300">Avg Response Time</h2>
                    <p className="text-2xl font-display font-bold gradient-text">{metrics.data.redis.avgResponseTime.toFixed(2)}ms</p>
                </div>
            </div>

            {/* Advanced Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-4 rounded-xl shadow-lg border border-primary-200/30 backdrop-blur-xl">
                    <h2 className="text-lg font-display font-bold gradient-text mb-3">Advanced Cache Metrics</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-light-text-secondary dark:text-dark-text-secondary font-body">Semantic Matches:</span>
                            <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">{metrics.data.redis.semanticMatches}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-light-text-secondary dark:text-dark-text-secondary font-body">Deduplication Count:</span>
                            <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">{metrics.data.redis.deduplicationCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-light-text-secondary dark:text-dark-text-secondary font-body">Cache Size:</span>
                            <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">{(metrics.data.redis.cacheSize / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    </div>
                </div>

                <div className="glass p-4 rounded-xl shadow-lg border border-primary-200/30 backdrop-blur-xl">
                    <h2 className="text-lg font-display font-bold gradient-text mb-3">Top Performing Models</h2>
                    <div className="space-y-2">
                        {metrics.data.redis.topModels.slice(0, 5).map((model: { model: string; hits: number }, index: number) => (
                            <div key={index} className="flex justify-between">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary font-body">{model.model}:</span>
                                <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">{model.hits} hits</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CacheDashboard;
