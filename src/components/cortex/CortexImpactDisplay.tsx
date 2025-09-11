import React from 'react';
import {
    ChartBarIcon,
    SparklesIcon,
    BoltIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface CortexImpactMetrics {
    tokenReduction: {
        withoutCortex: number;
        withCortex: number;
        absoluteSavings: number;
        percentageSavings: number;
    };
    qualityMetrics: {
        clarityScore: number;
        completenessScore: number;
        relevanceScore: number;
        ambiguityReduction: number;
        redundancyRemoval: number;
    };
    performanceMetrics: {
        processingTime: number;
        responseLatency: number;
        compressionRatio: number;
    };
    costImpact: {
        estimatedCostWithoutCortex: number;
        actualCostWithCortex: number;
        costSavings: number;
        savingsPercentage: number;
    };
    justification: {
        optimizationTechniques: string[];
        keyImprovements: string[];
        confidenceScore: number;
    };
}

interface CortexImpactDisplayProps {
    metrics: CortexImpactMetrics;
    className?: string;
}

export const CortexImpactDisplay: React.FC<CortexImpactDisplayProps> = ({
    metrics,
    className = ''
}) => {
    const formatNumber = (num: number) => {
        return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    };

    const formatCurrency = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 3,
            maximumFractionDigits: 4
        }).format(num);
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-blue-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBg = (score: number) => {
        if (score >= 90) return 'bg-green-100';
        if (score >= 70) return 'bg-blue-100';
        if (score >= 50) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header with Confidence Score */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2 text-indigo-600" />
                    Cortex Optimization Impact Analysis
                </h3>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBg(metrics.justification.confidenceScore)} ${getScoreColor(metrics.justification.confidenceScore)}`}>
                        {metrics.justification.confidenceScore}%
                    </span>
                </div>
            </div>

            {/* Token Reduction Comparison */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                    <ChartBarIcon className="w-4 h-4 mr-2" />
                    Token Usage Comparison
                </h4>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Without Cortex</p>
                        <p className="text-2xl font-bold text-gray-700">{formatNumber(metrics.tokenReduction.withoutCortex)}</p>
                        <p className="text-xs text-gray-500">tokens (estimated)</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">With Cortex</p>
                        <p className="text-2xl font-bold text-green-600">{formatNumber(metrics.tokenReduction.withCortex)}</p>
                        <p className="text-xs text-gray-500">tokens (actual)</p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-indigo-200">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tokens Saved</span>
                        <span className="text-lg font-bold text-green-600">
                            {formatNumber(metrics.tokenReduction.absoluteSavings)} ({metrics.tokenReduction.percentageSavings}%)
                        </span>
                    </div>
                </div>
            </div>

            {/* Quality Metrics */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
                    Quality Improvements
                </h4>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Clarity Score</span>
                        <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${metrics.qualityMetrics.clarityScore}%` }}
                                />
                            </div>
                            <span className={`text-sm font-medium ${getScoreColor(metrics.qualityMetrics.clarityScore)}`}>
                                {metrics.qualityMetrics.clarityScore}%
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completeness</span>
                        <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${metrics.qualityMetrics.completenessScore}%` }}
                                />
                            </div>
                            <span className={`text-sm font-medium ${getScoreColor(metrics.qualityMetrics.completenessScore)}`}>
                                {metrics.qualityMetrics.completenessScore}%
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Relevance</span>
                        <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${metrics.qualityMetrics.relevanceScore}%` }}
                                />
                            </div>
                            <span className={`text-sm font-medium ${getScoreColor(metrics.qualityMetrics.relevanceScore)}`}>
                                {metrics.qualityMetrics.relevanceScore}%
                            </span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Ambiguity Reduced</p>
                        <p className="text-lg font-bold text-green-600">{metrics.qualityMetrics.ambiguityReduction}%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Redundancy Removed</p>
                        <p className="text-lg font-bold text-green-600">{metrics.qualityMetrics.redundancyRemoval}%</p>
                    </div>
                </div>
            </div>

            {/* Cost Impact */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                    <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                    Cost Impact Analysis
                </h4>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Estimated Cost (No Cortex)</p>
                        <p className="text-xl font-bold text-gray-700">{formatCurrency(metrics.costImpact.estimatedCostWithoutCortex)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Actual Cost (With Cortex)</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(metrics.costImpact.actualCostWithCortex)}</p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Savings</span>
                        <span className="text-lg font-bold text-green-600">
                            {formatCurrency(metrics.costImpact.costSavings)} ({metrics.costImpact.savingsPercentage}%)
                        </span>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                    <BoltIcon className="w-4 h-4 mr-2" />
                    Performance Metrics
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-xs text-gray-500">Processing Time</p>
                        <p className="text-lg font-bold text-blue-600">{metrics.performanceMetrics.processingTime}ms</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Response Latency</p>
                        <p className="text-lg font-bold text-blue-600">{metrics.performanceMetrics.responseLatency}ms</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Compression Ratio</p>
                        <p className="text-lg font-bold text-green-600">{(metrics.performanceMetrics.compressionRatio * 100).toFixed(1)}%</p>
                    </div>
                </div>
            </div>

            {/* Optimization Techniques */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Optimization Techniques Applied</h4>
                <div className="space-y-2">
                    {metrics.justification.optimizationTechniques.map((technique, index) => (
                        <div key={index} className="flex items-start">
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{technique}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Key Improvements */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Key Improvements Achieved</h4>
                <div className="space-y-2">
                    {metrics.justification.keyImprovements.map((improvement, index) => (
                        <div key={index} className="flex items-start">
                            <SparklesIcon className="w-4 h-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{improvement}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
