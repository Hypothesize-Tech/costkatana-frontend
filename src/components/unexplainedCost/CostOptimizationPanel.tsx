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
            low: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-red-100 text-red-800'
        };
        return colors[effort] || 'bg-gray-100 text-gray-800';
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
            immediate: 'bg-red-50 border-red-200',
            short_term: 'bg-yellow-50 border-yellow-200',
            long_term: 'bg-blue-50 border-blue-200'
        };
        return colors[type] || 'bg-gray-50 border-gray-200';
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
        <div className="p-6 bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Cost Optimization</h2>
                    <p className="mt-1 text-gray-600">Actionable recommendations to reduce costs</p>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(totalPotentialSavings)}
                    </div>
                    <div className="text-sm text-gray-500">Total Savings Potential</div>
                </div>
            </div>

            {/* Savings Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 text-center bg-red-50 rounded-lg border border-red-200">
                    <div className="text-lg font-bold text-red-700">
                        {formatCurrency(immediateSavings)}
                    </div>
                    <div className="text-xs text-red-600">Immediate</div>
                </div>

                <div className="p-3 text-center bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-lg font-bold text-yellow-700">
                        {formatCurrency(shortTermSavings)}
                    </div>
                    <div className="text-xs text-yellow-600">Short Term</div>
                </div>

                <div className="p-3 text-center bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-lg font-bold text-blue-700">
                        {formatCurrency(longTermSavings)}
                    </div>
                    <div className="text-xs text-blue-600">Long Term</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex p-1 mb-6 space-x-1 bg-gray-100 rounded-lg">
                <button
                    onClick={() => setSelectedFilter('all')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${selectedFilter === 'all'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    All ({analysis.optimization_recommendations.length})
                </button>
                <button
                    onClick={() => setSelectedFilter('immediate')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${selectedFilter === 'immediate'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Immediate ({analysis.optimization_recommendations.filter(r => r.type === 'immediate').length})
                </button>
                <button
                    onClick={() => setSelectedFilter('short_term')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${selectedFilter === 'short_term'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Short Term ({analysis.optimization_recommendations.filter(r => r.type === 'short_term').length})
                </button>
                <button
                    onClick={() => setSelectedFilter('long_term')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${selectedFilter === 'long_term'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
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
                                    <h3 className="mb-2 text-sm font-medium text-gray-900">
                                        {recommendation.description}
                                    </h3>

                                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                                        <span className="flex items-center">
                                            <span className="mr-1">{getEffortIcon(recommendation.implementation_effort)}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffortColor(recommendation.implementation_effort)}`}>
                                                {recommendation.implementation_effort} effort
                                            </span>
                                        </span>

                                        <span className="flex items-center">
                                            <svg className="mr-1 w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2 1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="font-medium text-green-700">
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
                                    className={`p-2 rounded-md hover:bg-gray-100 ${recommendation.type === 'immediate'
                                            ? 'text-green-600 hover:text-green-700'
                                            : 'text-gray-400 hover:text-gray-600'
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
                                    className="p-2 text-gray-400 rounded-md hover:text-gray-600 hover:bg-gray-100"
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
            <div className="pt-6 mt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleApplyImmediate}
                        disabled={immediateSavings === 0}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${immediateSavings === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                    >
                        <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2 1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Apply All Immediate
                    </button>

                    <button
                        onClick={() => setShowDetailedPlan(true)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        View Detailed Plan
                    </button>

                    <button
                        onClick={handleScheduleReview}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                <div className="p-3 mt-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                        <svg className="mr-2 w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2 1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-green-800">
                            {appliedRecommendations.length} recommendation(s) applied
                        </span>
                    </div>
                </div>
            )}

            {/* Detailed Plan Modal */}
            {showDetailedPlan && (
                <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Detailed Optimization Plan</h3>
                            <button
                                onClick={() => setShowDetailedPlan(false)}
                                className="text-gray-400 hover:text-gray-600"
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
                                    <div key={type} className="p-4 rounded-lg border">
                                        <h4 className="mb-3 text-lg font-semibold text-gray-900 capitalize">
                                            {type.replace('_', ' ')} Optimizations
                                        </h4>
                                        <div className="space-y-3">
                                            {recommendations.map((rec, index) => (
                                                <div key={index} className="flex items-start p-3 space-x-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-shrink-0 mt-1">
                                                        <span className="text-lg">{getTypeIcon(rec.type)}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 className="mb-1 font-medium text-gray-900">{rec.description}</h5>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffortColor(rec.implementation_effort)}`}>
                                                                {rec.implementation_effort} effort
                                                            </span>
                                                            <span className="font-medium text-green-700">
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
                <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
                    <div className="p-6 max-w-md bg-white rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Schedule Cost Review</h3>
                            <button
                                onClick={() => setShowScheduleReview(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-gray-600">
                                Schedule a review with our cost optimization team to discuss implementation strategies for your recommendations.
                            </p>

                            <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="text-sm text-blue-800">
                                    <strong>Total Potential Savings:</strong> {formatCurrency(totalPotentialSavings)}
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        alert('Review scheduled! Our team will contact you within 24 hours to arrange a meeting.');
                                        setShowScheduleReview(false);
                                    }}
                                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Schedule Now
                                </button>
                                <button
                                    onClick={() => setShowScheduleReview(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50"
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



