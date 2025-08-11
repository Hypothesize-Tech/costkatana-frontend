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
        if (percentage >= 90) return 'text-red-600';
        if (percentage >= 75) return 'text-yellow-600';
        if (percentage >= 50) return 'text-blue-600';
        return 'text-green-600';
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 75) return 'bg-yellow-500';
        if (percentage >= 50) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStatusIcon = (percentage: number) => {
        if (percentage >= 90) return <XCircle className="w-5 h-5 text-red-600" />;
        if (percentage >= 75) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    };

    const formatLimit = (limit: number) => {
        if (limit === -1) return 'Unlimited';
        return formatNumber(limit);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !usageStats) {
        return (
            <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error || 'Unable to load usage data'}</AlertDescription>
            </Alert>
        );
    }

    const { current, limits, percentages, plan, recommendations, predictions } = usageStats;

    return (
        <div className="space-y-6">
            {/* Plan Overview */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Usage Overview</CardTitle>
                        <span className="text-sm font-normal bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                            {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Tokens Usage */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Tokens</span>
                                {getStatusIcon(percentages.tokens)}
                            </div>
                            <Progress
                                value={percentages.tokens}
                                className={`h-2 ${getProgressColor(percentages.tokens)}`}
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{formatNumber(current.tokens)}</span>
                                <span>{formatLimit(limits.tokensPerMonth)}</span>
                            </div>
                            <p className={`text-xs ${getStatusColor(percentages.tokens)}`}>
                                {percentages.tokens.toFixed(1)}% used
                            </p>
                        </div>

                        {/* Requests Usage */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">API Requests</span>
                                {getStatusIcon(percentages.requests)}
                            </div>
                            <Progress
                                value={percentages.requests}
                                className={`h-2 ${getProgressColor(percentages.requests)}`}
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{formatNumber(current.requests)}</span>
                                <span>{formatLimit(limits.requestsPerMonth)}</span>
                            </div>
                            <p className={`text-xs ${getStatusColor(percentages.requests)}`}>
                                {percentages.requests.toFixed(1)}% used
                            </p>
                        </div>

                        {/* Logs Usage */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Logs</span>
                                {getStatusIcon(percentages.logs)}
                            </div>
                            <Progress
                                value={limits.logsPerMonth === -1 ? 0 : percentages.logs}
                                className={`h-2 ${getProgressColor(percentages.logs)}`}
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{formatNumber(current.logs)}</span>
                                <span>{formatLimit(limits.logsPerMonth)}</span>
                            </div>
                            <p className={`text-xs ${getStatusColor(percentages.logs)}`}>
                                {limits.logsPerMonth === -1 ? 'Unlimited' : `${percentages.logs.toFixed(1)}% used`}
                            </p>
                        </div>

                        {/* Projects */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Projects</span>
                                {getStatusIcon(percentages.projects)}
                            </div>
                            <Progress
                                value={limits.projects === -1 ? 0 : percentages.projects}
                                className={`h-2 ${getProgressColor(percentages.projects)}`}
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{current.projects}</span>
                                <span>{formatLimit(limits.projects)}</span>
                            </div>
                            <p className={`text-xs ${getStatusColor(percentages.projects)}`}>
                                {limits.projects === -1 ? 'Unlimited' : `${percentages.projects.toFixed(1)}% used`}
                            </p>
                        </div>

                        {/* Workflows */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Workflows</span>
                                {getStatusIcon(percentages.workflows)}
                            </div>
                            <Progress
                                value={limits.workflows === -1 ? 0 : percentages.workflows}
                                className={`h-2 ${getProgressColor(percentages.workflows)}`}
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{current.workflows}</span>
                                <span>{formatLimit(limits.workflows)}</span>
                            </div>
                            <p className={`text-xs ${getStatusColor(percentages.workflows)}`}>
                                {limits.workflows === -1 ? 'Unlimited' : `${percentages.workflows.toFixed(1)}% used`}
                            </p>
                        </div>

                        {/* Monthly Cost */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Monthly Cost</span>
                                <TrendingUp className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                ${current.cost.toFixed(2)}
                            </div>
                            <p className="text-xs text-gray-500">
                                Current month spend
                            </p>
                        </div>

                        {/* Model Usage */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Available Models</span>
                                <Database className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="text-sm text-gray-900">
                                {limits.models && limits.models.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {limits.models.map((model: string, index: number) => (
                                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                {model === '*' ? 'All Models' : model}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-500">No models available</span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                {plan === 'free' ? 'Limited to cheaper models' : 'Access to all models'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Predictions */}
            {predictions && (
                <Card>
                    <CardHeader>
                        <CardTitle>End of Month Predictions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Predicted Tokens</p>
                                <p className="text-lg font-semibold">{formatNumber(predictions.tokens)}</p>
                                {predictions.tokens > limits.tokensPerMonth && limits.tokensPerMonth !== -1 && (
                                    <p className="text-xs text-red-600">Will exceed limit</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Predicted Requests</p>
                                <p className="text-lg font-semibold">{formatNumber(predictions.requests)}</p>
                                {predictions.requests > limits.requestsPerMonth && limits.requestsPerMonth !== -1 && (
                                    <p className="text-xs text-red-600">Will exceed limit</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Predicted Logs</p>
                                <p className="text-lg font-semibold">{formatNumber(predictions.logs)}</p>
                                {predictions.logs > limits.logsPerMonth && limits.logsPerMonth !== -1 && (
                                    <p className="text-xs text-red-600">Will exceed limit</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Optimization Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    <span className="text-sm text-gray-700">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Upgrade Prompt for Free Users */}
            {plan === 'free' && (percentages.tokens > 70 || percentages.requests > 70) && (
                <Alert className="bg-blue-50 border-blue-200">
                    <TrendingUp className="h-4 w-4" />
                    <AlertTitle>Approaching Limits</AlertTitle>
                    <AlertDescription>
                        You're approaching your plan limits. Consider upgrading to Plus or Pro for increased limits and access to all AI models.
                        <a href="https://costkatana.com/pricing" className="ml-2 text-blue-600 hover:underline">
                            View Plans →
                        </a>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};
