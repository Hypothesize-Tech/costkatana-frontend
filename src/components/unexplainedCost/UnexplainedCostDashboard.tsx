import React, { useState, useEffect } from 'react';
import { UnexplainedCostService, CostAnalysis, DailyCostReport, CostAnomaly, CostTrends } from '../../services/unexplainedCost.service';
import { CostStoryCard } from './CostStoryCard';
import { CostAttributionTree } from './CostAttributionTree';
import { CostOptimizationPanel } from './CostOptimizationPanel';
import { CostAnomalyAlerts } from './CostAnomalyAlerts';
import { CostTrendsChart } from './CostTrendsChart';

export const UnexplainedCostDashboard: React.FC = () => {
    const [timeframe, setTimeframe] = useState<string>('24h');
    const [workspaceId, setWorkspaceId] = useState<string>('default');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
    const [dailyReport, setDailyReport] = useState<DailyCostReport | null>(null);
    const [anomalies, setAnomalies] = useState<CostAnomaly[]>([]);
    const [trends, setTrends] = useState<CostTrends | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, [timeframe, workspaceId]);

    const loadDashboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [analysis, report, anomaliesData, trendsData] = await Promise.all([
                UnexplainedCostService.analyzeUnexplainedCosts(timeframe, workspaceId),
                UnexplainedCostService.generateDailyCostReport(undefined, workspaceId),
                UnexplainedCostService.getCostAnomalies(timeframe, workspaceId),
                UnexplainedCostService.getCostTrends('30d', workspaceId)
            ]);

            setCostAnalysis(analysis);
            setDailyReport(report);
            setAnomalies(anomaliesData.anomalies);
            setTrends(trendsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
            console.error('Dashboard data loading error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTimeframeChange = (newTimeframe: string) => {
        setTimeframe(newTimeframe);
    };

    const handleWorkspaceChange = (newWorkspaceId: string) => {
        setWorkspaceId(newWorkspaceId);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="h-64 bg-gray-200 rounded"></div>
                            <div className="h-64 bg-gray-200 rounded"></div>
                            <div className="h-64 bg-gray-200 rounded"></div>
                            <div className="h-64 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
                                <div className="mt-2 text-sm text-red-700">{error}</div>
                                <button
                                    onClick={loadDashboardData}
                                    className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Unexplained Cost Analyzer</h1>
                            <p className="mt-2 text-lg text-gray-600">
                                Understand why your AI costs changed and get actionable optimization insights
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
                            <select
                                value={timeframe}
                                onChange={(e) => handleTimeframeChange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="1h">Last Hour</option>
                                <option value="24h">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                            </select>

                            <select
                                value={workspaceId}
                                onChange={(e) => handleWorkspaceChange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="default">Default Workspace</option>
                                <option value="development">Development</option>
                                <option value="staging">Staging</option>
                                <option value="production">Production</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Cost Story Card */}
                    <div className="lg:col-span-2">
                        {dailyReport && <CostStoryCard report={dailyReport} />}
                    </div>

                    {/* Cost Attribution Tree */}
                    <div>
                        {costAnalysis && <CostAttributionTree analysis={costAnalysis} />}
                    </div>

                    {/* Cost Optimization Panel */}
                    <div>
                        {costAnalysis && <CostOptimizationPanel analysis={costAnalysis} />}
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Cost Anomaly Alerts */}
                    <div>
                        <CostAnomalyAlerts anomalies={anomalies} />
                    </div>

                    {/* Cost Trends Chart */}
                    <div>
                        {trends && <CostTrendsChart trends={trends} />}
                    </div>
                </div>
            </div>
        </div>
    );
};



