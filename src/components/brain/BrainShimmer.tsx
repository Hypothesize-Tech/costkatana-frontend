import React from 'react';

export const MetricCardShimmer: React.FC = () => {
    return (
        <div className="group p-4 sm:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel animate-pulse">
            <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0 space-y-3">
                    <div className="w-24 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="w-32 h-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="w-28 h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="ml-4 shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                </div>
            </div>
        </div>
    );
};

export const FlowCardShimmer: React.FC = () => {
    return (
        <div className="p-3 sm:p-4 rounded-xl border border-primary-200/20 dark:border-primary-500/10 bg-white/50 dark:bg-gray-800/50 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="w-16 h-5 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="w-12 h-5 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="w-20 h-5 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="space-y-2">
                <div className="w-full h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="w-3/4 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
        </div>
    );
};

export const InterventionCardShimmer: React.FC = () => {
    return (
        <div className="p-3 sm:p-4 rounded-xl border border-success-300/30 dark:border-success-500/20 bg-gradient-to-r from-success-500/5 to-success-600/5 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="w-24 h-5 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="w-16 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="w-16 h-5 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="space-y-2">
                <div className="w-full h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="w-5/6 h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="w-1/2 h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
        </div>
    );
};

export const TableShimmer: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                        {[1, 2, 3, 4, 5, 6].map((col) => (
                            <th key={col} className="text-left py-3 px-4">
                                <div className="w-20 h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                            {[1, 2, 3, 4, 5, 6].map((col) => (
                                <td key={col} className="py-3 px-4">
                                    <div className="w-16 h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const ChartCardShimmer: React.FC = () => {
    return (
        <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6 animate-pulse">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className="w-5 h-5 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                <div className="w-32 h-5 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="space-y-3">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                        <div className="w-24 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="w-8 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const BudgetForecastShimmer: React.FC = () => {
    return (
        <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6 animate-pulse">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-5 h-5 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                <div className="w-40 h-6 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="space-y-2">
                        <div className="w-20 h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="w-24 h-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                ))}
            </div>
            <div className="space-y-2">
                <div className="w-32 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
        </div>
    );
};

export const OverviewShimmer: React.FC = () => {
    return (
        <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {[1, 2, 3, 4].map((item) => (
                    <MetricCardShimmer key={item} />
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <ChartCardShimmer />
                <ChartCardShimmer />
            </div>
        </>
    );
};

export const FlowsShimmer: React.FC = () => {
    return (
        <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                <div className="w-48 h-6 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="w-16 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            </div>
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                    <FlowCardShimmer key={item} />
                ))}
            </div>
        </div>
    );
};

export const InterventionsShimmer: React.FC = () => {
    return (
        <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                <div className="w-56 h-6 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="w-32 h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            </div>
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                    <InterventionCardShimmer key={item} />
                ))}
            </div>
        </div>
    );
};

export const LearningStatsShimmer: React.FC = () => {
    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6 animate-pulse">
                <div className="w-48 h-6 rounded bg-gray-200 dark:bg-gray-700 mb-4 sm:mb-6"></div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="space-y-2">
                            <div className="w-32 h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="w-20 h-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6">
                <div className="w-56 h-6 rounded bg-gray-200 dark:bg-gray-700 mb-4 sm:mb-6 animate-pulse"></div>
                <TableShimmer rows={4} />
            </div>
        </div>
    );
};

