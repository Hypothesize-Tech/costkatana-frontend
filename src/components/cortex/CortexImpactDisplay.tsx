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

    const formatCurrency = (num: number): string => {
        if (num >= 1) return `$${num.toFixed(2)}`;
        if (num >= 0.01) return `$${num.toFixed(3)}`;
        if (num >= 0.001) return `$${num.toFixed(4)}`;
        return `$${num.toFixed(6)}`;
    };

    return (
        <div className={`glass rounded-lg p-3 border border-secondary-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-secondary-50/80 to-accent-50/60 dark:from-secondary-900/40 dark:to-accent-900/30 sm:p-4 md:p-6 md:rounded-xl ${className}`}>
            {/* Header */}
            <div className="flex flex-col gap-3 items-start justify-between mb-4 sm:flex-row sm:items-center sm:mb-5 md:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-secondary-500 to-accent-500 text-white sm:p-2">
                        <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-display font-semibold gradient-text-secondary sm:text-lg">
                            Cortex Optimization Impact
                        </h3>
                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                            Advanced semantic analysis results
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 sm:h-5 sm:w-5" />
                    <span className="text-xs font-medium text-success-600 dark:text-success-400 sm:text-sm">
                        Optimized
                    </span>
                </div>
            </div>

            {/* Token Reduction Stats */}
            <div className="grid grid-cols-1 gap-4 mb-4 sm:gap-5 sm:mb-5 md:grid-cols-2 md:gap-6 md:mb-6">
                <div className="glass rounded-lg p-3 border border-secondary-200/20 sm:p-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary sm:text-base md:text-lg">
                            {metrics.tokenReduction.absoluteSavings >= 0 ? 'Tokens Saved' : 'Token Increase'}
                        </span>
                        <ChartBarIcon className="h-4 w-4 text-secondary-500 sm:h-5 sm:w-5" />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                        <span className={`text-lg font-display font-bold sm:text-xl md:text-2xl ${metrics.tokenReduction.absoluteSavings >= 0 ? 'gradient-text' : 'text-danger-600 dark:text-danger-400'}`}>
                            {formatNumber(Math.abs(metrics.tokenReduction.absoluteSavings))} ({Math.abs(metrics.tokenReduction.percentageSavings).toFixed(1)}%)
                        </span>
                        {metrics.tokenReduction.absoluteSavings < 0 && (
                            <div className="text-[10px] font-body text-danger-600 dark:text-danger-400 flex items-center gap-1 sm:text-xs">
                                ⚠️ Cortex increased tokens instead of reducing them
                            </div>
                        )}
                        <div className="flex flex-col gap-1 justify-between text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:flex-row sm:text-sm">
                            <span>Expected: {formatNumber(metrics.tokenReduction.withoutCortex)}</span>
                            <span>Actual: {formatNumber(metrics.tokenReduction.withCortex)}</span>
                        </div>
                    </div>
                </div>

                <div className="glass rounded-lg p-3 border border-secondary-200/20 sm:p-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary sm:text-base md:text-lg">
                            {metrics.costImpact.costSavings >= 0 ? 'Cost Saved' : 'Cost Increase'}
                        </span>
                        <CurrencyDollarIcon className="h-4 w-4 text-success-500 sm:h-5 sm:w-5" />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                        <span className={`text-lg font-display font-bold sm:text-xl md:text-2xl ${metrics.costImpact.costSavings >= 0 ? 'gradient-text-success' : 'text-danger-600 dark:text-danger-400'}`}>
                            {formatCurrency(Math.abs(metrics.costImpact.costSavings))} ({Math.abs(metrics.costImpact.savingsPercentage).toFixed(1)}%)
                        </span>
                        <div className="flex flex-col gap-1 justify-between text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:flex-row sm:text-sm">
                            <span>Original: {formatCurrency(metrics.costImpact.estimatedCostWithoutCortex)}</span>
                            <span>Optimized: {formatCurrency(metrics.costImpact.actualCostWithCortex)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quality Metrics */}
            <div className="mb-4 sm:mb-5 md:mb-6">
                <h4 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 sm:text-base sm:mb-3">
                    Quality Metrics
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:gap-4">
                    <div className="text-center">
                        <div className="text-base font-display font-bold gradient-text-secondary mb-0.5 sm:text-lg sm:mb-1">
                            {metrics.qualityMetrics.clarityScore.toFixed(0)}%
                        </div>
                        <div className="text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-xs">
                            Clarity Score
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-base font-display font-bold gradient-text-secondary mb-0.5 sm:text-lg sm:mb-1">
                            {metrics.qualityMetrics.completenessScore.toFixed(0)}%
                        </div>
                        <div className="text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-xs">
                            Completeness
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-base font-display font-bold gradient-text-secondary mb-0.5 sm:text-lg sm:mb-1">
                            {metrics.qualityMetrics.relevanceScore.toFixed(0)}%
                        </div>
                        <div className="text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-xs">
                            Relevance
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="mb-4 sm:mb-5 md:mb-6">
                <h4 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 sm:text-base sm:mb-3">
                    Performance Impact
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3 md:gap-4">
                    <div className="glass rounded-lg p-2.5 border border-secondary-200/20 text-center sm:p-3">
                        <BoltIcon className="h-4 w-4 text-accent-500 mx-auto mb-1.5 sm:h-5 sm:w-5 sm:mb-2" />
                        <div className="text-base font-display font-bold gradient-text-accent mb-0.5 sm:text-lg sm:mb-1">
                            {metrics.performanceMetrics.processingTime}ms
                        </div>
                        <div className="text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-xs">
                            Processing Time
                        </div>
                    </div>
                    <div className="glass rounded-lg p-2.5 border border-secondary-200/20 text-center sm:p-3">
                        <ArrowTrendingUpIcon className="h-4 w-4 text-primary-500 mx-auto mb-1.5 sm:h-5 sm:w-5 sm:mb-2" />
                        <div className="text-base font-display font-bold gradient-text mb-0.5 sm:text-lg sm:mb-1">
                            {metrics.performanceMetrics.responseLatency}ms
                        </div>
                        <div className="text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-xs">
                            Response Latency
                        </div>
                    </div>
                    <div className="glass rounded-lg p-2.5 border border-secondary-200/20 text-center sm:p-3">
                        <ChartBarIcon className="h-4 w-4 text-success-500 mx-auto mb-1.5 sm:h-5 sm:w-5 sm:mb-2" />
                        <div className="text-base font-display font-bold gradient-text-success mb-0.5 sm:text-lg sm:mb-1">
                            {(metrics.performanceMetrics.compressionRatio * 100).toFixed(1)}%
                        </div>
                        <div className="text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-xs">
                            Compression Ratio
                        </div>
                    </div>
                </div>
            </div>

            {/* Optimization Techniques */}
            <div className="mb-4 sm:mb-5 md:mb-6">
                <h4 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 sm:text-base sm:mb-3">
                    Applied Techniques
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {metrics.justification.optimizationTechniques.map((technique, index) => (
                        <span
                            key={index}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r from-secondary-100 to-accent-100 text-secondary-700 dark:from-secondary-800 dark:to-accent-800 dark:text-secondary-200 border border-secondary-200/30 sm:px-3 sm:py-1 sm:text-xs"
                        >
                            {technique}
                        </span>
                    ))}
                </div>
            </div>

            {/* Key Improvements */}
            <div className="mb-3 sm:mb-4">
                <h4 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 sm:text-base sm:mb-3">
                    Key Improvements
                </h4>
                <ul className="space-y-1.5 sm:space-y-2">
                    {metrics.justification.keyImprovements.map((improvement, index) => (
                        <li key={index} className="flex items-start space-x-1.5 sm:space-x-2">
                            <CheckCircleIcon className="h-3.5 w-3.5 text-success-500 mt-0.5 flex-shrink-0 sm:h-4 sm:w-4" />
                            <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                                {improvement}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Confidence Score */}
            <div className="flex flex-col gap-2 items-start justify-between pt-3 border-t border-secondary-200/30 sm:flex-row sm:items-center sm:pt-4 sm:gap-0">
                <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                    Optimization Confidence
                </span>
                <div className="flex items-center space-x-1.5 w-full sm:w-auto sm:space-x-2">
                    <div className="flex-1 h-1.5 bg-light-surface-secondary dark:bg-dark-surface-secondary rounded-full overflow-hidden sm:w-24 sm:h-2 sm:flex-none">
                        <div
                            className="h-full bg-gradient-to-r from-success-400 to-success-600 rounded-full transition-all duration-300"
                            style={{ width: `${metrics.justification.confidenceScore}%` }}
                        />
                    </div>
                    <span className="text-xs font-display font-semibold gradient-text-success sm:text-sm">
                        {metrics.justification.confidenceScore.toFixed(0)}%
                    </span>
                </div>
            </div>
        </div>
    );
};