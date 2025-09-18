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
    icon: React.ComponentType<any>;
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
        <div className={`p-6 rounded-xl glass backdrop-blur-xl shadow-lg animate-fade-in hover:scale-105 transition-all duration-300 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${iconBgClasses[color]}`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <div className="text-sm font-display font-semibold">{title}</div>
                        {subtitle && (
                            <div className="text-xs font-body opacity-75 mt-1">{subtitle}</div>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-display font-bold flex items-center space-x-2 gradient-text">
                        <span>{value}</span>
                        <span className="text-lg">{trendIcons[trend]}</span>
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
            <div className="glass p-6 animate-fade-in shadow-2xl backdrop-blur-xl border border-primary-200/30">
                <div className="flex items-center space-x-4">
                    <div className="spinner"></div>
                    <div>
                        <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">Processing with Cortex...</div>
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Optimizing semantic structure</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-danger/10 border border-danger-200/30 rounded-xl p-4 glass backdrop-blur-xl animate-scale-in">
                <div className="flex items-center space-x-3">
                    <div className="bg-gradient-danger p-2 rounded-lg glow-danger">
                        <ExclamationTriangleIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <div className="text-sm font-display font-semibold text-danger-700 dark:text-danger-300">Cortex Processing Error</div>
                        <div className="text-xs font-body text-danger-600 dark:text-danger-400 mt-1">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!metadata?.cortex) {
        return (
            <div className="glass p-4 animate-fade-in shadow-2xl backdrop-blur-xl border border-primary-200/30">
                <div className="flex items-center space-x-3">
                    <div className="bg-gradient-accent/20 p-2 rounded-lg">
                        <InformationCircleIcon className="h-5 w-5 text-accent-600" />
                    </div>
                    <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">No Cortex optimization data available</div>
                </div>
            </div>
        );
    }

    const cortex = metadata.cortex;
    const hasError = cortex.error || cortex.fallbackUsed;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-primary p-3 rounded-xl glow-primary">
                            <SparklesIcon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-display font-bold gradient-text">Cortex Results</h3>
                    </div>
                    {!hasError && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-display font-semibold bg-gradient-success text-white shadow-lg glow-success animate-pulse">
                            <CheckCircleIcon className="w-4 h-4 mr-2" />
                            Success
                        </span>
                    )}
                </div>

                {hasError && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-display font-semibold bg-gradient-warning text-white shadow-lg glow-warning">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                        Fallback Used
                    </span>
                )}
            </div>

            {/* Error Message */}
            {cortex.error && (
                <div className="bg-gradient-warning/10 border border-warning-200/30 rounded-xl p-4 glass backdrop-blur-xl animate-scale-in">
                    <div className="text-sm font-body text-warning-700 dark:text-warning-300 leading-relaxed">
                        <strong className="font-display font-semibold">Note:</strong> {cortex.error}
                        {cortex.fallbackUsed && " - Traditional optimization was used as fallback."}
                    </div>
                </div>
            )}

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="glass p-6 shadow-2xl backdrop-blur-xl border border-primary-200/30">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-gradient-secondary/20 p-2 rounded-lg">
                        <CpuChipIcon className="h-5 w-5 text-secondary-600" />
                    </div>
                    <h4 className="text-lg font-display font-semibold gradient-text">Processing Pipeline</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="glass p-4 rounded-xl border border-primary-200/30">
                        <div className="text-light-text-secondary dark:text-dark-text-secondary font-body mb-1">Encoder</div>
                        <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{cortex.cortexModel?.encoder || 'Claude Haiku'}</div>
                    </div>
                    <div className="glass p-4 rounded-xl border border-primary-200/30">
                        <div className="text-light-text-secondary dark:text-dark-text-secondary font-body mb-1">Core Processor</div>
                        <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{cortex.cortexModel?.core || 'Claude Haiku'}</div>
                    </div>
                    <div className="glass p-4 rounded-xl border border-primary-200/30">
                        <div className="text-light-text-secondary dark:text-dark-text-secondary font-body mb-1">Decoder</div>
                        <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{cortex.cortexModel?.decoder || 'Claude Haiku'}</div>
                    </div>
                </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-primary/10 border border-primary-200/30 rounded-xl p-6 glass backdrop-blur-xl text-center animate-scale-in">
                <div className="text-4xl font-display font-bold gradient-text mb-3">
                    {Math.round(cortex.reductionPercentage)}% Token Reduction
                </div>
                <div className="text-lg font-body text-primary-600 dark:text-primary-400 mb-2">
                    Cortex achieved <span className="font-display font-semibold gradient-text">{cortex.tokensSaved}</span> token savings while maintaining{' '}
                    <span className="font-display font-semibold gradient-text">{Math.round(cortex.semanticIntegrity * 100)}%</span> semantic integrity
                </div>
                {!hasError && (
                    <div className="text-sm font-body text-primary-500 dark:text-primary-400 mt-3 flex items-center justify-center space-x-2">
                        <span>✨</span>
                        <span>Optimized using advanced semantic processing</span>
                        <span>✨</span>
                    </div>
                )}
            </div>

            {/* Debug Information (Development) */}
            {cortex.detailsForDebugging && import.meta.env?.DEV && (
                <details className="glass shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-xl">
                    <summary className="px-4 py-3 cursor-pointer text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary hover:text-primary-500 transition-colors duration-300">
                        Debug Information
                    </summary>
                    <div className="px-4 pb-4 text-xs font-mono text-light-text-secondary dark:text-dark-text-secondary">
                        <pre className="whitespace-pre-wrap bg-dark-bg-primary text-dark-text-primary p-3 rounded-lg overflow-auto">
                            {JSON.stringify(cortex.detailsForDebugging, null, 2)}
                        </pre>
                    </div>
                </details>
            )}
        </div>
    );
};
