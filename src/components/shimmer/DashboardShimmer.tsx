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
            className={`group p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel ${className || ""}`}
        >
            <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                    <div className="skeleton h-4 w-24 mb-3 rounded" />
                    <div className="flex flex-wrap gap-3 items-baseline">
                        <div className="skeleton h-10 w-32 rounded" />
                        <div className="skeleton h-6 w-16 rounded-full" />
                    </div>
                </div>
                <div className="ml-6 shrink-0">
                    <div className="p-3.5 rounded-xl shadow-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                        <div className="w-7 h-7 skeleton rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShimmerCostChart: React.FC = () => {
    return (
        <div className="group p-8 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                    <ChartBarIcon className="w-6 h-6 text-primary-500/50" />
                </div>
                <div className="skeleton h-6 w-40 rounded" />
            </div>
            <div className="skeleton h-64 rounded-xl" />
        </div>
    );
};

const ShimmerServiceBreakdown: React.FC = () => {
    return (
        <div className="group p-8 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                    <CpuChipIcon className="w-6 h-6 text-primary-500/50" />
                </div>
                <div className="skeleton h-6 w-48 rounded" />
            </div>
            <div className="relative h-64 skeleton rounded-xl mb-6" />
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="flex justify-between items-center p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-bg-300/50"
                    >
                        <div className="flex gap-3 items-center">
                            <div className="w-4 h-4 skeleton rounded-full" />
                            <div className="skeleton h-4 w-32 rounded" />
                        </div>
                        <div className="text-right">
                            <div className="skeleton h-5 w-20 rounded mb-2" />
                            <div className="skeleton h-3 w-16 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ShimmerRecentActivity: React.FC = () => {
    return (
        <div className="group p-8 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                        <ClockIcon className="w-6 h-6 text-primary-500/50" />
                    </div>
                    <div className="skeleton h-6 w-40 rounded" />
                </div>
                <div className="skeleton h-4 w-16 rounded" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="flex gap-6 justify-between items-start p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-bg-300/50"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="skeleton h-4 w-full mb-2 rounded" />
                            <div className="flex gap-3 items-center">
                                <div className="skeleton h-3 w-16 rounded" />
                                <div className="skeleton h-3 w-1 rounded" />
                                <div className="skeleton h-3 w-24 rounded" />
                                <div className="skeleton h-3 w-1 rounded" />
                                <div className="skeleton h-3 w-20 rounded" />
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <div className="skeleton h-5 w-20 rounded mb-2" />
                            <div className="skeleton h-3 w-16 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ShimmerChatInterface: React.FC = () => {
    return (
        <div className="h-full glass backdrop-blur-xl rounded-2xl shadow-xl border border-primary-200/30 bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 overflow-hidden flex flex-col">
            {/* Chat Header */}
            <div className="flex-shrink-0 glass backdrop-blur-xl border-b border-primary-200/30 shadow-lg bg-gradient-to-r from-white/80 via-white/50 to-white/80 dark:from-dark-card/80 dark:via-dark-card/50 dark:to-dark-card/80 px-5 py-3.5">
                <div className="flex items-center gap-3">
                    <div className="skeleton h-10 w-10 rounded-xl" />
                    <div className="skeleton h-5 w-32 rounded" />
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-3">
                        <div className="skeleton h-8 w-8 rounded-full shrink-0" />
                        <div className="flex-1">
                            <div className="skeleton h-4 w-20 rounded mb-2" />
                            <div className="skeleton h-16 w-full rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat Input */}
            <div className="flex-shrink-0 border-t border-primary-200/30 p-4">
                <div className="flex gap-3 items-center">
                    <div className="flex-1 skeleton h-12 rounded-xl" />
                    <div className="skeleton h-12 w-12 rounded-xl" />
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
                <div className="mx-auto px-5 py-3.5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="skeleton h-9 w-9 rounded-xl shrink-0" />
                            <div className="skeleton h-6 w-32 rounded hidden sm:block" />
                            <div className="skeleton h-6 w-24 rounded hidden md:block" />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="skeleton h-8 w-24 rounded-lg hidden lg:block" />
                            <div className="skeleton h-8 w-20 rounded-lg hidden md:block" />
                            <div className="skeleton h-8 w-8 rounded-lg" />
                            <div className="skeleton h-8 w-24 rounded-lg" />
                            <div className="skeleton h-8 w-20 rounded-lg" />
                            <div className="skeleton h-9 w-9 rounded-lg" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 min-h-0 flex">
                {/* Chat Interface Area */}
                <div
                    className={`transition-all duration-500 ease-in-out ${viewMode === "dashboard"
                        ? "w-0 overflow-hidden"
                        : viewMode === "chat"
                            ? "w-full"
                            : "w-2/3"
                        } flex flex-col`}
                >
                    <div className="h-[calc(100vh-5rem)] p-6">
                        <ShimmerChatInterface />
                    </div>
                </div>

                {/* Dashboard Panel */}
                {viewMode !== "chat" && (
                    <div
                        className={`transition-all duration-500 ease-in-out ${viewMode === "dashboard" ? "w-full" : "w-1/3"
                            } flex flex-col`}
                    >
                        <div className="h-[calc(100vh-5rem)] p-6 pl-0">
                            <div className="h-full glass backdrop-blur-xl rounded-2xl shadow-xl border border-primary-200/30 bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 overflow-hidden flex flex-col">
                                {/* Dashboard Header */}
                                <div className="flex-shrink-0 glass backdrop-blur-xl border-b border-primary-200/30 shadow-lg bg-gradient-to-r from-white/80 via-white/50 to-white/80 dark:from-dark-card/80 dark:via-dark-card/50 dark:to-dark-card/80 px-5 py-3.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="skeleton h-10 w-10 rounded-xl" />
                                            <div>
                                                <div className="skeleton h-5 w-40 rounded mb-2" />
                                                <div className="skeleton h-3 w-32 rounded" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dashboard Content */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                                    {viewMode === "dashboard" ? (
                                        // Full dashboard view
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                                <ShimmerStatsCard />
                                                <ShimmerStatsCard />
                                                <ShimmerStatsCard />
                                                <ShimmerStatsCard />
                                            </div>

                                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                                <ShimmerCostChart />
                                                <ShimmerServiceBreakdown />
                                            </div>

                                            <ShimmerRecentActivity />
                                        </div>
                                    ) : (
                                        // Compact split view
                                        <div className="space-y-5">
                                            <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary-200/30">
                                                    <div className="p-1.5 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg">
                                                        <CpuChipIcon className="w-4 h-4 text-primary-500/50" />
                                                    </div>
                                                    <div className="skeleton h-4 w-32 rounded" />
                                                </div>
                                                <div className="skeleton h-48 rounded-xl mb-4" />
                                                <div className="space-y-2">
                                                    {[1, 2, 3].map((i) => (
                                                        <div
                                                            key={i}
                                                            className="flex justify-between items-center p-3 rounded-lg border border-primary-200/30"
                                                        >
                                                            <div className="flex gap-2 items-center">
                                                                <div className="skeleton h-3 w-3 rounded-full" />
                                                                <div className="skeleton h-3 w-24 rounded" />
                                                            </div>
                                                            <div className="skeleton h-3 w-16 rounded" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary-200/30">
                                                    <div className="p-1.5 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg">
                                                        <ChartBarIcon className="w-4 h-4 text-primary-500/50" />
                                                    </div>
                                                    <div className="skeleton h-4 w-24 rounded" />
                                                </div>
                                                <div className="skeleton h-48 rounded-xl" />
                                            </div>

                                            <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary-200/30">
                                                    <div className="p-1.5 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg">
                                                        <ClockIcon className="w-4 h-4 text-primary-500/50" />
                                                    </div>
                                                    <div className="skeleton h-4 w-28 rounded" />
                                                </div>
                                                <div className="space-y-2.5">
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <div
                                                            key={i}
                                                            className="flex justify-between items-center py-2.5 px-3.5 glass rounded-lg border border-primary-200/30"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <div className="skeleton h-4 w-full rounded mb-2" />
                                                                <div className="skeleton h-3 w-24 rounded" />
                                                            </div>
                                                            <div className="ml-3 text-right">
                                                                <div className="skeleton h-4 w-16 rounded" />
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

