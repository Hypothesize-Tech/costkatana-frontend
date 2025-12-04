import React from "react";
import {
    FireIcon,
    BanknotesIcon,
    ShieldExclamationIcon,
    PresentationChartLineIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";

const ShimmerMetricCard: React.FC<{ icon: React.ComponentType<{ className?: string }> }> = ({ icon: Icon }) => {
    return (
        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex gap-4 items-start">
                <div className="p-3.5 rounded-xl shadow-lg bg-gradient-primary/20 shrink-0">
                    <Icon className="w-7 h-7 text-primary-500/50" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="mb-2 w-24 h-9 rounded skeleton" />
                    <div className="mb-3 w-32 h-4 rounded skeleton" />
                    <div className="w-24 h-7 rounded-full skeleton" />
                </div>
            </div>
        </div>
    );
};

const ShimmerTabButton: React.FC = () => {
    return (
        <div className="w-32 h-12 rounded-xl skeleton" />
    );
};

const ShimmerOverviewCard: React.FC = () => {
    return (
        <div className="p-6 bg-gradient-to-br rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-primary-200/30">
            <div className="flex gap-3 items-center mb-5">
                <div className="p-3.5 rounded-xl shadow-lg bg-gradient-primary/20">
                    <div className="w-7 h-7 rounded skeleton" />
                </div>
                <div className="w-48 h-6 rounded skeleton" />
            </div>
            <div className="mb-6 text-center">
                <div className="mx-auto mb-3 w-64 h-4 rounded skeleton" />
                <div className="mx-auto mb-3 w-32 h-16 rounded skeleton" />
                <div className="mx-auto w-48 h-4 rounded skeleton" />
            </div>
            <div className="space-y-3">
                <div className="w-32 h-4 rounded skeleton" />
                {[1, 2].map((i) => (
                    <div key={i} className="p-4 rounded-xl border glass border-primary-200/30">
                        <div className="flex justify-between items-center">
                            <div className="w-40 h-4 rounded skeleton" />
                            <div className="w-20 h-4 rounded skeleton" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ShimmerAlertCard: React.FC = () => {
    return (
        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-start mb-5">
                <div className="flex flex-1 gap-4 items-center">
                    <div className="w-4 h-4 rounded-full skeleton shrink-0" />
                    <div className="flex-1 w-48 h-6 rounded skeleton" />
                    <div className="w-20 h-7 rounded-full skeleton shrink-0" />
                </div>
                <div className="ml-4 w-24 h-7 rounded skeleton shrink-0" />
            </div>
            <div className="mb-6 w-full h-4 rounded skeleton" />
            <div className="space-y-3">
                <div className="mb-4 w-40 h-4 rounded skeleton" />
                {[1, 2].map((i) => (
                    <div key={i} className="p-4 rounded-xl border glass border-primary-200/30">
                        <div className="flex gap-4 justify-between items-start">
                            <div className="flex flex-1 gap-3 items-center">
                                <div className="w-16 h-6 rounded-full skeleton" />
                                <div className="flex-1 w-48 h-4 rounded skeleton" />
                            </div>
                            <div className="text-right">
                                <div className="mb-1 w-20 h-4 rounded skeleton" />
                                <div className="w-16 h-3 rounded skeleton" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ShimmerOptimizationCard: React.FC = () => {
    return (
        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-start mb-5">
                <div className="flex flex-1 gap-3 items-center">
                    <div className="w-20 h-6 rounded-full skeleton" />
                    <div className="flex-1 w-56 h-6 rounded skeleton" />
                </div>
                <div className="text-right">
                    <div className="mb-1 w-24 h-7 rounded skeleton" />
                    <div className="w-16 h-4 rounded skeleton" />
                </div>
            </div>
            <div className="mb-6 w-full h-4 rounded skeleton" />
            <div className="p-5 mb-6 rounded-xl border glass border-primary-200/30">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="text-center">
                            <div className="mx-auto mb-2 w-20 h-3 rounded skeleton" />
                            <div className="mx-auto w-16 h-4 rounded skeleton" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-5">
                <div className="flex justify-between items-center">
                    <div className="w-32 h-6 rounded-full skeleton" />
                    <div className="w-28 h-6 rounded-full skeleton" />
                </div>
                <div>
                    <div className="mb-4 w-40 h-4 rounded skeleton" />
                    <ol className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <li key={i} className="flex gap-3">
                                <div className="w-7 h-7 rounded-full skeleton shrink-0" />
                                <div className="w-full h-4 rounded skeleton" />
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
};

const ShimmerScenarioCard: React.FC = () => {
    return (
        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-start mb-5">
                <div className="w-48 h-6 rounded skeleton" />
                <div className="flex flex-col gap-2">
                    <div className="w-24 h-6 rounded-full skeleton" />
                    <div className="w-28 h-6 rounded-full skeleton" />
                </div>
            </div>
            <div className="mb-6 w-full h-4 rounded skeleton" />
            <div className="mb-6">
                <div className="mb-4 w-32 h-4 rounded skeleton" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 text-center rounded-xl border glass border-primary-200/30">
                            <div className="mx-auto mb-2 w-24 h-3 rounded skeleton" />
                            <div className="mx-auto w-16 h-4 rounded skeleton" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="mb-6">
                <div className="mb-4 w-32 h-4 rounded skeleton" />
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex gap-3">
                            <div className="mt-2 w-2 h-2 rounded-full skeleton shrink-0" />
                            <div className="w-full h-4 rounded skeleton" />
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <div className="mb-4 w-40 h-4 rounded skeleton" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-7 h-7 rounded-full skeleton shrink-0" />
                            <div className="w-full h-4 rounded skeleton" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const PredictiveIntelligenceShimmer: React.FC = () => {
    return (
        <div className="p-6 mx-auto space-y-6 max-w-7xl">
            {/* Header Shimmer */}
            <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel animate-fade-in">
                <div className="flex flex-col gap-6 justify-between items-start lg:flex-row lg:items-center">
                    <div className="flex gap-5 items-start">
                        <div className="p-4 rounded-2xl shadow-xl bg-gradient-primary/20 shrink-0">
                            <SparklesIcon className="w-8 h-8 text-primary-500/50" />
                        </div>
                        <div className="flex-1">
                            <div className="mb-2 w-64 h-9 rounded skeleton" />
                            <div className="mb-4 w-80 h-4 rounded skeleton" />
                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="w-24 h-4 rounded skeleton" />
                                <div className="w-40 h-3 rounded-full skeleton" />
                                <div className="w-12 h-6 rounded skeleton" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                        <div className="w-40 h-11 rounded-xl skeleton" />
                        <div className="w-32 h-11 rounded-xl skeleton" />
                    </div>
                </div>
            </div>

            {/* Key Metrics Cards Shimmer */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                <ShimmerMetricCard icon={FireIcon} />
                <ShimmerMetricCard icon={BanknotesIcon} />
                <ShimmerMetricCard icon={ShieldExclamationIcon} />
                <ShimmerMetricCard icon={PresentationChartLineIcon} />
            </div>

            {/* Navigation Tabs Shimmer */}
            <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel animate-fade-in">
                <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <ShimmerTabButton key={i} />
                    ))}
                </div>
            </div>

            {/* Tab Content Shimmer */}
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 min-h-[500px] animate-fade-in">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-5 w-16 h-16 rounded-2xl skeleton" />
                    <div className="mx-auto mb-3 w-64 h-9 rounded skeleton" />
                    <div className="mx-auto w-96 h-4 rounded skeleton" />
                </div>

                {/* Overview Tab Content */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    <ShimmerOverviewCard />
                    <ShimmerOverviewCard />
                    <ShimmerOverviewCard />
                </div>

                {/* Alerts Tab Content (hidden by default, but structure is here) */}
                <div className="hidden space-y-6">
                    {[1, 2, 3].map((i) => (
                        <ShimmerAlertCard key={i} />
                    ))}
                </div>

                {/* Optimizations Tab Content (hidden by default) */}
                <div className="hidden space-y-6">
                    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
                        <div className="h-32 rounded-xl skeleton" />
                        <div className="h-32 rounded-xl skeleton" />
                    </div>
                    {[1, 2].map((i) => (
                        <ShimmerOptimizationCard key={i} />
                    ))}
                </div>

                {/* Scenarios Tab Content (hidden by default) */}
                <div className="hidden space-y-6">
                    <div className="p-6 mb-8 rounded-xl border glass border-primary-200/30">
                        <div className="mb-6 w-48 h-6 rounded skeleton" />
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="p-5 rounded-xl border glass border-primary-200/30">
                                    <div className="w-full h-4 rounded skeleton" />
                                </div>
                            ))}
                        </div>
                    </div>
                    {[1, 2].map((i) => (
                        <ShimmerScenarioCard key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
};

