import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { securityService, SecurityAnalytics, SecurityMetrics, HumanReviewRequest } from '../services/security.service';

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
            <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    <div className="glass rounded-xl border border-error-200/30 bg-gradient-to-br from-error-50/30 to-error-100/30 p-6">
                        <div className="text-error-600 dark:text-error-400 text-sm mb-4">{error}</div>
                        <button
                            onClick={loadSecurityData}
                            className="btn-primary"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-8 mb-8">
                    <h1 className="text-4xl font-display font-bold gradient-text-primary mb-4">LLM Security Dashboard</h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                        Monitor and manage your AI security with comprehensive threat detection and analysis
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => exportSecurityReport('json')}
                            className="btn-secondary"
                        >
                            Export JSON Report
                        </button>
                        <button
                            onClick={() => exportSecurityReport('csv')}
                            className="btn-secondary"
                        >
                            Export CSV Report
                        </button>
                    </div>
                </div>

                {/* Security Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Threats Detected</p>
                                    <p className="text-2xl font-bold text-gray-900">{metrics?.totalThreatsDetected || 0}</p>
                                </div>
                                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-red-600 text-lg">⚠️</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Cost Saved</p>
                                    <p className="text-2xl font-bold text-green-600">${metrics?.totalCostSaved?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 text-lg">💰</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
                                    <p className={`text-2xl font-bold ${getRiskScoreColor(metrics?.averageRiskScore || 0)}`}>
                                        {((metrics?.averageRiskScore || 0) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 text-lg">📊</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Detection Rate</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {((analytics?.detectionRate || 0) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 text-lg">🎯</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Top Threat</p>
                                    <p className="text-sm font-bold text-gray-900 capitalize">
                                        {metrics?.mostCommonThreat?.replace('_', ' ') || 'None'}
                                    </p>
                                    <div className="mt-1">
                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${metrics?.detectionTrend === 'increasing' ? 'bg-red-100 text-red-800' :
                                            metrics?.detectionTrend === 'decreasing' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {metrics?.detectionTrend || 'stable'}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 text-lg">🔍</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Human Review Queue */}
                {pendingReviews.length > 0 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Pending Human Reviews ({pendingReviews.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pendingReviews.map((review) => (
                                    <div key={review.id} className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
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
                                                <p className="text-sm text-gray-700 mb-2">{review.threatResult.reason}</p>
                                                <p className="text-xs text-gray-500">
                                                    Request ID: {review.requestId} • Created: {new Date(review.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => setSelectedReview(review)}
                                                    className="px-3 py-1 text-sm border border-gray-300 text-gray-700 bg-white rounded hover:bg-gray-50"
                                                >
                                                    Review
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Threat Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Threat Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {analytics && Object.entries(analytics.threatDistribution).map(([threat, count]) => (
                                    <div key={threat} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getThreatBadgeColor(threat)}`}>
                                                {threat.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold">{count}</span>
                                    </div>
                                ))}
                                {!analytics?.threatDistribution || Object.keys(analytics.threatDistribution).length === 0 && (
                                    <p className="text-gray-500 text-center py-4">No threats detected recently</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Containment Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Containment Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {analytics && Object.entries(analytics.containmentActions).map(([action, count]) => (
                                    <div key={action} className="flex items-center justify-between">
                                        <span className="text-sm capitalize font-medium">{action.replace('_', ' ')}</span>
                                        <span className="text-sm font-semibold">{count}</span>
                                    </div>
                                ))}
                                {!analytics?.containmentActions || Object.keys(analytics.containmentActions).length === 0 && (
                                    <p className="text-gray-500 text-center py-4">No containment actions taken recently</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Risky Patterns */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Risky Patterns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Pattern</th>
                                        <th className="text-right py-2">Count</th>
                                        <th className="text-right py-2">Avg Risk Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics?.topRiskyPatterns?.slice(0, 10).map((pattern, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="py-2 font-mono text-xs">{pattern.pattern.slice(0, 100)}...</td>
                                            <td className="text-right py-2">{pattern.count}</td>
                                            <td className={`text-right py-2 font-semibold ${getRiskScoreColor(pattern.averageRiskScore)}`}>
                                                {(pattern.averageRiskScore * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                    {(!analytics?.topRiskyPatterns || analytics.topRiskyPatterns.length === 0) && (
                                        <tr>
                                            <td colSpan={3} className="text-center py-4 text-gray-500">
                                                No risky patterns detected recently
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Human Review Modal */}
            {selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
                        <CardHeader>
                            <CardTitle>Security Review Required</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Threat Category
                                </label>
                                <span className={`px-2 py-1 text-xs rounded-full ${getThreatBadgeColor(selectedReview.threatResult.threatCategory)}`}>
                                    {selectedReview.threatResult.threatCategory.replace('_', ' ')}
                                </span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Risk Score
                                </label>
                                <span className={`font-bold ${getRiskScoreColor(selectedReview.threatResult.riskScore || 0)}`}>
                                    {((selectedReview.threatResult.riskScore || 0) * 100).toFixed(1)}%
                                </span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Detection Reason
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                                    {selectedReview.threatResult.reason}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Original Prompt (Sanitized)
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded max-h-32 overflow-auto">
                                    {selectedReview.originalPrompt}
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleReviewDecision(selectedReview.id, 'approved')}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Approve Request
                                </button>
                                <button
                                    onClick={() => handleReviewDecision(selectedReview.id, 'denied')}
                                    className="px-4 py-2 border border-red-300 text-red-700 bg-white rounded hover:bg-red-50"
                                >
                                    Deny Request
                                </button>
                                <button
                                    onClick={() => setSelectedReview(null)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
