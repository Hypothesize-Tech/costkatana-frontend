import React, { useState, useEffect } from 'react';
import { securityService, SecurityAnalytics, SecurityMetrics, HumanReviewRequest } from '../services/security.service';
import { SecurityShimmer } from '../components/shimmer/SecurityShimmer';
import {
    RotateCw,
    FileText,
    Table,
    Eye,
    CheckCircle,
    XCircle,
    X,
    AlertTriangle,
    DollarSign,
    BarChart3,
    Target,
    Search
} from 'lucide-react';

export const Security: React.FC = () => {
    const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
    const [analytics, setAnalytics] = useState<SecurityAnalytics | null>(null);
    const [pendingReviews, setPendingReviews] = useState<HumanReviewRequest[]>([]);
    const [selectedReview, setSelectedReview] = useState<HumanReviewRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSecurityData();
    }, []);

    const loadSecurityData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [metricsResponse, analyticsResponse, reviewsResponse] = await Promise.all([
                securityService.getMetrics(),
                securityService.getAnalytics(),
                securityService.getPendingReviews()
            ]);

            setMetrics(metricsResponse.data);
            setAnalytics(analyticsResponse.data);
            setPendingReviews(reviewsResponse.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load security data');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewDecision = async (reviewId: string, decision: 'approved' | 'denied', comments?: string) => {
        try {
            await securityService.reviewRequest(reviewId, { decision, comments });

            // Reload pending reviews
            const reviewsResponse = await securityService.getPendingReviews();
            setPendingReviews(reviewsResponse.data);
            setSelectedReview(null);
        } catch (err: any) {
            setError(err.message || 'Failed to process review decision');
        }
    };

    const exportSecurityReport = async (format: 'json' | 'csv' = 'json') => {
        try {
            const response = await securityService.exportReport(format);

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `security_report.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err: any) {
            setError(err.message || 'Failed to export security report');
        }
    };

    const getThreatBadgeColor = (threatCategory: string): string => {
        return securityService.getThreatCategoryColor(threatCategory);
    };

    const getRiskScoreColor = (riskScore: number): string => {
        return securityService.getRiskScoreColor(riskScore);
    };

    if (loading) {
        return <SecurityShimmer />;
    }

    if (error) {
        return (
            <div className="px-4 py-8 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient sm:px-6 lg:px-8">
                <div className="mx-auto max-w-md">
                    <div className="p-6 bg-gradient-to-br rounded-xl border glass border-danger-200/30 from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
                        <div className="mb-4 text-sm text-danger-600 dark:text-danger-400 font-body">{error}</div>
                        <button
                            onClick={loadSecurityData}
                            className="flex gap-2 items-center btn btn-primary"
                        >
                            <RotateCw className="w-4 h-4" />
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-8 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="p-8 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <h1 className="mb-4 text-4xl font-bold font-display gradient-text-primary">LLM Security Dashboard</h1>
                    <p className="mb-6 text-secondary-600 dark:text-secondary-300">
                        Monitor and manage your AI security with comprehensive threat detection and analysis
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => exportSecurityReport('json')}
                            className="flex gap-2 items-center btn btn-secondary"
                        >
                            <FileText className="w-4 h-4" />
                            Export JSON Report
                        </button>
                        <button
                            onClick={() => exportSecurityReport('csv')}
                            className="flex gap-2 items-center btn btn-secondary"
                        >
                            <Table className="w-4 h-4" />
                            Export CSV Report
                        </button>
                    </div>
                </div>

                {/* Security Metrics Cards */}
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-5">
                    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Threats Detected</p>
                                <p className="text-2xl font-bold font-display text-secondary-900 dark:text-white">{metrics?.totalThreatsDetected || 0}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br rounded-xl from-danger-500/20 to-danger-600/20 dark:from-danger-900/30 dark:to-danger-800/30">
                                <AlertTriangle className="w-5 h-5 text-danger-600 dark:text-danger-400" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Cost Saved</p>
                                <p className="text-2xl font-bold font-display text-success-600 dark:text-success-400">${metrics?.totalCostSaved?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br rounded-xl from-success-500/20 to-success-600/20 dark:from-success-900/30 dark:to-success-800/30">
                                <DollarSign className="w-5 h-5 text-success-600 dark:text-success-400" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Avg Risk Score</p>
                                <p className={`text-2xl font-display font-bold ${getRiskScoreColor(metrics?.averageRiskScore || 0)}`}>
                                    {((metrics?.averageRiskScore || 0) * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br rounded-xl from-highlight-500/20 to-highlight-600/20 dark:from-highlight-900/30 dark:to-highlight-800/30">
                                <BarChart3 className="w-5 h-5 text-highlight-600 dark:text-highlight-400" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Detection Rate</p>
                                <p className="text-2xl font-bold font-display text-primary-600 dark:text-primary-400">
                                    {((analytics?.detectionRate || 0) * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br rounded-xl from-primary-500/20 to-primary-600/20 dark:from-primary-900/30 dark:to-primary-800/30">
                                <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Top Threat</p>
                                <p className="text-sm font-bold capitalize text-secondary-900 dark:text-white">
                                    {metrics?.mostCommonThreat?.replace('_', ' ') || 'None'}
                                </p>
                                <div className="mt-1">
                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${metrics?.detectionTrend === 'increasing' ? 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-300' :
                                        metrics?.detectionTrend === 'decreasing' ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300' :
                                            'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-300'
                                        }`}>
                                        {metrics?.detectionTrend || 'stable'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 bg-gradient-to-br rounded-xl from-accent-500/20 to-accent-600/20 dark:from-accent-900/30 dark:to-accent-800/30">
                                <Search className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Human Review Queue */}
                {pendingReviews.length > 0 && (
                    <div className="mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="p-6 border-b border-primary-200/30">
                            <h2 className="text-xl font-bold font-display text-secondary-900 dark:text-white">Pending Human Reviews ({pendingReviews.length})</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {pendingReviews.map((review) => (
                                    <div key={review.id} className="p-4 bg-gradient-to-br rounded-lg border glass border-warning-200/30 from-warning-50/30 to-accent-50/30 dark:from-warning-900/20 dark:to-accent-900/20">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex gap-2 items-center mb-2">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getThreatBadgeColor(review.threatResult.threatCategory)}`}>
                                                        {review.threatResult.threatCategory.replace('_', ' ')}
                                                    </span>
                                                    <span className={`text-sm font-semibold ${getRiskScoreColor(review.threatResult.riskScore || 0)}`}>
                                                        Risk: {((review.threatResult.riskScore || 0) * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                                <p className="mb-2 text-sm text-secondary-700 dark:text-secondary-300">{review.threatResult.reason}</p>
                                                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                                                    Request ID: {review.requestId} • Created: {new Date(review.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => setSelectedReview(review)}
                                                    className="flex gap-2 items-center btn btn-secondary"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Review
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Charts */}
                <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
                    {/* Threat Distribution */}
                    <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="p-6 border-b border-primary-200/30">
                            <h2 className="text-xl font-bold font-display text-secondary-900 dark:text-white">Threat Distribution</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {analytics && Object.entries(analytics.threatDistribution).map(([threat, count]) => (
                                    <div key={threat} className="flex justify-between items-center">
                                        <div className="flex gap-2 items-center">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getThreatBadgeColor(threat)}`}>
                                                {threat.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold text-secondary-900 dark:text-white">{count}</span>
                                    </div>
                                ))}
                                {!analytics?.threatDistribution || Object.keys(analytics.threatDistribution).length === 0 && (
                                    <p className="py-4 text-center text-secondary-500 dark:text-secondary-400">No threats detected recently</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Containment Actions */}
                    <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="p-6 border-b border-primary-200/30">
                            <h2 className="text-xl font-bold font-display text-secondary-900 dark:text-white">Containment Actions</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {analytics && Object.entries(analytics.containmentActions).map(([action, count]) => (
                                    <div key={action} className="flex justify-between items-center">
                                        <span className="text-sm font-medium capitalize text-secondary-700 dark:text-secondary-300">{action.replace('_', ' ')}</span>
                                        <span className="text-sm font-semibold text-secondary-900 dark:text-white">{count}</span>
                                    </div>
                                ))}
                                {!analytics?.containmentActions || Object.keys(analytics.containmentActions).length === 0 && (
                                    <p className="py-4 text-center text-secondary-500 dark:text-secondary-400">No containment actions taken recently</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Risky Patterns */}
                <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="p-6 border-b border-primary-200/30">
                        <h2 className="text-xl font-bold font-display text-secondary-900 dark:text-white">Top Risky Patterns</h2>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-primary-200/30">
                                        <th className="py-2 font-semibold text-left text-secondary-700 dark:text-secondary-300 font-display">Pattern</th>
                                        <th className="py-2 font-semibold text-right text-secondary-700 dark:text-secondary-300 font-display">Count</th>
                                        <th className="py-2 font-semibold text-right text-secondary-700 dark:text-secondary-300 font-display">Avg Risk Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics?.topRiskyPatterns?.slice(0, 10).map((pattern, index) => (
                                        <tr key={index} className="border-b border-primary-200/20 hover:bg-primary-50/30 dark:hover:bg-primary-900/10">
                                            <td className="py-2 font-mono text-xs text-secondary-700 dark:text-secondary-300">{pattern.pattern.slice(0, 100)}...</td>
                                            <td className="py-2 text-right text-secondary-900 dark:text-white">{pattern.count}</td>
                                            <td className={`text-right py-2 font-semibold ${getRiskScoreColor(pattern.averageRiskScore)}`}>
                                                {(pattern.averageRiskScore * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                    {(!analytics?.topRiskyPatterns || analytics.topRiskyPatterns.length === 0) && (
                                        <tr>
                                            <td colSpan={3} className="py-4 text-center text-secondary-500 dark:text-secondary-400">
                                                No risky patterns detected recently
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Human Review Modal */}
            {selectedReview && (
                <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
                        <div className="p-6 border-b border-primary-200/30">
                            <h2 className="text-xl font-bold font-display text-secondary-900 dark:text-white">Security Review Required</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-secondary-700 dark:text-secondary-300">
                                    Threat Category
                                </label>
                                <span className={`px-2 py-1 text-xs rounded-full ${getThreatBadgeColor(selectedReview.threatResult.threatCategory)}`}>
                                    {selectedReview.threatResult.threatCategory.replace('_', ' ')}
                                </span>
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-secondary-700 dark:text-secondary-300">
                                    Risk Score
                                </label>
                                <span className={`font-bold ${getRiskScoreColor(selectedReview.threatResult.riskScore || 0)}`}>
                                    {((selectedReview.threatResult.riskScore || 0) * 100).toFixed(1)}%
                                </span>
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-secondary-700 dark:text-secondary-300">
                                    Detection Reason
                                </label>
                                <p className="p-3 text-sm rounded text-secondary-900 dark:text-white bg-secondary-50 dark:bg-secondary-900/20">
                                    {selectedReview.threatResult.reason}
                                </p>
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-secondary-700 dark:text-secondary-300">
                                    Original Prompt (Sanitized)
                                </label>
                                <p className="overflow-auto p-3 max-h-32 text-sm rounded text-secondary-900 dark:text-white bg-secondary-50 dark:bg-secondary-900/20">
                                    {selectedReview.originalPrompt}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleReviewDecision(selectedReview.id, 'approved')}
                                    className="flex flex-1 gap-2 justify-center items-center btn btn-success"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve Request
                                </button>
                                <button
                                    onClick={() => handleReviewDecision(selectedReview.id, 'denied')}
                                    className="flex flex-1 gap-2 justify-center items-center btn btn-danger"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Deny Request
                                </button>
                                <button
                                    onClick={() => setSelectedReview(null)}
                                    className="flex gap-2 justify-center items-center btn btn-ghost"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
