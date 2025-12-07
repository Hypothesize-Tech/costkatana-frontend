import React, { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    CpuChipIcon,
    CurrencyDollarIcon,
    ClockIcon,
    LightBulbIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { MetricCardShimmer, FlowCardShimmer, InterventionCardShimmer, BudgetForecastShimmer } from './BrainShimmer';
import { API_BASE_URL } from '../../config/api';

interface ActiveFlow {
    flowId: string;
    type: string;
    startTime: Date;
    estimatedCost: number;
    priority: string;
    metadata: Record<string, unknown>;
}

interface UserMetrics {
    totalActiveFlows: number;
    totalEstimatedCost: number;
    costBurnRate: string;
    flowsByType: Record<string, number>;
}

interface Intervention {
    timestamp: Date;
    interventionType: string;
    reason: string;
    costSaved: number;
    originalRequest: {
        model: string;
    };
    modifiedRequest: {
        model: string;
    };
}

interface BudgetForecast {
    budgetLimit: number;
    currentSpend: number;
    remaining: number;
    utilizationPercent: string;
    hoursUntilExhaustion: string;
    alert: 'normal' | 'warning' | 'critical';
    recommendation: string;
}

export const UserBrainInsights: React.FC = () => {
    const [activeFlows, setActiveFlows] = useState<ActiveFlow[]>([]);
    const [metrics, setMetrics] = useState<UserMetrics | null>(null);
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [budgetForecast, setBudgetForecast] = useState<BudgetForecast | null>(null);
    const [loading, setLoading] = useState(true);
    const [eventSource, setEventSource] = useState<EventSource | null>(null);

    useEffect(() => {
        loadInitialData();
        connectSSE();

        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            const baseUrl = API_BASE_URL || 'http://localhost:8000';

            const [flowsRes, metricsRes, interventionsRes, budgetRes] = await Promise.all([
                fetch(`${baseUrl}/api/brain/user/active-flows`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${baseUrl}/api/brain/user/metrics`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${baseUrl}/api/brain/user/interventions`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${baseUrl}/api/brain/user/budget/forecast`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const flows = await flowsRes.json();
            const metricsData = await metricsRes.json();
            const interventionsData = await interventionsRes.json();
            const budgetData = await budgetRes.json();

            setActiveFlows(flows.data?.flows || []);
            setMetrics(metricsData.data);
            setInterventions(interventionsData.data?.interventions || []);
            setBudgetForecast(budgetData.data);
        } catch (error) {
            console.error('Failed to load brain insights:', error);
        } finally {
            setLoading(false);
        }
    };

    const connectSSE = () => {
        const token = localStorage.getItem('access_token');
        const baseUrl = API_BASE_URL || 'http://localhost:8000';
        const es = new EventSource(`${baseUrl}/api/brain/user/stream?token=${token}`);

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleSSEEvent(data);
            } catch (error) {
                console.error('SSE parse error:', error);
            }
        };

        es.onerror = () => {
            console.error('SSE connection error, reconnecting...');
            setTimeout(connectSSE, 5000);
        };

        setEventSource(es);
    };

    const handleSSEEvent = (event: {
        type: string;
        flowId?: string;
        userId?: string;
        data?: ActiveFlow | UserMetrics | Intervention;
    }) => {
        switch (event.type) {
            case 'flow-started':
                if (event.userId === localStorage.getItem('userId') && event.data) {
                    setActiveFlows(prev => [...prev, event.data as ActiveFlow]);
                }
                break;
            case 'flow-completed':
            case 'flow-failed':
                setActiveFlows(prev => prev.filter(f => f.flowId !== event.flowId));
                break;
            case 'user-metrics-update':
                if (event.data) {
                    setMetrics(event.data as UserMetrics);
                }
                break;
            case 'intervention-applied':
                if (event.data) {
                    setInterventions(prev => [event.data as Intervention, ...prev].slice(0, 10));
                }
                break;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
                    {/* Header Shimmer */}
                    <div className="glass backdrop-blur-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                            <div className="space-y-2">
                                <div className="w-48 sm:w-64 h-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                                <div className="w-64 sm:w-80 h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Metrics Grid Shimmer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                        {[1, 2, 3, 4].map((item) => (
                            <MetricCardShimmer key={item} />
                        ))}
                    </div>

                    {/* Active Flows Shimmer */}
                    <div className="mb-4 sm:mb-6">
                        <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6">
                            <div className="w-32 h-6 rounded bg-gray-200 dark:bg-gray-700 mb-4 animate-pulse"></div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((item) => (
                                    <FlowCardShimmer key={item} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Interventions Shimmer */}
                    <div className="mb-4 sm:mb-6">
                        <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6">
                            <div className="w-40 h-6 rounded bg-gray-200 dark:bg-gray-700 mb-4 animate-pulse"></div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((item) => (
                                    <InterventionCardShimmer key={item} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Budget Forecast Shimmer */}
                    <BudgetForecastShimmer />
                </div>
            </div>
        );
    }

    const getAlertColor = (alert: string) => {
        switch (alert) {
            case 'critical':
                return 'text-danger-700 dark:text-danger-300 bg-gradient-to-r from-danger-500/20 to-danger-600/20 border-danger-300/30 dark:border-danger-500/20';
            case 'warning':
                return 'text-warning-700 dark:text-warning-300 bg-gradient-to-r from-warning-500/20 to-warning-600/20 border-warning-300/30 dark:border-warning-500/20';
            default:
                return 'text-success-700 dark:text-success-300 bg-gradient-to-r from-success-500/20 to-success-600/20 border-success-300/30 dark:border-success-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
                {/* Header */}
                <div className="glass backdrop-blur-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 sm:p-3 rounded-xl glow-primary shadow-lg">
                            <CpuChipIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold gradient-text-primary mb-1">
                                AI Cost Brain
                            </h1>
                            <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                Real-time optimization insights
                            </p>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                {metrics && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                        <div className="group p-4 sm:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-primary-300/50 dark:hover:border-primary-400/30">
                            <div className="flex justify-between items-center">
                                <div className="flex-1 min-w-0">
                                    <dt className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-3">
                                        Active Flows
                                    </dt>
                                    <dd>
                                        <span className="text-2xl sm:text-3xl font-display font-bold gradient-text-primary">
                                            {metrics.totalActiveFlows}
                                        </span>
                                    </dd>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                        Currently running
                                    </p>
                                </div>
                                <div className="ml-4 shrink-0">
                                    <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary group-hover:scale-110 transition-transform duration-300">
                                        <ChartBarIcon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group p-4 sm:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-primary-300/50 dark:hover:border-primary-400/30">
                            <div className="flex justify-between items-center">
                                <div className="flex-1 min-w-0">
                                    <dt className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-3">
                                        Current Cost
                                    </dt>
                                    <dd>
                                        <span className="text-2xl sm:text-3xl font-display font-bold gradient-text-primary">
                                            ${parseFloat(metrics.totalEstimatedCost.toString()).toFixed(4)}
                                        </span>
                                    </dd>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                        Estimated spend
                                    </p>
                                </div>
                                <div className="ml-4 shrink-0">
                                    <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary group-hover:scale-110 transition-transform duration-300">
                                        <CurrencyDollarIcon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group p-4 sm:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-primary-300/50 dark:hover:border-primary-400/30">
                            <div className="flex justify-between items-center">
                                <div className="flex-1 min-w-0">
                                    <dt className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-3">
                                        Burn Rate
                                    </dt>
                                    <dd>
                                        <span className="text-2xl sm:text-3xl font-display font-bold gradient-text-primary">
                                            ${metrics.costBurnRate}/min
                                        </span>
                                    </dd>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                        Current rate
                                    </p>
                                </div>
                                <div className="ml-4 shrink-0">
                                    <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary group-hover:scale-110 transition-transform duration-300">
                                        <ClockIcon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group p-4 sm:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-primary-300/50 dark:hover:border-primary-400/30">
                            <div className="flex justify-between items-center">
                                <div className="flex-1 min-w-0">
                                    <dt className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-3">
                                        Interventions
                                    </dt>
                                    <dd>
                                        <span className="text-2xl sm:text-3xl font-display font-bold gradient-text-primary">
                                            {interventions.length}
                                        </span>
                                    </dd>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                        Auto-optimizations
                                    </p>
                                </div>
                                <div className="ml-4 shrink-0">
                                    <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary group-hover:scale-110 transition-transform duration-300">
                                        <ShieldCheckIcon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Flows */}
                <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-2 rounded-lg bg-gradient-primary/10">
                                <ChartBarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="text-lg sm:text-xl font-display font-semibold gradient-text-primary">
                                Active Flows
                            </h2>
                        </div>
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-success-500/20 text-success-700 dark:text-success-300 border border-success-300/30 dark:border-success-500/20">
                            {activeFlows.length} running
                        </span>
                    </div>

                    {activeFlows.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                <CpuChipIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-600" />
                            </div>
                            <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">
                                No active flows
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeFlows.map((flow) => (
                                <div key={flow.flowId} className="p-3 sm:p-4 rounded-xl border border-primary-200/20 dark:border-primary-500/10 bg-white/50 dark:bg-gray-800/50 hover:border-primary-300/30 dark:hover:border-primary-400/20 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${flow.type === 'gateway' ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300' :
                                                flow.type === 'workflow' ? 'bg-success-500/20 text-success-700 dark:text-success-300' :
                                                    'bg-purple-500/20 text-purple-700 dark:text-purple-300'
                                                }`}>
                                                {flow.type.replace('_', ' ')}
                                            </span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${flow.priority === 'high' ? 'bg-danger-500/20 text-danger-700 dark:text-danger-300' :
                                                flow.priority === 'normal' ? 'bg-gray-500/20 text-gray-700 dark:text-gray-300' :
                                                    'bg-gray-500/20 text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {flow.priority}
                                            </span>
                                        </div>
                                        <span className="text-xs sm:text-sm font-semibold gradient-text-primary">
                                            ${flow.estimatedCost.toFixed(4)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                        Started: {new Date(flow.startTime).toLocaleTimeString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Auto-Optimizations */}
                <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-2 rounded-lg bg-gradient-primary/10">
                                <LightBulbIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="text-lg sm:text-xl font-display font-semibold gradient-text-primary">
                                Auto-Optimizations
                            </h2>
                        </div>
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary-500/20 text-primary-700 dark:text-primary-300 border border-primary-300/30 dark:border-primary-500/20">
                            Last 10
                        </span>
                    </div>

                    {interventions.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                <ShieldCheckIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-600" />
                            </div>
                            <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">
                                No optimizations yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {interventions.map((intervention, idx) => (
                                <div key={idx} className="p-3 sm:p-4 rounded-xl border border-success-300/30 dark:border-success-500/20 bg-gradient-to-r from-success-500/5 to-success-600/5 hover:from-success-500/10 hover:to-success-600/10 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${intervention.interventionType === 'model_downgrade' ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300' :
                                                intervention.interventionType === 'prompt_compression' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' :
                                                    'bg-warning-500/20 text-warning-700 dark:text-warning-300'
                                                }`}>
                                                {intervention.interventionType.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <span className="text-xs sm:text-sm font-semibold text-success-700 dark:text-success-300">
                                            -${intervention.costSaved.toFixed(4)}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                        {intervention.originalRequest.model} → {intervention.modifiedRequest.model}
                                    </p>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                        {intervention.reason}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Budget Forecast */}
                {budgetForecast && (
                    <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <div className="p-2 rounded-lg bg-gradient-primary/10">
                                <ExclamationTriangleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="text-lg sm:text-xl font-display font-semibold gradient-text-primary">
                                Budget Forecast
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                            <div>
                                <p className="text-xs sm:text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                    Budget Limit
                                </p>
                                <p className="text-xl sm:text-2xl font-display font-bold gradient-text-primary">
                                    ${budgetForecast.budgetLimit.toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                    Current Spend
                                </p>
                                <p className="text-xl sm:text-2xl font-display font-bold gradient-text-primary">
                                    ${budgetForecast.currentSpend.toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                    Remaining
                                </p>
                                <p className="text-xl sm:text-2xl font-display font-bold gradient-text-primary">
                                    ${budgetForecast.remaining.toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                    Utilization
                                </p>
                                <p className="text-xl sm:text-2xl font-display font-bold gradient-text-primary">
                                    {budgetForecast.utilizationPercent}%
                                </p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs sm:text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                                    Budget Usage
                                </span>
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getAlertColor(budgetForecast.alert)}`}>
                                    {budgetForecast.alert}
                                </span>
                            </div>
                            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${parseFloat(budgetForecast.utilizationPercent) > 90 ? 'bg-danger-500' :
                                        parseFloat(budgetForecast.utilizationPercent) > 70 ? 'bg-warning-500' :
                                            'bg-success-500'
                                        }`}
                                    style={{ width: `${Math.min(parseFloat(budgetForecast.utilizationPercent), 100)}%` }}
                                />
                            </div>
                        </div>

                        {budgetForecast.recommendation && (
                            <div className="p-3 sm:p-4 rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-primary-500/5 dark:bg-primary-500/10">
                                <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    <span className="font-semibold">Recommendation:</span> {budgetForecast.recommendation}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
