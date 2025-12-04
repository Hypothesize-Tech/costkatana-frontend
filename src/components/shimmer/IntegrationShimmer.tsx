import React from "react";

export const IntegrationShimmer: React.FC = () => {
    return (
        <div className="px-4 py-6 mx-auto space-y-6 max-w-7xl sm:py-8 sm:px-6 lg:px-8 sm:space-y-8">
            {/* Header */}
            <div className="p-4 bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-6 lg:p-8">
                <div className="flex gap-3 items-center sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-lg">
                        <div className="w-5 h-5 rounded skeleton sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <div className="mb-1 w-64 h-7 rounded skeleton sm:w-80 sm:h-8" />
                        <div className="mt-1 w-80 h-4 rounded skeleton sm:mt-2 sm:w-96 sm:h-5" />
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="p-4 bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                    <div className="w-24 h-9 rounded-xl skeleton" />
                    <div className="w-48 h-9 rounded-xl skeleton sm:w-64" />
                </div>
            </div>

            {/* Tab Content - Overview */}
            {/* Integration Health */}
            <div className="p-4 bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-4 justify-between items-start mb-4 sm:flex-row sm:items-center sm:mb-6">
                    <div className="flex gap-3 items-center sm:gap-4">
                        <div className="w-8 h-8 rounded-xl skeleton sm:w-10 sm:h-10" />
                        <div className="w-40 h-7 rounded skeleton sm:w-48 sm:h-8" />
                    </div>
                    <div className="w-24 h-8 rounded-full skeleton" />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="p-4 text-center rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 sm:p-6"
                        >
                            <div className="mb-1 w-16 h-8 rounded skeleton sm:mb-2 sm:w-20 sm:h-9" />
                            <div className="mx-auto w-20 h-4 rounded skeleton" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
                {/* Left Column - Quick Actions */}
                <div className="lg:col-span-1">
                    <div className="p-4 bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-6">
                        <div className="flex items-center mb-4 sm:mb-6">
                            <div className="w-8 h-8 rounded-lg skeleton" />
                            <div className="ml-3 w-32 h-6 rounded skeleton" />
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-full min-h-[44px] p-3 sm:p-4 rounded-xl skeleton"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Recent Activity */}
                <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                        <div className="p-4 border-b sm:p-6 border-primary-200/30 dark:border-primary-500/20">
                            <div className="flex items-center">
                                <div className="mr-3 w-8 h-8 rounded-lg skeleton" />
                                <div className="w-40 h-6 rounded skeleton" />
                            </div>
                        </div>
                        <div className="overflow-y-auto max-h-96 divide-y divide-primary-200/30 dark:divide-primary-500/20">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="p-4 sm:p-6 min-h-[44px]"
                                >
                                    <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex flex-1 items-center space-x-3 min-w-0 sm:space-x-4">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-lg skeleton" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="w-32 h-5 rounded skeleton" />
                                                    <div className="w-20 h-5 rounded-full skeleton" />
                                                </div>
                                                <div className="p-3 mb-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                                                    <div className="flex flex-wrap gap-2 items-center mb-2">
                                                        <div className="w-24 h-4 rounded skeleton" />
                                                        <div className="w-20 h-4 rounded skeleton" />
                                                    </div>
                                                    <div className="mb-1 w-full h-3 rounded skeleton" />
                                                    <div className="w-3/4 h-3 rounded skeleton" />
                                                </div>
                                                <div className="flex flex-wrap gap-2 items-center sm:gap-4">
                                                    <div className="w-24 h-6 rounded-lg skeleton" />
                                                    <div className="w-20 h-6 rounded-lg skeleton" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 ml-0 w-8 h-8 rounded skeleton sm:ml-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

