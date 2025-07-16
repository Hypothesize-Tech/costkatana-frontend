import React, { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    BoltIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    MinusIcon,
    ServerIcon,
    CpuChipIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { InferenceScalingService, DashboardOverview } from '../../services/inferenceScaling.service';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface DashboardProps {
    className?: string;
}

export const InferenceScalingDashboard: React.FC<DashboardProps> = ({ className = "" }) => {
    const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeWindow, setSelectedTimeWindow] = useState(4);
    const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

    useEffect(() => {
        fetchDashboardData();

        // Set up auto-refresh every 5 minutes
        const interval = setInterval(() => {
            fetchDashboardData();
        }, 5 * 60 * 1000);

        setRefreshInterval(interval);

        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [selectedTimeWindow]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await InferenceScalingService.getDashboardOverview(selectedTimeWindow);
            setDashboardData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleExecuteRecommendation = async (recommendationId: string, dryRun: boolean = true) => {
        try {
            const result = await InferenceScalingService.executeRecommendation(recommendationId, dryRun);

            if (result.success) {
                alert(`Recommendation ${dryRun ? 'simulated' : 'executed'} successfully: ${result.message}`);
                // Refresh dashboard data
                fetchDashboardData();
            } else {
                alert(`Failed to execute recommendation: ${result.message}`);
            }
        } catch (err) {
            alert(`Error executing recommendation: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'increasing':
                return <ArrowTrendingUpIcon className="h-5 w-5 text-red-500" />;
            case 'decreasing':
                return <ArrowTrendingDownIcon className="h-5 w-5 text-green-500" />;
            default:
                return <MinusIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'text-red-600 bg-red-50';
            case 'error':
                return 'text-orange-600 bg-orange-50';
            case 'warning':
                return 'text-yellow-600 bg-yellow-50';
            default:
                return 'text-blue-600 bg-blue-50';
        }
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center h-64 ${className}`}>
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
                <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-red-700">{error}</span>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="mt-2 text-sm text-red-600 hover:text-red-500"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <p className="text-gray-500">No dashboard data available</p>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        AI Inference Cost Predictor & Reactive Scaler
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Monitor demand, optimize costs, and scale your AI models efficiently
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        value={selectedTimeWindow}
                        onChange={(e) => setSelectedTimeWindow(Number(e.target.value))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                        <option value={1}>Next 1 hour</option>
                        <option value={4}>Next 4 hours</option>
                        <option value={8}>Next 8 hours</option>
                        <option value={24}>Next 24 hours</option>
                    </select>
                    <button
                        onClick={fetchDashboardData}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Models</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {dashboardData.overview.totalModels}
                            </p>
                        </div>
                        <ServerIcon className="h-8 w-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Current Load</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {dashboardData.overview.totalCurrentLoad.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">requests/hour</p>
                        </div>
                        <CpuChipIcon className="h-8 w-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Predicted Load</p>
                            <div className="flex items-center space-x-2">
                                <p className="text-2xl font-bold text-gray-900">
                                    {dashboardData.overview.totalPredictedLoad.toLocaleString()}
                                </p>
                                {getTrendIcon(dashboardData.overview.loadTrend)}
                            </div>
                            <p className="text-xs text-gray-500">requests/hour</p>
                        </div>
                        <ChartBarIcon className="h-8 w-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Avg Confidence</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {InferenceScalingService.formatPercentage(dashboardData.overview.averageConfidence)}
                            </p>
                        </div>
                        <ClockIcon className="h-8 w-8 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {dashboardData.alerts.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                            Active Alerts ({dashboardData.alerts.length})
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {dashboardData.alerts.slice(0, 5).map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium">{alert.message}</p>
                                            <p className="text-sm mt-1 opacity-80">
                                                Model: {alert.modelId} • {new Date(alert.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        {alert.autoActionAvailable && (
                                            <button
                                                onClick={() => alert.recommendation && handleExecuteRecommendation(alert.recommendation.id, false)}
                                                className="ml-4 bg-white border border-gray-300 rounded-md px-3 py-1 text-sm hover:bg-gray-50"
                                            >
                                                Auto-Fix
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <BoltIcon className="h-5 w-5 text-blue-500 mr-2" />
                        Scaling Recommendations
                    </h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {dashboardData.summary.totalRecommendations}
                            </p>
                            <p className="text-sm text-gray-600">Total Recommendations</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {InferenceScalingService.formatCurrency(dashboardData.summary.potentialSavings)}
                            </p>
                            <p className="text-sm text-gray-600">Potential Savings</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">
                                {dashboardData.summary.highPriorityCount}
                            </p>
                            <p className="text-sm text-gray-600">High Priority</p>
                        </div>
                    </div>

                    {/* Top Recommendations */}
                    <div className="space-y-4">
                        {dashboardData.recommendations.slice(0, 3).map((recommendation) => (
                            <div key={recommendation.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-lg">
                                                {InferenceScalingService.getActionIcon(recommendation.action)}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${InferenceScalingService.getPriorityBgColor(recommendation.priority)} ${InferenceScalingService.getPriorityColor(recommendation.priority)}`}>
                                                {recommendation.priority.toUpperCase()}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {recommendation.modelId}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">
                                            {recommendation.reasoning}
                                        </p>
                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                            <span>
                                                💰 {InferenceScalingService.formatCurrency(Math.abs(recommendation.impact.costSavings))}
                                                {recommendation.impact.costSavings > 0 ? ' savings' : ' cost'}
                                            </span>
                                            <span>
                                                ⏱️ {recommendation.implementation.estimatedTime}min
                                            </span>
                                            <span>
                                                🎯 {recommendation.impact.riskLevel} risk
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleExecuteRecommendation(recommendation.id, true)}
                                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-200"
                                        >
                                            Simulate
                                        </button>
                                        <button
                                            onClick={() => handleExecuteRecommendation(recommendation.id, false)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                                        >
                                            Execute
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {dashboardData.recommendations.length > 3 && (
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-500">
                                Showing 3 of {dashboardData.recommendations.length} recommendations
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Model Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <ServerIcon className="h-5 w-5 text-gray-500 mr-2" />
                        Model Status
                    </h2>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {dashboardData.predictions.slice(0, 5).map((prediction) => (
                            <div key={prediction.modelId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                        <h3 className="font-medium text-gray-900">
                                            {prediction.modelId}
                                        </h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${prediction.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                                            prediction.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {InferenceScalingService.formatPercentage(prediction.confidence)} confidence
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                        <span>Current: {prediction.currentLoad.toLocaleString()}</span>
                                        <span>Predicted: {prediction.predictedLoad.toLocaleString()}</span>
                                        <span className="flex items-center space-x-1">
                                            <span>Trend:</span>
                                            {getTrendIcon(prediction.trend)}
                                            <span>{prediction.trend}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {prediction.predictedLoad > prediction.currentLoad * 1.5 ? (
                                        <XCircleIcon className="h-5 w-5 text-red-500" />
                                    ) : (
                                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}; 