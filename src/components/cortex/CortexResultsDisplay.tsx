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
        green: 'bg-green-50 text-green-700 border-green-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        red: 'bg-red-50 text-red-700 border-red-200',
    };

    const trendIcons = {
        up: '↗️',
        down: '↘️',
        neutral: '📊',
    };

    return (
        <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <div>
                        <div className="text-sm font-medium">{title}</div>
                        {subtitle && (
                            <div className="text-xs opacity-75 mt-1">{subtitle}</div>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-bold flex items-center space-x-1">
                        <span>{value}</span>
                        <span className="text-sm">{trendIcons[trend]}</span>
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
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">Processing with Cortex...</div>
                        <div className="text-xs text-gray-500">Optimizing semantic structure</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    <div>
                        <div className="text-sm font-medium text-red-800">Cortex Processing Error</div>
                        <div className="text-xs text-red-600 mt-1">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!metadata?.cortex) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                    <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                    <div className="text-sm text-gray-600">No Cortex optimization data available</div>
                </div>
            </div>
        );
    }

    const cortex = metadata.cortex;
    const hasError = cortex.error || cortex.fallbackUsed;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <SparklesIcon className="h-6 w-6 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Cortex Results</h3>
                    </div>
                    {!hasError && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Success
                        </span>
                    )}
                </div>

                {hasError && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                        Fallback Used
                    </span>
                )}
            </div>

            {/* Error Message */}
            {cortex.error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-sm text-yellow-800">
                        <strong>Note:</strong> {cortex.error}
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
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                    <CpuChipIcon className="h-5 w-5 text-gray-600" />
                    <h4 className="text-sm font-medium text-gray-900">Processing Pipeline</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <div className="text-gray-500">Encoder</div>
                        <div className="font-medium text-gray-900">{cortex.cortexModel?.encoder || 'Claude Haiku'}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">Core Processor</div>
                        <div className="font-medium text-gray-900">{cortex.cortexModel?.core || 'Claude Haiku'}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">Decoder</div>
                        <div className="font-medium text-gray-900">{cortex.cortexModel?.decoder || 'Claude Haiku'}</div>
                    </div>
                </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-700">
                        {Math.round(cortex.reductionPercentage)}% Token Reduction
                    </div>
                    <div className="text-sm text-purple-600 mt-1">
                        Cortex achieved {cortex.tokensSaved} token savings while maintaining{' '}
                        {Math.round(cortex.semanticIntegrity * 100)}% semantic integrity
                    </div>
                    {!hasError && (
                        <div className="text-xs text-purple-500 mt-2">
                            ✨ Optimized using advanced semantic processing
                        </div>
                    )}
                </div>
            </div>

            {/* Debug Information (Development) */}
            {cortex.detailsForDebugging && import.meta.env?.DEV && (
                <details className="bg-gray-100 rounded-lg">
                    <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700">
                        Debug Information
                    </summary>
                    <div className="px-4 pb-4 text-xs text-gray-600">
                        <pre className="whitespace-pre-wrap">
                            {JSON.stringify(cortex.detailsForDebugging, null, 2)}
                        </pre>
                    </div>
                </details>
            )}
        </div>
    );
};
