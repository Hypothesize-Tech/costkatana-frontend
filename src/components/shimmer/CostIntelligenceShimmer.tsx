import React from 'react';
import {
    ChartBarIcon,
    BoltIcon,
    ShieldCheckIcon,
    BeakerIcon,
    CloudIcon
} from '@heroicons/react/24/outline';

interface ShimmerProps {
    className?: string;
}

export const CostIntelligenceHeaderShimmer: React.FC<ShimmerProps> = ({ className }) => {
    return (
        <div className={`mb-6 ${className || ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                    <div className="skeleton h-8 w-64 mb-2 rounded" />
                    <div className="skeleton h-4 w-96 rounded" />
                </div>
                <div className="flex gap-3">
                    <div className="skeleton h-10 w-32 rounded-lg" />
                    <div className="skeleton h-10 w-32 rounded-lg" />
                </div>
            </div>
        </div>
    );
};

export const CostStatsCardsShimmer: React.FC<ShimmerProps> = ({ className }) => {
    const icons = [ChartBarIcon, BoltIcon, ShieldCheckIcon, BeakerIcon];

    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 ${className || ''}`}>
            {icons.map((Icon, index) => (
                <div
                    key={index}
                    className="group p-4 sm:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel"
                >
                    <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                            <div className="skeleton h-3 sm:h-4 w-20 sm:w-24 mb-2 sm:mb-3 rounded" />
                            <div className="flex flex-wrap gap-2 sm:gap-3 items-baseline">
                                <div className="skeleton h-8 sm:h-10 w-24 sm:w-32 rounded" />
                                <div className="skeleton h-5 sm:h-6 w-12 sm:w-16 rounded-full" />
                            </div>
                        </div>
                        <div className="ml-4 sm:ml-6 shrink-0">
                            <div className="p-2.5 sm:p-3.5 rounded-xl shadow-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                                <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary-500/50" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const CostIntelligenceInsightsShimmer: React.FC<ShimmerProps> = ({ className }) => {
    return (
        <div className={`p-4 sm:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel ${className || ''}`}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 rounded-xl shadow-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                    <BoltIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500/50" />
                </div>
                <div className="skeleton h-5 sm:h-6 w-32 sm:w-40 rounded" />
            </div>

            <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50"
                    >
                        <div className="flex items-start gap-4">
                            <div className="skeleton h-10 w-10 rounded-lg" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="skeleton h-4 w-48 rounded" />
                                    <div className="skeleton h-6 w-16 rounded-full" />
                                </div>
                                <div className="skeleton h-3 w-full rounded mb-3" />
                                <div className="skeleton h-3 w-3/4 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CostSimulationShimmer: React.FC<ShimmerProps> = ({ className }) => {
    return (
        <div className={`p-4 sm:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel ${className || ''}`}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 rounded-xl shadow-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                    <BeakerIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500/50" />
                </div>
                <div className="skeleton h-5 sm:h-6 w-48 rounded" />
            </div>

            {/* Current Request */}
            <div className="mb-6 p-4 rounded-lg bg-primary-50/50 dark:bg-primary-900/20">
                <div className="skeleton h-4 w-32 mb-3 rounded" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                        <div className="skeleton h-3 w-16 mb-2 rounded" />
                        <div className="skeleton h-6 w-24 rounded" />
                    </div>
                    <div>
                        <div className="skeleton h-3 w-16 mb-2 rounded" />
                        <div className="skeleton h-6 w-24 rounded" />
                    </div>
                    <div>
                        <div className="skeleton h-3 w-16 mb-2 rounded" />
                        <div className="skeleton h-6 w-24 rounded" />
                    </div>
                    <div>
                        <div className="skeleton h-3 w-16 mb-2 rounded" />
                        <div className="skeleton h-6 w-24 rounded" />
                    </div>
                </div>
            </div>

            {/* Alternatives */}
            <div className="skeleton h-4 w-32 mb-3 rounded" />
            <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="skeleton h-5 w-32 rounded" />
                            <div className="skeleton h-6 w-24 rounded-full" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <div className="skeleton h-3 w-12 mb-1 rounded" />
                                <div className="skeleton h-4 w-20 rounded" />
                            </div>
                            <div>
                                <div className="skeleton h-3 w-12 mb-1 rounded" />
                                <div className="skeleton h-4 w-20 rounded" />
                            </div>
                            <div>
                                <div className="skeleton h-3 w-12 mb-1 rounded" />
                                <div className="skeleton h-4 w-20 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CostStreamShimmer: React.FC<ShimmerProps> = ({ className }) => {
    return (
        <div className={`p-4 sm:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel ${className || ''}`}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 rounded-xl shadow-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                    <CloudIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500/50 animate-pulse" />
                </div>
                <div className="skeleton h-5 sm:h-6 w-40 rounded" />
                <div className="ml-auto skeleton h-8 w-8 rounded-full" />
            </div>

            <div className="space-y-2 max-h-96 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div
                        key={item}
                        className="p-3 rounded-lg border border-gray-200/30 dark:border-gray-700/30 bg-white/30 dark:bg-gray-800/30"
                    >
                        <div className="flex items-center gap-3">
                            <div className="skeleton h-8 w-8 rounded-full" />
                            <div className="flex-1">
                                <div className="skeleton h-3 w-full max-w-md rounded mb-1" />
                                <div className="skeleton h-2 w-32 rounded" />
                            </div>
                            <div className="skeleton h-5 w-16 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CostConfigShimmer: React.FC<ShimmerProps> = ({ className }) => {
    const layers = [1, 2, 3, 4, 5, 6];

    return (
        <div className={`space-y-6 ${className || ''}`}>
            {layers.map((layer) => (
                <div
                    key={layer}
                    className="p-4 sm:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="skeleton h-10 w-10 rounded-lg" />
                            <div>
                                <div className="skeleton h-5 w-32 rounded mb-2" />
                                <div className="skeleton h-3 w-48 rounded" />
                            </div>
                        </div>
                        <div className="skeleton h-6 w-12 rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="skeleton h-3 w-24 rounded" />
                            <div className="skeleton h-10 w-full rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <div className="skeleton h-3 w-24 rounded" />
                            <div className="skeleton h-10 w-full rounded-lg" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const CostIntelligenceShimmer: React.FC<ShimmerProps> = ({ className }) => {
    return (
        <div className={`space-y-6 ${className || ''}`}>
            <CostIntelligenceHeaderShimmer />
            <CostStatsCardsShimmer />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CostIntelligenceInsightsShimmer />
                <CostStreamShimmer />
            </div>
            <CostSimulationShimmer />
        </div>
    );
};

