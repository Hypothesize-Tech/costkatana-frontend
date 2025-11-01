import React, { useState, useEffect } from 'react';
import { securityService, SecurityAnalytics, SecurityMetrics, HumanReviewRequest } from '../services/security.service';
import {
    ArrowPathIcon,
    DocumentTextIcon,
    TableCellsIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

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
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    <div className="glass rounded-xl border border-danger-200/30 bg-gradient-to-br from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20 p-6">
                        <div className="text-danger-600 dark:text-danger-400 text-sm mb-4 font-body">{error}</div>
                        <button
                            onClick={loadSecurityData}
                            className="px-4 py-2.5 bg-gradient-primary hover:bg-gradient-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-display font-semibold text-sm"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 mb-8">
                    <h1 className="text-4xl font-display font-bold gradient-text-primary mb-4">LLM Security Dashboard</h1>
                    <p className="text-secondary-600 dark:text-secondary-300 mb-6">
                        Monitor and manage your AI security with comprehensive threat detection and analysis
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => exportSecurityReport('json')}
                            className="px-4 py-2.5 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex items-center gap-2 font-display font-semibold text-sm"
                        >
                            <DocumentTextIcon className="w-4 h-4" />
                            Export JSON Report
                        </button>
                        <button
                            onClick={() => exportSecurityReport('csv')}
                            className="px-4 py-2.5 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex items-center gap-2 font-display font-semibold text-sm"
                        >
                            <TableCellsIcon className="w-4 h-4" />
                            Export CSV Report
                        </button>
                    </div>
                </div>

                {/* Security Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Threats Detected</p>
                                <p className="text-2xl font-display font-bold text-secondary-900 dark:text-white">{metrics?.totalThreatsDetected || 0}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-danger-500/20 to-danger-600/20">
                                <span className="text-danger-600 dark:text-danger-400 text-lg">⚠️</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Cost Saved</p>
                                <p className="text-2xl font-display font-bold text-success-600 dark:text-success-400">${metrics?.totalCostSaved?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-success-500/20 to-success-600/20">
                                <span className="text-success-600 dark:text-success-400 text-lg">💰</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Avg Risk Score</p>
                                <p className={`text-2xl font-display font-bold ${getRiskScoreColor(metrics?.averageRiskScore || 0)}`}>
                                    {((metrics?.averageRiskScore || 0) * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-highlight-500/20 to-highlight-600/20">
                                <span className="text-highlight-600 dark:text-highlight-400 text-lg">📊</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Detection Rate</p>
                                <p className="text-2xl font-display font-bold text-primary-600 dark:text-primary-400">
                                    {((analytics?.detectionRate || 0) * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                                <span className="text-primary-600 dark:text-primary-400 text-lg">🎯</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Top Threat</p>
                                <p className="text-sm font-bold text-secondary-900 dark:text-white capitalize">
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
                            <div className="p-3 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/20">
                                <span className="text-accent-600 dark:text-accent-400 text-lg">🔍</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Human Review Queue */}
                {pendingReviews.length > 0 && (
                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel mb-8">
                        <div className="p-6 border-b border-primary-200/30">
                            <h2 className="text-xl font-display font-bold text-secondary-900 dark:text-white">Pending Human Reviews ({pendingReviews.length})</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {pendingReviews.map((review) => (
                                    <div key={review.id} className="glass rounded-lg border border-warning-200/30 bg-gradient-to-br from-warning-50/30 to-accent-50/30 dark:from-warning-900/20 dark:to-accent-900/20 p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getThreatBadgeColor(review.threatResult.threatCategory)}`}>
                                                        {review.threatResult.threatCategory.replace('_', ' ')}
                                                    </span>
                                                    <span className={`text-sm font-semibold ${getRiskScoreColor(review.threatResult.riskScore || 0)}`}>
                                                        Risk: {((review.threatResult.riskScore || 0) * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                                <p className="text-sm text-secondary-700 dark:text-secondary-300 mb-2">{review.threatResult.reason}</p>
                                                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                                                    Request ID: {review.requestId} • Created: {new Date(review.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => setSelectedReview(review)}
                                                    className="px-3 py-2 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex items-center gap-2 font-display font-semibold text-sm"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Threat Distribution */}
                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="p-6 border-b border-primary-200/30">
                            <h2 className="text-xl font-display font-bold text-secondary-900 dark:text-white">Threat Distribution</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {analytics && Object.entries(analytics.threatDistribution).map(([threat, count]) => (
                                    <div key={threat} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getThreatBadgeColor(threat)}`}>
                                                {threat.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold text-secondary-900 dark:text-white">{count}</span>
                                    </div>
                                ))}
                                {!analytics?.threatDistribution || Object.keys(analytics.threatDistribution).length === 0 && (
                                    <p className="text-secondary-500 dark:text-secondary-400 text-center py-4">No threats detected recently</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Containment Actions */}
                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="p-6 border-b border-primary-200/30">
                            <h2 className="text-xl font-display font-bold text-secondary-900 dark:text-white">Containment Actions</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {analytics && Object.entries(analytics.containmentActions).map(([action, count]) => (
                                    <div key={action} className="flex items-center justify-between">
                                        <span className="text-sm capitalize font-medium text-secondary-700 dark:text-secondary-300">{action.replace('_', ' ')}</span>
                                        <span className="text-sm font-semibold text-secondary-900 dark:text-white">{count}</span>
                                    </div>
                                ))}
                                {!analytics?.containmentActions || Object.keys(analytics.containmentActions).length === 0 && (
                                    <p className="text-secondary-500 dark:text-secondary-400 text-center py-4">No containment actions taken recently</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Risky Patterns */}
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="p-6 border-b border-primary-200/30">
                        <h2 className="text-xl font-display font-bold text-secondary-900 dark:text-white">Top Risky Patterns</h2>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-primary-200/30">
                                        <th className="text-left py-2 text-secondary-700 dark:text-secondary-300 font-display font-semibold">Pattern</th>
                                        <th className="text-right py-2 text-secondary-700 dark:text-secondary-300 font-display font-semibold">Count</th>
                                        <th className="text-right py-2 text-secondary-700 dark:text-secondary-300 font-display font-semibold">Avg Risk Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics?.topRiskyPatterns?.slice(0, 10).map((pattern, index) => (
                                        <tr key={index} className="border-b border-primary-200/20 hover:bg-primary-50/30 dark:hover:bg-primary-900/10">
                                            <td className="py-2 font-mono text-xs text-secondary-700 dark:text-secondary-300">{pattern.pattern.slice(0, 100)}...</td>
                                            <td className="text-right py-2 text-secondary-900 dark:text-white">{pattern.count}</td>
                                            <td className={`text-right py-2 font-semibold ${getRiskScoreColor(pattern.averageRiskScore)}`}>
                                                {(pattern.averageRiskScore * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                    {(!analytics?.topRiskyPatterns || analytics.topRiskyPatterns.length === 0) && (
                                        <tr>
                                            <td colSpan={3} className="text-center py-4 text-secondary-500 dark:text-secondary-400">
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
                        <div className="p-6 border-b border-primary-200/30">
                            <h2 className="text-xl font-display font-bold text-secondary-900 dark:text-white">Security Review Required</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                                    Threat Category
                                </label>
                                <span className={`px-2 py-1 text-xs rounded-full ${getThreatBadgeColor(selectedReview.threatResult.threatCategory)}`}>
                                    {selectedReview.threatResult.threatCategory.replace('_', ' ')}
                                </span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                                    Risk Score
                                </label>
                                <span className={`font-bold ${getRiskScoreColor(selectedReview.threatResult.riskScore || 0)}`}>
                                    {((selectedReview.threatResult.riskScore || 0) * 100).toFixed(1)}%
                                </span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                                    Detection Reason
                                </label>
                                <p className="text-sm text-secondary-900 dark:text-white bg-secondary-50 dark:bg-secondary-900/20 p-3 rounded">
                                    {selectedReview.threatResult.reason}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                                    Original Prompt (Sanitized)
                                </label>
                                <p className="text-sm text-secondary-900 dark:text-white bg-secondary-50 dark:bg-secondary-900/20 p-3 rounded max-h-32 overflow-auto">
                                    {selectedReview.originalPrompt}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleReviewDecision(selectedReview.id, 'approved')}
                                    className="flex-1 px-4 py-2.5 bg-gradient-success hover:bg-gradient-success/90 text-white rounded-xl shadow-lg hover:shadow-xl glow-success transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-display font-semibold text-sm"
                                >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Approve Request
                                </button>
                                <button
                                    onClick={() => handleReviewDecision(selectedReview.id, 'denied')}
                                    className="flex-1 px-4 py-2.5 bg-gradient-danger hover:bg-gradient-danger/90 text-white rounded-xl shadow-lg hover:shadow-xl glow-danger transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-display font-semibold text-sm"
                                >
                                    <XCircleIcon className="w-4 h-4" />
                                    Deny Request
                                </button>
                                <button
                                    onClick={() => setSelectedReview(null)}
                                    className="px-4 py-2.5 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center gap-2 font-display font-semibold text-sm"
                                >
                                    <XMarkIcon className="w-4 h-4" />
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
