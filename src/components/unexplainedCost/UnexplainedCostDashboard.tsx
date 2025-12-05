import React, { useState, useEffect, useCallback } from 'react';
import { UnexplainedCostService, CostAnalysis, DailyCostReport, CostAnomaly, CostTrends } from '../../services/unexplainedCost.service';
import { CostStoryCard } from './CostStoryCard';
import { CostAttributionTree } from './CostAttributionTree';
import { CostOptimizationPanel } from './CostOptimizationPanel';
import { CostAnomalyAlerts } from './CostAnomalyAlerts';
import { CostTrendsChart } from './CostTrendsChart';
import { UnexplainedCostShimmer } from '../shimmer/UnexplainedCostShimmer';

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

    const loadDashboardData = useCallback(async () => {
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
    }, [timeframe, workspaceId]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const handleTimeframeChange = (newTimeframe: string) => {
        setTimeframe(newTimeframe);
    };

    const handleWorkspaceChange = (newWorkspaceId: string) => {
        setWorkspaceId(newWorkspaceId);
    };

    if (loading && !costAnalysis && !dailyReport && !anomalies.length && !trends) {
        return <UnexplainedCostShimmer />;
    }

    if (error) {
        return (
            <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
                <div className="mx-auto max-w-7xl">
                    <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br rounded-xl border shadow-xl backdrop-blur-xl glass border-error-200/30 from-error-50/30 to-error-100/30 dark:from-error-900/20 dark:to-error-800/20">
                        <div className="flex items-start sm:items-center">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-error-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <h3 className="text-sm sm:text-base font-medium text-error-800 dark:text-error-200">Error Loading Dashboard</h3>
                                <div className="mt-2 text-xs sm:text-sm text-error-700 dark:text-error-300 break-words">{error}</div>
                                <button
                                    onClick={loadDashboardData}
                                    className="mt-3 btn btn-primary text-sm sm:text-base"
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
        <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display gradient-text-primary">Unexplained Cost Analyzer</h1>
                            <p className="mt-1 sm:mt-2 text-sm sm:text-base md:text-lg text-secondary-600 dark:text-secondary-300">
                                Understand why your AI costs changed and get actionable optimization insights
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:mt-0">
                            <select
                                value={timeframe}
                                onChange={(e) => handleTimeframeChange(e.target.value)}
                                className="select text-sm sm:text-base"
                            >
                                <option value="1h">Last Hour</option>
                                <option value="24h">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                            </select>

                            <select
                                value={workspaceId}
                                onChange={(e) => handleWorkspaceChange(e.target.value)}
                                className="select text-sm sm:text-base"
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
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 mb-4 sm:mb-6 md:mb-8 lg:grid-cols-2">
                    {/* Cost Story Card */}
                    <div className="lg:col-span-2">
                        {dailyReport ? (
                            <CostStoryCard report={dailyReport} />
                        ) : loadingStates.dailyReport ? (
                            <div className="h-48 sm:h-56 md:h-64 rounded-xl animate-pulse glass bg-light-bg-300 dark:bg-dark-bg-300"></div>
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
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-2">
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



