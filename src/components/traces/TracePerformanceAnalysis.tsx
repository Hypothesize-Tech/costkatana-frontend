import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    ChartBarIcon as BarChart3,
    ClockIcon as Clock,
    CurrencyDollarIcon as DollarSign,
    BoltIcon as Zap,
    ExclamationTriangleIcon as AlertTriangle,
    CheckCircleIcon as CheckCircle,
    LightBulbIcon as Lightbulb,
    CpuChipIcon as Cpu,
    CircleStackIcon as Database,
    ArrowsRightLeftIcon as ArrowRightLeft,
    SignalIcon as TrendingUp,
    InformationCircleIcon as Info
} from '@heroicons/react/24/outline';
import { TraceService, TraceAnalysis } from '../../services/trace.service';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const TracePerformanceAnalysis: React.FC = () => {
    const { traceId } = useParams<{ traceId: string }>();
    const [analysis, setAnalysis] = useState<TraceAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'bottlenecks' | 'optimizations' | 'recommendations'>('overview');

    useEffect(() => {
        if (traceId) {
            loadPerformanceAnalysis();
        }
    }, [traceId]);

    const loadPerformanceAnalysis = async () => {
        try {
            setLoading(true);
            const response = await TraceService.analyzeTrace(traceId!);
            setAnalysis(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load performance analysis');
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (duration: number) => {
        if (duration < 1000) return `${duration}ms`;
        return `${(duration / 1000).toFixed(2)}s`;
    };

    const formatCost = (cost: number) => {
        return `$${cost.toFixed(4)}`;
    };

    const getOptimizationIcon = (type: string) => {
        switch (type) {
            case 'parallelization': return <Zap className="w-5 h-5 text-purple-500" />;
            case 'caching': return <Database className="w-5 h-5 text-green-500" />;
            case 'model_optimization': return <Cpu className="w-5 h-5 text-blue-500" />;
            case 'prompt_optimization': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
            default: return <ArrowRightLeft className="w-5 h-5 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analysis</h3>
                <p className="text-gray-600">{error}</p>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="text-center py-12">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
                <p className="text-gray-600">Unable to load performance analysis for this trace.</p>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Performance Analysis</h1>
                        <p className="text-gray-600">Trace analysis and optimization insights</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                                {formatCost(analysis.performance.totalCost)}
                            </div>
                            <div className="text-sm text-gray-600">Total Cost</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Clock className="w-6 h-6 text-blue-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Average Latency</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatDuration(analysis.performance.averageLatency)}
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <DollarSign className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Total Cost</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCost(analysis.performance.totalCost)}
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Error Rate</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {(analysis.performance.errorRate * 100).toFixed(1)}%
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <TrendingUp className="w-6 h-6 text-purple-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Optimizations</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {analysis.optimizations.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white shadow">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'bottlenecks', label: 'Bottlenecks', icon: AlertTriangle },
                            { id: 'optimizations', label: 'Optimizations', icon: Lightbulb }
                        ].map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 mr-2" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Cost:</span>
                                            <span className="font-medium">{formatCost(analysis.performance.totalCost)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Tokens:</span>
                                            <span className="font-medium">{analysis.performance.totalTokens.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Cache Hit Rate:</span>
                                            <span className="font-medium text-green-600">{(analysis.performance.cacheHitRate * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Parallelizable Spans:</span>
                                            <span className="font-medium text-blue-600">{analysis.performance.parallelizationOpportunities.length}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Critical Path</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Duration:</span>
                                            <span className="font-medium">{formatDuration(analysis.criticalPath.totalDuration)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Spans in Path:</span>
                                            <span className="font-medium">{analysis.criticalPath.spans.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Bottlenecks:</span>
                                            <span className="font-medium text-yellow-600">{analysis.criticalPath.bottlenecks.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'bottlenecks' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Performance Bottlenecks</h3>
                                <span className="text-sm text-gray-500">{analysis.criticalPath.bottlenecks.length} identified</span>
                            </div>

                            {analysis.criticalPath.bottlenecks.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Bottlenecks Found</h3>
                                    <p className="text-gray-600">This trace shows good performance characteristics.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {analysis.criticalPath.bottlenecks.map((bottleneck, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 border border-red-200">
                                                            Critical Path
                                                        </span>
                                                    </div>
                                                    <h4 className="font-medium text-gray-900 mb-1">Span {bottleneck.spanId}</h4>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        Duration: {formatDuration(bottleneck.duration)} ({bottleneck.percentage.toFixed(1)}% of total)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'optimizations' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Optimization Opportunities</h3>
                                <span className="text-sm text-gray-500">{analysis.optimizations.length} opportunities</span>
                            </div>

                            {analysis.optimizations.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Fully Optimized</h3>
                                    <p className="text-gray-600">No optimization opportunities were identified.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {analysis.optimizations.map((optimization, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    {getOptimizationIcon(optimization.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-gray-900 capitalize">
                                                            {optimization.type.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {(optimization.confidence * 100).toFixed(0)}% confidence
                                                        </span>
                                                    </div>
                                                    <h4 className="font-medium text-gray-900 mb-1">{optimization.description}</h4>

                                                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                                        <div>
                                                            <span className="text-gray-500">Estimated Savings:</span>
                                                            <div className="font-medium text-green-600">
                                                                {formatCost(optimization.estimatedSavings)}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Affected Spans:</span>
                                                            <div className="font-medium text-gray-900">
                                                                {optimization.spans.length}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 