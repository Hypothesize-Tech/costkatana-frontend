import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChartBarIcon,
    CpuChipIcon,
    CurrencyDollarIcon,
    ClockIcon,
    UsersIcon,
    ServerIcon,
    BoltIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
    OverviewShimmer,
    FlowsShimmer,
    InterventionsShimmer,
    LearningStatsShimmer
} from '../components/brain/BrainShimmer';
import { API_BASE_URL } from '../config/api';

interface GlobalMetrics {
    totalActiveFlows: number;
    totalEstimatedCost: number;
    totalReservedBudget: number;
    flowsByType: Record<string, number>;
    flowsByPriority: Record<string, number>;
    activeUsers: number;
    activeProjects: number;
    costBurnRate: string;
    budgetUtilizationPercent: string;
}

interface ActiveFlow {
    flowId: string;
    type: string;
    userId: string;
    projectId?: string;
    startTime: Date;
    estimatedCost: number;
    priority: string;
    status: string;
    metadata: Record<string, unknown>;
}

interface Intervention {
    timestamp: Date;
    userId: {
        name?: string;
        _id?: string;
    };
    interventionType: string;
    reason: string;
    costSaved: number;
    originalRequest: {
        model: string;
        provider: string;
    };
    modifiedRequest: {
        model: string;
        provider: string;
    };
}

interface LearningStats {
    byType: Array<{
        optimizationType: string;
        total: number;
        applied: number;
        acceptanceRate: string;
        totalSavings: string;
    }>;
    overall: {
        totalOptimizations: number;
        totalApplied: number;
        totalSavings: number;
        avgAcceptanceRate: string;
    };
}

