import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../common/Progress';
import { Alert, AlertDescription, AlertTitle } from '../common/Alert';
import { TrendingUp, AlertTriangle, CheckCircle, XCircle, Database } from 'lucide-react';
import { guardrailsService } from '../../services/guardrails.service';
import { formatNumber } from '../../utils/formatters';

interface UsageMetrics {
    tokens: number;
    requests: number;
    logs: number;
    projects: number;
    workflows: number;
    cost: number;
}

interface PlanLimits {
    tokensPerMonth: number;
    requestsPerMonth: number;
    logsPerMonth: number;
    projects: number;
    workflows: number;
    models?: string[];
}

interface UsageStats {
    current: UsageMetrics;
    limits: PlanLimits;
    percentages: {
        tokens: number;
        requests: number;
        logs: number;
        projects: number;
        workflows: number;
    };
    plan: string;
    recommendations: string[];
    predictions: {
        tokens: number;
        requests: number;
        logs: number;
    };
}

export const UsageOverview: React.FC = () => {
    const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
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
            <div className="w-6 h-6 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
                <XCircle className="w-3 h-3 text-white" />
            </div>
        );
        if (percentage >= 75) return (
            <div className="w-6 h-6 rounded-lg bg-gradient-warning flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-3 h-3 text-white" />
            </div>
        );
        return (
            <div className="w-6 h-6 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
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
            <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-center h-64">
                    <div className="spinner-lg text-primary-500"></div>
                </div>
            </div>
        );
    }

    if (error || !usageStats) {
        return (
            <div className="card p-8 bg-gradient-danger/10 border border-danger-200/30 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-danger flex items-center justify-center mr-4 shadow-lg">
                        <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-display font-bold gradient-text-danger">Error Loading Usage Data</h3>
                </div>
                <p className="font-body text-danger-700 dark:text-danger-300">{error || 'Unable to load usage data'}</p>
            </div>
        );
    }

    const { current, limits, percentages, plan, recommendations, predictions } = usageStats;

    return (
        <div className="space-y-8">
            {/* Plan Overview */}
            <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg glow-primary">
                            <Database className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-2xl font-display font-bold gradient-text">📊 Usage Overview</h3>
                    </div>
                    <span className="text-sm font-display font-bold bg-gradient-primary text-white px-4 py-2 rounded-full shadow-lg">
                        ✨ {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Tokens Usage */}
                    <div className="card card-hover p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 border-primary-200/30">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-display font-bold text-light-text-primary dark:text-dark-text-primary">🪙 Tokens</span>
                            {getStatusIcon(percentages.tokens)}
                        </div>
                        <div className="w-full bg-primary-200/30 rounded-full h-3 mb-3 overflow-hidden">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(percentages.tokens)}`}
                                style={{ width: `${percentages.tokens}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                            <span>{formatNumber(current.tokens)}</span>
                            <span>{formatLimit(limits.tokensPerMonth)}</span>
                        </div>
                        <p className={`text-sm font-display font-bold ${getStatusColor(percentages.tokens)}`}>
                            {percentages.tokens.toFixed(1)}% used
                        </p>
                    </div>

                    {/* Requests Usage */}
                    <div className="card card-hover p-6 bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 border-secondary-200/30">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-display font-bold text-light-text-primary dark:text-dark-text-primary">⚡ API Requests</span>
                            {getStatusIcon(percentages.requests)}
                        </div>
                        <div className="w-full bg-secondary-200/30 rounded-full h-3 mb-3 overflow-hidden">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(percentages.requests)}`}
                                style={{ width: `${percentages.requests}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                            <span>{formatNumber(current.requests)}</span>
                            <span>{formatLimit(limits.requestsPerMonth)}</span>
                        </div>
                        <p className={`text-sm font-display font-bold ${getStatusColor(percentages.requests)}`}>
                            {percentages.requests.toFixed(1)}% used
                        </p>
                    </div>

                    {/* Logs Usage */}
                    <div className="card card-hover p-6 bg-gradient-to-br from-accent-50/50 to-accent-100/50 border-accent-200/30">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-display font-bold text-light-text-primary dark:text-dark-text-primary">📝 Logs</span>
                            {getStatusIcon(percentages.logs)}
                        </div>
                        <div className="w-full bg-accent-200/30 rounded-full h-3 mb-3 overflow-hidden">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(percentages.logs)}`}
                                style={{ width: `${limits.logsPerMonth === -1 ? 0 : percentages.logs}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                            <span>{formatNumber(current.logs)}</span>
                            <span>{formatLimit(limits.logsPerMonth)}</span>
                        </div>
                        <p className={`text-sm font-display font-bold ${getStatusColor(percentages.logs)}`}>
                            {limits.logsPerMonth === -1 ? 'Unlimited' : `${percentages.logs.toFixed(1)}% used`}
                        </p>
                    </div>

                    {/* Projects */}
                    <div className="card card-hover p-6 bg-gradient-to-br from-success-50/50 to-success-100/50 border-success-200/30">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-display font-bold text-light-text-primary dark:text-dark-text-primary">🗂️ Projects</span>
                            {getStatusIcon(percentages.projects)}
                        </div>
                        <div className="w-full bg-success-200/30 rounded-full h-3 mb-3 overflow-hidden">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(percentages.projects)}`}
                                style={{ width: `${limits.projects === -1 ? 0 : percentages.projects}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                            <span>{current.projects}</span>
                            <span>{formatLimit(limits.projects)}</span>
                        </div>
                        <p className={`text-sm font-display font-bold ${getStatusColor(percentages.projects)}`}>
                            {limits.projects === -1 ? 'Unlimited' : `${percentages.projects.toFixed(1)}% used`}
                        </p>
                    </div>

                    {/* Workflows */}
                    <div className="card card-hover p-6 bg-gradient-to-br from-warning-50/50 to-warning-100/50 border-warning-200/30">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-display font-bold text-light-text-primary dark:text-dark-text-primary">⚙️ Workflows</span>
                            {getStatusIcon(percentages.workflows)}
                        </div>
                        <div className="w-full bg-warning-200/30 rounded-full h-3 mb-3 overflow-hidden">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(percentages.workflows)}`}
                                style={{ width: `${limits.workflows === -1 ? 0 : percentages.workflows}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                            <span>{current.workflows}</span>
                            <span>{formatLimit(limits.workflows)}</span>
                        </div>
                        <p className={`text-sm font-display font-bold ${getStatusColor(percentages.workflows)}`}>
                            {limits.workflows === -1 ? 'Unlimited' : `${percentages.workflows.toFixed(1)}% used`}
                        </p>
                    </div>

                    {/* Monthly Cost */}
                    <div className="card card-hover p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 border-primary-200/30">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-display font-bold text-light-text-primary dark:text-dark-text-primary">💰 Monthly Cost</span>
                            <div className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                                <TrendingUp className="w-3 h-3 text-white" />
                            </div>
                        </div>
                        <div className="text-3xl font-display font-bold gradient-text mb-2">
                            ${current.cost.toFixed(2)}
                        </div>
                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            Current month spend
                        </p>
                    </div>

                    {/* Model Usage */}
                    <div className="card card-hover p-6 bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 border-secondary-200/30">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-display font-bold text-light-text-primary dark:text-dark-text-primary">🤖 Available Models</span>
                            <div className="w-6 h-6 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
                                <Database className="w-3 h-3 text-white" />
                            </div>
                        </div>
                        <div className="text-sm font-body text-light-text-primary dark:text-dark-text-primary mb-3">
                            {limits.models && limits.models.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {limits.models.map((model: string, index: number) => (
                                        <span key={index} className="px-3 py-1 bg-gradient-primary/10 text-primary-700 dark:text-primary-300 text-xs rounded-full border border-primary-200/30">
                                            {model === '*' ? '✨ All Models' : model}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-light-text-muted dark:text-dark-text-muted">No models available</span>
                            )}
                        </div>
                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            {plan === 'free' ? '🔒 Limited to cheaper models' : '🚀 Access to all models'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Predictions */}
            {predictions && (
                <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center mr-4 shadow-lg glow-accent">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-2xl font-display font-bold gradient-text">🔮 End of Month Predictions</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card card-hover p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 border-primary-200/30 text-center">
                            <p className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">🪙 Predicted Tokens</p>
                            <p className="text-2xl font-display font-bold gradient-text mb-2">{formatNumber(predictions.tokens)}</p>
                            {predictions.tokens > limits.tokensPerMonth && limits.tokensPerMonth !== -1 && (
                                <p className="text-xs font-display font-bold gradient-text-danger">⚠️ Will exceed limit</p>
                            )}
                        </div>
                        <div className="card card-hover p-6 bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 border-secondary-200/30 text-center">
                            <p className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">⚡ Predicted Requests</p>
                            <p className="text-2xl font-display font-bold text-secondary-600 dark:text-secondary-400 mb-2">{formatNumber(predictions.requests)}</p>
                            {predictions.requests > limits.requestsPerMonth && limits.requestsPerMonth !== -1 && (
                                <p className="text-xs font-display font-bold gradient-text-danger">⚠️ Will exceed limit</p>
                            )}
                        </div>
                        <div className="card card-hover p-6 bg-gradient-to-br from-accent-50/50 to-accent-100/50 border-accent-200/30 text-center">
                            <p className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">📝 Predicted Logs</p>
                            <p className="text-2xl font-display font-bold gradient-text-accent mb-2">{formatNumber(predictions.logs)}</p>
                            {predictions.logs > limits.logsPerMonth && limits.logsPerMonth !== -1 && (
                                <p className="text-xs font-display font-bold gradient-text-danger">⚠️ Will exceed limit</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
                <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center mr-4 shadow-lg glow-success">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-display font-bold gradient-text">💡 Optimization Recommendations</h3>
                    </div>
                    <div className="space-y-4">
                        {recommendations.map((rec, index) => (
                            <div key={index} className="glass p-4 rounded-xl border border-primary-200/30 hover:bg-primary-500/5 transition-all duration-300">
                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-gradient-success rounded-full mt-2 flex-shrink-0 shadow-lg"></div>
                                    <span className="text-sm font-body text-light-text-primary dark:text-dark-text-primary leading-relaxed">{rec}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upgrade Prompt for Free Users */}
            {plan === 'free' && (percentages.tokens > 70 || percentages.requests > 70) && (
                <div className="card p-6 bg-gradient-primary shadow-2xl backdrop-blur-xl border border-primary-200/30">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                            <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-display font-bold text-white">🚀 Approaching Limits</h3>
                    </div>
                    <p className="text-sm font-body text-white/90 mb-4">
                        You're approaching your plan limits. Consider upgrading to Plus or Pro for increased limits and access to all AI models.
                    </p>
                    <a
                        href="https://costkatana.com/pricing"
                        className="inline-flex items-center text-sm font-display font-semibold bg-white text-primary-600 px-4 py-2 rounded-xl hover:bg-primary-50 transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                        ✨ View Plans →
                    </a>
                </div>
            )}
        </div>
    );
};
