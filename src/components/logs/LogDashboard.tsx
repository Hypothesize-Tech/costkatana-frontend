import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    FiActivity, FiBarChart2, FiPieChart, FiTrendingUp, FiAlertCircle,
    FiClock, FiDollarSign, FiCpu, FiGrid, FiRefreshCw,
    FiZap, FiAlertTriangle, FiServer, FiCheckCircle,
    FiMaximize2, FiMinimize2, FiX
} from 'react-icons/fi';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { logsService } from '../../services/logs.service';

interface Widget {
    id: string;
    type: 'line' | 'bar' | 'pie' | 'area' | 'number' | 'gauge' | 'table' | 'stat-card';
    title: string;
    metric: string;
    size: 'small' | 'medium' | 'large' | 'full';
    filters?: any;
    refreshInterval?: number;
}

interface DashboardTemplate {
    id: string;
    name: string;
    description: string;
    widgets: Widget[];
}

const COLORS = ['#06ec9e', '#009454', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#10B981'];

// Helper function to calculate change percentage
const calculateChange = (breakdown: any[], metric: string): number => {
    if (breakdown.length < 2) return 0;
    const recent = breakdown[breakdown.length - 1];
    const previous = breakdown[breakdown.length - 2];
    const recentVal = recent[metric] || 0;
    const previousVal = previous[metric] || 0;
    if (previousVal === 0) return 0;
    return ((recentVal - previousVal) / previousVal) * 100;
};

const TEMPLATES: DashboardTemplate[] = [
    {
        id: 'cost-monitoring',
        name: 'Cost Analytics',
        description: 'Track AI costs and spending patterns',
        widgets: [
            { id: 'w1', type: 'stat-card', title: 'Total Cost', metric: 'totalCost', size: 'small', filters: { timeRange: 'today' } },
            { id: 'w2', type: 'stat-card', title: 'Total Requests', metric: 'totalCalls', size: 'small', filters: { timeRange: 'today' } },
            { id: 'w3', type: 'stat-card', title: 'Avg Cost/Request', metric: 'avgCost', size: 'small', filters: { timeRange: 'today' } },
            { id: 'w4', type: 'stat-card', title: 'Total Tokens', metric: 'totalTokens', size: 'small', filters: { timeRange: 'today' } },
            { id: 'w5', type: 'area', title: 'Cost Trend (24 Hours)', metric: 'costTrend', size: 'large', filters: { timeRange: '24h', groupBy: 'hour' } },
            { id: 'w6', type: 'pie', title: 'Cost Distribution by Service', metric: 'costByService', size: 'medium', filters: { timeRange: '24h' } },
        ]
    },
    {
        id: 'performance-tracking',
        name: 'Performance Insights',
        description: 'Monitor latency and response times',
        widgets: [
            { id: 'w1', type: 'stat-card', title: 'Avg Latency', metric: 'avgLatency', size: 'small', filters: { timeRange: 'today' } },
            { id: 'w2', type: 'stat-card', title: 'P95 Latency', metric: 'p95Latency', size: 'small', filters: { timeRange: 'today' } },
            { id: 'w3', type: 'stat-card', title: 'P99 Latency', metric: 'p99Latency', size: 'small', filters: { timeRange: 'today' } },
            { id: 'w4', type: 'stat-card', title: 'Max Latency', metric: 'maxLatency', size: 'small', filters: { timeRange: 'today' } },
            { id: 'w5', type: 'line', title: 'Latency Over Time', metric: 'latencyTrend', size: 'full', filters: { timeRange: '24h', groupBy: 'hour' } },
            { id: 'w6', type: 'bar', title: 'Slowest Services', metric: 'latencyByService', size: 'medium', filters: { timeRange: '24h' } },
        ]
    },
    {
        id: 'error-tracking',
        name: 'Error Monitoring',
        description: 'Track errors and system health',
        widgets: [
            { id: 'w1', type: 'stat-card', title: 'Total Errors', metric: 'totalErrors', size: 'small', filters: { timeRange: 'today' } },
            { id: 'w2', type: 'stat-card', title: 'Error Rate', metric: 'errorRate', size: 'small', filters: { timeRange: 'today' } },
            { id: 'w3', type: 'stat-card', title: 'Success Rate', metric: 'successRate', size: 'small', filters: { timeRange: 'today' } },
            { id: 'w4', type: 'stat-card', title: 'Active Services', metric: 'activeServices', size: 'small', filters: { timeRange: 'today' } },
            { id: 'w5', type: 'line', title: 'Error Trend (24 Hours)', metric: 'errorTrend', size: 'large', filters: { timeRange: '24h', groupBy: 'hour' } },
            { id: 'w6', type: 'bar', title: 'Errors by Service', metric: 'errorsByType', size: 'medium', filters: { timeRange: '24h' } },
            { id: 'w7', type: 'table', title: 'Recent Error Logs', metric: 'recentErrors', size: 'full', filters: { timeRange: '24h', limit: 10 } },
        ]
    },
    {
        id: 'usage-overview',
        name: 'Usage Overview',
        description: 'Comprehensive usage analytics',
        widgets: [
            { id: 'w1', type: 'stat-card', title: 'Total Requests', metric: 'totalCalls', size: 'small', filters: { timeRange: 'today' } },
            { id: 'w2', type: 'stat-card', title: 'Total Tokens', metric: 'totalTokens', size: 'small', filters: { timeRange: 'today' } },
            { id: 'w3', type: 'stat-card', title: 'Cache Hit Rate', metric: 'cacheHitRate', size: 'small', filters: { timeRange: 'today' } },
            { id: 'w4', type: 'stat-card', title: 'Active Models', metric: 'activeModels', size: 'small', filters: { timeRange: 'today' } },
            { id: 'w5', type: 'area', title: 'Request Volume (24 Hours)', metric: 'requestRate', size: 'large', filters: { timeRange: '24h', groupBy: 'hour' } },
            { id: 'w6', type: 'pie', title: 'Requests by Model', metric: 'requestsByModel', size: 'medium', filters: { timeRange: '24h' } },
        ]
    }
];

interface LogDashboardProps {
    onApplyQueryToDashboard?: (visualization: any, data: any[]) => void;
}

export const LogDashboard: React.FC<LogDashboardProps> = ({
    onApplyQueryToDashboard: externalOnApply
}) => {
    const [selectedTemplate, setSelectedTemplate] = useState<DashboardTemplate>(TEMPLATES[0]);
    const [widgets, setWidgets] = useState<Widget[]>(TEMPLATES[0].widgets);
    const [widgetData, setWidgetData] = useState<Map<string, any>>(new Map());
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState<number>(30);
    const [aiGeneratedWidgets, setAiGeneratedWidgets] = useState<Map<string, Widget & { data?: any; isAiGenerated: boolean }>>(new Map());
    const [highlightedWidget, setHighlightedWidget] = useState<string | null>(null);
    const aiWidgetRef = useRef<HTMLDivElement>(null);

    const fetchWidgetData = useCallback(async (widget: Widget) => {
        try {
            const filters = widget.filters || {};

            // Convert timeRange to startDate/endDate
            let startDate: Date | undefined;
            const endDate: Date = new Date();

            if (filters.timeRange === 'today') {
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
            } else if (filters.timeRange === '24h') {
                startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
            } else if (filters.timeRange === '7d') {
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            } else if (filters.timeRange === '30d') {
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            }

            const queryFilters: any = {};
            if (startDate) queryFilters.startDate = startDate.toISOString();
            if (endDate) queryFilters.endDate = endDate.toISOString();

            // Fetch stats data
            const statsResponse = await logsService.fetchAILogStats({
                ...queryFilters,
                groupBy: filters.groupBy || 'service'
            });

            if (!statsResponse.success) {
                throw new Error('Failed to fetch widget data');
            }

            // Process data based on metric type
            let processedData;

            switch (widget.metric) {
                case 'totalCost':
                    processedData = {
                        value: statsResponse.summary.totalCost,
                        change: calculateChange(statsResponse.breakdown, 'totalCost'),
                        trend: 'up'
                    };
                    break;
                case 'totalCalls':
                    processedData = {
                        value: statsResponse.summary.totalCalls,
                        change: calculateChange(statsResponse.breakdown, 'totalCalls'),
                        trend: 'up'
                    };
                    break;
                case 'avgCost': {
                    const avgCost = statsResponse.summary.totalCalls > 0
                        ? statsResponse.summary.totalCost / statsResponse.summary.totalCalls
                        : 0;
                    processedData = {
                        value: avgCost,
                        change: 0,
                        trend: 'neutral'
                    };
                    break;
                }
                case 'errorRate':
                    processedData = {
                        value: statsResponse.summary.errorRate * 100,
                        change: 0,
                        trend: statsResponse.summary.errorRate > 0.05 ? 'down' : 'up'
                    };
                    break;
                case 'successRate':
                    processedData = {
                        value: (1 - statsResponse.summary.errorRate) * 100,
                        change: 0,
                        trend: statsResponse.summary.errorRate < 0.05 ? 'up' : 'down'
                    };
                    break;
                case 'avgLatency': {
                    const avgLat = statsResponse.breakdown.reduce((sum: number, b: any) => sum + (b.avgLatency || 0), 0) / (statsResponse.breakdown.length || 1);
                    processedData = {
                        value: avgLat,
                        change: 0,
                        trend: 'neutral'
                    };
                    break;
                }
                case 'p95Latency':
                case 'p99Latency':
                case 'maxLatency':
                    processedData = {
                        value: Math.max(...statsResponse.breakdown.map((b: any) => b.maxLatency || 0)),
                        change: 0,
                        trend: 'neutral'
                    };
                    break;
                case 'totalErrors': {
                    const totalErrs = statsResponse.breakdown.reduce((sum: number, b: any) => sum + (b.errors || 0), 0);
                    processedData = {
                        value: totalErrs,
                        change: 0,
                        trend: totalErrs > 0 ? 'down' : 'up'
                    };
                    break;
                }
                case 'totalTokens':
                    processedData = {
                        value: statsResponse.breakdown.reduce((sum: number, b: any) => sum + (b.totalTokens || 0), 0),
                        change: 0,
                        trend: 'up'
                    };
                    break;
                case 'cacheHitRate': {
                    const totalCalls = statsResponse.summary.totalCalls;
                    const cacheHits = statsResponse.breakdown.reduce((sum: number, b: any) => sum + (b.cacheHits || 0), 0);
                    const hitRate = totalCalls > 0 ? (cacheHits / totalCalls) * 100 : 0;
                    processedData = {
                        value: hitRate,
                        change: 0,
                        trend: hitRate > 50 ? 'up' : 'down'
                    };
                    break;
                }
                case 'activeModels':
                    processedData = {
                        value: new Set(statsResponse.breakdown.map((b: any) => b._id)).size,
                        change: 0,
                        trend: 'neutral'
                    };
                    break;
                case 'activeServices':
                    processedData = {
                        value: statsResponse.breakdown.length,
                        change: 0,
                        trend: 'neutral'
                    };
                    break;
                case 'costTrend':
                case 'requestRate':
                case 'latencyTrend':
                case 'errorTrend':
                    processedData = statsResponse.breakdown.map((b: any) => ({
                        name: typeof b._id === 'object' ? `${b._id.hour || '00'}:00` : (b._id || 'Unknown').toString().slice(0, 10),
                        value: widget.metric === 'costTrend' ? b.totalCost :
                            widget.metric === 'latencyTrend' ? b.avgLatency :
                                widget.metric === 'errorTrend' ? b.errors :
                                    b.totalCalls,
                        timestamp: b._id
                    }));
                    break;
                case 'costByService':
                case 'requestsByModel':
                case 'latencyByService':
                    processedData = statsResponse.breakdown
                        .sort((a: any, b: any) => {
                            const aVal = widget.metric === 'costByService' ? a.totalCost :
                                widget.metric === 'latencyByService' ? a.avgLatency : a.totalCalls;
                            const bVal = widget.metric === 'costByService' ? b.totalCost :
                                widget.metric === 'latencyByService' ? b.avgLatency : b.totalCalls;
                            return bVal - aVal;
                        })
                        .slice(0, 10)
                        .map((b: any) => ({
                            name: (b._id || 'Unknown').toString().slice(0, 20),
                            value: widget.metric === 'costByService' ? b.totalCost :
                                widget.metric === 'latencyByService' ? b.avgLatency : b.totalCalls
                        }));
                    break;
                case 'errorsByType':
                    processedData = statsResponse.breakdown
                        .filter((b: any) => b.errors > 0)
                        .sort((a: any, b: any) => b.errors - a.errors)
                        .slice(0, 10)
                        .map((b: any) => ({
                            name: (b._id || 'Unknown').toString().slice(0, 20),
                            value: b.errors
                        }));
                    break;
                case 'recentErrors': {
                    // Fetch actual error logs
                    const logsResponse = await logsService.fetchAILogs({
                        ...queryFilters,
                        status: 'error',
                        limit: filters.limit || 10,
                        sortBy: 'timestamp',
                        sortOrder: 'desc'
                    });
                    processedData = logsResponse.data || [];
                    break;
                }
                default:
                    processedData = { value: 0, change: 0, trend: 'neutral' };
            }

            return { widgetId: widget.id, data: processedData };
        } catch (error) {
            console.error(`Failed to fetch data for widget ${widget.id}:`, error);
            return { widgetId: widget.id, data: null };
        }
    }, []);

    const loadAllWidgets = useCallback(async () => {
        setLoading(true);
        const results = await Promise.all(widgets.map(fetchWidgetData));

        const newWidgetData = new Map();
        results.forEach(result => {
            if (result.data !== null) {
                newWidgetData.set(result.widgetId, result.data);
            }
        });

        setWidgetData(newWidgetData);
        setLoading(false);
    }, [widgets, fetchWidgetData]);

    const refreshDashboard = useCallback(async () => {
        setRefreshing(true);
        await loadAllWidgets();
        setRefreshing(false);
    }, [loadAllWidgets]);

    useEffect(() => {
        loadAllWidgets();
    }, [loadAllWidgets]);

    useEffect(() => {
        if (autoRefresh > 0) {
            const interval = setInterval(refreshDashboard, autoRefresh * 1000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshDashboard]);

    const handleTemplateChange = (template: DashboardTemplate) => {
        setSelectedTemplate(template);
        setWidgets(template.widgets);
    };

    const handleApplyQueryToDashboard = useCallback((visualization: any, data: any[]) => {
        if (!visualization) return;

        // Generate unique ID for AI-generated widget
        const widgetId = `ai-${Date.now()}`;

        // Create widget from visualization config
        const aiWidget: Widget & { data?: any; isAiGenerated: boolean } = {
            id: widgetId,
            type: visualization.type,
            title: visualization.title,
            metric: visualization.metric,
            size: visualization.size,
            data: data,
            isAiGenerated: true
        };

        // Add to AI-generated widgets map
        setAiGeneratedWidgets(prev => {
            const updated = new Map(prev);
            updated.set(widgetId, aiWidget);
            return updated;
        });

        // Set widget data
        setWidgetData(prev => {
            const updated = new Map(prev);
            updated.set(widgetId, data);
            return updated;
        });

        // Highlight the new widget
        setHighlightedWidget(widgetId);

        // Scroll to the widget
        setTimeout(() => {
            aiWidgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        // Remove highlight after 3 seconds
        setTimeout(() => {
            setHighlightedWidget(null);
        }, 3000);
    }, []);

    // Expose the handler to parent if provided
    useEffect(() => {
        if (externalOnApply) {
            // This allows parent to call our internal handler
            (window as any).__dashboardApplyHandler = handleApplyQueryToDashboard;
        }
        return () => {
            delete (window as any).__dashboardApplyHandler;
        };
    }, [externalOnApply, handleApplyQueryToDashboard]);

    const handleRemoveAiWidget = (widgetId: string) => {
        setAiGeneratedWidgets(prev => {
            const updated = new Map(prev);
            updated.delete(widgetId);
            return updated;
        });

        setWidgetData(prev => {
            const updated = new Map(prev);
            updated.delete(widgetId);
            return updated;
        });
    };

    const getWidgetSize = (size: string): string => {
        switch (size) {
            case 'small': return 'col-span-1';
            case 'medium': return 'col-span-1 lg:col-span-2';
            case 'large': return 'col-span-1 lg:col-span-3';
            case 'full': return 'col-span-1 lg:col-span-4';
            default: return 'col-span-1';
        }
    };

    const renderWidget = (widget: Widget & { isAiGenerated?: boolean }) => {
        const data = widgetData.get(widget.id);
        const isExpanded = expandedWidget === widget.id;
        const isHighlighted = highlightedWidget === widget.id;
        const sizeClass = isExpanded ? 'col-span-1 md:col-span-2 lg:col-span-4' : getWidgetSize(widget.size);

        return (
            <div key={widget.id} className={`${sizeClass} transition-all duration-300 ${isHighlighted ? 'animate-pulse-glow' : ''}`}>
                <div className={`card shadow-xl h-full overflow-hidden hover:shadow-2xl transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary-500 glow-primary' : 'hover:scale-[1.02]'} ${isHighlighted ? 'ring-2 ring-primary-500 animate-glow' : ''}`}>
                    {/* Widget Header */}
                    <div className="px-6 py-4 border-b border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-r from-primary-500/5 to-transparent">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wide flex items-center gap-2">
                                {widget.type === 'line' && <FiTrendingUp className="text-primary-500 w-4 h-4" />}
                                {widget.type === 'bar' && <FiBarChart2 className="text-primary-500 w-4 h-4" />}
                                {widget.type === 'pie' && <FiPieChart className="text-primary-500 w-4 h-4" />}
                                {widget.type === 'area' && <FiActivity className="text-primary-500 w-4 h-4" />}
                                {widget.type === 'stat-card' && <FiZap className="text-primary-500 w-4 h-4" />}
                                {widget.type === 'table' && <FiGrid className="text-primary-500 w-4 h-4" />}
                                {widget.title}
                                {widget.isAiGenerated && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-gradient-primary text-white rounded-full flex items-center gap-1">
                                        <FiZap className="w-3 h-3" />
                                        AI
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center gap-1">
                                {widget.isAiGenerated && (
                                    <button
                                        onClick={() => handleRemoveAiWidget(widget.id)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 transition-all duration-300 group"
                                        title="Remove AI Widget"
                                    >
                                        <FiX className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary group-hover:text-red-500" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setExpandedWidget(isExpanded ? null : widget.id)}
                                    className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all duration-300 group"
                                    title={isExpanded ? 'Collapse' : 'Expand'}
                                >
                                    {isExpanded ? (
                                        <FiMinimize2 className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary group-hover:text-primary-500" />
                                    ) : (
                                        <FiMaximize2 className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary group-hover:text-primary-500" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Widget Content */}
                    <div className={`p-6 ${isExpanded ? 'min-h-[500px]' : ''}`}>
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : data === null || data === undefined ? (
                            <div className="flex flex-col items-center justify-center h-32 text-center">
                                <FiAlertCircle className="w-10 h-10 text-light-text-muted dark:text-dark-text-muted mb-2" />
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    No data available
                                </p>
                            </div>
                        ) : (
                            <>
                                {widget.type === 'stat-card' && <StatsCard data={data} metric={widget.metric} />}
                                {widget.type === 'line' && <LineWidget data={data} expanded={isExpanded} />}
                                {widget.type === 'bar' && <BarWidget data={data} expanded={isExpanded} />}
                                {widget.type === 'pie' && <PieWidget data={data} expanded={isExpanded} />}
                                {widget.type === 'area' && <AreaWidget data={data} expanded={isExpanded} />}
                                {widget.type === 'table' && <TableWidget data={data} expanded={isExpanded} />}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Template Tabs */}
            <div className="card shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-r from-primary-500/5 to-transparent">
                    <h3 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wide flex items-center gap-2">
                        <FiGrid className="text-primary-500 w-4 h-4" />
                        Dashboard Templates
                    </h3>
                </div>
                <div className="p-4">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        {TEMPLATES.map(template => (
                            <button
                                key={template.id}
                                onClick={() => handleTemplateChange(template)}
                                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${selectedTemplate.id === template.id
                                    ? 'bg-gradient-primary text-white shadow-lg glow-primary scale-105'
                                    : 'bg-light-panel dark:bg-dark-panel text-light-text-secondary dark:text-dark-text-secondary hover:bg-primary-500/10 border border-primary-200/30 dark:border-primary-500/20 hover:scale-102'
                                    }`}
                            >
                                {template.id === 'cost-monitoring' && <FiDollarSign className="w-4 h-4" />}
                                {template.id === 'performance-tracking' && <FiClock className="w-4 h-4" />}
                                {template.id === 'error-tracking' && <FiAlertTriangle className="w-4 h-4" />}
                                {template.id === 'usage-overview' && <FiServer className="w-4 h-4" />}
                                {template.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dashboard Controls */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold gradient-text-primary">
                        {selectedTemplate.name}
                    </h2>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        {selectedTemplate.description} • {widgets.length} widgets
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Auto Refresh */}
                    <select
                        value={autoRefresh}
                        onChange={(e) => setAutoRefresh(Number(e.target.value))}
                        className="px-4 py-2 text-sm rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-panel dark:bg-dark-panel text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 transition-all"
                    >
                        <option value={0}>No refresh</option>
                        <option value={10}>10s</option>
                        <option value={30}>30s</option>
                        <option value={60}>1m</option>
                        <option value={300}>5m</option>
                    </select>

                    {/* Refresh Button */}
                    <button
                        onClick={refreshDashboard}
                        disabled={refreshing}
                        className="btn-ghost px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                        <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* AI-Generated Widgets (rendered first) */}
            {aiGeneratedWidgets.size > 0 && (
                <div ref={aiWidgetRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {Array.from(aiGeneratedWidgets.values()).map(renderWidget)}
                </div>
            )}

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {widgets.map(renderWidget)}
            </div>
        </div>
    );
};

// Widget Components
const StatsCard: React.FC<{ data: any; metric: string }> = ({ data, metric }) => {
    const getIcon = () => {
        if (metric.includes('cost') || metric.includes('Cost')) return FiDollarSign;
        if (metric.includes('latency') || metric.includes('Latency')) return FiClock;
        if (metric.includes('token') || metric.includes('Token')) return FiCpu;
        if (metric.includes('error') || metric.includes('Error')) return FiAlertTriangle;
        if (metric.includes('success') || metric.includes('Success')) return FiCheckCircle;
        return FiActivity;
    };

    const Icon = getIcon();

    const formatValue = (val: number) => {
        if (metric.includes('cost') || metric.includes('Cost')) return `$${val.toFixed(4)}`;
        if (metric.includes('latency') || metric.includes('Latency')) return `${val.toFixed(0)}ms`;
        if (metric.includes('rate') || metric.includes('Rate')) return `${val.toFixed(1)}%`;
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
        return val.toLocaleString();
    };

    const getTrendColor = () => {
        if (data.trend === 'up') return 'text-green-500';
        if (data.trend === 'down') return 'text-red-500';
        return 'text-light-text-muted dark:text-dark-text-muted';
    };

    const getTrendIcon = () => {
        if (data.trend === 'up') return '↗';
        if (data.trend === 'down') return '↘';
        return '→';
    };

    return (
        <div className="flex flex-col h-full justify-between">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30">
                    <Icon className="w-6 h-6 text-primary-500" />
                </div>
                {data.change !== 0 && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${getTrendColor()}`}>
                        <span>{getTrendIcon()}</span>
                        <span>{Math.abs(data.change).toFixed(1)}%</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-4xl font-bold gradient-text-primary mb-1">
                    {formatValue(data.value)}
                </p>
                <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                    Last updated: now
                </p>
            </div>
        </div>
    );
};

const LineWidget: React.FC<{ data: any[]; expanded?: boolean }> = ({ data, expanded = false }) => {
    const isDark = document.documentElement.classList.contains('dark');

    return (
        <ResponsiveContainer width="100%" height={expanded ? 400 : 250}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06ec9e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06ec9e" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" opacity={0.3} />
                <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    style={{ fontSize: '11px' }}
                    tick={{ fill: '#64748b' }}
                />
                <YAxis
                    stroke="#94a3b8"
                    style={{ fontSize: '11px' }}
                    tick={{ fill: '#64748b' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                        border: '2px solid #06ec9e',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        padding: '12px',
                        boxShadow: isDark
                            ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(6, 236, 158, 0.3)'
                            : '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 0 15px rgba(6, 236, 158, 0.2)',
                        color: isDark ? '#f1f5f9' : '#1e293b'
                    }}
                    labelStyle={{
                        color: isDark ? '#f1f5f9' : '#1e293b',
                        fontWeight: 'bold',
                        marginBottom: '4px'
                    }}
                    itemStyle={{
                        color: isDark ? '#06ec9e' : '#009454',
                        fontWeight: '600'
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#06ec9e"
                    strokeWidth={3}
                    dot={{ fill: '#06ec9e', r: 4 }}
                    activeDot={{ r: 6 }}
                    fill="url(#lineGradient)"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

const BarWidget: React.FC<{ data: any[]; expanded?: boolean }> = ({ data, expanded = false }) => {
    const isDark = document.documentElement.classList.contains('dark');

    return (
        <ResponsiveContainer width="100%" height={expanded ? 400 : 250}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" opacity={0.3} />
                <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    style={{ fontSize: '11px' }}
                    tick={{ fill: '#64748b' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                />
                <YAxis
                    stroke="#94a3b8"
                    style={{ fontSize: '11px' }}
                    tick={{ fill: '#64748b' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                        border: '2px solid #06ec9e',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        padding: '12px',
                        boxShadow: isDark
                            ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(6, 236, 158, 0.3)'
                            : '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 0 15px rgba(6, 236, 158, 0.2)',
                        color: isDark ? '#f1f5f9' : '#1e293b'
                    }}
                    labelStyle={{
                        color: isDark ? '#f1f5f9' : '#1e293b',
                        fontWeight: 'bold',
                        marginBottom: '4px'
                    }}
                    itemStyle={{
                        color: isDark ? '#06ec9e' : '#009454',
                        fontWeight: '600'
                    }}
                />
                <Bar dataKey="value" fill="#06ec9e" radius={[8, 8, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

const PieWidget: React.FC<{ data: any[]; expanded?: boolean }> = ({ data, expanded = false }) => {
    const isDark = document.documentElement.classList.contains('dark');

    return (
        <ResponsiveContainer width="100%" height={expanded ? 400 : 250}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name.slice(0, 10)} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={expanded ? 120 : 80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                        border: '2px solid #06ec9e',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        padding: '12px',
                        boxShadow: isDark
                            ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(6, 236, 158, 0.3)'
                            : '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 0 15px rgba(6, 236, 158, 0.2)',
                        color: isDark ? '#f1f5f9' : '#1e293b'
                    }}
                    labelStyle={{
                        color: isDark ? '#f1f5f9' : '#1e293b',
                        fontWeight: 'bold',
                        marginBottom: '4px'
                    }}
                    itemStyle={{
                        color: isDark ? '#06ec9e' : '#009454',
                        fontWeight: '600'
                    }}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{
                        fontSize: '11px',
                        color: isDark ? '#cbd5e1' : '#475569'
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

const AreaWidget: React.FC<{ data: any[]; expanded?: boolean }> = ({ data, expanded = false }) => {
    const isDark = document.documentElement.classList.contains('dark');

    return (
        <ResponsiveContainer width="100%" height={expanded ? 400 : 250}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06ec9e" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#06ec9e" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" opacity={0.3} />
                <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    style={{ fontSize: '11px' }}
                    tick={{ fill: '#64748b' }}
                />
                <YAxis
                    stroke="#94a3b8"
                    style={{ fontSize: '11px' }}
                    tick={{ fill: '#64748b' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                        border: '2px solid #06ec9e',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        padding: '12px',
                        boxShadow: isDark
                            ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(6, 236, 158, 0.3)'
                            : '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 0 15px rgba(6, 236, 158, 0.2)',
                        color: isDark ? '#f1f5f9' : '#1e293b'
                    }}
                    labelStyle={{
                        color: isDark ? '#f1f5f9' : '#1e293b',
                        fontWeight: 'bold',
                        marginBottom: '4px'
                    }}
                    itemStyle={{
                        color: isDark ? '#06ec9e' : '#009454',
                        fontWeight: '600'
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#06ec9e"
                    strokeWidth={2}
                    fill="url(#colorGradient)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

const TableWidget: React.FC<{ data: any[]; expanded?: boolean }> = ({ data, expanded = false }) => (
    <div className={`overflow-y-auto ${expanded ? 'max-h-96' : 'max-h-80'}`}>
        <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-light-panel dark:bg-dark-panel border-b-2 border-primary-500/20">
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">Error</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-primary-200/20 dark:divide-primary-500/10">
                {data.map((log, idx) => (
                    <tr key={idx} className="hover:bg-primary-500/5 transition-colors">
                        <td className="px-4 py-3 text-light-text-secondary dark:text-dark-text-secondary whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-light-text-primary dark:text-dark-text-primary">
                            <span className="px-2 py-1 bg-primary-500/10 rounded text-xs">
                                {log.service}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-red-600 dark:text-red-400 truncate max-w-xs">
                            {log.errorMessage}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

