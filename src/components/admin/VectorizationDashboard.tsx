import React, { useState, useEffect } from 'react';
import {
    AdminDashboardService,
    VectorizationDashboard,
} from '../../services/adminDashboard.service';
import { useNotification } from '../../contexts/NotificationContext';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';

export const VectorizationDashboardComponent: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<VectorizationDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        loadDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadDashboardData = async () => {
        try {
            setRefreshing(true);
            setError(null);
            const data = await AdminDashboardService.getVectorizationDashboard();
            setDashboardData(data);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load vectorization dashboard';
            console.error('Error loading vectorization dashboard:', err);
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getHealthStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'optimal':
                return 'text-success-700 dark:text-success-300 bg-gradient-to-r from-success-500/20 to-success-600/20 border-success-300/30 dark:border-success-500/20';
            case 'degraded':
            case 'suboptimal':
                return 'text-warning-700 dark:text-warning-300 bg-gradient-to-r from-warning-500/20 to-warning-600/20 border-warning-300/30 dark:border-warning-500/20';
            case 'error':
                return 'text-danger-700 dark:text-danger-300 bg-gradient-to-r from-danger-500/20 to-danger-600/20 border-danger-300/30 dark:border-danger-500/20';
            case 'high':
            case 'medium':
            case 'building':
                return 'text-primary-700 dark:text-primary-300 bg-gradient-to-r from-primary-500/20 to-primary-600/20 border-primary-300/30 dark:border-primary-500/20';
            default:
                return 'text-light-text-secondary dark:text-dark-text-secondary bg-light-bg-secondary/50 dark:bg-dark-bg-secondary/50 border-primary-200/30 dark:border-primary-500/20';
        }
    };

    const getHealthStatusBadge = (status: string) => {
        const colors = getHealthStatusColor(status);
        return (
            <span className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold border ${colors}`}>
                {status.toUpperCase()}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="p-6 animate-fade-in">
                <div className="space-y-4">
                    <div className="h-8 skeleton rounded w-1/4"></div>
                    <div className="h-64 skeleton rounded-xl"></div>
                    <div className="h-64 skeleton rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 animate-fade-in">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="max-w-md w-full p-8 rounded-xl border shadow-xl glass border-danger-200/30 dark:border-danger-500/20 bg-gradient-to-br from-danger-500/10 to-danger-600/5">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 mb-4 p-4 rounded-xl bg-gradient-danger glow-danger">
                                <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-display font-bold text-danger-700 dark:text-danger-300 mb-2">Error Loading Dashboard</h3>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6">{error}</p>
                            <button
                                onClick={loadDashboardData}
                                className="px-4 py-2.5 bg-gradient-danger text-white rounded-lg font-display font-semibold hover:scale-105 transition-transform duration-200 shadow-lg glow-danger"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="p-6 animate-fade-in">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 mb-4 p-4 rounded-xl bg-gradient-primary glow-primary">
                            <SparklesIcon className="w-full h-full text-white" />
                        </div>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">No vectorization data available</p>
                        <button
                            onClick={loadDashboardData}
                            className="px-4 py-2.5 bg-gradient-primary text-white rounded-lg font-display font-semibold hover:scale-105 transition-transform duration-200 shadow-lg glow-primary"
                        >
                            Load Data
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { health, processingStats, crossModalStats, alerts } = dashboardData;

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-display font-bold gradient-text-primary mb-2">Vectorization Dashboard</h2>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        Monitor memory vectorization health and processing statistics
                    </p>
                </div>
                <button
                    onClick={loadDashboardData}
                    disabled={refreshing}
                    className="px-4 py-2.5 bg-gradient-primary text-white rounded-lg font-display font-semibold hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 shadow-lg glow-primary transition-all duration-200"
                >
                    <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="space-y-3">
                    {alerts.map((alert, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-xl border-l-4 shadow-lg glass backdrop-blur-xl animate-fade-in ${alert.level === 'error'
                                ? 'bg-gradient-to-r from-danger-500/10 to-transparent border-danger-500 dark:border-danger-400'
                                : alert.level === 'warning'
                                    ? 'bg-gradient-to-r from-warning-500/10 to-transparent border-warning-500 dark:border-warning-400'
                                    : 'bg-gradient-to-r from-primary-500/10 to-transparent border-primary-500 dark:border-primary-400'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <p className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{alert.message}</p>
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">{alert.action}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Health Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="group p-6 rounded-xl border shadow-xl glass backdrop-blur-xl transition-all duration-300 border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-primary-300/50 dark:hover:border-primary-400/30">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Embedding Service</h3>
                        {getHealthStatusBadge(health.embeddingService)}
                    </div>
                    <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                        Amazon Titan Embed Text v2
                    </p>
                </div>

                <div className="group p-6 rounded-xl border shadow-xl glass backdrop-blur-xl transition-all duration-300 border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-primary-300/50 dark:hover:border-primary-400/30">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Vector Indexes</h3>
                        {getHealthStatusBadge(health.vectorIndexes)}
                    </div>
                    <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                        MongoDB Atlas Vector Search
                    </p>
                </div>

                <div className="group p-6 rounded-xl border shadow-xl glass backdrop-blur-xl transition-all duration-300 border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-primary-300/50 dark:hover:border-primary-400/30">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Processing Status</h3>
                        {health.currentlyProcessing ? (
                            <span className="px-3 py-1.5 rounded-full text-xs font-display font-semibold border text-primary-700 dark:text-primary-300 bg-gradient-to-r from-primary-500/20 to-primary-600/20 border-primary-300/30 dark:border-primary-500/20">
                                IN PROGRESS
                            </span>
                        ) : (
                            <span className="px-3 py-1.5 rounded-full text-xs font-display font-semibold border text-success-700 dark:text-success-300 bg-gradient-to-r from-success-500/20 to-success-600/20 border-success-300/30 dark:border-success-500/20">
                                IDLE
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                        Background vectorization jobs
                    </p>
                </div>
            </div>

            {/* Storage Usage */}
            <div className="p-6 rounded-xl border shadow-xl glass backdrop-blur-xl border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <h3 className="text-lg font-display font-bold gradient-text-primary mb-6">Storage Usage</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-display text-light-text-secondary dark:text-dark-text-secondary">Current Storage</span>
                            <span className="text-sm font-display font-bold text-light-text-primary dark:text-dark-text-primary">{health.storageUsage.current}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-display text-light-text-secondary dark:text-dark-text-secondary">Projected Storage</span>
                            <span className="text-sm font-display font-bold text-light-text-primary dark:text-dark-text-primary">{health.storageUsage.projected}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-display text-light-text-secondary dark:text-dark-text-secondary">User Memories</span>
                                <span className="text-sm font-display font-bold gradient-text-primary">
                                    {health.storageUsage.userMemories.percentage}%
                                </span>
                            </div>
                            <div className="w-full bg-light-bg-secondary/50 dark:bg-dark-bg-secondary/50 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-500 glow-primary"
                                    style={{ width: `${health.storageUsage.userMemories.percentage}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1.5">
                                {health.storageUsage.userMemories.vectorized} / {health.storageUsage.userMemories.total} vectorized
                            </p>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-display text-light-text-secondary dark:text-dark-text-secondary">Conversations</span>
                                <span className="text-sm font-display font-bold gradient-text-success">
                                    {health.storageUsage.conversations.percentage}%
                                </span>
                            </div>
                            <div className="w-full bg-light-bg-secondary/50 dark:bg-dark-bg-secondary/50 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-success-500 to-success-600 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${health.storageUsage.conversations.percentage}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1.5">
                                {health.storageUsage.conversations.vectorized} / {health.storageUsage.conversations.total} vectorized
                            </p>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-display text-light-text-secondary dark:text-dark-text-secondary">Messages</span>
                                <span className="text-sm font-display font-bold text-purple-600 dark:text-purple-400">
                                    {health.storageUsage.messages.percentage}%
                                </span>
                            </div>
                            <div className="w-full bg-light-bg-secondary/50 dark:bg-dark-bg-secondary/50 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${health.storageUsage.messages.percentage}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1.5">
                                {health.storageUsage.messages.vectorized} / {health.storageUsage.messages.total} vectorized
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Processing Statistics */}
            <div className="p-6 rounded-xl border shadow-xl glass backdrop-blur-xl border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <h3 className="text-lg font-display font-bold gradient-text-primary mb-6">Processing Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-primary/30 dark:bg-dark-bg-primary/30 hover:scale-105 transition-transform duration-200">
                        <div className="text-sm font-display text-light-text-secondary dark:text-dark-text-secondary mb-2">User Memories</div>
                        <div className="text-3xl font-display font-bold gradient-text-primary">{processingStats.userMemories.total}</div>
                        <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-2">
                            ~{Math.round(processingStats.userMemories.estimated / 60)} min estimated
                        </div>
                    </div>
                    <div className="p-5 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-primary/30 dark:bg-dark-bg-primary/30 hover:scale-105 transition-transform duration-200">
                        <div className="text-sm font-display text-light-text-secondary dark:text-dark-text-secondary mb-2">Conversations</div>
                        <div className="text-3xl font-display font-bold gradient-text-primary">{processingStats.conversations.total}</div>
                        <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-2">
                            ~{Math.round(processingStats.conversations.estimated / 60)} min estimated
                        </div>
                    </div>
                    <div className="p-5 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-primary/30 dark:bg-dark-bg-primary/30 hover:scale-105 transition-transform duration-200">
                        <div className="text-sm font-display text-light-text-secondary dark:text-dark-text-secondary mb-2">Messages</div>
                        <div className="text-3xl font-display font-bold gradient-text-primary">{processingStats.messages.total}</div>
                        <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-2">
                            ~{Math.round(processingStats.messages.estimated / 60)} min estimated
                        </div>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-primary-200/30 dark:border-primary-500/20">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-display text-light-text-secondary dark:text-dark-text-secondary">Total Estimated Processing Time</span>
                        <span className="text-xl font-display font-bold gradient-text-primary">
                            ~{Math.round(processingStats.totalEstimated / 60)} minutes
                        </span>
                    </div>
                </div>
            </div>

            {/* Cross-Modal Intelligence Stats */}
            <div className="p-6 rounded-xl border shadow-xl glass backdrop-blur-xl border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <h3 className="text-lg font-display font-bold gradient-text-primary mb-6">Cross-Modal Intelligence</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-primary/30 dark:bg-dark-bg-primary/30 hover:scale-105 transition-transform duration-200">
                        <div className="text-sm font-display text-light-text-secondary dark:text-dark-text-secondary mb-2">Total Vectors</div>
                        <div className="text-3xl font-display font-bold gradient-text-primary">{crossModalStats.totalVectors.toLocaleString()}</div>
                    </div>
                    <div className="p-5 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-primary/30 dark:bg-dark-bg-primary/30 hover:scale-105 transition-transform duration-200">
                        <div className="text-sm font-display text-light-text-secondary dark:text-dark-text-secondary mb-2">Avg Dimensions</div>
                        <div className="text-3xl font-display font-bold gradient-text-primary">{crossModalStats.avgEmbeddingDimensions}</div>
                    </div>
                    <div className="p-5 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-primary/30 dark:bg-dark-bg-primary/30 hover:scale-105 transition-transform duration-200">
                        <div className="text-sm font-display text-light-text-secondary dark:text-dark-text-secondary mb-2">Memory Efficiency</div>
                        <div className="mt-2">
                            {getHealthStatusBadge(crossModalStats.memoryEfficiency)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Last Processing Times */}
            <div className="p-6 rounded-xl border shadow-xl glass backdrop-blur-xl border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <h3 className="text-lg font-display font-bold gradient-text-primary mb-6">Last Processing Times</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-primary/30 dark:bg-dark-bg-primary/30">
                        <div className="text-sm font-display text-light-text-secondary dark:text-dark-text-secondary mb-2">User Memories</div>
                        <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                            {health.lastProcessing.userMemories
                                ? new Date(health.lastProcessing.userMemories).toLocaleString()
                                : 'Never'}
                        </div>
                    </div>
                    <div className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-primary/30 dark:bg-dark-bg-primary/30">
                        <div className="text-sm font-display text-light-text-secondary dark:text-dark-text-secondary mb-2">Conversations</div>
                        <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                            {health.lastProcessing.conversations
                                ? new Date(health.lastProcessing.conversations).toLocaleString()
                                : 'Never'}
                        </div>
                    </div>
                    <div className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-primary/30 dark:bg-dark-bg-primary/30">
                        <div className="text-sm font-display text-light-text-secondary dark:text-dark-text-secondary mb-2">Messages</div>
                        <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                            {health.lastProcessing.messages
                                ? new Date(health.lastProcessing.messages).toLocaleString()
                                : 'Never'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};