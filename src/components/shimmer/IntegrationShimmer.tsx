import React from "react";

export const IntegrationShimmer: React.FC = () => {
    return (
        <div className="px-3 py-4 mx-auto space-y-4 max-w-7xl sm:px-4 sm:py-6 sm:space-y-6 md:px-6 md:py-8 md:space-y-8 lg:px-8">
            {/* Header */}
            <div className="p-3 bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-3 items-start sm:flex-row sm:items-center sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-lg shrink-0">
                        <div className="w-5 h-5 rounded skeleton sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                        <div className="mb-1 w-full h-6 rounded skeleton sm:w-64 sm:h-7 md:w-80 md:h-8" />
                        <div className="mt-1 w-full h-3 rounded skeleton sm:mt-2 sm:w-80 sm:h-4 md:w-96 md:h-5" />
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="p-3 bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-4 md:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                    <div className="w-full h-9 rounded-xl skeleton sm:w-24" />
                    <div className="w-full h-9 rounded-xl skeleton sm:w-48 md:w-64" />
                </div>
            </div>

            {/* Tab Content - Overview */}
            {/* Integration Health */}
            <div className="p-3 bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-3 justify-between items-start mb-3 sm:flex-row sm:items-center sm:gap-4 sm:mb-4 md:mb-6">
                    <div className="flex gap-2 items-center sm:gap-3 md:gap-4">
                        <div className="w-7 h-7 rounded-xl skeleton sm:w-8 sm:h-8 md:w-10 md:h-10" />
                        <div className="w-full h-6 rounded skeleton sm:w-40 sm:h-7 md:w-48 md:h-8" />
                    </div>
                    <div className="w-full h-7 rounded-full skeleton sm:w-24 sm:h-8" />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="p-3 text-center rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 sm:p-4 md:p-6"
                        >
                            <div className="mb-1 w-full h-7 rounded skeleton sm:mb-2 sm:w-16 sm:h-8 md:w-20 md:h-9" />
                            <div className="mx-auto w-full h-3 rounded skeleton sm:w-20 sm:h-4" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
                {/* Left Column - Quick Actions */}
                <div className="lg:col-span-1">
                    <div className="p-3 bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-4 md:p-6">
                        <div className="flex items-center mb-3 sm:mb-4 md:mb-6">
                            <div className="w-7 h-7 rounded-lg skeleton sm:w-8 sm:h-8" />
                            <div className="ml-2 w-full h-5 rounded skeleton sm:ml-3 sm:w-32 sm:h-6" />
                        </div>
                        <div className="space-y-2 sm:space-y-3 md:space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-full min-h-[40px] p-2 rounded-xl skeleton sm:min-h-[44px] sm:p-3 md:p-4"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Recent Activity */}
                <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                        <div className="p-3 border-b sm:p-4 md:p-6 border-primary-200/30 dark:border-primary-500/20">
                            <div className="flex items-center">
                                <div className="mr-2 w-7 h-7 rounded-lg skeleton sm:mr-3 sm:w-8 sm:h-8" />
                                <div className="w-full h-5 rounded skeleton sm:w-40 sm:h-6" />
                            </div>
                        </div>
                        <div className="overflow-y-auto max-h-96 divide-y divide-primary-200/30 dark:divide-primary-500/20">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="p-3 sm:p-4 md:p-6 min-h-[40px] sm:min-h-[44px]"
                                >
                                    <div className="flex flex-col gap-2 justify-between items-start sm:flex-row sm:items-center sm:gap-3 md:gap-4">
                                        <div className="flex flex-1 items-center space-x-2 min-w-0 sm:space-x-3 md:space-x-4">
                                            <div className="flex-shrink-0 w-7 h-7 rounded-lg skeleton sm:w-8 sm:h-8" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="w-full h-4 rounded skeleton sm:w-32 sm:h-5" />
                                                    <div className="w-full h-4 rounded-full skeleton sm:w-20 sm:h-5" />
                                                </div>
                                                <div className="p-2 mb-2 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 sm:p-3 sm:mb-3">
                                                    <div className="flex flex-wrap gap-1.5 items-center mb-1.5 sm:gap-2 sm:mb-2">
                                                        <div className="w-full h-3 rounded skeleton sm:w-24 sm:h-4" />
                                                        <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-4" />
                                                    </div>
                                                    <div className="mb-1 w-full h-2.5 rounded skeleton sm:h-3" />
                                                    <div className="w-3/4 h-2.5 rounded skeleton sm:h-3" />
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 items-center sm:gap-2 md:gap-4">
                                                    <div className="w-full h-5 rounded-lg skeleton sm:w-24 sm:h-6" />
                                                    <div className="w-full h-5 rounded-lg skeleton sm:w-20 sm:h-6" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 ml-0 w-7 h-7 rounded skeleton sm:ml-4 sm:w-8 sm:h-8" />
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

