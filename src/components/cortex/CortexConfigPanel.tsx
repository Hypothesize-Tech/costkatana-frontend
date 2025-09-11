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
        <div className="space-y-6 bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 pb-4 border-b border-gray-200">
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-medium text-gray-900">Cortex Configuration</h3>
            </div>

            {/* Processing Mode - NEW ARCHITECTURE */}
            <div className="space-y-2">
                <label className="flex items-center space-x-2">
                    <ChartBarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Processing Mode</span>
                </label>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">Answer Generation Mode</span>
                    </div>
                    <p className="text-xs text-purple-700 mt-2">
                        Cortex now generates answers in LISP format, reducing output tokens by 70-85%.
                        The system processes queries through: Query → LISP → Answer (LISP) → Natural Language
                    </p>
                </div>
            </div>

            {/* Answer Generation Settings */}
            <div className="space-y-2">
                <label className="flex items-center space-x-2">
                    <CpuChipIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Answer Generation Settings</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
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
                            className={`p-3 rounded-lg border-2 text-center transition-colors ${(config.outputStyle === 'conversational' && level.value === 'concise') || (config.outputStyle === 'formal' && level.value === 'detailed')
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <div className="text-sm font-medium">{level.label}</div>
                            <div className="text-xs text-gray-500 mt-1">{level.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Output Style */}
            <div className="space-y-2">
                <label className="flex items-center space-x-2">
                    <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Output Style</span>
                </label>
                <select
                    value={config.outputStyle || 'conversational'}
                    onChange={(e) => updateConfig({
                        outputStyle: e.target.value as CortexConfig['outputStyle']
                    })}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="conversational">Conversational - Natural, flowing text</option>
                    <option value="formal">Formal - Professional, structured language</option>
                    <option value="technical">Technical - Precise, domain-specific terminology</option>
                    <option value="casual">Casual - Relaxed, friendly tone</option>
                </select>
            </div>

            {/* Output Format */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Output Format</label>
                <div className="grid grid-cols-2 gap-2">
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
                            className={`p-2 rounded-md border text-sm transition-colors ${config.outputFormat === format.value
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {format.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700">Advanced Options</h4>

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
                    <label key={option.key} className="flex items-start space-x-3">
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
                                className={`w-5 h-5 border-2 rounded-md flex items-center justify-center cursor-pointer transition-colors ${(config[option.key] ?? option.defaultValue) as boolean
                                    ? 'border-purple-500 bg-purple-500'
                                    : 'border-gray-300 bg-white hover:border-gray-400'
                                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => !disabled && updateConfig({
                                    [option.key]: !((config[option.key] ?? option.defaultValue) as boolean)
                                })}
                            >
                                {((config[option.key] ?? option.defaultValue) as boolean) && (
                                    <CheckCircleIcon className="w-3 h-3 text-white" />
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-700">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                    </label>
                ))}
            </div>

            {/* Model Configuration Hint */}
            <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-blue-700">
                    <strong>Model Selection:</strong> Cortex automatically uses Claude Haiku for encoding/decoding
                    and Claude Sonnet for core processing. SAST mode enables advanced semantic understanding
                    with automatic ambiguity resolution and cross-lingual compatibility.
                </div>
            </div>
        </div>
    );
};
