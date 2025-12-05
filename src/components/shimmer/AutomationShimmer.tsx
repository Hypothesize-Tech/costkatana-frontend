import React from "react";

export const AutomationShimmer: React.FC = () => {
    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:gap-4 justify-between items-start sm:flex-row sm:items-center">
                <div className="flex gap-2 sm:gap-3 items-center">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-lg flex-shrink-0">
                        <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 rounded skeleton" />
                    </div>
                    <div className="w-48 sm:w-56 md:w-64 h-7 sm:h-8 md:h-9 rounded skeleton" />
                </div>
                <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                    <div className="w-full sm:w-28 md:w-32 h-9 sm:h-10 rounded-xl skeleton" />
                    <div className="w-full sm:w-20 md:w-24 h-9 sm:h-10 rounded-xl skeleton" />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="p-4 sm:p-5 md:p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20"
                    >
                        <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                            <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded skeleton" />
                        </div>
                        <div className="mb-1 w-28 sm:w-32 h-7 sm:h-8 rounded skeleton" />
                        <div className="w-36 sm:w-40 h-2.5 sm:h-3 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="p-3 sm:p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20">
                <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="w-20 sm:w-22 md:w-24 h-9 sm:h-10 rounded-xl skeleton" />
                    ))}
                </div>
            </div>

            {/* Tab Content - Overview */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Time Series Chart */}
                <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20">
                    <div className="mb-3 sm:mb-4 w-40 sm:w-44 md:w-48 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
                    <div className="h-48 sm:h-56 md:h-64 rounded skeleton" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-2">
                    {/* Platform Breakdown */}
                    <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20">
                        <div className="mb-3 sm:mb-4 w-32 sm:w-36 md:w-40 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
                        <div className="mb-3 sm:mb-4 space-y-2 sm:space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-center p-2.5 sm:p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10"
                                >
                                    <div className="flex gap-2 sm:gap-3 items-center min-w-0 flex-1">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg skeleton flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                            <div className="w-28 sm:w-32 h-2.5 sm:h-3 rounded skeleton" />
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                        <div className="mb-1 w-16 sm:w-20 h-4 sm:h-5 rounded skeleton" />
                                        <div className="w-20 sm:w-24 h-2.5 sm:h-3 rounded skeleton" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Platform Cost Distribution Chart */}
                        <div className="mt-3 sm:mt-4 h-40 sm:h-44 md:h-48 rounded skeleton" />
                    </div>

                    {/* Top Workflows */}
                    <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20">
                        <div className="mb-3 sm:mb-4 w-32 sm:w-36 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
                        <div className="mb-3 sm:mb-4 space-y-2 sm:space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-center p-2.5 sm:p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10"
                                >
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="mb-1 w-36 sm:w-40 h-3 sm:h-4 rounded skeleton" />
                                        <div className="w-28 sm:w-32 h-2.5 sm:h-3 rounded skeleton" />
                                    </div>
                                    <div className="ml-2 sm:ml-4 text-right flex-shrink-0">
                                        <div className="mb-1 w-16 sm:w-20 h-4 sm:h-5 rounded skeleton" />
                                        <div className="w-20 sm:w-24 h-2.5 sm:h-3 rounded skeleton" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Workflow Cost Distribution */}
                        <div className="mt-3 sm:mt-4 h-40 sm:h-44 md:h-48 rounded skeleton" />
                    </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="p-3 sm:p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20"
                        >
                            <div className="flex gap-1.5 sm:gap-2 items-center mb-2 sm:mb-3">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg skeleton flex-shrink-0" />
                                <div className="w-28 sm:w-32 h-4 sm:h-5 rounded skeleton" />
                            </div>
                            <div className="space-y-1.5 sm:space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <div className="w-28 sm:w-32 h-2.5 sm:h-3 rounded skeleton" />
                                    <div className="w-16 sm:w-20 h-2.5 sm:h-3 rounded skeleton" />
                                </div>
                                <div className="flex justify-between">
                                    <div className="w-32 sm:w-36 h-2.5 sm:h-3 rounded skeleton" />
                                    <div className="w-12 sm:w-16 h-2.5 sm:h-3 rounded skeleton" />
                                </div>
                                <div className="flex justify-between">
                                    <div className="w-24 sm:w-28 h-2.5 sm:h-3 rounded skeleton" />
                                    <div className="w-6 sm:w-8 h-2.5 sm:h-3 rounded skeleton" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quota Status Widget */}
                <div className="p-4 sm:p-5 md:p-6 mt-4 sm:mt-5 md:mt-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20">
                    <div className="mb-3 sm:mb-4 w-36 sm:w-40 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
                    <div className="space-y-2 sm:space-y-3">
                        <div className="w-full h-7 sm:h-8 rounded skeleton" />
                        <div className="w-3/4 h-7 sm:h-8 rounded skeleton" />
                        <div className="w-1/2 h-7 sm:h-8 rounded skeleton" />
                    </div>
                </div>
            </div>
        </div>
    );
};

