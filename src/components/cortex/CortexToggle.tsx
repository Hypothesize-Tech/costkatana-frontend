import React from 'react';
import { Switch } from '@headlessui/react';
import {
    SparklesIcon,
    CogIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import type { CortexConfig } from '../../types/cortex.types';

interface CortexToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    config?: CortexConfig;
    onConfigChange?: (config: Partial<CortexConfig>) => void;
    disabled?: boolean;
    showAdvancedOptions?: boolean;
    onAdvancedToggle?: (show: boolean) => void;
}

export const CortexToggle: React.FC<CortexToggleProps> = ({
    enabled,
    onChange,
    config: _config,
    onConfigChange: _onConfigChange,
    disabled = false,
    showAdvancedOptions = false,
    onAdvancedToggle,
}) => {
    return (
        <div className="space-y-4">
            {/* Main Cortex Toggle */}
            <div className="flex items-center justify-between p-6 glass shadow-2xl backdrop-blur-xl border border-primary-200/30 animate-fade-in">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-primary p-3 rounded-xl glow-primary">
                            <SparklesIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-3">
                                <span className="text-lg font-display font-bold gradient-text">
                                    Enable Cortex Meta-Language
                                </span>
                                <div className="group relative">
                                    <InformationCircleIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 cursor-help transition-colors duration-300" />
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 text-sm text-white bg-gradient-dark-panel rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none w-80 z-50 shadow-2xl border border-primary-500/20 backdrop-blur-xl">
                                        <div className="text-center">
                                            <strong className="font-display font-bold">Cortex Meta-Language</strong><br />
                                            <span className="font-body">Advanced AI optimization using semantic structures for 30-50% token reduction with preserved meaning</span>
                                        </div>
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-primary-500 to-secondary-500 rotate-45"></div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                {enabled
                                    ? "AI-powered semantic optimization active"
                                    : "Use traditional optimization methods"
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {enabled && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-display font-semibold bg-gradient-success text-white shadow-lg glow-success animate-pulse">
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            Enhanced
                        </span>
                    )}

                    <Switch
                        checked={enabled}
                        onChange={onChange}
                        disabled={disabled}
                        className={`${enabled ? 'bg-gradient-primary shadow-lg glow-primary' : 'bg-primary-200/30'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
              relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                        <span
                            className={`${enabled ? 'translate-x-7' : 'translate-x-1'
                                } inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out`}
                        />
                    </Switch>
                </div>
            </div>

            {/* Advanced Options Toggle */}
            {enabled && onAdvancedToggle && (
                <div className="flex items-center justify-between p-4 glass rounded-xl border border-primary-200/30 hover:bg-primary-500/5 transition-all duration-300">
                    <button
                        type="button"
                        onClick={() => onAdvancedToggle(!showAdvancedOptions)}
                        className="flex items-center space-x-3 text-sm font-display font-medium text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 transition-all duration-300 hover:scale-105"
                    >
                        <div className="bg-gradient-secondary/20 p-2 rounded-lg">
                            <CogIcon className="h-4 w-4 text-secondary-600" />
                        </div>
                        <span>Advanced Cortex Settings</span>
                        <svg
                            className={`h-4 w-4 transform transition-transform duration-300 ${showAdvancedOptions ? 'rotate-180' : ''
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
                        <span className="text-sm font-body text-light-text-muted dark:text-dark-text-muted">
                            Configure Cortex processing options
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
