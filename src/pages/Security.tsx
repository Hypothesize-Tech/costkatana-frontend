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
            <div className="px-3 py-4 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient sm:px-4 sm:py-6 md:px-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-md">
                    <div className="p-4 bg-gradient-to-br rounded-xl border glass border-danger-200/30 from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20 sm:p-6">
                        <div className="mb-4 text-xs text-danger-600 dark:text-danger-400 font-body sm:text-sm">{error}</div>
                        <button
                            onClick={loadSecurityData}
                            className="flex gap-2 items-center justify-center btn btn-primary w-full sm:w-auto"
                        >
                            <RotateCw className="w-4 h-4" />
                            <span className="text-xs sm:text-sm">Retry</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-3 py-4 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient sm:px-4 sm:py-6 md:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="p-4 mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6 lg:p-8 lg:mb-8">
                    <h1 className="mb-3 text-2xl font-bold font-display gradient-text-primary sm:text-3xl lg:text-4xl lg:mb-4">LLM Security Dashboard</h1>
                    <p className="mb-4 text-sm text-secondary-600 dark:text-secondary-300 sm:text-base lg:mb-6">
                        Monitor and manage your AI security with comprehensive threat detection and analysis
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                        <button
                            onClick={() => exportSecurityReport('json')}
                            className="flex gap-2 items-center justify-center btn btn-secondary w-full sm:w-auto"
                        >
                            <FileText className="w-4 h-4" />
                            <span className="text-sm sm:text-base">Export JSON Report</span>
                        </button>
                        <button
                            onClick={() => exportSecurityReport('csv')}
                            className="flex gap-2 items-center justify-center btn btn-secondary w-full sm:w-auto"
                        >
                            <Table className="w-4 h-4" />
                            <span className="text-sm sm:text-base">Export CSV Report</span>
                        </button>
                    </div>
                </div>

                {/* Security Metrics Cards */}
                <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-6 lg:mb-8">
                    <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover sm:p-5 lg:p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs font-medium text-secondary-600 dark:text-secondary-300 sm:text-sm">Threats Detected</p>
                                <p className="text-xl font-bold font-display text-secondary-900 dark:text-white sm:text-2xl">{metrics?.totalThreatsDetected || 0}</p>
                            </div>
                            <div className="p-2 bg-gradient-to-br rounded-xl from-danger-500/20 to-danger-600/20 dark:from-danger-900/30 dark:to-danger-800/30 sm:p-3">
                                <AlertTriangle className="w-4 h-4 text-danger-600 dark:text-danger-400 sm:w-5 sm:h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover sm:p-5 lg:p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs font-medium text-secondary-600 dark:text-secondary-300 sm:text-sm">Cost Saved</p>
                                <p className="text-xl font-bold font-display text-success-600 dark:text-success-400 sm:text-2xl">${metrics?.totalCostSaved?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div className="p-2 bg-gradient-to-br rounded-xl from-success-500/20 to-success-600/20 dark:from-success-900/30 dark:to-success-800/30 sm:p-3">
                                <DollarSign className="w-4 h-4 text-success-600 dark:text-success-400 sm:w-5 sm:h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover sm:p-5 lg:p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs font-medium text-secondary-600 dark:text-secondary-300 sm:text-sm">Avg Risk Score</p>
                                <p className={`text-xl font-display font-bold sm:text-2xl ${getRiskScoreColor(metrics?.averageRiskScore || 0)}`}>
                                    {((metrics?.averageRiskScore || 0) * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-2 bg-gradient-to-br rounded-xl from-highlight-500/20 to-highlight-600/20 dark:from-highlight-900/30 dark:to-highlight-800/30 sm:p-3">
                                <BarChart3 className="w-4 h-4 text-highlight-600 dark:text-highlight-400 sm:w-5 sm:h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover sm:p-5 lg:p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs font-medium text-secondary-600 dark:text-secondary-300 sm:text-sm">Detection Rate</p>
                                <p className="text-xl font-bold font-display text-primary-600 dark:text-primary-400 sm:text-2xl">
                                    {((analytics?.detectionRate || 0) * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-2 bg-gradient-to-br rounded-xl from-primary-500/20 to-primary-600/20 dark:from-primary-900/30 dark:to-primary-800/30 sm:p-3">
                                <Target className="w-4 h-4 text-primary-600 dark:text-primary-400 sm:w-5 sm:h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover sm:p-5 lg:p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs font-medium text-secondary-600 dark:text-secondary-300 sm:text-sm">Top Threat</p>
                                <p className="text-xs font-bold capitalize text-secondary-900 dark:text-white sm:text-sm">
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
                            <div className="p-2 bg-gradient-to-br rounded-xl from-accent-500/20 to-accent-600/20 dark:from-accent-900/30 dark:to-accent-800/30 sm:p-3">
                                <Search className="w-4 h-4 text-accent-600 dark:text-accent-400 sm:w-5 sm:h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Human Review Queue */}
                {pendingReviews.length > 0 && (
                    <div className="mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel lg:mb-8">
                        <div className="p-4 border-b border-primary-200/30 sm:p-5 lg:p-6">
                            <h2 className="text-lg font-bold font-display text-secondary-900 dark:text-white sm:text-xl">Pending Human Reviews ({pendingReviews.length})</h2>
                        </div>
                        <div className="p-4 sm:p-5 lg:p-6">
                            <div className="space-y-3 sm:space-y-4">
                                {pendingReviews.map((review) => (
                                    <div key={review.id} className="p-3 bg-gradient-to-br rounded-lg border glass border-warning-200/30 from-warning-50/30 to-accent-50/30 dark:from-warning-900/20 dark:to-accent-900/20 sm:p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap gap-2 items-center mb-2">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getThreatBadgeColor(review.threatResult.threatCategory)}`}>
                                                        {review.threatResult.threatCategory.replace('_', ' ')}
                                                    </span>
                                                    <span className={`text-xs font-semibold sm:text-sm ${getRiskScoreColor(review.threatResult.riskScore || 0)}`}>
                                                        Risk: {((review.threatResult.riskScore || 0) * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                                <p className="mb-2 text-xs text-secondary-700 dark:text-secondary-300 sm:text-sm break-words">{review.threatResult.reason}</p>
                                                <p className="text-xs text-secondary-500 dark:text-secondary-400 break-all">
                                                    Request ID: {review.requestId} • Created: {new Date(review.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 sm:ml-4 sm:flex-shrink-0">
                                                <button
                                                    onClick={() => setSelectedReview(review)}
                                                    className="flex gap-2 items-center justify-center btn btn-secondary w-full sm:w-auto"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span className="text-xs sm:text-sm">Review</span>
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
                <div className="grid grid-cols-1 gap-4 mb-6 sm:gap-6 lg:grid-cols-2 lg:gap-8 lg:mb-8">
                    {/* Threat Distribution */}
                    <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="p-4 border-b border-primary-200/30 sm:p-5 lg:p-6">
                            <h2 className="text-lg font-bold font-display text-secondary-900 dark:text-white sm:text-xl">Threat Distribution</h2>
                        </div>
                        <div className="p-4 sm:p-5 lg:p-6">
                            <div className="space-y-2 sm:space-y-3">
                                {analytics && Object.entries(analytics.threatDistribution).map(([threat, count]) => (
                                    <div key={threat} className="flex justify-between items-center">
                                        <div className="flex gap-2 items-center min-w-0 flex-1">
                                            <span className={`px-2 py-1 text-xs rounded-full truncate ${getThreatBadgeColor(threat)}`}>
                                                {threat.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold text-secondary-900 dark:text-white sm:text-sm ml-2 flex-shrink-0">{count}</span>
                                    </div>
                                ))}
                                {!analytics?.threatDistribution || Object.keys(analytics.threatDistribution).length === 0 && (
                                    <p className="py-4 text-xs text-center text-secondary-500 dark:text-secondary-400 sm:text-sm">No threats detected recently</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Containment Actions */}
                    <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="p-4 border-b border-primary-200/30 sm:p-5 lg:p-6">
                            <h2 className="text-lg font-bold font-display text-secondary-900 dark:text-white sm:text-xl">Containment Actions</h2>
                        </div>
                        <div className="p-4 sm:p-5 lg:p-6">
                            <div className="space-y-2 sm:space-y-3">
                                {analytics && Object.entries(analytics.containmentActions).map(([action, count]) => (
                                    <div key={action} className="flex justify-between items-center">
                                        <span className="text-xs font-medium capitalize text-secondary-700 dark:text-secondary-300 sm:text-sm truncate flex-1 min-w-0">{action.replace('_', ' ')}</span>
                                        <span className="text-xs font-semibold text-secondary-900 dark:text-white sm:text-sm ml-2 flex-shrink-0">{count}</span>
                                    </div>
                                ))}
                                {!analytics?.containmentActions || Object.keys(analytics.containmentActions).length === 0 && (
                                    <p className="py-4 text-xs text-center text-secondary-500 dark:text-secondary-400 sm:text-sm">No containment actions taken recently</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Risky Patterns */}
                <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="p-4 border-b border-primary-200/30 sm:p-5 lg:p-6">
                        <h2 className="text-lg font-bold font-display text-secondary-900 dark:text-white sm:text-xl">Top Risky Patterns</h2>
                    </div>
                    <div className="p-3 sm:p-4 lg:p-6">
                        <div className="overflow-x-auto -mx-3 sm:mx-0">
                            <div className="inline-block min-w-full align-middle">
                                <table className="min-w-full text-xs sm:text-sm">
                                    <thead>
                                        <tr className="border-b border-primary-200/30">
                                            <th className="py-2 px-2 font-semibold text-left text-secondary-700 dark:text-secondary-300 font-display sm:px-4">Pattern</th>
                                            <th className="py-2 px-2 font-semibold text-right text-secondary-700 dark:text-secondary-300 font-display sm:px-4">Count</th>
                                            <th className="py-2 px-2 font-semibold text-right text-secondary-700 dark:text-secondary-300 font-display sm:px-4">Avg Risk Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics?.topRiskyPatterns?.slice(0, 10).map((pattern, index) => (
                                            <tr key={index} className="border-b border-primary-200/20 hover:bg-primary-50/30 dark:hover:bg-primary-900/10">
                                                <td className="py-2 px-2 font-mono text-xs text-secondary-700 dark:text-secondary-300 sm:px-4 max-w-[200px] sm:max-w-none truncate sm:whitespace-normal">{pattern.pattern.slice(0, 50)}...</td>
                                                <td className="py-2 px-2 text-right text-secondary-900 dark:text-white sm:px-4 whitespace-nowrap">{pattern.count}</td>
                                                <td className={`text-right py-2 px-2 font-semibold sm:px-4 whitespace-nowrap ${getRiskScoreColor(pattern.averageRiskScore)}`}>
                                                    {(pattern.averageRiskScore * 100).toFixed(1)}%
                                                </td>
                                            </tr>
                                        ))}
                                        {(!analytics?.topRiskyPatterns || analytics.topRiskyPatterns.length === 0) && (
                                            <tr>
                                                <td colSpan={3} className="py-4 text-center text-xs text-secondary-500 dark:text-secondary-400 sm:text-sm">
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
            </div>

            {/* Human Review Modal */}
            {selectedReview && (
                <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50 p-3 sm:p-4">
                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-auto">
                        <div className="p-4 border-b border-primary-200/30 sm:p-5 lg:p-6">
                            <h2 className="text-lg font-bold font-display text-secondary-900 dark:text-white sm:text-xl">Security Review Required</h2>
                        </div>
                        <div className="p-4 space-y-3 sm:p-5 sm:space-y-4 lg:p-6">
                            <div>
                                <label className="block mb-1 text-xs font-medium text-secondary-700 dark:text-secondary-300 sm:text-sm">
                                    Threat Category
                                </label>
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getThreatBadgeColor(selectedReview.threatResult.threatCategory)}`}>
                                    {selectedReview.threatResult.threatCategory.replace('_', ' ')}
                                </span>
                            </div>

                            <div>
                                <label className="block mb-1 text-xs font-medium text-secondary-700 dark:text-secondary-300 sm:text-sm">
                                    Risk Score
                                </label>
                                <span className={`text-sm font-bold sm:text-base ${getRiskScoreColor(selectedReview.threatResult.riskScore || 0)}`}>
                                    {((selectedReview.threatResult.riskScore || 0) * 100).toFixed(1)}%
                                </span>
                            </div>

                            <div>
                                <label className="block mb-1 text-xs font-medium text-secondary-700 dark:text-secondary-300 sm:text-sm">
                                    Detection Reason
                                </label>
                                <p className="p-3 text-xs rounded text-secondary-900 dark:text-white bg-secondary-50 dark:bg-secondary-900/20 sm:text-sm break-words">
                                    {selectedReview.threatResult.reason}
                                </p>
                            </div>

                            <div>
                                <label className="block mb-1 text-xs font-medium text-secondary-700 dark:text-secondary-300 sm:text-sm">
                                    Original Prompt (Sanitized)
                                </label>
                                <p className="overflow-auto p-3 max-h-32 text-xs rounded text-secondary-900 dark:text-white bg-secondary-50 dark:bg-secondary-900/20 sm:text-sm break-words">
                                    {selectedReview.originalPrompt}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 pt-2">
                                <button
                                    onClick={() => handleReviewDecision(selectedReview.id, 'approved')}
                                    className="flex flex-1 gap-2 justify-center items-center btn btn-success w-full sm:w-auto"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-xs sm:text-sm">Approve Request</span>
                                </button>
                                <button
                                    onClick={() => handleReviewDecision(selectedReview.id, 'denied')}
                                    className="flex flex-1 gap-2 justify-center items-center btn btn-danger w-full sm:w-auto"
                                >
                                    <XCircle className="w-4 h-4" />
                                    <span className="text-xs sm:text-sm">Deny Request</span>
                                </button>
                                <button
                                    onClick={() => setSelectedReview(null)}
                                    className="flex gap-2 justify-center items-center btn btn-ghost w-full sm:w-auto"
                                >
                                    <X className="w-4 h-4" />
                                    <span className="text-xs sm:text-sm">Cancel</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