export const AdminBrainDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { tab } = useParams<{ tab?: string }>();
    const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics | null>(null);
    const [activeFlows, setActiveFlows] = useState<ActiveFlow[]>([]);
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [learningStats, setLearningStats] = useState<LearningStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [eventSource, setEventSource] = useState<EventSource | null>(null);

    // Determine selected tab from URL or default to overview
    const selectedTab = (tab as 'overview' | 'flows' | 'interventions' | 'learning') || 'overview';

    // Update URL when tab changes
    const setSelectedTab = (newTab: 'overview' | 'flows' | 'interventions' | 'learning') => {
        navigate(`/admin/brain/${newTab}`, { replace: true });
    };

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

            const [metricsRes, flowsRes, interventionsRes, learningRes] = await Promise.all([
                fetch(`${baseUrl}/api/brain/admin/global-metrics`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${baseUrl}/api/brain/admin/active-flows`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${baseUrl}/api/brain/admin/interventions?limit=50`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${baseUrl}/api/brain/admin/learning/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const metrics = await metricsRes.json();
            const flows = await flowsRes.json();
            const interventionsData = await interventionsRes.json();
            const learning = await learningRes.json();

            setGlobalMetrics(metrics.data);
            setActiveFlows(flows.data?.flows || []);
            setInterventions(interventionsData.data?.interventions || []);
            setLearningStats(learning.data);
        } catch (error) {
            console.error('Failed to load admin brain data:', error);
        } finally {
            setLoading(false);
        }
    };

    const connectSSE = () => {
        const token = localStorage.getItem('access_token');
        const baseUrl = API_BASE_URL || 'http://localhost:8000';
        const es = new EventSource(`${baseUrl}/api/brain/admin/stream?token=${token}`);

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
        data?: ActiveFlow | Intervention | { metrics?: GlobalMetrics };
    }) => {
        switch (event.type) {
            case 'flow-started':
                if (event.data) {
                    setActiveFlows(prev => [...prev, event.data as ActiveFlow]);
                }
                break;
            case 'flow-completed':
            case 'flow-failed':
                setActiveFlows(prev => prev.filter(f => f.flowId !== event.flowId));
                break;
            case 'metrics-update':
                if (event.data && typeof event.data === 'object' && 'metrics' in event.data) {
                    setGlobalMetrics(event.data.metrics as GlobalMetrics);
                }
                break;
            case 'intervention-applied':
                if (event.data) {
                    setInterventions(prev => [event.data as Intervention, ...prev].slice(0, 50));
                }
                break;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
                <div className="max-w-[1600px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
                    {/* Header Shimmer */}
                    <div className="glass backdrop-blur-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                            <div className="space-y-2">
                                <div className="w-56 sm:w-72 h-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                                <div className="w-72 sm:w-96 h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation Shimmer */}
                    <div className="mb-4 sm:mb-6 flex gap-2 overflow-x-auto pb-2">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="w-32 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0"></div>
                        ))}
                    </div>

                    {/* Content based on selected tab */}
                    {selectedTab === 'overview' && <OverviewShimmer />}
                    {selectedTab === 'flows' && <FlowsShimmer />}
                    {selectedTab === 'interventions' && <InterventionsShimmer />}
                    {selectedTab === 'learning' && <LearningStatsShimmer />}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="max-w-[1600px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
                {/* Header */}
                <div className="glass backdrop-blur-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 sm:p-3 rounded-xl glow-primary shadow-lg">
                            <ServerIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold gradient-text-primary mb-1">
                                Cost Katana Brain - Admin
                            </h1>
                            <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                System-wide AI cost optimization control center
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mb-4 sm:mb-6 flex gap-2 overflow-x-auto pb-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                        { id: 'flows', label: 'Active Flows', icon: CpuChipIcon },
                        { id: 'interventions', label: 'Interventions', icon: BoltIcon },
                        { id: 'learning', label: 'Learning Stats', icon: CheckCircleIcon },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedTab(tab.id as 'overview' | 'flows' | 'interventions' | 'learning')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all shrink-0 ${selectedTab === tab.id
                                ? 'bg-primary-500 text-white shadow-lg hover:bg-primary-600'
                                : 'glass backdrop-blur-xl border border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel text-light-text-primary dark:text-dark-text-primary hover:border-primary-300/50 dark:hover:border-primary-400/30'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {selectedTab === 'overview' && globalMetrics && (
                    <>
                        {/* Global Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                            <AdminMetricCard
                                icon={CpuChipIcon}
                                label="Active Flows"
                                value={globalMetrics.totalActiveFlows}
                                subtitle="System-wide"
                                trend={{ value: globalMetrics.totalActiveFlows > 10 ? 'High' : 'Normal', isPositive: false }}
                            />
                            <AdminMetricCard
                                icon={UsersIcon}
                                label="Active Users"
                                value={globalMetrics.activeUsers}
                                subtitle="Concurrent users"
                            />
                            <AdminMetricCard
                                icon={CurrencyDollarIcon}
                                label="Reserved Budget"
                                value={`$${globalMetrics.totalReservedBudget.toFixed(2)}`}
                                subtitle={`${globalMetrics.budgetUtilizationPercent}% utilized`}
                                trend={{
                                    value: parseFloat(globalMetrics.budgetUtilizationPercent) > 80 ? 'Critical' : 'Good',
                                    isPositive: parseFloat(globalMetrics.budgetUtilizationPercent) < 80
                                }}
                            />
                            <AdminMetricCard
                                icon={ClockIcon}
                                label="Burn Rate"
                                value={`$${globalMetrics.costBurnRate}/min`}
                                subtitle="Current rate"
                            />
                        </div>

                        {/* Flow Type Distribution */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6">
                                <h3 className="text-lg font-display font-semibold gradient-text-primary mb-4 flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-primary/10">
                                        <ChartBarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    Flows by Type
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(globalMetrics.flowsByType).map(([type, count]) => (
                                        <div key={type} className="flex items-center justify-between p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10 bg-white/50 dark:bg-gray-800/50">
                                            <span className="capitalize text-light-text-primary dark:text-dark-text-primary">{type.replace('_', ' ')}</span>
                                            <span className="font-display font-bold gradient-text-primary">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6">
                                <h3 className="text-lg font-display font-semibold gradient-text-primary mb-4 flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-primary/10">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                                    </div>
                                    Flows by Priority
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(globalMetrics.flowsByPriority).map(([priority, count]) => (
                                        <div key={priority} className="flex items-center justify-between p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10 bg-white/50 dark:bg-gray-800/50">
                                            <span className={`capitalize font-display font-medium ${priority === 'critical' ? 'text-danger-700 dark:text-danger-300' :
                                                priority === 'high' ? 'text-warning-700 dark:text-warning-300' :
                                                    'text-light-text-primary dark:text-dark-text-primary'
                                                }`}>
                                                {priority}
                                            </span>
                                            <span className="font-display font-bold gradient-text-primary">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Active Flows Tab */}
                {selectedTab === 'flows' && (
                    <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                            <h3 className="text-lg sm:text-xl font-display font-semibold gradient-text-primary">
                                Active Flows ({activeFlows.length})
                            </h3>
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-success-500/20 text-success-700 dark:text-success-300 border border-success-300/30 dark:border-success-500/20 w-fit">
                                Live
                            </span>
                        </div>

                        {activeFlows.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                    <CpuChipIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-600" />
                                </div>
                                <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">
                                    No active flows
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden lg:block overflow-x-auto">
                                    <table className="w-full min-w-[800px]">
                                        <thead>
                                            <tr className="border-b border-primary-200/30 dark:border-primary-500/20">
                                                <th className="text-left py-3 px-4 text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Type</th>
                                                <th className="text-left py-3 px-4 text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Priority</th>
                                                <th className="text-left py-3 px-4 text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">User</th>
                                                <th className="text-left py-3 px-4 text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Started</th>
                                                <th className="text-right py-3 px-4 text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Cost</th>
                                                <th className="text-center py-3 px-4 text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeFlows.map((flow) => (
                                                <tr key={flow.flowId} className="border-b border-primary-200/10 dark:border-primary-500/10 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${flow.type === 'gateway' ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300' :
                                                            flow.type === 'workflow' ? 'bg-success-500/20 text-success-700 dark:text-success-300' :
                                                                flow.type === 'cortex_streaming' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' :
                                                                    'bg-gray-500/20 text-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {flow.type.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${flow.priority === 'critical' ? 'bg-danger-500/20 text-danger-700 dark:text-danger-300' :
                                                            flow.priority === 'high' ? 'bg-warning-500/20 text-warning-700 dark:text-warning-300' :
                                                                'bg-gray-500/20 text-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {flow.priority}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-light-text-primary dark:text-dark-text-primary">
                                                        {flow.userId.substring(0, 8)}...
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                        {new Date(flow.startTime).toLocaleTimeString()}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-sm font-display font-semibold gradient-text-primary">
                                                        ${flow.estimatedCost.toFixed(4)}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${flow.status === 'running' ? 'bg-success-500/20 text-success-700 dark:text-success-300' :
                                                            flow.status === 'failed' ? 'bg-danger-500/20 text-danger-700 dark:text-danger-300' :
                                                                'bg-gray-500/20 text-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {flow.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile/Tablet Card View */}
                                <div className="lg:hidden space-y-3">
                                    {activeFlows.map((flow) => (
                                        <div key={flow.flowId} className="p-4 rounded-xl border border-primary-200/20 dark:border-primary-500/10 bg-white/50 dark:bg-gray-800/50">
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${flow.type === 'gateway' ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300' :
                                                    flow.type === 'workflow' ? 'bg-success-500/20 text-success-700 dark:text-success-300' :
                                                        flow.type === 'cortex_streaming' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' :
                                                            'bg-gray-500/20 text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {flow.type.replace('_', ' ')}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${flow.priority === 'critical' ? 'bg-danger-500/20 text-danger-700 dark:text-danger-300' :
                                                    flow.priority === 'high' ? 'bg-warning-500/20 text-warning-700 dark:text-warning-300' :
                                                        'bg-gray-500/20 text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {flow.priority}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ml-auto ${flow.status === 'running' ? 'bg-success-500/20 text-success-700 dark:text-success-300' :
                                                    flow.status === 'failed' ? 'bg-danger-500/20 text-danger-700 dark:text-danger-300' :
                                                        'bg-gray-500/20 text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {flow.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-light-text-secondary dark:text-dark-text-secondary text-xs mb-1">User ID</p>
                                                    <p className="text-light-text-primary dark:text-dark-text-primary font-medium">{flow.userId.substring(0, 12)}...</p>
                                                </div>
                                                <div>
                                                    <p className="text-light-text-secondary dark:text-dark-text-secondary text-xs mb-1">Started</p>
                                                    <p className="text-light-text-primary dark:text-dark-text-primary font-medium">{new Date(flow.startTime).toLocaleTimeString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-light-text-secondary dark:text-dark-text-secondary text-xs mb-1">Est. Cost</p>
                                                    <p className="font-display font-semibold gradient-text-primary">${flow.estimatedCost.toFixed(4)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Interventions Tab */}
                {selectedTab === 'interventions' && (
                    <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
                            <h3 className="text-lg sm:text-xl font-display font-semibold gradient-text-primary">
                                Recent Interventions ({interventions.length})
                            </h3>
                            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                Total Saved: ${interventions.reduce((sum, i) => sum + i.costSaved, 0).toFixed(2)}
                            </div>
                        </div>

                        {interventions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                    <BoltIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-600" />
                                </div>
                                <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">
                                    No interventions yet
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {interventions.map((intervention, idx) => (
                                    <div key={idx} className="p-3 sm:p-4 rounded-xl border border-success-300/30 dark:border-success-500/20 bg-gradient-to-r from-success-500/5 to-success-600/5 hover:from-success-500/10 hover:to-success-600/10 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${intervention.interventionType === 'model_downgrade' ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300' :
                                                    intervention.interventionType === 'prompt_compression' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' :
                                                        intervention.interventionType === 'provider_switch' ? 'bg-warning-500/20 text-warning-700 dark:text-warning-300' :
                                                            'bg-danger-500/20 text-danger-700 dark:text-danger-300'
                                                    }`}>
                                                    {intervention.interventionType.replace('_', ' ')}
                                                </span>
                                                <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                                    User: {intervention.userId?.name || intervention.userId?._id?.substring(0, 8) || 'Unknown'}
                                                </span>
                                            </div>
                                            <span className="text-sm font-display font-semibold text-success-700 dark:text-success-300 whitespace-nowrap">
                                                -${intervention.costSaved.toFixed(4)}
                                            </span>
                                        </div>
                                        <div className="text-xs sm:text-sm text-light-text-primary dark:text-dark-text-primary mb-1 break-words">
                                            {intervention.originalRequest.model} ({intervention.originalRequest.provider}) →{' '}
                                            {intervention.modifiedRequest.model} ({intervention.modifiedRequest.provider})
                                        </div>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                            {intervention.reason}
                                        </p>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                            {new Date(intervention.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Learning Stats Tab */}
                {selectedTab === 'learning' && learningStats && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Overall Stats */}
                        <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-display font-semibold gradient-text-primary mb-4 sm:mb-6">Overall Learning Performance</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                <div>
                                    <p className="text-xs sm:text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">Total Optimizations</p>
                                    <p className="text-2xl sm:text-3xl font-display font-bold gradient-text-primary">
                                        {learningStats.overall.totalOptimizations}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">Applied</p>
                                    <p className="text-2xl sm:text-3xl font-display font-bold text-success-600 dark:text-success-400">
                                        {learningStats.overall.totalApplied}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">Acceptance Rate</p>
                                    <p className="text-2xl sm:text-3xl font-display font-bold text-primary-600 dark:text-primary-400">
                                        {learningStats.overall.avgAcceptanceRate}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">Total Savings</p>
                                    <p className="text-2xl sm:text-3xl font-display font-bold text-purple-600 dark:text-purple-400">
                                        ${learningStats.overall.totalSavings.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* By Type */}
                        <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-display font-semibold gradient-text-primary mb-4 sm:mb-6">Performance by Optimization Type</h3>

                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-primary-200/30 dark:border-primary-500/20">
                                            <th className="text-left py-3 px-4 text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Type</th>
                                            <th className="text-right py-3 px-4 text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Total</th>
                                            <th className="text-right py-3 px-4 text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Applied</th>
                                            <th className="text-right py-3 px-4 text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Acceptance Rate</th>
                                            <th className="text-right py-3 px-4 text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Total Savings</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {learningStats.byType.map((stat) => (
                                            <tr key={stat.optimizationType} className="border-b border-primary-200/10 dark:border-primary-500/10 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="py-3 px-4 text-sm text-light-text-primary dark:text-dark-text-primary capitalize">
                                                    {stat.optimizationType.replace('_', ' ')}
                                                </td>
                                                <td className="py-3 px-4 text-right text-sm text-light-text-primary dark:text-dark-text-primary">
                                                    {stat.total}
                                                </td>
                                                <td className="py-3 px-4 text-right text-sm text-success-600 dark:text-success-400 font-display font-semibold">
                                                    {stat.applied}
                                                </td>
                                                <td className="py-3 px-4 text-right text-sm text-primary-600 dark:text-primary-400 font-display font-semibold">
                                                    {stat.acceptanceRate}%
                                                </td>
                                                <td className="py-3 px-4 text-right text-sm text-purple-600 dark:text-purple-400 font-display font-semibold">
                                                    ${stat.totalSavings}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile/Tablet Card View */}
                            <div className="md:hidden space-y-3">
                                {learningStats.byType.map((stat) => (
                                    <div key={stat.optimizationType} className="p-4 rounded-xl border border-primary-200/20 dark:border-primary-500/10 bg-white/50 dark:bg-gray-800/50">
                                        <h4 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary capitalize mb-3">
                                            {stat.optimizationType.replace('_', ' ')}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-light-text-secondary dark:text-dark-text-secondary text-xs mb-1">Total</p>
                                                <p className="text-light-text-primary dark:text-dark-text-primary font-display font-semibold">{stat.total}</p>
                                            </div>
                                            <div>
                                                <p className="text-light-text-secondary dark:text-dark-text-secondary text-xs mb-1">Applied</p>
                                                <p className="text-success-600 dark:text-success-400 font-display font-semibold">{stat.applied}</p>
                                            </div>
                                            <div>
                                                <p className="text-light-text-secondary dark:text-dark-text-secondary text-xs mb-1">Acceptance Rate</p>
                                                <p className="text-primary-600 dark:text-primary-400 font-display font-semibold">{stat.acceptanceRate}%</p>
                                            </div>
                                            <div>
                                                <p className="text-light-text-secondary dark:text-dark-text-secondary text-xs mb-1">Total Savings</p>
                                                <p className="text-purple-600 dark:text-purple-400 font-display font-semibold">${stat.totalSavings}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface AdminMetricCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | number;
    subtitle: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

const AdminMetricCard: React.FC<AdminMetricCardProps> = ({ icon: Icon, label, value, subtitle, trend }) => {
    return (
        <div className="group p-4 sm:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-primary-300/50 dark:hover:border-primary-400/30">
            <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                    <dt className="text-xs sm:text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-3">
                        {label}
                    </dt>
                    <dd>
                        <div className="flex flex-wrap gap-3 items-baseline">
                            <span className="text-2xl sm:text-3xl font-display font-bold gradient-text-primary">
                                {value}
                            </span>
                            {trend && (
                                <span className={`px-2.5 py-1 text-xs font-display font-semibold rounded-full border ${trend.isPositive
                                    ? 'bg-success-500/20 text-success-700 dark:text-success-300 border-success-300/30 dark:border-success-500/20'
                                    : 'bg-danger-500/20 text-danger-700 dark:text-danger-300 border-danger-300/30 dark:border-danger-500/20'
                                    }`}>
                                    {trend.value}
                                </span>
                            )}
                        </div>
                    </dd>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        {subtitle}
                    </p>
                </div>
                <div className="ml-4 sm:ml-6 shrink-0">
                    <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
};
