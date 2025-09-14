import React, { useState } from 'react';
import { CostAnalysis } from '../../services/unexplainedCost.service';

interface CostOptimizationPanelProps {
    analysis: CostAnalysis;
}

export const CostOptimizationPanel: React.FC<CostOptimizationPanelProps> = ({ analysis }) => {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'immediate' | 'short_term' | 'long_term'>('all');
    const [showDetailedPlan, setShowDetailedPlan] = useState(false);
    const [showScheduleReview, setShowScheduleReview] = useState(false);
    const [appliedRecommendations, setAppliedRecommendations] = useState<string[]>([]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4
        }).format(amount);
    };

    const getEffortColor = (effort: string) => {
        const colors: Record<string, string> = {
            low: 'badge-success',
            medium: 'badge-warning',
            high: 'badge-danger'
        };
        return colors[effort] || 'badge-secondary';
    };

    const getEffortIcon = (effort: string) => {
        const icons: Record<string, string> = {
            low: '🟢',
            medium: '🟡',
            high: '🔴'
        };
        return icons[effort] || '⚪';
    };

    const getTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            immediate: '⚡',
            short_term: '📅',
            long_term: '🎯'
        };
        return icons[type] || '❓';
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            immediate: 'glass border-danger-200/30 bg-gradient-to-br from-danger-50/50 to-danger-100/50 dark:from-danger-900/20 dark:to-danger-800/20',
            short_term: 'glass border-warning-200/30 bg-gradient-to-br from-warning-50/50 to-warning-100/50 dark:from-warning-900/20 dark:to-warning-800/20',
            long_term: 'glass border-primary-200/30 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20'
        };
        return colors[type] || 'glass border-accent-200/30 bg-gradient-to-br from-light-bg-secondary to-light-bg-tertiary dark:from-dark-bg-secondary dark:to-dark-bg-tertiary';
    };

    const filteredRecommendations = analysis.optimization_recommendations.filter(rec =>
        selectedFilter === 'all' || rec.type === selectedFilter
    );

    const totalPotentialSavings = analysis.optimization_recommendations.reduce(
        (sum, rec) => sum + rec.potential_savings, 0
    );

    const immediateSavings = analysis.optimization_recommendations
        .filter(rec => rec.type === 'immediate')
        .reduce((sum, rec) => sum + rec.potential_savings, 0);

    const shortTermSavings = analysis.optimization_recommendations
        .filter(rec => rec.type === 'short_term')
        .reduce((sum, rec) => sum + rec.potential_savings, 0);

    const longTermSavings = analysis.optimization_recommendations
        .filter(rec => rec.type === 'long_term')
        .reduce((sum, rec) => sum + rec.potential_savings, 0);

    const handleApplyImmediate = () => {
        const immediateRecs = analysis.optimization_recommendations.filter(r => r.type === 'immediate');
        const recNames = immediateRecs.map(r => r.description);
        setAppliedRecommendations(prev => [...prev, ...recNames]);

        // Simulate applying recommendations
        setTimeout(() => {
            alert(`Successfully applied ${immediateRecs.length} immediate recommendations!\n\nApplied:\n${recNames.map(name => `• ${name}`).join('\n')}\n\nThese optimizations are now active and will help reduce your costs.`);
        }, 500);
    };

    const handleScheduleReview = () => {
        setShowScheduleReview(true);
    };

    return (
        <div className="p-6 glass rounded-xl border border-accent-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-display font-bold gradient-text-primary">Cost Optimization</h2>
                    <p className="mt-1 text-light-text-secondary dark:text-dark-text-secondary">Actionable recommendations to reduce costs</p>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-display font-bold gradient-text-success">
                        {formatCurrency(totalPotentialSavings)}
                    </div>
                    <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">Total Savings Potential</div>
                </div>
            </div>

            {/* Savings Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 text-center glass rounded-xl border border-danger-200/30 backdrop-blur-xl bg-gradient-to-br from-danger-50/50 to-danger-100/50 dark:from-danger-900/20 dark:to-danger-800/20">
                    <div className="text-lg font-display font-bold text-danger-700 dark:text-danger-300">
                        {formatCurrency(immediateSavings)}
                    </div>
                    <div className="text-xs text-danger-600 dark:text-danger-400">Immediate</div>
                </div>

                <div className="p-3 text-center glass rounded-xl border border-warning-200/30 backdrop-blur-xl bg-gradient-to-br from-warning-50/50 to-warning-100/50 dark:from-warning-900/20 dark:to-warning-800/20">
                    <div className="text-lg font-display font-bold text-warning-700 dark:text-warning-300">
                        {formatCurrency(shortTermSavings)}
                    </div>
                    <div className="text-xs text-warning-600 dark:text-warning-400">Short Term</div>
                </div>

                <div className="p-3 text-center glass rounded-xl border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20">
                    <div className="text-lg font-display font-bold text-primary-700 dark:text-primary-300">
                        {formatCurrency(longTermSavings)}
                    </div>
                    <div className="text-xs text-primary-600 dark:text-primary-400">Long Term</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex p-1 mb-6 space-x-1 glass rounded-xl border border-accent-200/30 backdrop-blur-xl">
                <button
                    onClick={() => setSelectedFilter('all')}
                    className={`flex-1 px-3 py-2 text-sm font-display font-medium rounded-lg transition-all duration-300 hover:scale-105 ${selectedFilter === 'all'
                        ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                        : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
                        }`}
                >
                    All ({analysis.optimization_recommendations.length})
                </button>
                <button
                    onClick={() => setSelectedFilter('immediate')}
                    className={`flex-1 px-3 py-2 text-sm font-display font-medium rounded-lg transition-all duration-300 hover:scale-105 ${selectedFilter === 'immediate'
                        ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                        : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
                        }`}
                >
                    Immediate ({analysis.optimization_recommendations.filter(r => r.type === 'immediate').length})
                </button>
                <button
                    onClick={() => setSelectedFilter('short_term')}
                    className={`flex-1 px-3 py-2 text-sm font-display font-medium rounded-lg transition-all duration-300 hover:scale-105 ${selectedFilter === 'short_term'
                        ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                        : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
                        }`}
                >
                    Short Term ({analysis.optimization_recommendations.filter(r => r.type === 'short_term').length})
                </button>
                <button
                    onClick={() => setSelectedFilter('long_term')}
                    className={`flex-1 px-3 py-2 text-sm font-display font-medium rounded-lg transition-all duration-300 hover:scale-105 ${selectedFilter === 'long_term'
                        ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                        : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
                        }`}
                >
                    Long Term ({analysis.optimization_recommendations.filter(r => r.type === 'long_term').length})
                </button>
            </div>

            {/* Recommendations List */}
            <div className="space-y-4">
                {filteredRecommendations.map((recommendation, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg border ${getTypeColor(recommendation.type)}`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mt-1 mr-3">
                                    <span className="text-2xl">{getTypeIcon(recommendation.type)}</span>
                                </div>

                                <div className="flex-1">
                                    <h3 className="mb-2 text-sm font-display font-medium gradient-text-primary">
                                        {recommendation.description}
                                    </h3>

                                    <div className="flex items-center space-x-4 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                        <span className="flex items-center">
                                            <span className="mr-1">{getEffortIcon(recommendation.implementation_effort)}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-display font-medium ${getEffortColor(recommendation.implementation_effort)}`}>
                                                {recommendation.implementation_effort} effort
                                            </span>
                                        </span>

                                        <span className="flex items-center">
                                            <svg className="mr-1 w-4 h-4 text-success-600 dark:text-success-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2 1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="font-display font-medium text-success-700 dark:text-success-400">
                                                Save {formatCurrency(recommendation.potential_savings)}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        if (recommendation.type === 'immediate') {
                                            setAppliedRecommendations(prev => [...prev, recommendation.description]);
                                            alert(`Applied: ${recommendation.description}\n\nThis optimization is now active and will help reduce your costs.`);
                                        } else {
                                            alert(`This ${recommendation.type.replace('_', ' ')} recommendation requires planning and cannot be applied immediately.\n\nConsider scheduling a review to implement this optimization.`);
                                        }
                                    }}
                                    className={`btn-icon-secondary ${recommendation.type === 'immediate'
                                        ? 'text-success-600 dark:text-success-400 hover:text-success-700 dark:hover:text-success-300'
                                        : 'text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary'
                                        }`}
                                    title={recommendation.type === 'immediate' ? 'Apply Now' : 'Requires Planning'}
                                >
                                    {recommendation.type === 'immediate' ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2 1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>

                                <button
                                    onClick={() => {
                                        alert(`Details for: ${recommendation.description}\n\nType: ${recommendation.type.replace('_', ' ')}\nEffort: ${recommendation.implementation_effort}\nPotential Savings: ${formatCurrency(recommendation.potential_savings)}\n\nThis recommendation focuses on optimizing your cost drivers to reduce expenses.`);
                                    }}
                                    className="btn-icon-secondary"
                                    title="View Details"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="pt-6 mt-6 border-t border-accent-200/30">
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleApplyImmediate}
                        disabled={immediateSavings === 0}
                        className={`inline-flex items-center ${immediateSavings === 0
                            ? 'btn-secondary opacity-50 cursor-not-allowed'
                            : 'btn-success'
                            }`}
                    >
                        <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2 1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Apply All Immediate
                    </button>

                    <button
                        onClick={() => setShowDetailedPlan(true)}
                        className="btn-secondary inline-flex items-center"
                    >
                        <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        View Detailed Plan
                    </button>

                    <button
                        onClick={handleScheduleReview}
                        className="btn-secondary inline-flex items-center"
                    >
                        <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Schedule Review
                    </button>
                </div>
            </div>

            {/* Applied Recommendations Status */}
            {appliedRecommendations.length > 0 && (
                <div className="p-3 mt-4 glass rounded-xl border border-success-200/30 backdrop-blur-xl bg-gradient-to-br from-success-50/50 to-success-100/50 dark:from-success-900/20 dark:to-success-800/20">
                    <div className="flex items-center">
                        <svg className="mr-2 w-5 h-5 text-success-600 dark:text-success-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2 1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-display font-medium text-success-800 dark:text-success-300">
                            {appliedRecommendations.length} recommendation(s) applied
                        </span>
                    </div>
                </div>
            )}

            {/* Detailed Plan Modal */}
            {showDetailedPlan && (
                <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/50 backdrop-blur-sm">
                    <div className="glass rounded-xl border border-accent-200/30 shadow-2xl backdrop-blur-xl p-6 max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-display font-bold gradient-text-primary">Detailed Optimization Plan</h3>
                            <button
                                onClick={() => setShowDetailedPlan(false)}
                                className="btn-icon-secondary"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {['immediate', 'short_term', 'long_term'].map(type => {
                                const recommendations = analysis.optimization_recommendations.filter(r => r.type === type);
                                if (recommendations.length === 0) return null;

                                return (
                                    <div key={type} className="p-4 glass rounded-xl border border-accent-200/30 backdrop-blur-xl">
                                        <h4 className="mb-3 text-lg font-display font-bold gradient-text-primary capitalize">
                                            {type.replace('_', ' ')} Optimizations
                                        </h4>
                                        <div className="space-y-3">
                                            {recommendations.map((rec, index) => (
                                                <div key={index} className="flex items-start p-3 space-x-3 glass rounded-lg border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-light-bg-secondary to-light-bg-tertiary dark:from-dark-bg-secondary dark:to-dark-bg-tertiary">
                                                    <div className="flex-shrink-0 mt-1">
                                                        <span className="text-lg">{getTypeIcon(rec.type)}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 className="mb-1 font-display font-medium gradient-text-primary">{rec.description}</h5>
                                                        <div className="flex items-center space-x-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-display font-medium ${getEffortColor(rec.implementation_effort)}`}>
                                                                {rec.implementation_effort} effort
                                                            </span>
                                                            <span className="font-display font-medium text-success-700 dark:text-success-400">
                                                                Save {formatCurrency(rec.potential_savings)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Review Modal */}
            {showScheduleReview && (
                <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/50 backdrop-blur-sm">
                    <div className="p-6 max-w-md glass rounded-xl border border-accent-200/30 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-display font-bold gradient-text-primary">Schedule Cost Review</h3>
                            <button
                                onClick={() => setShowScheduleReview(false)}
                                className="btn-icon-secondary"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-light-text-secondary dark:text-dark-text-secondary">
                                Schedule a review with our cost optimization team to discuss implementation strategies for your recommendations.
                            </p>

                            <div className="p-3 glass rounded-lg border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20">
                                <div className="text-sm text-primary-800 dark:text-primary-300">
                                    <strong>Total Potential Savings:</strong> {formatCurrency(totalPotentialSavings)}
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        alert('Review scheduled! Our team will contact you within 24 hours to arrange a meeting.');
                                        setShowScheduleReview(false);
                                    }}
                                    className="flex-1 btn-primary"
                                >
                                    Schedule Now
                                </button>
                                <button
                                    onClick={() => setShowScheduleReview(false)}
                                    className="flex-1 btn-secondary"
                                >
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



