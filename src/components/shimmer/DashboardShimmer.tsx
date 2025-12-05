import React from "react";
import {
    ChartBarIcon,
    ClockIcon,
    CpuChipIcon,
} from "@heroicons/react/24/outline";

interface ShimmerStatsCardProps {
    className?: string;
}

const ShimmerStatsCard: React.FC<ShimmerStatsCardProps> = ({ className }) => {
    return (
        <div
            className={`group p-4 sm:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel ${className || ""}`}
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
                        <div className="w-5 h-5 sm:w-7 sm:h-7 skeleton rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShimmerCostChart: React.FC = () => {
    return (
        <div className="group p-4 sm:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 rounded-xl shadow-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                    <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500/50" />
                </div>
                <div className="skeleton h-5 sm:h-6 w-32 sm:w-40 rounded" />
            </div>
            <div className="skeleton h-48 sm:h-56 lg:h-64 rounded-xl" />
        </div>
    );
};

const ShimmerServiceBreakdown: React.FC = () => {
    return (
        <div className="group p-4 sm:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 rounded-xl shadow-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                    <CpuChipIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500/50" />
                </div>
                <div className="skeleton h-5 sm:h-6 w-40 sm:w-48 rounded" />
            </div>
            <div className="relative h-48 sm:h-56 lg:h-64 skeleton rounded-xl mb-4 sm:mb-6" />
            <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="flex justify-between items-center p-3 sm:p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-bg-300/50"
                    >
                        <div className="flex gap-2 sm:gap-3 items-center">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 skeleton rounded-full" />
                            <div className="skeleton h-3 sm:h-4 w-24 sm:w-32 rounded" />
                        </div>
                        <div className="text-right">
                            <div className="skeleton h-4 sm:h-5 w-16 sm:w-20 rounded mb-1 sm:mb-2" />
                            <div className="skeleton h-2.5 sm:h-3 w-12 sm:w-16 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ShimmerRecentActivity: React.FC = () => {
    return (
        <div className="group p-4 sm:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-xl shadow-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                        <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500/50" />
                    </div>
                    <div className="skeleton h-5 sm:h-6 w-32 sm:w-40 rounded" />
                </div>
                <div className="skeleton h-3 sm:h-4 w-12 sm:w-16 rounded" />
            </div>
            <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="flex gap-3 sm:gap-6 justify-between items-start p-3 sm:p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-bg-300/50"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="skeleton h-3 sm:h-4 w-full mb-1.5 sm:mb-2 rounded" />
                            <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
                                <div className="skeleton h-2.5 sm:h-3 w-12 sm:w-16 rounded" />
                                <div className="skeleton h-2.5 sm:h-3 w-1 rounded" />
                                <div className="skeleton h-2.5 sm:h-3 w-20 sm:w-24 rounded" />
                                <div className="skeleton h-2.5 sm:h-3 w-1 rounded" />
                                <div className="skeleton h-2.5 sm:h-3 w-16 sm:w-20 rounded" />
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <div className="skeleton h-4 sm:h-5 w-16 sm:w-20 rounded mb-1 sm:mb-2" />
                            <div className="skeleton h-2.5 sm:h-3 w-12 sm:w-16 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ShimmerChatInterface: React.FC = () => {
    return (
        <div className="h-full glass backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-primary-200/30 bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 overflow-hidden flex flex-col">
            {/* Chat Header */}
            <div className="flex-shrink-0 glass backdrop-blur-xl border-b border-primary-200/30 shadow-lg bg-gradient-to-r from-white/80 via-white/50 to-white/80 dark:from-dark-card/80 dark:via-dark-card/50 dark:to-dark-card/80 px-3 sm:px-5 py-2.5 sm:py-3.5">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="skeleton h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl" />
                    <div className="skeleton h-4 sm:h-5 w-24 sm:w-32 rounded" />
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-2 sm:gap-3">
                        <div className="skeleton h-6 w-6 sm:h-8 sm:w-8 rounded-full shrink-0" />
                        <div className="flex-1">
                            <div className="skeleton h-3 sm:h-4 w-16 sm:w-20 rounded mb-1.5 sm:mb-2" />
                            <div className="skeleton h-12 sm:h-16 w-full rounded-lg sm:rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat Input */}
            <div className="flex-shrink-0 border-t border-primary-200/30 p-3 sm:p-4">
                <div className="flex gap-2 sm:gap-3 items-center">
                    <div className="flex-1 skeleton h-10 sm:h-12 rounded-lg sm:rounded-xl" />
                    <div className="skeleton h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl" />
                </div>
            </div>
        </div>
    );
};

interface DashboardShimmerProps {
    viewMode?: "split" | "chat" | "dashboard";
}

export const DashboardShimmer: React.FC<DashboardShimmerProps> = ({
    viewMode = "chat",
}) => {
    return (
        <div className="min-h-screen relative bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            {/* Header Shimmer */}
            <header className="glass backdrop-blur-xl sticky top-0 z-20 border-b border-primary-200/30 shadow-xl bg-gradient-to-r from-white/90 via-white/70 to-white/90 dark:from-dark-card/90 dark:via-dark-card/70 dark:to-dark-card/90 shrink-0">
                <div className="mx-auto px-3 sm:px-5 py-2.5 sm:py-3.5">
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="skeleton h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl shrink-0" />
                            <div className="skeleton h-5 sm:h-6 w-24 sm:w-32 rounded hidden sm:block" />
                            <div className="skeleton h-5 sm:h-6 w-20 sm:w-24 rounded hidden md:block" />
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            <div className="skeleton h-7 w-20 sm:h-8 sm:w-24 rounded-lg hidden lg:block" />
                            <div className="skeleton h-7 w-16 sm:h-8 sm:w-20 rounded-lg hidden md:block" />
                            <div className="skeleton h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
                            <div className="skeleton h-7 w-20 sm:h-8 sm:w-24 rounded-lg hidden sm:block" />
                            <div className="skeleton h-7 w-16 sm:h-8 sm:w-20 rounded-lg hidden sm:block" />
                            <div className="skeleton h-8 w-8 sm:h-9 sm:w-9 rounded-lg" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 min-h-0 flex flex-col lg:flex-row">
                {/* Chat Interface Area */}
                <div
                    className={`transition-all duration-500 ease-in-out ${
                        viewMode === "dashboard"
                            ? "hidden lg:w-0 lg:overflow-hidden"
                            : viewMode === "chat"
                            ? "w-full"
                            : "w-full lg:w-2/3"
                    } flex flex-col`}
                >
                    <div className="h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] lg:h-[calc(100vh-5rem)] p-3 sm:p-4 lg:p-6">
                        <ShimmerChatInterface />
                    </div>
                </div>

                {/* Dashboard Panel */}
                {viewMode !== "chat" && (
                    <div
                        className={`transition-all duration-500 ease-in-out ${
                            viewMode === "dashboard" ? "w-full" : "w-full lg:w-1/3"
                        } flex flex-col`}
                    >
                        <div className="h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] lg:h-[calc(100vh-5rem)] p-3 sm:p-4 lg:p-6 lg:pl-0">
                            <div className="h-full glass backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-primary-200/30 bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 overflow-hidden flex flex-col">
                                {/* Dashboard Header */}
                                <div className="flex-shrink-0 glass backdrop-blur-xl border-b border-primary-200/30 shadow-lg bg-gradient-to-r from-white/80 via-white/50 to-white/80 dark:from-dark-card/80 dark:via-dark-card/50 dark:to-dark-card/80 px-3 sm:px-5 py-2.5 sm:py-3.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="skeleton h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl" />
                                            <div>
                                                <div className="skeleton h-4 sm:h-5 w-32 sm:w-40 rounded mb-1.5 sm:mb-2" />
                                                <div className="skeleton h-2.5 sm:h-3 w-24 sm:w-32 rounded" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dashboard Content */}
                                <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 space-y-4 sm:space-y-5">
                                    {viewMode === "dashboard" ? (
                                        // Full dashboard view
                                        <div className="space-y-4 sm:space-y-6">
                                            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                                                <ShimmerStatsCard />
                                                <ShimmerStatsCard />
                                                <ShimmerStatsCard />
                                                <ShimmerStatsCard />
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-1 xl:grid-cols-2">
                                                <ShimmerCostChart />
                                                <ShimmerServiceBreakdown />
                                            </div>

                                            <ShimmerRecentActivity />
                                        </div>
                                    ) : (
                                        // Compact split view
                                        <div className="space-y-4 sm:space-y-5">
                                            <div className="glass backdrop-blur-xl rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                                                <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-primary-200/30">
                                                    <div className="p-1.5 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg">
                                                        <CpuChipIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500/50" />
                                                    </div>
                                                    <div className="skeleton h-3.5 sm:h-4 w-28 sm:w-32 rounded" />
                                                </div>
                                                <div className="skeleton h-40 sm:h-48 rounded-lg sm:rounded-xl mb-3 sm:mb-4" />
                                                <div className="space-y-2">
                                                    {[1, 2, 3].map((i) => (
                                                        <div
                                                            key={i}
                                                            className="flex justify-between items-center p-2.5 sm:p-3 rounded-lg border border-primary-200/30"
                                                        >
                                                            <div className="flex gap-2 items-center">
                                                                <div className="skeleton h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full" />
                                                                <div className="skeleton h-2.5 sm:h-3 w-20 sm:w-24 rounded" />
                                                            </div>
                                                            <div className="skeleton h-2.5 sm:h-3 w-12 sm:w-16 rounded" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="glass backdrop-blur-xl rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                                                <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-primary-200/30">
                                                    <div className="p-1.5 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg">
                                                        <ChartBarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500/50" />
                                                    </div>
                                                    <div className="skeleton h-3.5 sm:h-4 w-20 sm:w-24 rounded" />
                                                </div>
                                                <div className="skeleton h-40 sm:h-48 rounded-lg sm:rounded-xl" />
                                            </div>

                                            <div className="glass backdrop-blur-xl rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                                                <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-primary-200/30">
                                                    <div className="p-1.5 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg">
                                                        <ClockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500/50" />
                                                    </div>
                                                    <div className="skeleton h-3.5 sm:h-4 w-24 sm:w-28 rounded" />
                                                </div>
                                                <div className="space-y-2 sm:space-y-2.5">
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <div
                                                            key={i}
                                                            className="flex justify-between items-center py-2 px-2.5 sm:py-2.5 sm:px-3.5 glass rounded-lg border border-primary-200/30"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <div className="skeleton h-3 sm:h-4 w-full rounded mb-1.5 sm:mb-2" />
                                                                <div className="skeleton h-2.5 sm:h-3 w-20 sm:w-24 rounded" />
                                                            </div>
                                                            <div className="ml-2 sm:ml-3 text-right">
                                                                <div className="skeleton h-3 sm:h-4 w-12 sm:w-16 rounded" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
