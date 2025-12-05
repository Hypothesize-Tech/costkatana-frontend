import React from "react";
import {
    Globe,
    BarChart3,
    DollarSign,
    Zap,
    Clock,
    Monitor,
    Target,
    Settings,
    Tag,
} from "lucide-react";

const ShimmerSummaryCard: React.FC<{ icon: React.ComponentType<{ className?: string }> }> = ({ icon: Icon }) => {
    return (
        <div className="p-3 sm:p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center">
                <div className="flex-1">
                    <div className="mb-2 w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                    <div className="mb-1 w-24 sm:w-32 h-6 sm:h-8 rounded skeleton" />
                    <div className="w-16 sm:w-20 h-2.5 sm:h-3 rounded skeleton" />
                </div>
                <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-primary/20">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500/50" />
                </div>
            </div>
        </div>
    );
};

const ShimmerSystemStatCard: React.FC = () => {
    return (
        <div className="p-3 sm:p-4 text-center rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="mb-2 w-16 sm:w-20 h-3 sm:h-4 mx-auto rounded skeleton" />
            <div className="mb-1 w-20 sm:w-24 h-6 sm:h-8 mx-auto rounded skeleton" />
            <div className="w-12 sm:w-16 h-2.5 sm:h-3 mx-auto rounded skeleton" />
        </div>
    );
};

const ShimmerProviderCard: React.FC = () => {
    return (
        <div className="p-3 sm:p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
                <div className="w-20 sm:w-24 h-4 sm:h-5 rounded skeleton" />
                <div className="w-14 sm:w-16 h-5 sm:h-6 rounded-full skeleton" />
            </div>
            <div className="mb-2 sm:mb-3 w-full h-2.5 sm:h-3 rounded-full skeleton" />
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-between">
                <div className="w-16 sm:w-20 h-5 sm:h-6 rounded-full skeleton" />
                <div className="w-16 sm:w-20 h-5 sm:h-6 rounded-full skeleton" />
                <div className="w-16 sm:w-20 h-5 sm:h-6 rounded-full skeleton" />
            </div>
        </div>
    );
};

const ShimmerBudgetCard: React.FC = () => {
    return (
        <div className="p-3 sm:p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
                <div className="w-24 sm:w-32 h-4 sm:h-5 rounded skeleton" />
                <div className="w-14 sm:w-16 h-5 sm:h-6 rounded-full skeleton" />
            </div>
            <div className="mb-2 sm:mb-3 w-full h-2.5 sm:h-3 rounded-full skeleton" />
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-between">
                <div className="w-20 sm:w-24 h-5 sm:h-6 rounded-full skeleton" />
                <div className="w-20 sm:w-24 h-5 sm:h-6 rounded-full skeleton" />
            </div>
        </div>
    );
};

const ShimmerFeatureCard: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 text-center rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="mb-2 sm:mb-3 w-24 sm:w-32 h-4 sm:h-5 mx-auto rounded skeleton" />
            <div className="mb-1.5 sm:mb-2 w-12 sm:w-16 h-8 sm:h-10 mx-auto rounded skeleton" />
            <div className="w-16 sm:w-20 h-2.5 sm:h-3 mx-auto rounded skeleton" />
        </div>
    );
};

const ShimmerPropertyCard: React.FC = () => {
    return (
        <div className="flex justify-between items-center p-3 sm:p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex-1">
                <div className="w-32 sm:w-48 h-4 sm:h-5 rounded skeleton" />
            </div>
            <div className="flex flex-col gap-1.5 sm:gap-2 text-right">
                <div className="w-20 sm:w-24 h-5 sm:h-6 rounded-full skeleton" />
                <div className="w-16 sm:w-20 h-4 sm:h-5 rounded-full skeleton" />
            </div>
        </div>
    );
};

export const GatewayShimmer: React.FC = () => {
    return (
        <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            {/* Header Shimmer */}
            <header className="mb-4 sm:mb-5 md:mb-6">
                <div className="p-4 sm:p-6 md:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                        <div className="flex gap-2 sm:gap-3 items-center mb-2">
                            <div className="flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg bg-gradient-primary/20">
                                <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500/50" />
                            </div>
                            <div className="w-36 sm:w-48 h-7 sm:h-9 rounded skeleton" />
                        </div>
                        <div className="flex gap-2 sm:gap-3 items-center w-full sm:w-auto">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full skeleton" />
                            <div className="w-16 sm:w-20 h-5 sm:h-6 rounded-full skeleton" />
                            <div className="w-20 sm:w-24 h-9 sm:h-11 rounded-xl skeleton ml-auto sm:ml-0" />
                        </div>
                    </div>
                    <div className="mt-2 w-full sm:w-80 h-3.5 sm:h-4 rounded skeleton" />
                </div>
            </header>

            {/* Summary Cards Shimmer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                <ShimmerSummaryCard icon={BarChart3} />
                <ShimmerSummaryCard icon={DollarSign} />
                <ShimmerSummaryCard icon={Zap} />
                <ShimmerSummaryCard icon={Clock} />
            </div>

            {/* System Stats Shimmer */}
            <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg bg-gradient-secondary/20">
                        <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-500/50" />
                    </div>
                    <div className="w-24 sm:w-32 h-5 sm:h-6 rounded skeleton" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <ShimmerSystemStatCard />
                    <ShimmerSystemStatCard />
                    <ShimmerSystemStatCard />
                </div>
            </div>

            {/* Provider Breakdown Shimmer */}
            <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg bg-gradient-primary/20">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500/50" />
                    </div>
                    <div className="w-24 sm:w-32 h-5 sm:h-6 rounded skeleton" />
                </div>
                <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3].map((i) => (
                        <ShimmerProviderCard key={i} />
                    ))}
                </div>
            </div>

            {/* Budget Utilization Shimmer */}
            <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-success-200/30 dark:border-success-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg bg-gradient-success/20">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-success-500/50" />
                    </div>
                    <div className="w-32 sm:w-40 h-5 sm:h-6 rounded skeleton" />
                </div>
                <div className="space-y-3 sm:space-y-4">
                    {[1, 2].map((i) => (
                        <ShimmerBudgetCard key={i} />
                    ))}
                </div>
            </div>

            {/* Features Usage Shimmer */}
            <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-accent-200/30 dark:border-accent-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg bg-gradient-accent/20">
                        <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-accent-500/50" />
                    </div>
                    <div className="w-24 sm:w-32 h-5 sm:h-6 rounded skeleton" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {[1, 2, 3].map((i) => (
                        <ShimmerFeatureCard key={i} />
                    ))}
                </div>
            </div>

            {/* Top Properties Shimmer */}
            <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-secondary-200/30 dark:border-secondary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg bg-gradient-secondary/20">
                        <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-500/50" />
                    </div>
                    <div className="w-32 sm:w-40 h-5 sm:h-6 rounded skeleton" />
                </div>
                <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <ShimmerPropertyCard key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
};
