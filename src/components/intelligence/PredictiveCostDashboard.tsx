import React, { useState, useEffect, useMemo } from 'react';
import {
    ExclamationTriangleIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    HomeIcon,
    BoltIcon,
    BeakerIcon,
    XCircleIcon,
    ClockIcon,
    ArrowPathIcon,
    LightBulbIcon,
    ShieldExclamationIcon,
    SparklesIcon,
    PresentationChartLineIcon,
    BanknotesIcon,
    ChartPieIcon,
    FireIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { PredictiveIntelligenceShimmer } from '../shimmer/PredictiveIntelligenceShimmer';
import { predictiveIntelligenceService, PredictiveIntelligenceData } from '../../services/predictiveIntelligence.service';

interface PredictiveCostDashboardProps {
    scope?: 'user' | 'project' | 'team';
    scopeId?: string;
    className?: string;
}

const PredictiveCostDashboard: React.FC<PredictiveCostDashboardProps> = ({
    scope = 'user',
    scopeId,
    className = ''
}) => {
    const [intelligenceData, setIntelligenceData] = useState<PredictiveIntelligenceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeHorizon, setSelectedTimeHorizon] = useState(30);
    const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'optimizations' | 'scenarios'>('overview');
    const [autoOptimizeEnabled, setAutoOptimizeEnabled] = useState(false);

    // Fetch predictive intelligence data
    useEffect(() => {
        const fetchIntelligenceData = async () => {
            try {
                setLoading(true);

                const data = await predictiveIntelligenceService.getPredictiveIntelligence({
                    scope,
                    scopeId,
                    timeHorizon: selectedTimeHorizon,
                    includeScenarios: true,
                    includeCrossPlatform: true
                });

                setIntelligenceData(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchIntelligenceData();
    }, [scope, scopeId, selectedTimeHorizon]);

    // Calculate key metrics
    const keyMetrics = useMemo(() => {
        if (!intelligenceData) return null;

        const criticalAlerts = intelligenceData.proactiveAlerts.filter(alert => alert.severity === 'critical').length;
        const urgentAlerts = intelligenceData.proactiveAlerts.filter(alert => alert.daysUntilImpact <= 7).length;
        const totalPotentialSavings = intelligenceData.optimizationRecommendations.reduce((sum, opt) => sum + opt.potentialSavings, 0);
        const easyOptimizations = intelligenceData.optimizationRecommendations.filter(opt => opt.implementationDifficulty === 'easy').length;
        const budgetRiskProjects = intelligenceData.budgetExceedanceProjections.filter(proj => proj.exceedanceProbability > 0.7).length;

        return {
            criticalAlerts,
            urgentAlerts,
            totalPotentialSavings,
            easyOptimizations,
            budgetRiskProjects,
            confidenceScore: intelligenceData.confidenceScore,
            nextBudgetExceedance: intelligenceData.budgetExceedanceProjections.length > 0
                ? intelligenceData.budgetExceedanceProjections.sort((a, b) => a.daysUntilExceedance - b.daysUntilExceedance)[0]
                : null
        };
    }, [intelligenceData]);

    const handleAutoOptimize = async (alertId: string) => {
        try {
            setLoading(true);
            const result = await predictiveIntelligenceService.autoOptimize(alertId);

            // Show success message
            if (result.success) {
                alert(`Auto-optimization completed successfully!\n\n` +
                    `Actions Applied:\n${result.data.actionsApplied.join('\n')}\n\n` +
                    `Estimated Savings: $${result.data.estimatedSavings.toFixed(2)}\n\n` +
                    `Status: ${result.data.implementationStatus}`);
            }

            // Refresh data after auto-optimization
            window.location.reload();
        } catch (err) {
            console.error('Auto-optimization failed:', err);
            alert(`Auto-optimization failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };



    if (loading) {
        return <PredictiveIntelligenceShimmer />;
    }

    if (error) {
        return (
            <div className={`p-2 sm:p-3 mx-auto max-w-7xl ${className}`}>
                <div className="p-4 sm:p-6 text-center rounded-lg sm:rounded-xl border shadow-xl backdrop-blur-xl glass border-danger-200/30 dark:border-danger-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel animate-fade-in">
                    <div className="flex justify-center items-center mx-auto mb-3 sm:mb-4 w-14 h-14 sm:w-16 sm:h-16 rounded-xl shadow-2xl bg-gradient-danger">
                        <XCircleIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold font-display gradient-text-danger">Intelligence Generation Failed</h3>
                    <p className="mx-auto mb-4 sm:mb-6 max-w-md text-sm font-body text-light-text-secondary dark:text-dark-text-secondary px-3">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary text-sm min-h-[40px] px-4"
                    >
                        <ArrowPathIcon className="mr-2 w-4 h-4" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!intelligenceData || !keyMetrics) {
        return (
            <div className={`p-2 sm:p-3 mx-auto max-w-7xl ${className}`}>
                <div className="p-4 sm:p-6 text-center rounded-lg sm:rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel animate-fade-in">
                    <div className="flex justify-center items-center mx-auto mb-3 sm:mb-4 w-14 h-14 sm:w-16 sm:h-16 rounded-xl shadow-2xl bg-gradient-primary glow-primary">
                        <ChartBarIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg sm:text-xl font-bold font-display gradient-text-primary">No Intelligence Data Available</h3>
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary px-3">Insufficient historical data for predictive analysis</p>
                </div>
            </div>
        );
    }

    // After null checks, we know these are non-null
    const data = intelligenceData!;
    const metrics = keyMetrics!;

    return (
        <div className={`p-2 sm:p-3 mx-auto space-y-3 sm:space-y-4 max-w-7xl ${className}`}>
            {/* Header */}
            <div className="p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel animate-fade-in">
                <div className="flex flex-col gap-3 sm:gap-4 justify-between items-start lg:flex-row lg:items-center">
                    <div className="flex gap-2 sm:gap-3 md:gap-4 items-start w-full lg:w-auto">
                        <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl shadow-xl bg-gradient-primary glow-primary shrink-0">
                            <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="mb-1 sm:mb-1.5 text-lg sm:text-xl md:text-2xl font-bold font-display gradient-text-primary truncate">Predictive Cost Intelligence</h1>
                            <p className="mb-2 sm:mb-2.5 text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">AI-powered proactive optimization and intelligence</p>
                            <div className="flex flex-wrap gap-2 items-center">
                                <div className="flex gap-1.5 sm:gap-2 items-center">
                                    <InformationCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500 dark:text-primary-400 flex-shrink-0" />
                                    <span className="text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary whitespace-nowrap">Confidence:</span>
                                </div>
                                <div className="overflow-hidden w-28 sm:w-32 md:w-36 h-2 sm:h-2.5 rounded-full border glass border-primary-200/30 dark:border-primary-500/20 bg-light-bg-secondary dark:bg-dark-bg-300">
                                    <div
                                        className="h-full bg-gradient-to-r rounded-full shadow-lg transition-all duration-700 from-primary-500 to-primary-600 glow-primary"
                                        style={{ width: `${metrics.confidenceScore * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs sm:text-sm font-bold font-display gradient-text-primary whitespace-nowrap">{Math.round(metrics.confidenceScore * 100)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
                        <div className="relative">
                            <ClockIcon className="absolute left-2.5 top-1/2 z-10 w-4 h-4 transform -translate-y-1/2 pointer-events-none text-primary-500 dark:text-primary-400" />
                            <select
                                value={selectedTimeHorizon}
                                onChange={(e) => setSelectedTimeHorizon(parseInt(e.target.value))}
                                className="input text-xs sm:text-sm py-2 pl-8 pr-7 min-w-[110px] sm:min-w-[120px] appearance-none bg-white/90 dark:bg-dark-bg-300/90 border-primary-200/30 dark:border-primary-500/20 font-display font-semibold text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500/20 min-h-[36px] sm:min-h-[40px]"
                            >
                                <option value={7}>7 Days</option>
                                <option value={14}>14 Days</option>
                                <option value={30}>30 Days</option>
                                <option value={60}>60 Days</option>
                                <option value={90}>90 Days</option>
                            </select>
                        </div>

                        <div className="flex gap-2 items-center p-2 sm:p-2.5 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-bg-300/50">
                            <label className="flex gap-1.5 sm:gap-2 items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoOptimizeEnabled}
                                    onChange={(e) => setAutoOptimizeEnabled(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`relative w-9 h-5 sm:w-10 sm:h-5 rounded-full transition-all duration-300 shadow-inner ${autoOptimizeEnabled
                                    ? 'bg-gradient-primary glow-primary'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                    }`}>
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${autoOptimizeEnabled ? 'translate-x-4 sm:translate-x-4.5' : 'translate-x-0.5'
                                        }`} />
                                </div>
                                <span className="text-xs font-semibold font-display text-light-text-primary dark:text-dark-text-primary whitespace-nowrap">
                                    <BoltIcon className="inline mr-1 w-3.5 h-3.5" />
                                    Auto-Optimize
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Critical Alerts Card */}
                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-danger-200/30 dark:border-danger-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-danger-300/50 dark:hover:border-danger-400/30 animate-fade-in">
                    <div className="flex gap-2.5 sm:gap-3 items-start">
                        <div className="p-2 sm:p-2.5 rounded-lg shadow-lg bg-gradient-danger shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <FireIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="mb-1 sm:mb-1.5 text-xl sm:text-2xl font-bold font-display gradient-text-danger truncate">{metrics.criticalAlerts}</h3>
                            <p className="mb-1.5 sm:mb-2 text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Critical Alerts</p>
                            {metrics.urgentAlerts > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-danger-700 dark:text-danger-300 bg-gradient-to-r rounded-full font-display from-danger-500/20 to-danger-600/20 border border-danger-300/30 dark:border-danger-500/20">
                                    <ExclamationTriangleIcon className="w-3 h-3" />
                                    {metrics.urgentAlerts} urgent
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Potential Savings Card */}
                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-success-200/30 dark:border-success-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-success-300/50 dark:hover:border-success-400/30 animate-fade-in animation-delay-100">
                    <div className="flex gap-2.5 sm:gap-3 items-start">
                        <div className="p-2 sm:p-2.5 rounded-lg shadow-lg bg-gradient-success glow-success shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <BanknotesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="mb-1 sm:mb-1.5 text-lg sm:text-xl md:text-2xl font-bold truncate font-display gradient-text-success">{formatCurrency(metrics.totalPotentialSavings)}</h3>
                            <p className="mb-1.5 sm:mb-2 text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Potential Monthly Savings</p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r rounded-full font-display from-success-500/20 to-success-600/20 text-success-700 dark:text-success-300 border border-success-300/30 dark:border-success-500/20">
                                <CheckCircleIcon className="w-3 h-3" />
                                {metrics.easyOptimizations} easy wins
                            </span>
                        </div>
                    </div>
                </div>

                {/* Budget Risk Card */}
                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-warning-200/30 dark:border-warning-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-warning-300/50 dark:hover:border-warning-400/30 animate-fade-in animation-delay-200">
                    <div className="flex gap-2.5 sm:gap-3 items-start">
                        <div className="p-2 sm:p-2.5 rounded-lg shadow-lg bg-gradient-warning shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <ShieldExclamationIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="mb-1 sm:mb-1.5 text-xl sm:text-2xl font-bold font-display gradient-text-warning truncate">{metrics.budgetRiskProjects}</h3>
                            <p className="mb-1.5 sm:mb-2 text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Projects at Budget Risk</p>
                            {metrics.nextBudgetExceedance && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r rounded-full font-display from-warning-500/20 to-warning-600/20 text-warning-700 dark:text-warning-300 border border-warning-300/30 dark:border-warning-500/20">
                                    <ClockIcon className="w-3 h-3" />
                                    Next: {metrics.nextBudgetExceedance.daysUntilExceedance} days
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Growth Rate Card */}
                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-primary-300/50 dark:hover:border-primary-400/30 animate-fade-in animation-delay-300">
                    <div className="flex gap-2.5 sm:gap-3 items-start">
                        <div className="p-2 sm:p-2.5 rounded-lg shadow-lg bg-gradient-primary glow-primary shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <PresentationChartLineIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="mb-1 sm:mb-1.5 text-xl sm:text-2xl font-bold font-display gradient-text-primary truncate">{data.promptLengthGrowth.growthRatePerWeek.toFixed(1)}%</h3>
                            <p className="mb-1.5 sm:mb-2 text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Weekly Prompt Growth</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-display border ${data.historicalTokenTrends.tokenEfficiencyTrend === 'improving'
                                ? 'bg-gradient-to-r from-success-500/20 to-success-600/20 text-success-700 dark:text-success-300 border-success-300/30 dark:border-success-500/20'
                                : data.historicalTokenTrends.tokenEfficiencyTrend === 'stable'
                                    ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-700 dark:text-primary-300 border-primary-300/30 dark:border-primary-500/20'
                                    : 'bg-gradient-to-r from-danger-500/20 to-danger-600/20 text-danger-700 dark:text-danger-300 border-danger-300/30 dark:border-danger-500/20'
                                }`}>
                                <ArrowTrendingUpIcon className="w-3 h-3" />
                                {data.historicalTokenTrends.tokenEfficiencyTrend}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="p-2.5 sm:p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel animate-fade-in">
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: HomeIcon },
                        { id: 'alerts', label: 'Alerts', icon: ExclamationTriangleIcon },
                        { id: 'optimizations', label: 'Optimizations', icon: RocketLaunchIcon },
                        { id: 'scenarios', label: 'Scenarios', icon: BeakerIcon }
                    ].map(tab => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg font-display font-semibold text-xs sm:text-sm transition-all duration-300 shrink-0 min-h-[36px] sm:min-h-[40px] [touch-action:manipulation] active:scale-95 ${activeTab === tab.id
                                    ? 'bg-gradient-primary text-white shadow-xl glow-primary scale-105'
                                    : 'glass hover:bg-primary-500/10 dark:hover:bg-primary-500/10 text-light-text-primary dark:text-dark-text-primary border border-primary-200/30 dark:border-primary-500/20 hover:scale-105 hover:border-primary-300/50 dark:hover:border-primary-400/30'
                                    }`}
                                onClick={() => setActiveTab(tab.id as 'overview' | 'alerts' | 'optimizations' | 'scenarios')}
                            >
                                <IconComponent className={`w-4 h-4 shrink-0 ${activeTab === tab.id ? 'text-white' : ''}`} />
                                <span className="whitespace-nowrap">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="glass rounded-lg sm:rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-3 sm:p-4 md:p-5 min-h-[350px] sm:min-h-[400px] animate-fade-in">
                {activeTab === 'overview' && (
                    <div className="space-y-3 sm:space-y-4">
                        <div className="mb-4 sm:mb-5 text-center">
                            <div className="inline-flex justify-center items-center p-2.5 sm:p-3 mx-auto mb-2 sm:mb-3 rounded-xl shadow-xl bg-gradient-primary glow-primary">
                                <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <h2 className="mb-1.5 sm:mb-2 text-xl sm:text-2xl font-bold font-display gradient-text-primary">Intelligence Overview</h2>
                            <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary px-3">Key insights and upcoming challenges</p>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 lg:grid-cols-2 xl:grid-cols-3">
                            {/* Next Budget Exceedance */}
                            {metrics.nextBudgetExceedance && (
                                <div className="p-3 sm:p-4 bg-gradient-to-br rounded-lg border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-warning-200/30 dark:border-warning-500/20 from-yellow-50/50 to-yellow-100/30 dark:from-yellow-900/10 dark:to-yellow-800/10 hover:scale-105 hover:shadow-2xl">
                                    <div className="flex gap-2 items-center mb-3">
                                        <div className="p-2 rounded-lg shadow-lg bg-gradient-warning group-hover:scale-110 transition-transform duration-300 shrink-0">
                                            <ShieldExclamationIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                        </div>
                                        <h3 className="text-sm sm:text-base font-bold font-display gradient-text-warning truncate">Upcoming Budget Exceedance</h3>
                                    </div>
                                    <div className="mb-3 text-center">
                                        <p className="mb-2 text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                            <span className="font-semibold font-display gradient-text-primary">{metrics.nextBudgetExceedance.scopeName}</span> will exceed budget in
                                        </p>
                                        <div className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold font-display gradient-text-warning">
                                            {metrics.nextBudgetExceedance.daysUntilExceedance} days
                                        </div>
                                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                                            Exceeding by <span className="font-semibold font-display gradient-text-danger">{formatCurrency(metrics.nextBudgetExceedance.exceedanceAmount)}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 text-xs sm:text-sm font-semibold font-display gradient-text-primary">Quick Actions:</h4>
                                        <div className="space-y-2">
                                            {metrics.nextBudgetExceedance.mitigationStrategies.slice(0, 2).map((strategy: { strategy: string; potentialSaving: number }, index: number) => (
                                                <div key={index} className="flex justify-between items-center gap-2 p-2.5 rounded-lg border shadow-lg backdrop-blur-xl glass border-warning-200/30">
                                                    <span className="text-xs font-body text-light-text-primary dark:text-dark-text-primary truncate flex-1">{strategy.strategy}</span>
                                                    <span className="text-xs font-semibold font-display gradient-text-success whitespace-nowrap flex-shrink-0">{formatCurrency(strategy.potentialSaving)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Top Optimization Opportunity */}
                            {data.optimizationRecommendations.length > 0 && (
                                <div className="p-3 sm:p-4 bg-gradient-to-br rounded-lg border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-success-200/30 dark:border-success-500/20 from-success-50/50 to-success-100/30 dark:from-success-900/10 dark:to-success-800/10 hover:scale-105 hover:shadow-2xl">
                                    <div className="flex gap-2 items-center mb-3">
                                        <div className="p-2 rounded-lg shadow-lg bg-gradient-success glow-success group-hover:scale-110 transition-transform duration-300 shrink-0">
                                            <LightBulbIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                        </div>
                                        <h3 className="text-sm sm:text-base font-bold font-display gradient-text-success truncate">Top Optimization Opportunity</h3>
                                    </div>
                                    <div className="space-y-2.5 sm:space-y-3">
                                        <h4 className="text-sm sm:text-base font-semibold font-display gradient-text-primary truncate">{data.optimizationRecommendations[0].title}</h4>
                                        <p className="text-xs leading-relaxed font-body text-light-text-secondary dark:text-dark-text-secondary">{data.optimizationRecommendations[0].description}</p>
                                        <div className="p-2.5 sm:p-3 rounded-lg border shadow-lg backdrop-blur-xl glass border-success-200/30">
                                            <div className="flex gap-2 sm:gap-3 justify-center items-center text-center">
                                                <div className="flex-1 min-w-0">
                                                    <div className="mb-1 text-[10px] font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Current</div>
                                                    <div className="text-sm sm:text-base font-bold font-display gradient-text-primary truncate">
                                                        {formatCurrency(data.optimizationRecommendations[0].currentCost)}
                                                    </div>
                                                </div>
                                                <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-primary flex-shrink-0">
                                                    <span className="text-xs sm:text-sm text-white">→</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="mb-1 text-[10px] font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Optimized</div>
                                                    <div className="text-sm sm:text-base font-bold font-display gradient-text-success truncate">
                                                        {formatCurrency(data.optimizationRecommendations[0].optimizedCost)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="mb-1 text-lg sm:text-xl font-bold font-display gradient-text-success">
                                                Save {data.optimizationRecommendations[0].savingsPercentage.toFixed(1)}%
                                            </div>
                                            <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                ({formatCurrency(data.optimizationRecommendations[0].potentialSavings)}/month)
                                            </div>
                                        </div>
                                    </div>
                                    {data.optimizationRecommendations[0].implementationDifficulty === 'easy' && (
                                        <button className="mt-3 sm:mt-4 w-full transition-transform duration-300 btn btn-primary hover:scale-105 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]">
                                            <RocketLaunchIcon className="inline mr-2 w-4 h-4" />
                                            Auto-Optimize Now
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Token Growth Trend */}
                            <div className="p-3 sm:p-4 bg-gradient-to-br rounded-lg border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-primary-200/30 dark:border-primary-500/20 from-primary-50/50 to-primary-100/30 dark:from-primary-900/10 dark:to-primary-800/10 hover:scale-105 hover:shadow-2xl">
                                <div className="flex gap-2 items-center mb-3">
                                    <div className="p-2 rounded-lg shadow-lg bg-gradient-primary glow-primary group-hover:scale-110 transition-transform duration-300 shrink-0">
                                        <ChartPieIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <h3 className="text-sm sm:text-base font-bold font-display gradient-text-primary truncate">Token Usage Trends</h3>
                                </div>
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center gap-2 p-2.5 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                                        <span className="text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary truncate">Average Prompt Length</span>
                                        <span className="text-xs font-bold font-display gradient-text-primary whitespace-nowrap flex-shrink-0">
                                            {data.historicalTokenTrends.averagePromptLength.toFixed(0)} tokens
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center gap-2 p-2.5 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                                        <span className="text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary truncate">Growth Rate (Weekly)</span>
                                        <span className={`text-xs font-display font-bold whitespace-nowrap flex-shrink-0 ${data.promptLengthGrowth.growthRatePerWeek > 5
                                            ? 'gradient-text-warning'
                                            : 'gradient-text-success'
                                            }`}>
                                            {data.promptLengthGrowth.growthRatePerWeek.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center gap-2 p-2.5 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                                        <span className="text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary truncate">Projected Monthly Increase</span>
                                        <span className="text-xs font-bold font-display gradient-text-primary whitespace-nowrap flex-shrink-0">
                                            {formatCurrency(
                                                data.promptLengthGrowth.impactOnCosts.projectedMonthly -
                                                data.promptLengthGrowth.impactOnCosts.currentMonthly
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'alerts' && (
                    <div className="space-y-3 sm:space-y-4">
                        <div className="mb-4 sm:mb-5 text-center">
                            <div className="inline-flex justify-center items-center p-2.5 sm:p-3 mx-auto mb-2 sm:mb-3 rounded-xl shadow-xl bg-gradient-danger glow-danger">
                                <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <h2 className="mb-1.5 sm:mb-2 text-xl sm:text-2xl font-bold font-display gradient-text-danger">Proactive Alerts</h2>
                            <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary px-3">AI-detected issues and opportunities requiring attention</p>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {data.proactiveAlerts.map(alert => (
                                <div key={alert.id} className={`group glass rounded-lg border shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-3 sm:p-4 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] ${alert.severity === 'critical'
                                    ? 'border-l-4 border-l-danger-500 dark:border-l-danger-400'
                                    : alert.severity === 'high'
                                        ? 'border-l-4 border-l-warning-500 dark:border-l-warning-400'
                                        : alert.severity === 'medium'
                                            ? 'border-l-4 border-l-accent-500 dark:border-l-accent-400'
                                            : 'border-l-4 border-l-success-500 dark:border-l-success-400'
                                    }`}>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2 sm:gap-3 mb-3">
                                        <div className="flex flex-1 gap-2 sm:gap-3 items-center min-w-0 w-full sm:w-auto">
                                            <div className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full shrink-0 ${alert.severity === 'critical' ? 'bg-gradient-danger glow-danger'
                                                : alert.severity === 'high' ? 'bg-gradient-warning glow-warning'
                                                    : alert.severity === 'medium' ? 'bg-gradient-accent glow-accent'
                                                        : 'bg-gradient-success glow-success'
                                                }`}></div>
                                            <h4 className="flex-1 text-sm sm:text-base font-bold font-display gradient-text truncate min-w-0">{alert.title}</h4>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-display border shrink-0 ${alert.daysUntilImpact === 0
                                                ? 'bg-gradient-danger/20 text-danger-700 dark:text-danger-300 border-danger-300/30 dark:border-danger-500/20'
                                                : 'bg-gradient-primary/20 text-primary-700 dark:text-primary-300 border-primary-300/30 dark:border-primary-500/20'
                                                }`}>
                                                <ClockIcon className="w-3 h-3" />
                                                {alert.daysUntilImpact === 0 ? 'Today' : `${alert.daysUntilImpact} days`}
                                            </span>
                                        </div>
                                        <div className={`text-base sm:text-lg font-display font-bold shrink-0 w-full sm:w-auto text-left sm:text-right ${alert.severity === 'critical' ? 'gradient-text-danger'
                                            : alert.severity === 'high' ? 'gradient-text-warning'
                                                : 'gradient-text-primary'
                                            }`}>
                                            {formatCurrency(alert.estimatedImpact)}
                                        </div>
                                    </div>

                                    <p className="mb-3 text-xs sm:text-sm leading-relaxed font-body text-light-text-secondary dark:text-dark-text-secondary">{alert.message}</p>

                                    <div>
                                        <h5 className="mb-2 text-xs sm:text-sm font-semibold font-display gradient-text-primary">Recommended Actions:</h5>
                                        <div className="space-y-2">
                                            {alert.actionableInsights.map((insight: { action: string; difficulty: string; expectedSaving: number; timeToImplement: string }, index: number) => (
                                                <div key={index} className="p-2.5 rounded-lg border glass border-primary-200/30">
                                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-between items-start sm:items-start">
                                                        <div className="flex flex-1 gap-2 items-center min-w-0 w-full sm:w-auto">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium font-display whitespace-nowrap shrink-0 ${insight.difficulty === 'easy'
                                                                ? 'bg-gradient-success/20 text-success-700 dark:text-success-300'
                                                                : insight.difficulty === 'medium'
                                                                    ? 'bg-gradient-warning/20 text-warning-700 dark:text-warning-300'
                                                                    : 'bg-gradient-danger/20 text-danger-700 dark:text-danger-300'
                                                                }`}>
                                                                {insight.difficulty}
                                                            </span>
                                                            <span className="text-xs font-body text-light-text-primary dark:text-dark-text-primary truncate flex-1">{insight.action}</span>
                                                        </div>
                                                        <div className="text-left sm:text-right w-full sm:w-auto">
                                                            <div className="text-xs font-semibold font-display gradient-text-success">{formatCurrency(insight.expectedSaving)}</div>
                                                            <div className="text-[10px] font-body text-light-text-tertiary dark:text-dark-text-tertiary">{insight.timeToImplement}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {alert.autoOptimizationAvailable && autoOptimizeEnabled && (
                                        <div className="mt-3 sm:mt-4">
                                            <button
                                                className="w-full transition-transform duration-300 btn btn-primary hover:scale-105 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                                                onClick={() => handleAutoOptimize(alert.id)}
                                            >
                                                <BoltIcon className="inline mr-2 w-4 h-4" />
                                                Auto-Optimize
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {activeTab === 'optimizations' && (
                    <div className="space-y-3 sm:space-y-4">
                        <div className="mb-4 sm:mb-5 text-center">
                            <div className="inline-flex justify-center items-center p-2.5 sm:p-3 mx-auto mb-2 sm:mb-3 rounded-xl shadow-xl bg-gradient-primary glow-primary">
                                <RocketLaunchIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <h2 className="mb-1.5 sm:mb-2 text-xl sm:text-2xl font-bold font-display gradient-text-primary">Smart Optimizations</h2>
                            <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary px-3">AI-powered recommendations to reduce costs while maintaining quality</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4 sm:mb-5 md:grid-cols-2">
                            <div className="p-4 sm:p-5 text-center rounded-lg border shadow-xl backdrop-blur-xl transition-all duration-300 group glass bg-gradient-success/10 dark:bg-success-500/5 border-success-200/30 dark:border-success-500/20 hover:scale-105 hover:shadow-2xl">
                                <BanknotesIcon className="mx-auto mb-2 sm:mb-3 w-7 h-7 sm:w-8 sm:h-8 text-success-500 dark:text-success-400" />
                                <h4 className="mb-2 text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Total Potential Savings</h4>
                                <div className="mb-1 text-xl sm:text-2xl md:text-3xl font-bold font-display gradient-text-success truncate">{formatCurrency(metrics.totalPotentialSavings)}</div>
                                <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">per month</span>
                            </div>
                            <div className="p-4 sm:p-5 text-center bg-gradient-to-br rounded-lg border shadow-xl backdrop-blur-xl transition-all duration-300 group glass from-primary-50/50 to-primary-100/50 dark:from-primary-900/10 dark:to-primary-800/10 border-primary-200/30 dark:border-primary-500/20 hover:scale-105 hover:shadow-2xl">
                                <RocketLaunchIcon className="mx-auto mb-2 sm:mb-3 w-7 h-7 sm:w-8 sm:h-8 text-primary-500 dark:text-primary-400" />
                                <h4 className="mb-2 text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Easy Implementations</h4>
                                <div className="mb-1 text-xl sm:text-2xl md:text-3xl font-bold font-display gradient-text-primary">{metrics.easyOptimizations}</div>
                                <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">can be automated</span>
                            </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {data.optimizationRecommendations.map((optimization, index) => (
                                <div key={index} className="group p-3 sm:p-4 rounded-lg border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-[1.01] hover:shadow-2xl">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2 sm:gap-3 mb-3">
                                        <div className="flex flex-1 gap-2 items-center min-w-0 w-full sm:w-auto">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium font-display capitalize whitespace-nowrap shrink-0 ${optimization.type === 'model_switch' ? 'bg-gradient-primary/20 text-primary-700 dark:text-primary-300'
                                                : optimization.type === 'prompt_optimization' ? 'bg-gradient-warning/20 text-warning-700 dark:text-warning-300'
                                                    : optimization.type === 'caching' ? 'bg-gradient-success/20 text-success-700 dark:text-success-300'
                                                        : optimization.type === 'batch_processing' ? 'bg-gradient-danger/20 text-danger-700 dark:text-danger-300'
                                                            : 'bg-gradient-accent/20 text-accent-700 dark:text-accent-300'
                                                }`}>
                                                {optimization.type.replace('_', ' ')}
                                            </span>
                                            <h4 className="text-sm sm:text-base font-bold font-display gradient-text-primary truncate flex-1">{optimization.title}</h4>
                                        </div>
                                        <div className="text-left sm:text-right w-full sm:w-auto">
                                            <div className="text-base sm:text-lg font-bold font-display gradient-text-success">{formatCurrency(optimization.potentialSavings)}</div>
                                            <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">({optimization.savingsPercentage.toFixed(1)}%)</div>
                                        </div>
                                    </div>

                                    <p className="mb-3 text-xs leading-relaxed font-body text-light-text-secondary dark:text-dark-text-secondary">{optimization.description}</p>

                                    <div className="p-2.5 sm:p-3 mb-3 sm:mb-4 rounded-lg border glass border-primary-200/30">
                                        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
                                            <div className="text-center">
                                                <div className="mb-1 text-[10px] font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Current Cost</div>
                                                <div className="text-xs font-bold font-display gradient-text-primary truncate">{formatCurrency(optimization.currentCost)}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="mb-1 text-[10px] font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Optimized Cost</div>
                                                <div className="text-xs font-bold font-display gradient-text-success truncate">{formatCurrency(optimization.optimizedCost)}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="mb-1 text-[10px] font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Affected Requests</div>
                                                <div className="text-xs font-bold font-display gradient-text-primary truncate">{optimization.affectedRequests.toLocaleString()}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="mb-1 text-[10px] font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Time to Results</div>
                                                <div className="text-xs font-bold font-display gradient-text-primary truncate">{optimization.timeToSeeResults}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium font-display whitespace-nowrap ${optimization.implementationDifficulty === 'easy' ? 'bg-gradient-success/20 text-success-700 dark:text-success-300'
                                                : optimization.implementationDifficulty === 'medium' ? 'bg-gradient-warning/20 text-warning-700 dark:text-warning-300'
                                                    : 'bg-gradient-danger/20 text-danger-700 dark:text-danger-300'
                                                }`}>
                                                {optimization.implementationDifficulty} to implement
                                            </span>
                                            <span className="px-2 py-0.5 text-xs font-medium rounded-full font-display bg-gradient-primary/20 text-primary-700 dark:text-primary-300 whitespace-nowrap">
                                                {Math.round(optimization.confidenceLevel * 100)}% confidence
                                            </span>
                                        </div>

                                        <div>
                                            <h5 className="mb-2 text-xs sm:text-sm font-semibold font-display gradient-text-primary">Implementation Steps:</h5>
                                            <ol className="space-y-2">
                                                {optimization.steps.map((step: string, stepIndex: number) => (
                                                    <li key={stepIndex} className="flex gap-2">
                                                        <span className="flex flex-shrink-0 justify-center items-center w-6 h-6 text-xs font-bold text-white rounded-full font-display bg-gradient-primary">
                                                            {stepIndex + 1}
                                                        </span>
                                                        <span className="text-xs leading-relaxed font-body text-light-text-secondary dark:text-dark-text-secondary">{step}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>

                                        <div>
                                            <h5 className="mb-2 text-xs sm:text-sm font-semibold font-display gradient-text-primary">Risk Assessment:</h5>
                                            <div className="flex gap-2 sm:gap-3">
                                                <div className="flex-1 p-2.5 sm:p-3 text-center rounded-lg border glass border-primary-200/30">
                                                    <div className="mb-1 text-[10px] font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Performance</div>
                                                    <div className="text-xs font-semibold font-display gradient-text-primary">{optimization.riskAssessment.performanceImpact}</div>
                                                </div>
                                                <div className="flex-1 p-2.5 sm:p-3 text-center rounded-lg border glass border-primary-200/30">
                                                    <div className="mb-1 text-[10px] font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Quality</div>
                                                    <div className="text-xs font-semibold font-display gradient-text-primary">{optimization.riskAssessment.qualityImpact}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {optimization.implementationDifficulty === 'easy' && (
                                        <div className="mt-3 sm:mt-4">
                                            <button
                                                className="w-full transition-transform duration-300 btn btn-primary hover:scale-105 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                                                onClick={() => handleAutoOptimize(`opt_${index}`)}
                                            >
                                                <RocketLaunchIcon className="inline mr-2 w-4 h-4" />
                                                Implement Now
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'scenarios' && (
                    <div className="space-y-3 sm:space-y-4">
                        <div className="mb-4 sm:mb-5 text-center">
                            <div className="inline-flex justify-center items-center p-2.5 sm:p-3 mx-auto mb-2 sm:mb-3 bg-gradient-to-br rounded-xl shadow-xl from-accent-500 to-accent-600 glow-accent">
                                <BeakerIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <h2 className="mb-1.5 sm:mb-2 text-xl sm:text-2xl font-bold font-display gradient-text-primary">Future Scenarios</h2>
                            <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary px-3">Strategic cost planning with different growth and optimization scenarios</p>
                        </div>

                        <div className="p-3 sm:p-4 mb-4 sm:mb-5 bg-gradient-to-br rounded-lg border shadow-xl backdrop-blur-xl glass from-accent-50/30 to-accent-100/30 dark:from-accent-900/10 dark:to-accent-800/10 border-accent-200/30 dark:border-accent-500/20">
                            <div className="flex gap-2 items-center mb-3 sm:mb-4">
                                <ChartBarIcon className="w-5 h-5 text-accent-500 dark:text-accent-400 flex-shrink-0" />
                                <h4 className="text-sm sm:text-base font-bold font-display gradient-text-primary">Scenario Comparison</h4>
                            </div>
                            <div className="space-y-2.5 sm:space-y-3">
                                {data.scenarioSimulations.map((scenario) => (
                                    <div key={scenario.scenarioId} className="p-2.5 sm:p-3 rounded-lg border glass border-accent-200/30">
                                        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 items-center lg:grid-cols-4">
                                            <div className="text-xs sm:text-sm font-semibold font-display gradient-text-primary truncate">{scenario.name}</div>
                                            <div className="space-y-2">
                                                <div className="flex gap-2 items-center">
                                                    <span className="w-18 sm:w-20 text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary shrink-0">Baseline</span>
                                                    <div className="overflow-hidden flex-1 h-2.5 sm:h-3 rounded-full bg-light-bg-secondary dark:bg-dark-bg-secondary">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500 bg-light-bg-tertiary dark:bg-dark-bg-tertiary"
                                                            style={{
                                                                width: `${(scenario.projectedCosts.baseline / Math.max(...data.scenarioSimulations.map(s => s.projectedCosts.baseline))) * 100}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="w-20 sm:w-24 text-xs font-semibold text-right font-display gradient-text-primary shrink-0 truncate">{formatCurrency(scenario.projectedCosts.baseline)}</span>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <span className="w-18 sm:w-20 text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary shrink-0">Optimized</span>
                                                    <div className="overflow-hidden flex-1 h-2.5 sm:h-3 rounded-full bg-light-bg-secondary dark:bg-dark-bg-secondary">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500 bg-gradient-success glow-success"
                                                            style={{
                                                                width: `${(scenario.projectedCosts.optimized / Math.max(...data.scenarioSimulations.map(s => s.projectedCosts.baseline))) * 100}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="w-20 sm:w-24 text-xs font-semibold text-right font-display gradient-text-success shrink-0 truncate">{formatCurrency(scenario.projectedCosts.optimized)}</span>
                                                </div>
                                            </div>
                                            <div className="text-center lg:text-left">
                                                <div className="text-sm sm:text-base font-bold font-display gradient-text-success truncate">
                                                    Save {formatCurrency(scenario.projectedCosts.savings)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {data.scenarioSimulations.map((scenario) => (
                                <div key={scenario.scenarioId} className="group p-3 sm:p-4 rounded-lg border shadow-xl backdrop-blur-xl glass border-accent-200/30 dark:border-accent-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2 sm:gap-3 mb-3">
                                        <h4 className="text-sm sm:text-base font-bold font-display gradient-text-primary truncate flex-1">{scenario.name}</h4>
                                        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                                            <span className="px-2 py-0.5 text-xs font-medium capitalize rounded-full font-display bg-gradient-primary/20 text-primary-700 dark:text-primary-300 whitespace-nowrap">
                                                {scenario.timeframe.replace('_', ' ')}
                                            </span>
                                            <span className="px-2 py-0.5 text-xs font-medium rounded-full font-display bg-gradient-success/20 text-success-700 dark:text-success-300 whitespace-nowrap">
                                                {Math.round(scenario.probabilityOfSuccess * 100)}% success rate
                                            </span>
                                        </div>
                                    </div>

                                    <p className="mb-3 text-xs leading-relaxed font-body text-light-text-secondary dark:text-dark-text-secondary">{scenario.description}</p>

                                    <div className="mb-3 sm:mb-4">
                                        <h5 className="mb-2 text-xs sm:text-sm font-semibold font-display gradient-text-primary">Key Variables:</h5>
                                        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-3">
                                            <div className="p-2.5 sm:p-3 text-center rounded-lg border glass border-accent-200/30">
                                                <div className="mb-1 text-[10px] font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Usage Growth</div>
                                                <div className="text-xs font-bold font-display gradient-text-primary">
                                                    {((scenario.variables.usageGrowth - 1) * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                            <div className="p-2.5 sm:p-3 text-center rounded-lg border glass border-accent-200/30">
                                                <div className="mb-1 text-[10px] font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Prompt Complexity</div>
                                                <div className="text-xs font-bold font-display gradient-text-primary">
                                                    {((scenario.variables.promptComplexity - 1) * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                            <div className="p-2.5 sm:p-3 text-center rounded-lg border glass border-accent-200/30">
                                                <div className="mb-1 text-[10px] font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">Optimization Level</div>
                                                <div className="text-xs font-bold font-display gradient-text-primary">
                                                    {(scenario.variables.optimizationLevel * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-3 sm:mb-4">
                                        <h5 className="mb-2 text-xs sm:text-sm font-semibold font-display gradient-text-primary">Key Insights:</h5>
                                        <div className="space-y-2">
                                            {scenario.keyInsights.map((insight: string, insightIndex: number) => (
                                                <div key={insightIndex} className="flex gap-2">
                                                    <div className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-accent glow-accent"></div>
                                                    <span className="text-xs leading-relaxed font-body text-light-text-secondary dark:text-dark-text-secondary">{insight}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h5 className="mb-2 text-xs sm:text-sm font-semibold font-display gradient-text-primary">Recommended Actions:</h5>
                                        <div className="space-y-2">
                                            {scenario.recommendedActions.map((action: string, actionIndex: number) => (
                                                <div key={actionIndex} className="flex gap-2">
                                                    <div className="flex flex-shrink-0 justify-center items-center w-5 h-5 sm:w-6 sm:h-6 text-xs font-bold text-white rounded-full font-display bg-gradient-success">
                                                        {actionIndex + 1}
                                                    </div>
                                                    <span className="text-xs leading-relaxed font-body text-light-text-secondary dark:text-dark-text-secondary">{action}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PredictiveCostDashboard;