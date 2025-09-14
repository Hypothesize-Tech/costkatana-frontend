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
    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    };

    const formatPercentage = (num: number): string => {
        return `${num.toFixed(1)}%`;
    };

    const formatCurrency = (num: number): string => {
        if (num >= 1) return `$${num.toFixed(2)}`;
        if (num >= 0.01) return `$${num.toFixed(3)}`;
        if (num >= 0.001) return `$${num.toFixed(4)}`;
        return `$${num.toFixed(6)}`;
    };

    return (
        <div className={`glass rounded-xl p-6 border border-secondary-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-secondary-50/80 to-accent-50/60 dark:from-secondary-900/40 dark:to-accent-900/30 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-secondary-500 to-accent-500 text-white">
                        <SparklesIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-display font-semibold gradient-text-secondary">
                            Cortex Optimization Impact
                        </h3>
                        <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                            Advanced semantic analysis results
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-success-500" />
                    <span className="text-sm font-medium text-success-600 dark:text-success-400">
                        Optimized
                    </span>
                </div>
            </div>

            {/* Token Reduction Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="glass rounded-lg p-4 border border-secondary-200/20">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                            {metrics.tokenReduction.absoluteSavings >= 0 ? 'Tokens Saved' : 'Token Increase'}
                        </span>
                        <ChartBarIcon className="h-5 w-5 text-secondary-500" />
                    </div>
                    <div className="space-y-2">
                        <span className={`text-2xl font-display font-bold ${metrics.tokenReduction.absoluteSavings >= 0 ? 'gradient-text' : 'text-danger-600 dark:text-danger-400'}`}>
                            {formatNumber(Math.abs(metrics.tokenReduction.absoluteSavings))} ({Math.abs(metrics.tokenReduction.percentageSavings).toFixed(1)}%)
                        </span>
                        <div className="flex justify-between text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                            <span>Original: {formatNumber(metrics.tokenReduction.withoutCortex)}</span>
                            <span>Optimized: {formatNumber(metrics.tokenReduction.withCortex)}</span>
                        </div>
                    </div>
                </div>

                <div className="glass rounded-lg p-4 border border-secondary-200/20">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                            {metrics.costImpact.costSavings >= 0 ? 'Cost Saved' : 'Cost Increase'}
                        </span>
                        <CurrencyDollarIcon className="h-5 w-5 text-success-500" />
                    </div>
                    <div className="space-y-2">
                        <span className={`text-2xl font-display font-bold ${metrics.costImpact.costSavings >= 0 ? 'gradient-text-success' : 'text-danger-600 dark:text-danger-400'}`}>
                            {formatCurrency(Math.abs(metrics.costImpact.costSavings))} ({Math.abs(metrics.costImpact.savingsPercentage).toFixed(1)}%)
                        </span>
                        <div className="flex justify-between text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                            <span>Original: {formatCurrency(metrics.costImpact.estimatedCostWithoutCortex)}</span>
                            <span>Optimized: {formatCurrency(metrics.costImpact.actualCostWithCortex)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quality Metrics */}
            <div className="mb-6">
                <h4 className="text-md font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                    Quality Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-lg font-display font-bold gradient-text-secondary mb-1">
                            {metrics.qualityMetrics.clarityScore.toFixed(0)}%
                        </div>
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            Clarity Score
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-display font-bold gradient-text-secondary mb-1">
                            {metrics.qualityMetrics.completenessScore.toFixed(0)}%
                        </div>
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            Completeness
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-display font-bold gradient-text-secondary mb-1">
                            {metrics.qualityMetrics.relevanceScore.toFixed(0)}%
                        </div>
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            Relevance
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="mb-6">
                <h4 className="text-md font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                    Performance Impact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass rounded-lg p-3 border border-secondary-200/20 text-center">
                        <BoltIcon className="h-5 w-5 text-accent-500 mx-auto mb-2" />
                        <div className="text-lg font-display font-bold gradient-text-accent mb-1">
                            {metrics.performanceMetrics.processingTime}ms
                        </div>
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            Processing Time
                        </div>
                    </div>
                    <div className="glass rounded-lg p-3 border border-secondary-200/20 text-center">
                        <ArrowTrendingUpIcon className="h-5 w-5 text-primary-500 mx-auto mb-2" />
                        <div className="text-lg font-display font-bold gradient-text mb-1">
                            {metrics.performanceMetrics.responseLatency}ms
                        </div>
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            Response Latency
                        </div>
                    </div>
                    <div className="glass rounded-lg p-3 border border-secondary-200/20 text-center">
                        <ChartBarIcon className="h-5 w-5 text-success-500 mx-auto mb-2" />
                        <div className="text-lg font-display font-bold gradient-text-success mb-1">
                            {(metrics.performanceMetrics.compressionRatio * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            Compression Ratio
                        </div>
                    </div>
                </div>
            </div>

            {/* Optimization Techniques */}
            <div className="mb-6">
                <h4 className="text-md font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                    Applied Techniques
                </h4>
                <div className="flex flex-wrap gap-2">
                    {metrics.justification.optimizationTechniques.map((technique, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-secondary-100 to-accent-100 text-secondary-700 dark:from-secondary-800 dark:to-accent-800 dark:text-secondary-200 border border-secondary-200/30"
                        >
                            {technique}
                        </span>
                    ))}
                </div>
            </div>

            {/* Key Improvements */}
            <div className="mb-4">
                <h4 className="text-md font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                    Key Improvements
                </h4>
                <ul className="space-y-2">
                    {metrics.justification.keyImprovements.map((improvement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                            <CheckCircleIcon className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                {improvement}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Confidence Score */}
            <div className="flex items-center justify-between pt-4 border-t border-secondary-200/30">
                <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                    Optimization Confidence
                </span>
                <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-light-surface-secondary dark:bg-dark-surface-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-success-400 to-success-600 rounded-full transition-all duration-300"
                            style={{ width: `${metrics.justification.confidenceScore}%` }}
                        />
                    </div>
                    <span className="text-sm font-display font-semibold gradient-text-success">
                        {metrics.justification.confidenceScore.toFixed(0)}%
                    </span>
                </div>
            </div>
        </div>
    );
};