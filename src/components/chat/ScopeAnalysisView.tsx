import React from 'react';
import { ScopeAnalysis } from '../../types/governedAgent';
import {
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ArrowRightIcon,
    QuestionMarkCircleIcon,
    MagnifyingGlassIcon,
    LinkIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

interface ScopeAnalysisViewProps {
    analysis: ScopeAnalysis;
    onProceed?: () => void;
}

export const ScopeAnalysisView: React.FC<ScopeAnalysisViewProps> = ({
    analysis,
    onProceed
}) => {
    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case 'high':
                return 'text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-700';
            case 'medium':
                return 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-700';
            case 'low':
                return 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-700';
            default:
                return 'text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/20 border-secondary-200 dark:border-secondary-700';
        }
    };

    return (
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                    <MagnifyingGlassIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold text-primary-600 dark:text-primary-400">
                        Scope Analysis
                    </h2>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        Analyzing feasibility and requirements
                    </p>
                </div>
            </div>

            {/* Compatibility Status */}
            <div className={`rounded-xl border p-6 backdrop-blur-sm ${analysis.compatible
                ? 'border-success-200/30 dark:border-success-700/30 bg-success-50/50 dark:bg-success-900/20'
                : 'border-danger-200/30 dark:border-danger-700/30 bg-danger-50/50 dark:bg-danger-900/20'
                }`}>
                <div className="flex items-center gap-3">
                    {analysis.compatible ? (
                        <>
                            <CheckCircleIcon className="w-8 h-8 text-success-600 dark:text-success-400" />
                            <div>
                                <h3 className="text-lg font-semibold text-success-900 dark:text-success-100">
                                    Task is Compatible
                                </h3>
                                <p className="text-sm text-success-700 dark:text-success-300">
                                    This task can be handled by the governed workflow
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <XCircleIcon className="w-8 h-8 text-danger-600 dark:text-danger-400" />
                            <div>
                                <h3 className="text-lg font-semibold text-danger-900 dark:text-danger-100">
                                    Task is Not Compatible
                                </h3>
                                <p className="text-sm text-danger-700 dark:text-danger-300">
                                    This task cannot be handled by the governed workflow
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Required Integrations */}
            {analysis.requiredIntegrations.length > 0 && (
                <div className="rounded-xl border border-primary-200/30 dark:border-primary-700/30 p-6 bg-primary-50/50 dark:bg-primary-900/20 backdrop-blur-sm">
                    <h3 className="text-lg font-display font-bold text-primary-900 dark:text-primary-100 mb-4 flex items-center gap-2">
                        <LinkIcon className="w-5 h-5" />
                        Required Integrations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {analysis.requiredIntegrations.map((integration, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-dark-card border border-primary-200/30 dark:border-primary-700/30 text-primary-700 dark:text-primary-300 font-display font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                            >
                                <CheckCircleIcon className="w-4 h-4" />
                                {integration}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Estimated Complexity */}
            <div className="rounded-xl border border-secondary-200/30 dark:border-secondary-700/30 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-display font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5" />
                    Estimated Complexity
                </h3>
                <span className={`inline-flex px-4 py-2 rounded-lg border font-bold text-sm uppercase ${getComplexityColor(analysis.estimatedComplexity)}`}>
                    {analysis.estimatedComplexity}
                </span>
            </div>

            {/* Ambiguities */}
            {analysis.ambiguities.length > 0 && (
                <div className="rounded-xl border border-accent-200/30 dark:border-accent-700/30 p-6 bg-accent-50/50 dark:bg-accent-900/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <ExclamationTriangleIcon className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                        <h3 className="text-lg font-display font-bold text-accent-900 dark:text-accent-100">
                            Ambiguities Detected
                        </h3>
                    </div>
                    <ul className="space-y-2">
                        {analysis.ambiguities.map((ambiguity, idx) => (
                            <li
                                key={idx}
                                className="flex items-start gap-2 p-3 rounded-lg bg-white dark:bg-dark-card border border-accent-200/30 dark:border-accent-700/30"
                            >
                                <ExclamationTriangleIcon className="w-4 h-4 text-accent-500 mt-1 flex-shrink-0" />
                                <span className="text-sm text-secondary-900 dark:text-secondary-100">
                                    {ambiguity}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Clarification Needed */}
            {analysis.clarificationNeeded && analysis.clarificationNeeded.length > 0 && (
                <div className="rounded-xl border border-highlight-200/30 dark:border-highlight-700/30 p-6 bg-highlight-50/50 dark:bg-highlight-900/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <QuestionMarkCircleIcon className="w-6 h-6 text-highlight-600 dark:text-highlight-400" />
                        <h3 className="text-lg font-display font-bold text-highlight-900 dark:text-highlight-100">
                            Clarification Needed
                        </h3>
                    </div>
                    <ul className="space-y-2">
                        {analysis.clarificationNeeded.map((question, idx) => (
                            <li
                                key={idx}
                                className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-dark-card border border-highlight-200/30 dark:border-highlight-700/30 hover:border-highlight-400 dark:hover:border-highlight-600 transition-all"
                            >
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-highlight-500 to-highlight-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                                    {idx + 1}
                                </span>
                                <span className="text-sm text-secondary-900 dark:text-secondary-100 font-medium">
                                    {question}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Action Button - Always show when in scope mode */}
            {onProceed && (
                <div className="sticky bottom-0 bg-white dark:bg-dark-card border-t border-secondary-200/30 dark:border-secondary-700/30 p-4 -m-6 mt-6">
                    <button
                        onClick={onProceed}
                        className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-display font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        Generate Execution Plan
                        <ArrowRightIcon className="w-5 h-5" />
                    </button>
                    {analysis.clarificationNeeded && analysis.clarificationNeeded.length > 0 && (
                        <p className="text-xs text-center text-secondary-500 dark:text-secondary-400 mt-2">
                            Plan will be generated with reasonable assumptions based on your request
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
