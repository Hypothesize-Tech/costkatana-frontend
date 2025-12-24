import React from 'react';
import { MagnifyingGlassIcon, LinkIcon } from '@heroicons/react/24/outline';

interface WebSearchToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    quotaUsed?: number;
    quotaLimit?: number;
}

/**
 * Web Search Toggle Component
 * Matches Cost Katana's design system with glass morphism and gradient styling
 */
export const WebSearchToggle: React.FC<WebSearchToggleProps> = ({
    enabled,
    onChange,
    quotaUsed = 0,
    quotaLimit = 100,
}) => {
    const quotaPercentage = quotaLimit > 0 ? (quotaUsed / quotaLimit) * 100 : 0;
    const quotaRemaining = quotaLimit - quotaUsed;

    return (
        <div className="glass rounded-xl p-4 sm:p-5 md:p-6 border border-primary-200/30 dark:border-primary-700/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            {/* Main Toggle Section */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-3 items-center flex-1">
                    <div className="flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-success shadow-lg flex-shrink-0">
                        <MagnifyingGlassIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                            Enable Web Search
                        </h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            Search the web for up-to-date information
                        </p>
                    </div>
                </div>

                {/* Toggle Switch */}
                <button
                    onClick={() => onChange(!enabled)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${enabled
                        ? 'bg-gradient-primary'
                        : 'bg-secondary-300 dark:bg-secondary-600'
                        }`}
                    role="switch"
                    aria-checked={enabled}
                    aria-label="Toggle web search"
                >
                    <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                    />
                </button>
            </div>

            {/* Active Indicator & Quota Status */}
            {enabled && (
                <div className="mt-4 pt-4 border-t border-primary-200/30 dark:border-primary-700/30">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <LinkIcon className="w-5 h-5 text-success-500" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                    Web search active
                                </span>
                                <span className="text-xs px-2 py-1 rounded-full bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 font-medium">
                                    Connected
                                </span>
                            </div>

                            {/* Quota Status */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                    <span>Daily quota</span>
                                    <span className="font-medium">
                                        {quotaUsed} / {quotaLimit} searches
                                    </span>
                                </div>

                                {/* Quota Progress Bar */}
                                <div className="w-full h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${quotaPercentage >= 90
                                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                                            : quotaPercentage >= 80
                                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                                : 'bg-gradient-success'
                                            }`}
                                        style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                                    />
                                </div>

                                {/* Quota Warning */}
                                {quotaPercentage >= 80 && (
                                    <div className="flex items-start gap-2 p-2 rounded-lg bg-warning-100 dark:bg-warning-900/20 border border-warning-200/50 dark:border-warning-700/50">
                                        <span className="text-warning-600 dark:text-warning-400 text-xs">
                                            ⚠️ {quotaPercentage >= 90 ? 'Quota almost exhausted' : 'Approaching quota limit'}
                                            {' '} ({quotaRemaining} searches remaining)
                                        </span>
                                    </div>
                                )}

                                {quotaPercentage < 80 && (
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                        {quotaRemaining} searches remaining today
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Disabled Info */}
            {!enabled && (
                <div className="mt-3 p-3 rounded-lg border border-secondary-200/30 dark:border-secondary-700/30 bg-secondary-50 dark:bg-secondary-900/20">
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        Enable web search to get real-time information from trusted sources.
                    </p>
                </div>
            )}
        </div>
    );
};

export default WebSearchToggle;

