import React from "react";

export const AutomationShimmer: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
                <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-lg">
                        <div className="w-5 h-5 rounded skeleton" />
                    </div>
                    <div className="w-64 h-8 rounded sm:h-9 skeleton" />
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-32 h-10 rounded-xl skeleton" />
                    <div className="w-24 h-10 rounded-xl skeleton" />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="w-24 h-4 rounded skeleton" />
                            <div className="w-5 h-5 rounded skeleton" />
                        </div>
                        <div className="mb-1 w-32 h-8 rounded skeleton" />
                        <div className="w-40 h-3 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20">
                <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="w-24 h-10 rounded-xl skeleton" />
                    ))}
                </div>
            </div>

            {/* Tab Content - Overview */}
            <div className="space-y-6">
                {/* Time Series Chart */}
                <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20">
                    <div className="mb-4 w-48 h-6 rounded skeleton" />
                    <div className="h-64 rounded skeleton" />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Platform Breakdown */}
                    <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20">
                        <div className="mb-4 w-40 h-6 rounded skeleton" />
                        <div className="mb-4 space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-center p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10"
                                >
                                    <div className="flex gap-3 items-center">
                                        <div className="w-8 h-8 rounded-lg skeleton" />
                                        <div>
                                            <div className="mb-1 w-24 h-4 rounded skeleton" />
                                            <div className="w-32 h-3 rounded skeleton" />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="mb-1 w-20 h-5 rounded skeleton" />
                                        <div className="w-24 h-3 rounded skeleton" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Platform Cost Distribution Chart */}
                        <div className="mt-4 h-48 rounded skeleton" />
                    </div>

                    {/* Top Workflows */}
                    <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20">
                        <div className="mb-4 w-36 h-6 rounded skeleton" />
                        <div className="mb-4 space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-center p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="mb-1 w-40 h-4 rounded skeleton" />
                                        <div className="w-32 h-3 rounded skeleton" />
                                    </div>
                                    <div className="ml-4 text-right">
                                        <div className="mb-1 w-20 h-5 rounded skeleton" />
                                        <div className="w-24 h-3 rounded skeleton" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Workflow Cost Distribution */}
                        <div className="mt-4 h-48 rounded skeleton" />
                    </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20"
                        >
                            <div className="flex gap-2 items-center mb-3">
                                <div className="w-6 h-6 rounded-lg skeleton" />
                                <div className="w-32 h-5 rounded skeleton" />
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <div className="w-32 h-3 rounded skeleton" />
                                    <div className="w-20 h-3 rounded skeleton" />
                                </div>
                                <div className="flex justify-between">
                                    <div className="w-36 h-3 rounded skeleton" />
                                    <div className="w-16 h-3 rounded skeleton" />
                                </div>
                                <div className="flex justify-between">
                                    <div className="w-28 h-3 rounded skeleton" />
                                    <div className="w-8 h-3 rounded skeleton" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quota Status Widget */}
                <div className="p-6 mt-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20">
                    <div className="mb-4 w-40 h-6 rounded skeleton" />
                    <div className="space-y-3">
                        <div className="w-full h-8 rounded skeleton" />
                        <div className="w-3/4 h-8 rounded skeleton" />
                        <div className="w-1/2 h-8 rounded skeleton" />
                    </div>
                </div>
            </div>
        </div>
    );
};

