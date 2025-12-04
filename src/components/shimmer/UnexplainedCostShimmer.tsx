import React from "react";

export const UnexplainedCostShimmer: React.FC = () => {
    return (
        <div className="p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="p-8 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                            <div className="mb-2 w-80 h-9 rounded skeleton" />
                            <div className="w-96 h-5 rounded skeleton" />
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col gap-3 mt-4 sm:mt-0 sm:flex-row">
                            <div className="w-40 h-10 rounded skeleton" />
                            <div className="w-48 h-10 rounded skeleton" />
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
                    {/* Cost Story Card - Full Width */}
                    <div className="lg:col-span-2">
                        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="mb-4 w-48 h-6 rounded skeleton" />
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="p-4 rounded-lg border glass border-primary-200/30">
                                            <div className="mb-2 w-32 h-4 rounded skeleton" />
                                            <div className="w-24 h-6 rounded skeleton" />
                                        </div>
                                    ))}
                                </div>
                                <div className="w-full h-48 rounded-lg skeleton" />
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex justify-between items-center p-3 rounded-lg border glass border-primary-200/30">
                                            <div className="w-40 h-4 rounded skeleton" />
                                            <div className="w-24 h-4 rounded skeleton" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cost Attribution Tree */}
                    <div>
                        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="mb-4 w-56 h-6 rounded skeleton" />
                            <div className="space-y-4">
                                <div className="w-full h-32 rounded-lg skeleton" />
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex gap-3 items-center">
                                            <div className="w-8 h-8 rounded-full skeleton" />
                                            <div className="flex-1">
                                                <div className="mb-1 w-32 h-4 rounded skeleton" />
                                                <div className="w-24 h-3 rounded skeleton" />
                                            </div>
                                            <div className="w-20 h-4 rounded skeleton" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cost Optimization Panel */}
                    <div>
                        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="mb-4 w-64 h-6 rounded skeleton" />
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-4 rounded-lg border glass border-primary-200/30">
                                        <div className="mb-2 w-40 h-5 rounded skeleton" />
                                        <div className="mb-2 w-full h-2 rounded-full skeleton" />
                                        <div className="flex justify-between items-center">
                                            <div className="w-24 h-3 rounded skeleton" />
                                            <div className="w-32 h-4 rounded skeleton" />
                                        </div>
                                    </div>
                                ))}
                                <div className="w-full h-10 rounded-lg skeleton" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Cost Anomaly Alerts */}
                    <div>
                        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="mb-4 w-48 h-6 rounded skeleton" />
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-4 rounded-lg border glass border-primary-200/30">
                                        <div className="flex gap-3 items-start">
                                            <div className="w-5 h-5 rounded skeleton" />
                                            <div className="flex-1">
                                                <div className="mb-2 w-full h-4 rounded skeleton" />
                                                <div className="w-3/4 h-3 rounded skeleton" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cost Trends Chart */}
                    <div>
                        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="mb-4 w-48 h-6 rounded skeleton" />
                            <div className="w-full h-64 rounded-lg skeleton" />
                            <div className="flex justify-between items-center mt-4">
                                <div className="w-32 h-4 rounded skeleton" />
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-16 h-6 rounded skeleton" />
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

