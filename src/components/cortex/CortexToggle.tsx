// src/components/cortex/CortexToggle.tsx
import React from 'react';
import { Switch } from '@headlessui/react';
import {
    SparklesIcon,
    CogIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

interface CortexToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
    showAdvancedOptions?: boolean;
    onAdvancedToggle?: (show: boolean) => void;
}

export const CortexToggle: React.FC<CortexToggleProps> = ({
    enabled,
    onChange,
    disabled = false,
    showAdvancedOptions = false,
    onAdvancedToggle,
}) => {
    return (
        <div className="space-y-4">
            {/* Main Cortex Toggle */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <SparklesIcon className="h-5 w-5 text-purple-600" />
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">
                                    Enable Cortex Meta-Language
                                </span>
                                <div className="group relative">
                                    <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10">
                                        <div className="text-center">
                                            <strong>Cortex Meta-Language</strong><br />
                                            Advanced AI optimization using semantic structures for 30-50% token reduction with preserved meaning
                                        </div>
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                {enabled
                                    ? "AI-powered semantic optimization active"
                                    : "Use traditional optimization methods"
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {enabled && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <SparklesIcon className="w-3 h-3 mr-1" />
                            Enhanced
                        </span>
                    )}

                    <Switch
                        checked={enabled}
                        onChange={onChange}
                        disabled={disabled}
                        className={`${enabled ? 'bg-purple-600' : 'bg-gray-200'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
                    >
                        <span
                            className={`${enabled ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}
                        />
                    </Switch>
                </div>
            </div>

            {/* Advanced Options Toggle */}
            {enabled && onAdvancedToggle && (
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => onAdvancedToggle(!showAdvancedOptions)}
                        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <CogIcon className="h-4 w-4" />
                        <span>Advanced Cortex Settings</span>
                        <svg
                            className={`h-4 w-4 transform transition-transform ${showAdvancedOptions ? 'rotate-180' : ''
                                }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>

                    {showAdvancedOptions && (
                        <span className="text-xs text-gray-500">
                            Configure Cortex processing options
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
