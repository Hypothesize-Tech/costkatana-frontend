import React from "react";
import {
    CurrencyDollarIcon,
    HashtagIcon,
    CircleStackIcon,
    ClockIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";

const ShimmerStatsCard: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl transition-all duration-300 glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
                <div className="p-2.5 sm:p-3 rounded-xl glass border border-primary-200/30 dark:border-primary-500/20">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 skeleton rounded" />
                </div>
                <div className="skeleton h-6 w-16 rounded-xl" />
            </div>
            <div>
                <div className="skeleton h-4 w-24 mb-2 rounded" />
                <div className="skeleton h-7 w-32 mb-2 rounded" />
                <div className="skeleton h-3 w-20 rounded" />
            </div>
        </div>
    );
};

const ShimmerUsageChart: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#06ec9e]/20 via-emerald-500/20 to-[#009454]/20">
                        <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500/50" />
                    </div>
                    <div>
                        <div className="skeleton h-5 w-40 mb-2 rounded" />
                        <div className="skeleton h-3 w-32 rounded" />
                    </div>
                </div>
            </div>
            <div className="skeleton h-[250px] sm:h-[300px] rounded-xl" />
        </div>
    );
};

const ShimmerSimpleStatsCard: React.FC<{ icon: React.ComponentType<{ className?: string }> }> = ({ icon: Icon }) => {
    return (
        <div className="p-4 sm:p-6 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center">
                <div className="p-3 mr-3 sm:mr-4 bg-gradient-to-br rounded-xl from-primary-500/20 to-primary-600/20">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500/50" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="skeleton h-4 w-24 mb-2 rounded" />
                    <div className="skeleton h-7 w-28 rounded" />
                </div>
            </div>
        </div>
    );
};

const ShimmerTokenBreakdownCard: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center">
                <div className="p-3 mr-3 sm:mr-4 bg-gradient-to-br rounded-xl from-highlight-500/20 to-highlight-600/20">
                    <CircleStackIcon className="w-5 h-5 sm:w-6 sm:h-6 text-highlight-500/50" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="skeleton h-4 w-28 mb-3 rounded" />
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="skeleton h-3 w-16 rounded" />
                            <div className="skeleton h-3 w-20 rounded" />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="skeleton h-3 w-16 rounded" />
                            <div className="skeleton h-3 w-20 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShimmerUsageTableRow: React.FC = () => {
    return (
        <tr className="border-b border-primary-200/30 dark:border-primary-700/30">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="skeleton w-8 h-8 rounded-full" />
                    <div className="flex-1">
                        <div className="skeleton h-4 w-24 mb-2 rounded" />
                        <div className="skeleton h-3 w-32 rounded" />
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="skeleton h-4 w-20 rounded" />
            </td>
            <td className="px-6 py-4">
                <div className="skeleton h-4 w-32 rounded" />
            </td>
            <td className="px-6 py-4">
                <div className="skeleton h-4 w-16 rounded" />
            </td>
            <td className="px-6 py-4">
                <div className="skeleton h-4 w-20 rounded" />
            </td>
            <td className="px-6 py-4">
                <div className="skeleton h-4 w-16 rounded" />
            </td>
            <td className="px-6 py-4">
                <div className="skeleton h-4 w-12 rounded" />
            </td>
            <td className="px-6 py-4">
                <div className="skeleton h-4 w-24 rounded" />
            </td>
        </tr>
    );
};

export const UsageShimmer: React.FC = () => {
    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Usage Stats Shimmer */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <ShimmerStatsCard />
                <ShimmerStatsCard />
                <ShimmerStatsCard />
                <ShimmerStatsCard />
            </div>

            {/* Usage Chart Shimmer */}
            <ShimmerUsageChart />

            {/* Stats Cards Shimmer */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <ShimmerSimpleStatsCard icon={CurrencyDollarIcon} />
                <ShimmerSimpleStatsCard icon={HashtagIcon} />
                <ShimmerTokenBreakdownCard />
                <ShimmerSimpleStatsCard icon={ClockIcon} />
            </div>

            {/* Search and Filters Shimmer */}
            <div className="p-4 sm:p-6 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row">
                    <div className="flex-1 skeleton h-11 rounded-xl" />
                    <div className="skeleton h-11 w-32 rounded-xl" />
                </div>
            </div>

            {/* Cost Optimization Banner Shimmer */}
            <div className="p-4 sm:p-6 bg-gradient-to-br rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="skeleton w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
                        <div>
                            <div className="skeleton h-5 w-56 mb-2 rounded" />
                            <div className="skeleton h-4 w-64 rounded" />
                        </div>
                    </div>
                    <div className="skeleton h-11 w-40 rounded-xl" />
                </div>
            </div>

            {/* Usage List Shimmer */}
            <div className="overflow-hidden rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-primary-200/30 dark:border-primary-700/30">
                    <div className="flex justify-between items-center">
                        <div className="skeleton h-6 w-32 rounded" />
                        <div className="skeleton w-10 h-10 rounded-xl" />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-primary-200/30">
                        <thead className="bg-gradient-to-r glass from-primary-50/30 to-secondary-50/30 dark:from-primary-900/20 dark:to-secondary-900/20">
                            <tr>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <th key={i} className="px-6 py-4">
                                        <div className="skeleton h-4 w-20 rounded" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary-200/30">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <ShimmerUsageTableRow key={i} />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Shimmer */}
                <div className="px-6 py-4 border-t border-primary-200/30 dark:border-primary-700/30">
                    <div className="flex justify-between items-center">
                        <div className="skeleton h-4 w-32 rounded" />
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="skeleton h-9 w-9 rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

