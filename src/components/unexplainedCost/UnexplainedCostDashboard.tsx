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

    const [loadingStates, setLoadingStates] = useState({
        costAnalysis: false,
        dailyReport: false,
        anomalies: false,
        trends: false
    });

    useEffect(() => {
        loadDashboardData();
    }, [timeframe, workspaceId]);

    const loadDashboardData = async () => {
        setLoading(true);
        setError(null);
        setLoadingStates({
            costAnalysis: true,
            dailyReport: true,
            anomalies: true,
            trends: true
        });

        // Load each API independently
        UnexplainedCostService.analyzeUnexplainedCosts(timeframe, workspaceId)
            .then(analysis => {
                setCostAnalysis(analysis);
                setLoadingStates(prev => ({ ...prev, costAnalysis: false }));
            })
            .catch(err => {
                console.error('Cost analysis error:', err);
                setLoadingStates(prev => ({ ...prev, costAnalysis: false }));
            });

        UnexplainedCostService.generateDailyCostReport(undefined, workspaceId)
            .then(report => {
                setDailyReport(report);
                setLoadingStates(prev => ({ ...prev, dailyReport: false }));
            })
            .catch(err => {
                console.error('Daily report error:', err);
                setLoadingStates(prev => ({ ...prev, dailyReport: false }));
            });

        UnexplainedCostService.getCostAnomalies(timeframe, workspaceId)
            .then(anomaliesData => {
                setAnomalies(anomaliesData.anomalies);
                setLoadingStates(prev => ({ ...prev, anomalies: false }));
            })
            .catch(err => {
                console.error('Anomalies error:', err);
                setLoadingStates(prev => ({ ...prev, anomalies: false }));
            });

        UnexplainedCostService.getCostTrends('30d', workspaceId)
            .then(trendsData => {
                setTrends(trendsData);
                setLoadingStates(prev => ({ ...prev, trends: false }));
            })
            .catch(err => {
                console.error('Trends error:', err);
                setLoadingStates(prev => ({ ...prev, trends: false }));
            });

        // Check if all data is loaded
        const checkAllLoaded = setInterval(() => {
            setLoadingStates(prev => {
                if (!prev.costAnalysis && !prev.dailyReport && !prev.anomalies && !prev.trends) {
                    setLoading(false);
                    clearInterval(checkAllLoaded);
                }
                return prev;
            });
        }, 100);
    };

    const handleTimeframeChange = (newTimeframe: string) => {
        setTimeframe(newTimeframe);
    };

    const handleWorkspaceChange = (newWorkspaceId: string) => {
        setWorkspaceId(newWorkspaceId);
    };

    if (loading && !costAnalysis && !dailyReport && !anomalies.length && !trends) {
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 glass rounded-xl w-1/4 mb-6 bg-light-bg-300 dark:bg-dark-bg-300"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="h-64 glass rounded-xl bg-light-bg-300 dark:bg-dark-bg-300"></div>
                            <div className="h-64 glass rounded-xl bg-light-bg-300 dark:bg-dark-bg-300"></div>
                            <div className="h-64 glass rounded-xl bg-light-bg-300 dark:bg-dark-bg-300"></div>
                            <div className="h-64 glass rounded-xl bg-light-bg-300 dark:bg-dark-bg-300"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="glass rounded-xl border border-error-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-error-50/30 to-error-100/30 dark:from-error-900/20 dark:to-error-800/20 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-error-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-error-800 dark:text-error-200">Error Loading Dashboard</h3>
                                <div className="mt-2 text-sm text-error-700 dark:text-error-300">{error}</div>
                                <button
                                    onClick={loadDashboardData}
                                    className="btn-primary mt-3"
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
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-display font-bold gradient-text-primary">Unexplained Cost Analyzer</h1>
                            <p className="mt-2 text-lg text-secondary-600 dark:text-secondary-300">
                                Understand why your AI costs changed and get actionable optimization insights
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
                            <select
                                value={timeframe}
                                onChange={(e) => handleTimeframeChange(e.target.value)}
                                className="select"
                            >
                                <option value="1h">Last Hour</option>
                                <option value="24h">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                            </select>

                            <select
                                value={workspaceId}
                                onChange={(e) => handleWorkspaceChange(e.target.value)}
                                className="select"
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
                        {dailyReport ? (
                            <CostStoryCard report={dailyReport} />
                        ) : loadingStates.dailyReport ? (
                            <div className="h-64 glass rounded-xl animate-pulse bg-light-bg-300 dark:bg-dark-bg-300"></div>
                        ) : null}
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



