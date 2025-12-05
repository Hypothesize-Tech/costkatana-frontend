import React from "react";

export const UnexplainedCostShimmer: React.FC = () => {
    return (
        <div className="p-3 md:p-4 lg:p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="p-4 md:p-6 lg:p-8 mb-4 md:mb-6 lg:mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                            <div className="mb-2 w-full sm:w-64 md:w-80 h-7 md:h-8 lg:h-9 rounded skeleton" />
                            <div className="w-full sm:w-80 md:w-96 h-4 md:h-5 rounded skeleton" />
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="w-full sm:w-40 h-10 rounded skeleton" />
                            <div className="w-full sm:w-48 h-10 rounded skeleton" />
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 gap-4 md:gap-6 mb-4 md:mb-6 lg:mb-8 lg:grid-cols-2">
                    {/* Cost Story Card - Full Width */}
                    <div className="lg:col-span-2">
                        <div className="p-4 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="mb-4 w-40 md:w-48 h-5 md:h-6 rounded skeleton" />
                            <div className="space-y-3 md:space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="p-3 md:p-4 rounded-lg border glass border-primary-200/30">
                                            <div className="mb-2 w-28 md:w-32 h-3 md:h-4 rounded skeleton" />
                                            <div className="w-20 md:w-24 h-5 md:h-6 rounded skeleton" />
                                        </div>
                                    ))}
                                </div>
                                <div className="w-full h-40 md:h-48 rounded-lg skeleton" />
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 rounded-lg border glass border-primary-200/30">
                                            <div className="w-full sm:w-40 h-3 md:h-4 rounded skeleton" />
                                            <div className="w-full sm:w-24 h-3 md:h-4 rounded skeleton" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cost Attribution Tree */}
                    <div>
                        <div className="p-4 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="mb-4 w-48 md:w-56 h-5 md:h-6 rounded skeleton" />
                            <div className="space-y-3 md:space-y-4">
                                <div className="w-full h-28 md:h-32 rounded-lg skeleton" />
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex gap-2 md:gap-3 items-center">
                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full skeleton flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="mb-1 w-full sm:w-32 h-3 md:h-4 rounded skeleton" />
                                                <div className="w-20 md:w-24 h-3 rounded skeleton" />
                                            </div>
                                            <div className="w-16 md:w-20 h-3 md:h-4 rounded skeleton flex-shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cost Optimization Panel */}
                    <div>
                        <div className="p-4 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="mb-4 w-56 md:w-64 h-5 md:h-6 rounded skeleton" />
                            <div className="space-y-3 md:space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-3 md:p-4 rounded-lg border glass border-primary-200/30">
                                        <div className="mb-2 w-full sm:w-40 h-4 md:h-5 rounded skeleton" />
                                        <div className="mb-2 w-full h-2 rounded-full skeleton" />
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                            <div className="w-20 md:w-24 h-3 rounded skeleton" />
                                            <div className="w-28 md:w-32 h-3 md:h-4 rounded skeleton" />
                                        </div>
                                    </div>
                                ))}
                                <div className="w-full h-10 rounded-lg skeleton" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
                    {/* Cost Anomaly Alerts */}
                    <div>
                        <div className="p-4 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="mb-4 w-40 md:w-48 h-5 md:h-6 rounded skeleton" />
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-3 md:p-4 rounded-lg border glass border-primary-200/30">
                                        <div className="flex gap-2 md:gap-3 items-start">
                                            <div className="w-4 h-4 md:w-5 md:h-5 rounded skeleton flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="mb-2 w-full h-3 md:h-4 rounded skeleton" />
                                                <div className="w-full sm:w-3/4 h-3 rounded skeleton" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cost Trends Chart */}
                    <div>
                        <div className="p-4 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="mb-4 w-40 md:w-48 h-5 md:h-6 rounded skeleton" />
                            <div className="w-full h-48 md:h-56 lg:h-64 rounded-lg skeleton" />
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
                                <div className="w-full sm:w-32 h-3 md:h-4 rounded skeleton" />
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-14 md:w-16 h-5 md:h-6 rounded skeleton" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

