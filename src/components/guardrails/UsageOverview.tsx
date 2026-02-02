import React, { useEffect, useState } from 'react';
import {
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Database,
    Sparkles,
    Coins,
    Zap,
    FileText,
    Folder,
    Settings,
    DollarSign,
    Bot,
    Lock,
    Rocket,
    Wand2,
    AlertCircle,
    Lightbulb,
    ArrowRight
} from 'lucide-react';
import type { UsageStats as GuardrailsUsageStats } from '../../services/guardrails.service';
import { guardrailsService } from '../../services/guardrails.service';
import { formatNumber } from '../../utils/formatters';

export const UsageOverview: React.FC = () => {
    const [usageStats, setUsageStats] = useState<GuardrailsUsageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsageStats();
        // Refresh every minute
        const interval = setInterval(fetchUsageStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchUsageStats = async () => {
        try {
            setLoading(true);
            const stats = await guardrailsService.getUserUsage();
            setUsageStats(stats);
            setError(null);
        } catch (err) {
            setError('Failed to load usage statistics');
            console.error('Error fetching usage stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (percentage: number) => {
        if (percentage >= 90) return 'gradient-text-danger';
        if (percentage >= 75) return 'gradient-text-warning';
        if (percentage >= 50) return 'gradient-text';
        return 'gradient-text-success';
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-gradient-danger glow-danger';
        if (percentage >= 75) return 'bg-gradient-warning glow-warning';
        if (percentage >= 50) return 'bg-gradient-primary glow-primary';
        return 'bg-gradient-success glow-success';
    };

    const getStatusIcon = (percentage: number) => {
        if (percentage >= 90) return (
            <div className="flex justify-center items-center w-6 h-6 rounded-lg shadow-lg bg-gradient-danger">
                <XCircle className="w-3 h-3 text-white" />
            </div>
        );
        if (percentage >= 75) return (
            <div className="flex justify-center items-center w-6 h-6 rounded-lg shadow-lg bg-gradient-warning">
                <AlertTriangle className="w-3 h-3 text-white" />
            </div>
        );
        return (
            <div className="flex justify-center items-center w-6 h-6 rounded-lg shadow-lg bg-gradient-success">
                <CheckCircle className="w-3 h-3 text-white" />
            </div>
        );
    };

    const formatLimit = (limit: number) => {
        if (limit === -1) return 'Unlimited';
        return formatNumber(limit);
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6 md:p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex justify-center items-center h-48 sm:h-56 md:h-64">
                    <div className="spinner-lg text-primary-500"></div>
                </div>
            </div>
        );
    }

    if (error || !usageStats) {
        return (
            <div className="p-4 sm:p-6 md:p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-danger-200/30 dark:border-danger-700/30 bg-gradient-danger/10">
                <div className="flex items-center mb-3 sm:mb-4">
                    <div className="flex justify-center items-center mr-3 sm:mr-4 w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg bg-gradient-danger flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold font-display gradient-text-danger">Error Loading Usage Data</h3>
                </div>
                <p className="text-sm sm:text-base font-body text-danger-700 dark:text-danger-300">{error || 'Unable to load usage data'}</p>
            </div>
        );
    }

    const { current, limits, percentages, plan, recommendations, predictions } = usageStats;

    return (
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Plan Overview */}
            <div className="p-4 sm:p-6 md:p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                    <div className="flex items-center">
                        <div className="flex justify-center items-center mr-3 sm:mr-4 w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg bg-gradient-primary flex-shrink-0">
                            <Database className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold font-display gradient-text-primary">Usage Overview</h3>
                    </div>
                    <span className="flex gap-2 items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-white rounded-full shadow-lg font-display bg-gradient-primary self-start sm:self-auto">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                        {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
                    </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Tokens Usage */}
                    <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-primary-200/30 dark:border-primary-700/30 from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 hover:scale-105">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <span className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm font-bold font-display text-light-text-primary dark:text-dark-text-primary">
                                <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Tokens
                            </span>
                            {getStatusIcon(percentages.tokens)}
                        </div>
                        <div className="overflow-hidden mb-3 w-full h-3 rounded-full bg-primary-200/30 dark:bg-primary-800/30">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(percentages.tokens)}`}
                                style={{ width: `${percentages.tokens}%` }}
                            />
                        </div>
                        <div className="flex justify-between mb-2 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                            <span>{formatNumber(current.tokens)}</span>
                            <span>{formatLimit(limits.tokensPerMonth)}</span>
                        </div>
                        <p className={`text-sm font-display font-bold ${getStatusColor(percentages.tokens)}`}>
                            {percentages.tokens.toFixed(1)}% used
                        </p>
                    </div>

                    {/* Requests Usage */}
                    <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-secondary-200/30 dark:border-secondary-700/30 from-secondary-50/50 to-secondary-100/50 dark:from-secondary-900/20 dark:to-secondary-800/20 hover:scale-105">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <span className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm font-bold font-display text-light-text-primary dark:text-dark-text-primary">
                                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                API Requests
                            </span>
                            {getStatusIcon(percentages.requests)}
                        </div>
                        <div className="overflow-hidden mb-3 w-full h-3 rounded-full bg-secondary-200/30 dark:bg-secondary-800/30">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(percentages.requests)}`}
                                style={{ width: `${percentages.requests}%` }}
                            />
                        </div>
                        <div className="flex justify-between mb-2 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                            <span>{formatNumber(current.requests)}</span>
                            <span>{formatLimit(limits.requestsPerMonth)}</span>
                        </div>
                        <p className={`text-sm font-display font-bold ${getStatusColor(percentages.requests)}`}>
                            {percentages.requests.toFixed(1)}% used
                        </p>
                    </div>

                    {/* Logs Usage */}
                    <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-accent-200/30 dark:border-accent-700/30 from-accent-50/50 to-accent-100/50 dark:from-accent-900/20 dark:to-accent-800/20 hover:scale-105">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <span className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm font-bold font-display text-light-text-primary dark:text-dark-text-primary">
                                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Logs
                            </span>
                            {getStatusIcon(percentages.logs)}
                        </div>
                        <div className="overflow-hidden mb-3 w-full h-3 rounded-full bg-accent-200/30 dark:bg-accent-800/30">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(percentages.logs)}`}
                                style={{ width: `${limits.logsPerMonth === -1 ? 0 : percentages.logs}%` }}
                            />
                        </div>
                        <div className="flex justify-between mb-2 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                            <span>{formatNumber(current.logs)}</span>
                            <span>{formatLimit(limits.logsPerMonth)}</span>
                        </div>
                        <p className={`text-sm font-display font-bold ${getStatusColor(percentages.logs)}`}>
                            {limits.logsPerMonth === -1 ? 'Unlimited' : `${percentages.logs.toFixed(1)}% used`}
                        </p>
                    </div>

                    {/* Projects */}
                    <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-success-200/30 dark:border-success-700/30 from-success-50/50 to-success-100/50 dark:from-success-900/20 dark:to-success-800/20 hover:scale-105">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <span className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm font-bold font-display text-light-text-primary dark:text-dark-text-primary">
                                <Folder className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Projects
                            </span>
                            {getStatusIcon(percentages.projects)}
                        </div>
                        <div className="overflow-hidden mb-3 w-full h-3 rounded-full bg-success-200/30 dark:bg-success-800/30">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(percentages.projects)}`}
                                style={{ width: `${limits.projects === -1 ? 0 : percentages.projects}%` }}
                            />
                        </div>
                        <div className="flex justify-between mb-2 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                            <span>{current.projects}</span>
                            <span>{formatLimit(limits.projects)}</span>
                        </div>
                        <p className={`text-sm font-display font-bold ${getStatusColor(percentages.projects)}`}>
                            {limits.projects === -1 ? 'Unlimited' : `${percentages.projects.toFixed(1)}% used`}
                        </p>
                    </div>

                    {/* Agent Traces */}
                    <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-warning-200/30 dark:border-warning-700/30 from-warning-50/50 to-warning-100/50 dark:from-warning-900/20 dark:to-warning-800/20 hover:scale-105">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <span className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm font-bold font-display text-light-text-primary dark:text-dark-text-primary">
                                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Agent Traces
                            </span>
                            {getStatusIcon(percentages.agentTraces)}
                        </div>
                        <div className="overflow-hidden mb-3 w-full h-3 rounded-full bg-warning-200/30 dark:bg-warning-800/30">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(percentages.agentTraces)}`}
                                style={{ width: `${limits.agentTraces === -1 ? 0 : percentages.agentTraces}%` }}
                            />
                        </div>
                        <div className="flex justify-between mb-2 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                            <span>{current.agentTraces}</span>
                            <span>{formatLimit(limits.agentTraces)}</span>
                        </div>
                        <p className={`text-sm font-display font-bold ${getStatusColor(percentages.agentTraces)}`}>
                            {limits.agentTraces === -1 ? 'Unlimited' : `${percentages.agentTraces.toFixed(1)}% used`}
                        </p>
                    </div>

                    {/* Monthly Cost */}
                    <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-primary-200/30 dark:border-primary-700/30 from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 hover:scale-105">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <span className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm font-bold font-display text-light-text-primary dark:text-dark-text-primary">
                                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Monthly Cost
                            </span>
                            <div className="flex justify-center items-center w-5 h-5 sm:w-6 sm:h-6 rounded-lg shadow-lg bg-gradient-primary">
                                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                            </div>
                        </div>
                        <div className="mb-2 text-2xl sm:text-3xl font-bold font-display gradient-text-primary">
                            ${current.cost.toFixed(2)}
                        </div>
                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            Current month spend
                        </p>
                    </div>

                    {/* Model Usage */}
                    <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-secondary-200/30 dark:border-secondary-700/30 from-secondary-50/50 to-secondary-100/50 dark:from-secondary-900/20 dark:to-secondary-800/20 hover:scale-105">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <span className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm font-bold font-display text-light-text-primary dark:text-dark-text-primary">
                                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Available Models
                            </span>
                            <div className="flex justify-center items-center w-5 h-5 sm:w-6 sm:h-6 rounded-lg shadow-lg bg-gradient-secondary">
                                <Database className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                            </div>
                        </div>
                        <div className="mb-3 text-sm font-body text-light-text-primary dark:text-dark-text-primary">
                            {limits.models && limits.models.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {limits.models.map((model: string, index: number) => (
                                        <span key={index} className="flex gap-1 items-center px-3 py-1 text-xs rounded-full border bg-gradient-primary/10 text-primary-700 dark:text-primary-300 border-primary-200/30 dark:border-primary-700/30">
                                            {model === '*' && <Sparkles className="w-3 h-3" />}
                                            {model === '*' ? 'All Models' : model}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-light-text-muted dark:text-dark-text-muted">No models available</span>
                            )}
                        </div>
                        <p className="flex gap-1 items-center text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            {plan === 'free' ? (
                                <>
                                    <Lock className="w-3 h-3" />
                                    Limited to cheaper models
                                </>
                            ) : (
                                <>
                                    <Rocket className="w-3 h-3" />
                                    Access to all models
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Predictions */}
            {predictions && (
                <div className="p-4 sm:p-6 md:p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex items-center mb-4 sm:mb-6">
                        <div className="flex justify-center items-center mr-3 sm:mr-4 w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg bg-gradient-accent flex-shrink-0">
                            <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold font-display gradient-text-primary">End of Month Predictions</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="p-4 sm:p-5 md:p-6 text-center bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-primary-200/30 dark:border-primary-700/30 from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 hover:scale-105">
                            <p className="flex gap-1.5 sm:gap-2 justify-center items-center mb-2 text-xs sm:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                                <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Predicted Tokens
                            </p>
                            <p className="mb-2 text-xl sm:text-2xl font-bold font-display gradient-text-primary">{formatNumber(predictions.tokens)}</p>
                            {predictions.tokens > limits.tokensPerMonth && limits.tokensPerMonth !== -1 && (
                                <p className="flex gap-1 justify-center items-center text-xs font-bold font-display gradient-text-danger">
                                    <AlertCircle className="w-3 h-3" />
                                    Will exceed limit
                                </p>
                            )}
                        </div>
                        <div className="p-6 text-center bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-secondary-200/30 dark:border-secondary-700/30 from-secondary-50/50 to-secondary-100/50 dark:from-secondary-900/20 dark:to-secondary-800/20 hover:scale-105">
                            <p className="flex gap-2 justify-center items-center mb-2 text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                                <Zap className="w-4 h-4" />
                                Predicted Requests
                            </p>
                            <p className="mb-2 text-2xl font-bold font-display gradient-text-secondary">{formatNumber(predictions.requests)}</p>
                            {predictions.requests > limits.requestsPerMonth && limits.requestsPerMonth !== -1 && (
                                <p className="flex gap-1 justify-center items-center text-xs font-bold font-display gradient-text-danger">
                                    <AlertCircle className="w-3 h-3" />
                                    Will exceed limit
                                </p>
                            )}
                        </div>
                        <div className="p-6 text-center bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-accent-200/30 dark:border-accent-700/30 from-accent-50/50 to-accent-100/50 dark:from-accent-900/20 dark:to-accent-800/20 hover:scale-105">
                            <p className="flex gap-2 justify-center items-center mb-2 text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                                <FileText className="w-4 h-4" />
                                Predicted Logs
                            </p>
                            <p className="mb-2 text-2xl font-bold font-display gradient-text-accent">{formatNumber(predictions.logs)}</p>
                            {predictions.logs > limits.logsPerMonth && limits.logsPerMonth !== -1 && (
                                <p className="flex gap-1 justify-center items-center text-xs font-bold font-display gradient-text-danger">
                                    <AlertCircle className="w-3 h-3" />
                                    Will exceed limit
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
                <div className="p-4 sm:p-6 md:p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex items-center mb-4 sm:mb-6">
                        <div className="flex justify-center items-center mr-3 sm:mr-4 w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg bg-gradient-success flex-shrink-0">
                            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold font-display gradient-text-primary">Optimization Recommendations</h3>
                    </div>
                    <div className="space-y-4">
                        {recommendations.map((rec, index) => (
                            <div key={index} className="p-4 rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-700/30 hover:bg-primary-500/5">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-2 w-2 h-2 rounded-full shadow-lg bg-gradient-success"></div>
                                    <span className="text-sm leading-relaxed font-body text-light-text-primary dark:text-dark-text-primary">{rec}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upgrade Prompt for Free Users */}
            {plan === 'free' && (percentages.tokens > 70 || percentages.requests > 70) && (
                <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-primary">
                    <div className="flex items-center mb-3 sm:mb-4">
                        <div className="flex justify-center items-center mr-2 sm:mr-3 w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-lg bg-white/20 flex-shrink-0">
                            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white font-display">Approaching Limits</h3>
                    </div>
                    <p className="mb-3 sm:mb-4 text-xs sm:text-sm font-body text-white/90">
                        You're approaching your plan limits. Consider upgrading to Plus or Pro for increased limits and access to all AI models.
                    </p>
                    <a
                        href="https://www.costkatana.com/#pricing"
                        className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold bg-white rounded-xl shadow-lg transition-all duration-300 btn btn-primary font-display text-primary-600 hover:bg-primary-50 hover:scale-105"
                    >
                        <Sparkles className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                        View Plans
                        <ArrowRight className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
                    </a>
                </div>
            )}
        </div>
    );
};
