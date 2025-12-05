// src/components/cortex/CortexConfigPanel.tsx
import React from 'react';
import {
    AdjustmentsHorizontalIcon,
    ChartBarIcon,
    DocumentTextIcon,
    CpuChipIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import type { CortexConfig } from '../../types/cortex.types';

interface CortexConfigPanelProps {
    config: Partial<CortexConfig>;
    onChange: (config: Partial<CortexConfig>) => void;
    disabled?: boolean;
}

export const CortexConfigPanel: React.FC<CortexConfigPanelProps> = ({
    config,
    onChange,
    disabled = false,
}) => {
    const updateConfig = (updates: Partial<CortexConfig>) => {
        onChange({ ...config, ...updates });
    };

    return (
        <div className="space-y-4 glass shadow-2xl backdrop-blur-xl border border-primary-200/30 p-3 animate-fade-in sm:space-y-5 sm:p-4 md:space-y-6 md:p-6">
            <div className="flex items-center space-x-2 pb-3 border-b border-primary-200/30 sm:space-x-3 sm:pb-4">
                <div className="bg-gradient-primary p-1.5 rounded-lg glow-primary sm:p-2">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-base font-display font-bold gradient-text sm:text-lg md:text-xl">Cortex Configuration</h3>
            </div>

            {/* Processing Mode - NEW ARCHITECTURE */}
            <div className="space-y-2 sm:space-y-3">
                <label className="flex items-center space-x-2 sm:space-x-3">
                    <div className="bg-gradient-accent/20 p-1.5 rounded-lg sm:p-2">
                        <ChartBarIcon className="h-3.5 w-3.5 text-accent-600 sm:h-4 sm:w-4" />
                    </div>
                    <span className="text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary sm:text-sm">Processing Mode</span>
                </label>
                <div className="p-3 bg-gradient-primary/10 border border-primary-200/30 rounded-lg glass backdrop-blur-xl sm:p-4 md:rounded-xl">
                    <div className="flex items-center space-x-2 mb-2 sm:space-x-3 sm:mb-3">
                        <div className="bg-gradient-success p-1.5 rounded-lg glow-success sm:p-2">
                            <CheckCircleIcon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                        </div>
                        <span className="text-xs font-display font-semibold text-primary-700 dark:text-primary-300 sm:text-sm">Answer Generation Mode</span>
                    </div>
                    <p className="text-xs font-body text-primary-600 dark:text-primary-400 leading-relaxed sm:text-sm">
                        Cortex now generates answers in LISP format, reducing output tokens by 70-85%.
                        The system processes queries through: Query → LISP → Answer (LISP) → Natural Language
                    </p>
                </div>
            </div>

            {/* Answer Generation Settings */}
            <div className="space-y-2 sm:space-y-3">
                <label className="flex items-center space-x-2 sm:space-x-3">
                    <div className="bg-gradient-secondary/20 p-1.5 rounded-lg sm:p-2">
                        <CpuChipIcon className="h-3.5 w-3.5 text-secondary-600 sm:h-4 sm:w-4" />
                    </div>
                    <span className="text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary sm:text-sm">Answer Generation Settings</span>
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                    {[
                        { value: 'concise', label: 'Concise', desc: 'Brief LISP answers' },
                        { value: 'detailed', label: 'Detailed', desc: 'Comprehensive LISP responses' },
                    ].map((level) => (
                        <button
                            key={level.value}
                            type="button"
                            onClick={() => updateConfig({
                                outputStyle: level.value === 'concise' ? 'conversational' : 'formal'
                            })}
                            disabled={disabled}
                            className={`p-3 rounded-lg text-center transition-all duration-300 hover:scale-105 min-h-[44px] sm:p-4 md:rounded-xl [touch-action:manipulation] active:scale-95 ${(config.outputStyle === 'conversational' && level.value === 'concise') || (config.outputStyle === 'formal' && level.value === 'detailed')
                                ? 'bg-gradient-primary text-white shadow-lg glow-primary border border-primary-300'
                                : 'glass border border-primary-200/30 hover:bg-primary-500/10 text-light-text-primary dark:text-dark-text-primary'
                                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <div className="text-xs font-display font-semibold sm:text-sm">{level.label}</div>
                            <div className="text-[10px] font-body opacity-75 mt-0.5 sm:text-xs sm:mt-1">{level.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Output Style */}
            <div className="space-y-3">
                <label className="flex items-center space-x-3">
                    <div className="bg-gradient-highlight/20 p-2 rounded-lg">
                        <DocumentTextIcon className="h-4 w-4 text-highlight-600" />
                    </div>
                    <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">Output Style</span>
                </label>
                <select
                    value={config.outputStyle || 'conversational'}
                    onChange={(e) => updateConfig({
                        outputStyle: e.target.value as CortexConfig['outputStyle']
                    })}
                    disabled={disabled}
                    className="input w-full font-body"
                >
                    <option value="conversational">Conversational - Natural, flowing text</option>
                    <option value="formal">Formal - Professional, structured language</option>
                    <option value="technical">Technical - Precise, domain-specific terminology</option>
                    <option value="casual">Casual - Relaxed, friendly tone</option>
                </select>
            </div>

            {/* Output Format */}
            <div className="space-y-3">
                <label className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">Output Format</label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { value: 'plain', label: 'Plain Text' },
                        { value: 'markdown', label: 'Markdown' },
                        { value: 'structured', label: 'Structured' },
                        { value: 'json', label: 'JSON' },
                    ].map((format) => (
                        <button
                            key={format.value}
                            type="button"
                            onClick={() => updateConfig({
                                outputFormat: format.value as CortexConfig['outputFormat']
                            })}
                            disabled={disabled}
                            className={`p-3 rounded-xl text-sm font-display font-medium transition-all duration-300 hover:scale-105 ${config.outputFormat === format.value
                                ? 'bg-gradient-primary text-white shadow-lg glow-primary border border-primary-300'
                                : 'glass border border-primary-200/30 hover:bg-primary-500/10 text-light-text-primary dark:text-dark-text-primary'
                                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {format.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4 pt-6 border-t border-primary-200/30">
                <h4 className="text-lg font-display font-semibold gradient-text">Advanced Options</h4>

                {[
                    {
                        key: 'enableSemanticCache' as keyof CortexConfig,
                        label: 'Semantic Caching',
                        description: 'Cache frequently used semantic structures',
                        defaultValue: true,
                    },
                    {
                        key: 'preserveSemantics' as keyof CortexConfig,
                        label: 'Preserve Semantics',
                        description: 'Maintain original meaning during optimization',
                        defaultValue: true,
                    },
                    {
                        key: 'enableStructuredContext' as keyof CortexConfig,
                        label: 'Structured Context',
                        description: 'Use advanced context management for conversations',
                        defaultValue: false,
                    },
                    {
                        key: 'enableIntelligentRouting' as keyof CortexConfig,
                        label: 'Intelligent Routing',
                        description: 'Automatically select best models for each stage',
                        defaultValue: false,
                    },
                    {
                        key: 'enableSastProcessing' as keyof CortexConfig,
                        label: 'SAST Processing',
                        description: 'Use Semantic Abstract Syntax Tree for advanced semantic understanding',
                        defaultValue: false,
                    },
                    {
                        key: 'enableAmbiguityResolution' as keyof CortexConfig,
                        label: 'Ambiguity Resolution',
                        description: 'Resolve structural ambiguities using semantic primitives',
                        defaultValue: false,
                    },
                    {
                        key: 'enableCrossLingualMode' as keyof CortexConfig,
                        label: 'Cross-Lingual Mode',
                        description: 'Generate universal semantic representations across languages',
                        defaultValue: false,
                    },
                ].map((option) => (
                    <label key={option.key} className="flex items-start space-x-4 p-3 glass rounded-xl border border-primary-200/30 hover:bg-primary-500/5 transition-all duration-300 cursor-pointer">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={(config[option.key] ?? option.defaultValue) as boolean}
                                onChange={(e) => updateConfig({
                                    [option.key]: e.target.checked
                                })}
                                disabled={disabled}
                                className="sr-only"
                            />
                            <div
                                className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 ${(config[option.key] ?? option.defaultValue) as boolean
                                    ? 'border-primary-500 bg-gradient-primary shadow-lg glow-primary'
                                    : 'border-primary-300 bg-white hover:border-primary-400 hover:shadow-md'
                                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => !disabled && updateConfig({
                                    [option.key]: !((config[option.key] ?? option.defaultValue) as boolean)
                                })}
                            >
                                {((config[option.key] ?? option.defaultValue) as boolean) && (
                                    <CheckCircleIcon className="w-4 h-4 text-white" />
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{option.label}</div>
                            <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">{option.description}</div>
                        </div>
                    </label>
                ))}
            </div>

            {/* Model Configuration Hint */}
            <div className="bg-gradient-accent/10 border border-accent-200/30 p-4 rounded-xl glass backdrop-blur-xl">
                <div className="text-sm font-body text-accent-700 dark:text-accent-300 leading-relaxed">
                    <strong className="font-display font-semibold">Model Selection:</strong> Cortex automatically uses Claude Sonnet for encoding/decoding
                    and Claude Opus 4.1 for core processing. SAST mode enables advanced semantic understanding
                    with automatic ambiguity resolution and cross-lingual compatibility.
                </div>
            </div>
        </div>
    );
};
