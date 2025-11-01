import React, { useState, useEffect, useMemo } from 'react';
import {
    CpuChipIcon,
    ExclamationTriangleIcon,
    CurrencyDollarIcon,
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
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../common/LoadingSpinner';
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

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return '#dc3545';
            case 'high': return '#fd7e14';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className={`max-w-7xl mx-auto p-6 ${className}`}>
                <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mx-auto mb-4 flex items-center justify-center glow-primary shadow-lg">
                        <CpuChipIcon className="w-8 h-8 text-white" />
                    </div>
                    <LoadingSpinner />
                    <h3 className="text-xl font-display font-bold gradient-text-primary mb-2 mt-4">Generating Predictive Intelligence...</h3>
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Analyzing patterns and identifying optimization opportunities</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`max-w-7xl mx-auto p-6 ${className}`}>
                <div className="glass backdrop-blur-xl rounded-xl border border-danger-200/30 shadow-xl bg-gradient-to-br from-danger-50/50 to-danger-100/50 p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                        <XCircleIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-display font-bold gradient-text-danger mb-3">Intelligence Generation Failed</h3>
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary px-6 py-3 hover:scale-105 transition-transform duration-300"
                    >
                        <ArrowPathIcon className="w-4 h-4 mr-2" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!intelligenceData || !keyMetrics) {
        return (
            <div className={`max-w-7xl mx-auto p-6 ${className}`}>
                <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mx-auto mb-4 flex items-center justify-center glow-primary shadow-lg">
                        <ChartBarIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-display font-bold gradient-text-primary mb-2">No Intelligence Data Available</h3>
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Insufficient historical data for predictive analysis</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`max-w-7xl mx-auto p-5 space-y-5 ${className}`}>
            {/* Header */}
            <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-5">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl glow-primary shadow-lg">
                            <CpuChipIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-bold gradient-text-primary mb-1">Predictive Cost Intelligence</h1>
                            <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-2">AI-powered proactive optimization and intelligence</p>
                            <div className="flex items-center gap-2.5">
                                <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Confidence:</span>
                                <div className="w-24 h-2 glass rounded-full overflow-hidden border border-primary-200/30">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 shadow-lg"
                                        style={{ width: `${keyMetrics.confidenceScore * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-display font-semibold gradient-text-primary">{Math.round(keyMetrics.confidenceScore * 100)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="glass rounded-lg border border-primary-200/30 p-1 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10">
                            <div className="relative">
                                <ClockIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-500 pointer-events-none z-10" />
                                <select
                                    value={selectedTimeHorizon}
                                    onChange={(e) => setSelectedTimeHorizon(parseInt(e.target.value))}
                                    className="input text-xs py-1.5 pl-8 pr-7 min-w-[100px] appearance-none bg-white/80 dark:bg-gray-800/80 border-primary-200/30 font-display font-semibold"
                                >
                                    <option value={7}>7 Days</option>
                                    <option value={14}>14 Days</option>
                                    <option value={30}>30 Days</option>
                                    <option value={60}>60 Days</option>
                                    <option value={90}>90 Days</option>
                                </select>
                            </div>
                        </div>

                        <div className="glass p-2 rounded-lg border border-primary-200/30 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoOptimizeEnabled}
                                    onChange={(e) => setAutoOptimizeEnabled(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`relative w-9 h-5 rounded-full transition-all duration-300 ${autoOptimizeEnabled
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                    }`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 mt-0.5 ${autoOptimizeEnabled ? 'translate-x-4' : 'translate-x-0.5'
                                        }`} />
                                </div>
                                <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Auto-Optimize</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300 p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-red-500 to-red-600 p-2.5 rounded-lg shadow-lg shrink-0">
                            <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-xl font-display font-bold gradient-text-danger">{keyMetrics.criticalAlerts}</h3>
                            <p className="text-xs font-body text-danger-600 dark:text-danger-400 mb-1">Critical Alerts</p>
                            {keyMetrics.urgentAlerts > 0 && (
                                <span className="inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-700 dark:text-red-300 text-xs font-medium">
                                    {keyMetrics.urgentAlerts} urgent
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300 p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-success-500 to-success-600 p-2.5 rounded-lg glow-success shadow-lg shrink-0">
                            <CurrencyDollarIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-xl font-display font-bold gradient-text-success truncate">{formatCurrency(keyMetrics.totalPotentialSavings)}</h3>
                            <p className="text-xs font-body text-success-600 dark:text-success-400 mb-1">Potential Monthly Savings</p>
                            <span className="inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-success-500/20 to-success-600/20 text-success-700 dark:text-success-300 text-xs font-medium">
                                {keyMetrics.easyOptimizations} easy wins
                            </span>
                        </div>
                    </div>
                </div>

                <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300 p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-2.5 rounded-lg shadow-lg shrink-0">
                            <ShieldExclamationIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-xl font-display font-bold gradient-text-warning">{keyMetrics.budgetRiskProjects}</h3>
                            <p className="text-xs font-body text-warning-600 dark:text-warning-400 mb-1">Projects at Budget Risk</p>
                            {keyMetrics.nextBudgetExceedance && (
                                <span className="inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-warning-700 dark:text-warning-300 text-xs font-medium">
                                    Next: {keyMetrics.nextBudgetExceedance.daysUntilExceedance} days
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300 p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-lg glow-primary shadow-lg shrink-0">
                            <ArrowTrendingUpIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-xl font-display font-bold gradient-text-primary">{intelligenceData.promptLengthGrowth.growthRatePerWeek.toFixed(1)}%</h3>
                            <p className="text-xs font-body text-primary-600 dark:text-primary-400 mb-1">Weekly Prompt Growth</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${intelligenceData.historicalTokenTrends.tokenEfficiencyTrend === 'improving'
                                ? 'bg-gradient-to-r from-success-500/20 to-success-600/20 text-success-700 dark:text-success-300'
                                : intelligenceData.historicalTokenTrends.tokenEfficiencyTrend === 'stable'
                                    ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-700 dark:text-primary-300'
                                    : 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-700 dark:text-red-300'
                                }`}>
                                {intelligenceData.historicalTokenTrends.tokenEfficiencyTrend}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-2">
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: HomeIcon },
                        { id: 'alerts', label: 'Alerts', icon: ExclamationTriangleIcon },
                        { id: 'optimizations', label: 'Optimizations', icon: BoltIcon },
                        { id: 'scenarios', label: 'Scenarios', icon: BeakerIcon }
                    ].map(tab => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-display font-semibold text-sm transition-all duration-300 hover:scale-105 shrink-0 ${activeTab === tab.id
                                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg glow-primary'
                                    : 'glass hover:bg-primary-500/10 text-light-text-primary dark:text-dark-text-primary border border-primary-200/30'
                                    }`}
                                onClick={() => setActiveTab(tab.id as any)}
                            >
                                <IconComponent className="w-4 h-4 shrink-0" />
                                <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-5 min-h-[500px]">
                {activeTab === 'overview' && (
                    <div className="space-y-5">
                        <div className="text-center mb-6">
                            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl mx-auto mb-3 inline-flex items-center justify-center glow-primary shadow-lg">
                                <HomeIcon className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-display font-bold gradient-text-primary mb-1">Intelligence Overview</h2>
                            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Key insights and upcoming challenges</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {/* Next Budget Exceedance */}
                            {keyMetrics.nextBudgetExceedance && (
                                <div className="glass backdrop-blur-xl rounded-xl border border-warning-200/30 shadow-lg bg-gradient-to-br from-yellow-50/50 to-yellow-100/30 dark:from-yellow-900/10 p-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-2.5 rounded-xl shadow-lg">
                                            <ShieldExclamationIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-lg font-display font-bold gradient-text-warning">Upcoming Budget Exceedance</h3>
                                    </div>
                                    <div className="text-center mb-6">
                                        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                            <span className="font-semibold gradient-text-primary">{keyMetrics.nextBudgetExceedance.scopeName}</span> will exceed budget in
                                        </p>
                                        <div className="text-5xl font-display font-bold gradient-text-warning mb-2">
                                            {keyMetrics.nextBudgetExceedance.daysUntilExceedance} days
                                        </div>
                                        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                                            Exceeding by <span className="font-semibold gradient-text-danger">{formatCurrency(keyMetrics.nextBudgetExceedance.exceedanceAmount)}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-display font-semibold gradient-text-primary mb-4">Quick Actions:</h4>
                                        <div className="space-y-3">
                                            {keyMetrics.nextBudgetExceedance.mitigationStrategies.slice(0, 2).map((strategy: any, index: number) => (
                                                <div key={index} className="glass p-4 rounded-xl border border-warning-200/30 shadow-lg backdrop-blur-xl flex justify-between items-center">
                                                    <span className="font-body text-light-text-primary dark:text-dark-text-primary">{strategy.strategy}</span>
                                                    <span className="font-display font-semibold gradient-text-success">{formatCurrency(strategy.potentialSaving)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Top Optimization Opportunity */}
                            {intelligenceData.optimizationRecommendations.length > 0 && (
                                <div className="glass backdrop-blur-xl rounded-xl border border-success-200/30 shadow-lg bg-gradient-to-br from-success-50/50 to-success-100/30 dark:from-success-900/10 p-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-gradient-to-br from-success-500 to-success-600 p-2.5 rounded-xl shadow-lg">
                                            <LightBulbIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-lg font-display font-bold gradient-text-success">Top Optimization Opportunity</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-display font-semibold gradient-text-primary">{intelligenceData.optimizationRecommendations[0].title}</h4>
                                        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">{intelligenceData.optimizationRecommendations[0].description}</p>
                                        <div className="glass p-4 rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl">
                                            <div className="flex items-center justify-center gap-4 text-center">
                                                <div>
                                                    <div className="font-body text-sm text-light-text-secondary dark:text-dark-text-secondary">Current</div>
                                                    <div className="font-display font-bold gradient-text-primary">
                                                        {formatCurrency(intelligenceData.optimizationRecommendations[0].currentCost)}
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                                                    <span className="text-white">→</span>
                                                </div>
                                                <div>
                                                    <div className="font-body text-sm text-light-text-secondary dark:text-dark-text-secondary">Optimized</div>
                                                    <div className="font-display font-bold gradient-text-success">
                                                        {formatCurrency(intelligenceData.optimizationRecommendations[0].optimizedCost)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-display font-bold gradient-text-success mb-1">
                                                Save {intelligenceData.optimizationRecommendations[0].savingsPercentage.toFixed(1)}%
                                            </div>
                                            <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                ({formatCurrency(intelligenceData.optimizationRecommendations[0].potentialSavings)}/month)
                                            </div>
                                        </div>
                                    </div>
                                    {intelligenceData.optimizationRecommendations[0].implementationDifficulty === 'easy' && (
                                        <button className="btn btn-primary w-full mt-4 hover:scale-105 transition-transform duration-300">
                                            <BoltIcon className="w-4 h-4 mr-2 inline" />
                                            Auto-Optimize Now
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Token Growth Trend */}
                            <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-primary-50/50 to-primary-100/30 dark:from-primary-900/10 p-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl glow-primary shadow-lg">
                                        <ArrowTrendingUpIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-display font-bold gradient-text-primary">Token Usage Trends</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="glass p-4 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl flex justify-between items-center">
                                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Average Prompt Length</span>
                                        <span className="font-display font-bold gradient-text-primary">
                                            {intelligenceData.historicalTokenTrends.averagePromptLength.toFixed(0)} tokens
                                        </span>
                                    </div>
                                    <div className="glass p-4 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl flex justify-between items-center">
                                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Growth Rate (Weekly)</span>
                                        <span className={`font-display font-bold ${intelligenceData.promptLengthGrowth.growthRatePerWeek > 5
                                            ? 'gradient-text-warning'
                                            : 'gradient-text-success'
                                            }`}>
                                            {intelligenceData.promptLengthGrowth.growthRatePerWeek.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="glass p-4 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl flex justify-between items-center">
                                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Projected Monthly Increase</span>
                                        <span className="font-display font-bold gradient-text-primary">
                                            {formatCurrency(
                                                intelligenceData.promptLengthGrowth.impactOnCosts.projectedMonthly -
                                                intelligenceData.promptLengthGrowth.impactOnCosts.currentMonthly
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'alerts' && (
                    <div className="space-y-5">
                        <div className="text-center mb-6">
                            <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl mx-auto mb-3 inline-flex items-center justify-center glow-danger shadow-lg">
                                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-display font-bold gradient-text-danger mb-1">Proactive Alerts</h2>
                            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">AI-detected issues and opportunities requiring attention</p>
                        </div>

                        <div className="space-y-6">
                            {intelligenceData.proactiveAlerts.map(alert => (
                                <div key={alert.id} className={`card p-6 shadow-lg backdrop-blur-xl border-l-4 ${alert.severity === 'critical'
                                    ? 'bg-gradient-danger/10 border-l-danger-500 border border-danger-200/30'
                                    : alert.severity === 'high'
                                        ? 'bg-gradient-warning/10 border-l-warning-500 border border-warning-200/30'
                                        : alert.severity === 'medium'
                                            ? 'bg-gradient-accent/10 border-l-accent-500 border border-accent-200/30'
                                            : 'bg-gradient-success/10 border-l-success-500 border border-success-200/30'
                                    }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className={`w-3 h-3 rounded-full ${alert.severity === 'critical' ? 'bg-gradient-danger glow-danger'
                                                : alert.severity === 'high' ? 'bg-gradient-warning glow-warning'
                                                    : alert.severity === 'medium' ? 'bg-gradient-accent glow-accent'
                                                        : 'bg-gradient-success glow-success'
                                                }`}></div>
                                            <h4 className="text-lg font-display font-bold gradient-text flex-1">{alert.title}</h4>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${alert.daysUntilImpact === 0
                                                ? 'bg-gradient-danger/20 text-danger-700 dark:text-danger-300'
                                                : 'bg-gradient-primary/20 text-primary-700 dark:text-primary-300'
                                                }`}>
                                                {alert.daysUntilImpact === 0 ? 'Today' : `${alert.daysUntilImpact} days`}
                                            </span>
                                        </div>
                                        <div className={`text-xl font-display font-bold ml-4 ${alert.severity === 'critical' ? 'gradient-text-danger'
                                            : alert.severity === 'high' ? 'gradient-text-warning'
                                                : 'gradient-text'
                                            }`}>
                                            {formatCurrency(alert.estimatedImpact)}
                                        </div>
                                    </div>

                                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-6">{alert.message}</p>

                                    <div>
                                        <h5 className="font-display font-semibold gradient-text mb-4">Recommended Actions:</h5>
                                        <div className="space-y-3">
                                            {alert.actionableInsights.map((insight: any, index: number) => (
                                                <div key={index} className="glass p-4 rounded-xl border border-primary-200/30">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${insight.difficulty === 'easy'
                                                                ? 'bg-gradient-success/20 text-success-700 dark:text-success-300'
                                                                : insight.difficulty === 'medium'
                                                                    ? 'bg-gradient-warning/20 text-warning-700 dark:text-warning-300'
                                                                    : 'bg-gradient-danger/20 text-danger-700 dark:text-danger-300'
                                                                }`}>
                                                                {insight.difficulty}
                                                            </span>
                                                            <span className="font-body text-light-text-primary dark:text-dark-text-primary">{insight.action}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-display font-semibold gradient-text-success">{formatCurrency(insight.expectedSaving)}</div>
                                                            <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">{insight.timeToImplement}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {alert.autoOptimizationAvailable && autoOptimizeEnabled && (
                                        <div className="mt-4">
                                            <button
                                                className="btn btn-primary w-full hover:scale-105 transition-transform duration-300"
                                                onClick={() => handleAutoOptimize(alert.id)}
                                            >
                                                <BoltIcon className="w-4 h-4 mr-2 inline" />
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
                    <div className="space-y-5">
                        <div className="text-center mb-6">
                            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl mx-auto mb-3 inline-flex items-center justify-center glow-primary shadow-lg">
                                <BoltIcon className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-display font-bold gradient-text-primary mb-1">Smart Optimizations</h2>
                            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">AI-powered recommendations to reduce costs while maintaining quality</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="card p-6 bg-gradient-success/10 border border-success-200/30 shadow-lg backdrop-blur-xl text-center">
                                <h4 className="font-body text-success-600 dark:text-success-400 mb-2">Total Potential Savings</h4>
                                <div className="text-4xl font-display font-bold gradient-text-success mb-1">{formatCurrency(keyMetrics.totalPotentialSavings)}</div>
                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">per month</span>
                            </div>
                            <div className="card p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 border border-primary-200/30 shadow-lg backdrop-blur-xl text-center">
                                <h4 className="font-body text-primary-600 dark:text-primary-400 mb-2">Easy Implementations</h4>
                                <div className="text-4xl font-display font-bold gradient-text mb-1">{keyMetrics.easyOptimizations}</div>
                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">can be automated</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {intelligenceData.optimizationRecommendations.map((optimization, index) => (
                                <div key={index} className="card p-6 shadow-lg backdrop-blur-xl border border-primary-200/30 hover:border-primary-300/50 transition-all duration-300 hover:scale-[1.02]">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${optimization.type === 'model_switch' ? 'bg-gradient-primary/20 text-primary-700 dark:text-primary-300'
                                                : optimization.type === 'prompt_optimization' ? 'bg-gradient-warning/20 text-warning-700 dark:text-warning-300'
                                                    : optimization.type === 'caching' ? 'bg-gradient-success/20 text-success-700 dark:text-success-300'
                                                        : optimization.type === 'batch_processing' ? 'bg-gradient-danger/20 text-danger-700 dark:text-danger-300'
                                                            : 'bg-gradient-accent/20 text-accent-700 dark:text-accent-300'
                                                }`}>
                                                {optimization.type.replace('_', ' ')}
                                            </span>
                                            <h4 className="text-lg font-display font-bold gradient-text">{optimization.title}</h4>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-display font-bold gradient-text-success">{formatCurrency(optimization.potentialSavings)}</div>
                                            <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">({optimization.savingsPercentage.toFixed(1)}%)</div>
                                        </div>
                                    </div>

                                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-6">{optimization.description}</p>

                                    <div className="glass p-4 rounded-xl border border-primary-200/30 mb-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <div className="font-body text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Current Cost</div>
                                                <div className="font-display font-bold gradient-text">{formatCurrency(optimization.currentCost)}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-body text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Optimized Cost</div>
                                                <div className="font-display font-bold gradient-text-success">{formatCurrency(optimization.optimizedCost)}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-body text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Affected Requests</div>
                                                <div className="font-display font-bold gradient-text">{optimization.affectedRequests.toLocaleString()}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-body text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Time to Results</div>
                                                <div className="font-display font-bold gradient-text">{optimization.timeToSeeResults}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${optimization.implementationDifficulty === 'easy' ? 'bg-gradient-success/20 text-success-700 dark:text-success-300'
                                                : optimization.implementationDifficulty === 'medium' ? 'bg-gradient-warning/20 text-warning-700 dark:text-warning-300'
                                                    : 'bg-gradient-danger/20 text-danger-700 dark:text-danger-300'
                                                }`}>
                                                {optimization.implementationDifficulty} to implement
                                            </span>
                                            <span className="px-3 py-1 rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 text-sm font-medium">
                                                {Math.round(optimization.confidenceLevel * 100)}% confidence
                                            </span>
                                        </div>

                                        <div>
                                            <h5 className="font-display font-semibold gradient-text mb-3">Implementation Steps:</h5>
                                            <ol className="space-y-2">
                                                {optimization.steps.map((step: string, stepIndex: number) => (
                                                    <li key={stepIndex} className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                            {stepIndex + 1}
                                                        </span>
                                                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">{step}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>

                                        <div>
                                            <h5 className="font-display font-semibold gradient-text mb-3">Risk Assessment:</h5>
                                            <div className="flex gap-4">
                                                <div className="glass p-3 rounded-xl border border-primary-200/30 flex-1 text-center">
                                                    <div className="font-body text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Performance</div>
                                                    <div className="font-display font-semibold gradient-text">{optimization.riskAssessment.performanceImpact}</div>
                                                </div>
                                                <div className="glass p-3 rounded-xl border border-primary-200/30 flex-1 text-center">
                                                    <div className="font-body text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Quality</div>
                                                    <div className="font-display font-semibold gradient-text">{optimization.riskAssessment.qualityImpact}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {optimization.implementationDifficulty === 'easy' && (
                                        <div className="mt-4">
                                            <button
                                                className="btn btn-primary w-full hover:scale-105 transition-transform duration-300"
                                                onClick={() => handleAutoOptimize(`opt_${index}`)}
                                            >
                                                <BoltIcon className="w-4 h-4 mr-2 inline" />
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
                    <div className="space-y-5">
                        <div className="text-center mb-6">
                            <div className="bg-gradient-to-br from-accent-500 to-accent-600 p-3 rounded-xl mx-auto mb-3 inline-flex items-center justify-center glow-accent shadow-lg">
                                <BeakerIcon className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-display font-bold gradient-text-primary mb-1">Future Scenarios</h2>
                            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Strategic cost planning with different growth and optimization scenarios</p>
                        </div>

                        <div className="card p-6 bg-gradient-to-br from-accent-50/30 to-accent-100/30 border border-accent-200/30 shadow-lg backdrop-blur-xl mb-8">
                            <h4 className="text-lg font-display font-bold gradient-text mb-6">Scenario Comparison</h4>
                            <div className="space-y-6">
                                {intelligenceData.scenarioSimulations.map((scenario) => (
                                    <div key={scenario.scenarioId} className="glass p-4 rounded-xl border border-accent-200/30">
                                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                                            <div className="font-display font-semibold gradient-text">{scenario.name}</div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary w-20">Baseline</span>
                                                    <div className="flex-1 h-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${(scenario.projectedCosts.baseline / Math.max(...intelligenceData.scenarioSimulations.map(s => s.projectedCosts.baseline))) * 100}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-display font-semibold gradient-text w-24 text-right">{formatCurrency(scenario.projectedCosts.baseline)}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary w-20">Optimized</span>
                                                    <div className="flex-1 h-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-success rounded-full transition-all duration-500 glow-success"
                                                            style={{
                                                                width: `${(scenario.projectedCosts.optimized / Math.max(...intelligenceData.scenarioSimulations.map(s => s.projectedCosts.baseline))) * 100}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-display font-semibold gradient-text-success w-24 text-right">{formatCurrency(scenario.projectedCosts.optimized)}</span>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-display font-bold gradient-text-success">
                                                    Save {formatCurrency(scenario.projectedCosts.savings)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {intelligenceData.scenarioSimulations.map((scenario) => (
                                <div key={scenario.scenarioId} className="card p-6 shadow-lg backdrop-blur-xl border border-accent-200/30">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-lg font-display font-bold gradient-text">{scenario.name}</h4>
                                        <div className="flex flex-col gap-2">
                                            <span className="px-3 py-1 rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 text-sm font-medium capitalize">
                                                {scenario.timeframe.replace('_', ' ')}
                                            </span>
                                            <span className="px-3 py-1 rounded-full bg-gradient-success/20 text-success-700 dark:text-success-300 text-sm font-medium">
                                                {Math.round(scenario.probabilityOfSuccess * 100)}% success rate
                                            </span>
                                        </div>
                                    </div>

                                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-6">{scenario.description}</p>

                                    <div className="mb-6">
                                        <h5 className="font-display font-semibold gradient-text mb-4">Key Variables:</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="glass p-4 rounded-xl border border-accent-200/30 text-center">
                                                <div className="font-body text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Usage Growth</div>
                                                <div className="font-display font-bold gradient-text">
                                                    {((scenario.variables.usageGrowth - 1) * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                            <div className="glass p-4 rounded-xl border border-accent-200/30 text-center">
                                                <div className="font-body text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Prompt Complexity</div>
                                                <div className="font-display font-bold gradient-text">
                                                    {((scenario.variables.promptComplexity - 1) * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                            <div className="glass p-4 rounded-xl border border-accent-200/30 text-center">
                                                <div className="font-body text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Optimization Level</div>
                                                <div className="font-display font-bold gradient-text">
                                                    {(scenario.variables.optimizationLevel * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h5 className="font-display font-semibold gradient-text mb-4">Key Insights:</h5>
                                        <div className="space-y-2">
                                            {scenario.keyInsights.map((insight: string, insightIndex: number) => (
                                                <div key={insightIndex} className="flex gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-gradient-accent mt-2 flex-shrink-0 glow-accent"></div>
                                                    <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">{insight}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h5 className="font-display font-semibold gradient-text mb-4">Recommended Actions:</h5>
                                        <div className="space-y-2">
                                            {scenario.recommendedActions.map((action: string, actionIndex: number) => (
                                                <div key={actionIndex} className="flex gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-success flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                        {actionIndex + 1}
                                                    </div>
                                                    <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">{action}</span>
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