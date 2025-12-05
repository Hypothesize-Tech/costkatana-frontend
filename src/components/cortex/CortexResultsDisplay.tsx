// src/components/cortex/CortexResultsDisplay.tsx
import React from 'react';
import {
    ChartBarIcon,
    ClockIcon,
    SparklesIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    CpuChipIcon,
    TrophyIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { OptimizationMetadata } from '../../types/optimization.types';

interface CortexResultsDisplayProps {
    metadata?: OptimizationMetadata;
    loading?: boolean;
    error?: string;
}

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'green' | 'blue' | 'purple' | 'yellow' | 'red';
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend = 'neutral',
    color = 'blue'
}) => {
    const colorClasses = {
        green: 'bg-gradient-success/10 text-success-700 dark:text-success-300 border border-success-200/30',
        blue: 'bg-gradient-primary/10 text-primary-700 dark:text-primary-300 border border-primary-200/30',
        purple: 'bg-gradient-accent/10 text-accent-700 dark:text-accent-300 border border-accent-200/30',
        yellow: 'bg-gradient-warning/10 text-warning-700 dark:text-warning-300 border border-warning-200/30',
        red: 'bg-gradient-danger/10 text-danger-700 dark:text-danger-300 border border-danger-200/30',
    };

    const iconBgClasses = {
        green: 'bg-gradient-success glow-success',
        blue: 'bg-gradient-primary glow-primary',
        purple: 'bg-gradient-accent glow-accent',
        yellow: 'bg-gradient-warning glow-warning',
        red: 'bg-gradient-danger glow-danger',
    };

    const trendIcons = {
        up: '↗️',
        down: '↘️',
        neutral: '📊',
    };

    return (
        <div className={`p-3 rounded-lg glass backdrop-blur-xl shadow-lg animate-fade-in hover:scale-105 transition-all duration-300 sm:p-4 md:p-6 md:rounded-xl ${colorClasses[color]}`}>
            <div className="flex flex-col gap-2 items-start justify-between sm:flex-row sm:items-center sm:gap-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className={`p-1.5 rounded-lg sm:p-2 ${iconBgClasses[color]}`}>
                        <Icon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                    </div>
                    <div>
                        <div className="text-xs font-display font-semibold sm:text-sm">{title}</div>
                        {subtitle && (
                            <div className="text-[10px] font-body opacity-75 mt-0.5 sm:text-xs sm:mt-1">{subtitle}</div>
                        )}
                    </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className="text-base font-display font-bold flex items-center space-x-1.5 gradient-text sm:text-lg md:text-xl sm:space-x-2">
                        <span>{value}</span>
                        <span className="text-sm sm:text-base md:text-lg">{trendIcons[trend]}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CortexResultsDisplay: React.FC<CortexResultsDisplayProps> = ({
    metadata,
    loading = false,
    error,
}) => {
    if (loading) {
        return (
            <div className="glass p-3 animate-fade-in shadow-2xl backdrop-blur-xl border border-primary-200/30 sm:p-4 md:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                    <div className="spinner"></div>
                    <div>
                        <div className="text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary sm:text-sm">Processing with Cortex...</div>
                        <div className="text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-xs">Optimizing semantic structure</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-danger/10 border border-danger-200/30 rounded-lg p-3 glass backdrop-blur-xl animate-scale-in sm:p-4 md:rounded-xl">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="bg-gradient-danger p-1.5 rounded-lg glow-danger sm:p-2">
                        <ExclamationTriangleIcon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                    </div>
                    <div>
                        <div className="text-xs font-display font-semibold text-danger-700 dark:text-danger-300 sm:text-sm">Cortex Processing Error</div>
                        <div className="text-[10px] font-body text-danger-600 dark:text-danger-400 mt-0.5 sm:text-xs sm:mt-1">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!metadata?.cortex) {
        return (
            <div className="glass p-3 animate-fade-in shadow-2xl backdrop-blur-xl border border-primary-200/30 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="bg-gradient-accent/20 p-1.5 rounded-lg sm:p-2">
                        <InformationCircleIcon className="h-4 w-4 text-accent-600 sm:h-5 sm:w-5" />
                    </div>
                    <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">No Cortex optimization data available</div>
                </div>
            </div>
        );
    }

    const cortex = metadata.cortex;
    const hasError = cortex.error || cortex.fallbackUsed;

    return (
        <div className="space-y-4 animate-fade-in sm:space-y-5 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 items-start justify-between sm:flex-row sm:items-center sm:gap-0">
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="bg-gradient-primary p-2 rounded-lg glow-primary sm:p-2.5 md:p-3 md:rounded-xl">
                            <SparklesIcon className="h-5 w-5 text-white sm:h-5.5 sm:w-5.5 md:h-6 md:w-6" />
                        </div>
                        <h3 className="text-lg font-display font-bold gradient-text sm:text-xl md:text-2xl">Cortex Results</h3>
                    </div>
                    {!hasError && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-display font-semibold bg-gradient-success text-white shadow-lg glow-success animate-pulse sm:px-3 sm:text-sm">
                            <CheckCircleIcon className="w-3.5 h-3.5 mr-1.5 sm:w-4 sm:h-4 sm:mr-2" />
                            Success
                        </span>
                    )}
                </div>

                {hasError && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-display font-semibold bg-gradient-warning text-white shadow-lg glow-warning sm:px-3 sm:text-sm">
                        <ExclamationTriangleIcon className="w-3.5 h-3.5 mr-1.5 sm:w-4 sm:h-4 sm:mr-2" />
                        Fallback Used
                    </span>
                )}
            </div>

            {/* Error Message */}
            {cortex.error && (
                <div className="bg-gradient-warning/10 border border-warning-200/30 rounded-lg p-3 glass backdrop-blur-xl animate-scale-in sm:p-4 md:rounded-xl">
                    <div className="text-xs font-body text-warning-700 dark:text-warning-300 leading-relaxed sm:text-sm">
                        <strong className="font-display font-semibold">Note:</strong> {cortex.error}
                        {cortex.fallbackUsed && " - Traditional optimization was used as fallback."}
                    </div>
                </div>
            )}

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                <MetricCard
                    title="Token Reduction"
                    value={`${Math.round(cortex.reductionPercentage)}%`}
                    subtitle={`${cortex.tokensSaved} tokens saved`}
                    icon={TrophyIcon}
                    trend="up"
                    color="green"
                />

                <MetricCard
                    title="Processing Time"
                    value={`${(cortex.processingTime / 1000).toFixed(1)}s`}
                    subtitle="3-stage pipeline"
                    icon={ClockIcon}
                    trend="neutral"
                    color="blue"
                />

                <MetricCard
                    title="Semantic Integrity"
                    value={`${Math.round(cortex.semanticIntegrity * 100)}%`}
                    subtitle="Meaning preserved"
                    icon={CheckCircleIcon}
                    trend={cortex.semanticIntegrity >= 0.95 ? 'up' : 'neutral'}
                    color={cortex.semanticIntegrity >= 0.95 ? 'green' : 'yellow'}
                />

                <MetricCard
                    title="Optimizations Applied"
                    value={cortex.optimizationsApplied}
                    subtitle="Semantic transformations"
                    icon={SparklesIcon}
                    trend="neutral"
                    color="purple"
                />
            </div>

            {/* Confidence Metrics */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-4">
                <MetricCard
                    title="Encoding Confidence"
                    value={`${Math.round(cortex.encodingConfidence * 100)}%`}
                    subtitle="Natural language → Cortex"
                    icon={ChartBarIcon}
                    trend={cortex.encodingConfidence >= 0.8 ? 'up' : 'neutral'}
                    color={cortex.encodingConfidence >= 0.8 ? 'green' : 'yellow'}
                />

                <MetricCard
                    title="Decoding Confidence"
                    value={`${Math.round(cortex.decodingConfidence * 100)}%`}
                    subtitle="Cortex → Natural language"
                    icon={ChartBarIcon}
                    trend={cortex.decodingConfidence >= 0.8 ? 'up' : 'neutral'}
                    color={cortex.decodingConfidence >= 0.8 ? 'green' : 'yellow'}
                />
            </div>

            {/* Model Information */}
            <div className="glass p-3 shadow-2xl backdrop-blur-xl border border-primary-200/30 sm:p-4 md:p-6">
                <div className="flex items-center space-x-2 mb-3 sm:space-x-3 sm:mb-4">
                    <div className="bg-gradient-secondary/20 p-1.5 rounded-lg sm:p-2">
                        <CpuChipIcon className="h-4 w-4 text-secondary-600 sm:h-5 sm:w-5" />
                    </div>
                    <h4 className="text-base font-display font-semibold gradient-text sm:text-lg">Processing Pipeline</h4>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-6 text-xs sm:text-sm">
                    <div className="glass p-3 rounded-lg border border-primary-200/30 sm:p-4 md:rounded-xl">
                        <div className="text-light-text-secondary dark:text-dark-text-secondary font-body mb-0.5 sm:mb-1">Encoder</div>
                        <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary break-words">{cortex.cortexModel?.encoder || 'Claude Haiku'}</div>
                    </div>
                    <div className="glass p-3 rounded-lg border border-primary-200/30 sm:p-4 md:rounded-xl">
                        <div className="text-light-text-secondary dark:text-dark-text-secondary font-body mb-0.5 sm:mb-1">Core Processor</div>
                        <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary break-words">{cortex.cortexModel?.core || 'Claude Haiku'}</div>
                    </div>
                    <div className="glass p-3 rounded-lg border border-primary-200/30 sm:p-4 md:rounded-xl">
                        <div className="text-light-text-secondary dark:text-dark-text-secondary font-body mb-0.5 sm:mb-1">Decoder</div>
                        <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary break-words">{cortex.cortexModel?.decoder || 'Claude Haiku'}</div>
                    </div>
                </div>
            </div>

            {/* Performance Summary */}
            <div className={`border rounded-lg p-4 glass backdrop-blur-xl text-center animate-scale-in sm:p-5 md:p-6 md:rounded-xl ${cortex.reductionPercentage < 0
                ? 'bg-gradient-danger/10 border-danger-200/30'
                : 'bg-gradient-primary/10 border-primary-200/30'
                }`}>
                <div className={`text-2xl font-display font-bold mb-2 sm:text-3xl sm:mb-2.5 md:text-4xl md:mb-3 ${cortex.reductionPercentage < 0
                    ? 'text-danger-600 dark:text-danger-400'
                    : 'gradient-text'
                    }`}>
                    {Math.abs(Math.round(cortex.reductionPercentage))}% Token {cortex.reductionPercentage < 0 ? 'Increase' : 'Reduction'}
                </div>
                <div className={`text-sm font-body mb-2 sm:text-base md:text-lg ${cortex.reductionPercentage < 0
                    ? 'text-danger-600 dark:text-danger-400'
                    : 'text-primary-600 dark:text-primary-400'
                    }`}>
                    {cortex.reductionPercentage < 0 ? (
                        <>
                            ⚠️ Cortex increased tokens by <span className="font-display font-semibold">{Math.abs(cortex.tokensSaved)}</span> while maintaining{' '}
                            <span className="font-display font-semibold">{Math.round(cortex.semanticIntegrity * 100)}%</span> semantic integrity
                        </>
                    ) : (
                        <>
                            Cortex achieved <span className="font-display font-semibold gradient-text">{cortex.tokensSaved}</span> token savings while maintaining{' '}
                            <span className="font-display font-semibold gradient-text">{Math.round(cortex.semanticIntegrity * 100)}%</span> semantic integrity
                        </>
                    )}
                </div>
                {!hasError && cortex.reductionPercentage >= 0 && (
                    <div className="text-xs font-body text-primary-500 dark:text-primary-400 mt-2 flex items-center justify-center space-x-1.5 sm:text-sm sm:mt-3 sm:space-x-2">
                        <span>✨</span>
                        <span>Optimized using advanced semantic processing</span>
                        <span>✨</span>
                    </div>
                )}
            </div>

            {/* Debug Information (Development) */}
            {cortex.detailsForDebugging && import.meta.env?.DEV && (
                <details className="glass shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-lg sm:rounded-xl">
                    <summary className="px-3 py-2 cursor-pointer text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary hover:text-primary-500 transition-colors duration-300 sm:px-4 sm:py-3 sm:text-sm">
                        Debug Information
                    </summary>
                    <div className="px-3 pb-3 text-[10px] font-mono text-light-text-secondary dark:text-dark-text-secondary sm:px-4 sm:pb-4 sm:text-xs">
                        <pre className="whitespace-pre-wrap bg-dark-bg-primary text-dark-text-primary p-2 rounded-lg overflow-auto sm:p-3">
                            {JSON.stringify(cortex.detailsForDebugging, null, 2)}
                        </pre>
                    </div>
                </details>
            )}
        </div>
    );
};
