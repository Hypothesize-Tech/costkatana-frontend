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
        <div className="space-y-3 sm:space-y-4">
            {/* Main Cortex Toggle */}
            <div className="flex flex-col gap-3 items-start justify-between p-3 glass shadow-2xl backdrop-blur-xl border border-primary-200/30 animate-fade-in sm:flex-row sm:items-center sm:p-4 md:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 w-full sm:w-auto">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 sm:flex-initial">
                        <div className="bg-gradient-primary p-2 rounded-lg glow-primary sm:p-2.5 md:p-3 md:rounded-xl flex-shrink-0">
                            <SparklesIcon className="h-4 w-4 text-white sm:h-5 sm:w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 space-x-0 sm:space-x-3">
                                <span className="text-sm font-display font-bold gradient-text sm:text-base md:text-lg">
                                    Enable Cortex Meta-Language
                                </span>
                                <div className="group relative flex-shrink-0">
                                    <InformationCircleIcon className="h-4 w-4 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 cursor-help transition-colors duration-300 sm:h-5 sm:w-5" />
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gradient-dark-panel rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none w-64 z-50 shadow-2xl border border-primary-500/20 backdrop-blur-xl sm:mb-3 sm:px-4 sm:py-3 sm:text-sm sm:w-80 sm:rounded-xl">
                                        <div className="text-center">
                                            <strong className="font-display font-bold">Cortex Meta-Language</strong><br />
                                            <span className="font-body">Advanced AI optimization using semantic structures for 30-50% token reduction with preserved meaning</span>
                                        </div>
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-br from-primary-500 to-secondary-500 rotate-45 sm:w-3 sm:h-3"></div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-0.5 sm:text-sm sm:mt-1">
                                {enabled
                                    ? "AI-powered semantic optimization active"
                                    : "Use traditional optimization methods"
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2 w-full justify-between sm:w-auto sm:space-x-4 sm:justify-start">
                    {enabled && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-display font-semibold bg-gradient-success text-white shadow-lg glow-success animate-pulse sm:px-3 sm:text-sm">
                            <SparklesIcon className="w-3 h-3 mr-1.5 sm:w-4 sm:h-4 sm:mr-2" />
                            Enhanced
                        </span>
                    )}

                    <Switch
                        checked={enabled}
                        onChange={onChange}
                        disabled={disabled}
                        className={`${enabled ? 'bg-gradient-primary shadow-lg glow-primary' : 'bg-primary-200/30'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
              relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:h-8 sm:w-14 [touch-action:manipulation] active:scale-95`}
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
