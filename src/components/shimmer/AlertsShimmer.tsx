import React from "react";
import { BellIcon } from "@heroicons/react/24/outline";

export const AlertsShimmer: React.FC = () => {
    return (
        <div className="p-4 min-h-screen sm:p-6 lg:p-8 bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            {/* Header */}
            <div className="p-8 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <div className="flex gap-3 items-center mb-4">
                            <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-danger/20">
                                <BellIcon className="w-6 h-6 text-danger-500/50" />
                            </div>
                            <div className="w-32 h-7 rounded skeleton" />
                        </div>
                        <div className="w-96 h-4 rounded skeleton" />
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <div className="w-40 h-11 rounded-xl skeleton" />
                    </div>
                </div>
            </div>

            {/* Alert Summary */}
            <div className="glass rounded-xl p-8 border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary/20 mr-4">
                        <div className="w-6 h-6 rounded skeleton" />
                    </div>
                    <div className="w-40 h-7 rounded skeleton" />
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    {[1, 2].map((i) => (
                        <div key={i} className="glass rounded-xl p-6 border border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-5 h-5 rounded skeleton" />
                                <div className="w-24 h-4 rounded skeleton" />
                            </div>
                            <div className="w-20 h-9 rounded skeleton" />
                        </div>
                    ))}
                </div>

                {/* Severity Breakdown */}
                <div className="space-y-4">
                    <div className="w-32 h-5 rounded skeleton" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="glass rounded-xl p-4 border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl shadow-lg bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-primary/20 mb-3">
                                        <div className="w-6 h-6 rounded skeleton" />
                                    </div>
                                    <div className="mb-1 w-16 h-3 rounded skeleton" />
                                    <div className="w-12 h-7 rounded skeleton" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Type Breakdown */}
                <div className="mt-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-5 h-5 rounded skeleton" />
                        <div className="w-24 h-5 rounded skeleton" />
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-sm backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                <div className="w-40 h-4 rounded skeleton" />
                                <div className="w-8 h-4 rounded skeleton" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters and Alert List */}
            <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6">
                {/* Alert Filter */}
                <div className="glass rounded-xl p-6 border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel mb-6">
                    <div className="flex items-center mb-6">
                        <div className="w-8 h-8 rounded-lg bg-gradient-primary/20 mr-3">
                            <div className="w-5 h-5 rounded skeleton" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded skeleton" />
                            <div className="w-24 h-5 rounded skeleton" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i}>
                                <div className="mb-2 w-16 h-4 rounded skeleton" />
                                <div className="w-full h-11 rounded skeleton" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <div className="w-32 h-9 rounded skeleton" />
                    </div>
                </div>

                {/* Alert List */}
                <div className="space-y-8">
                    {[1, 2].map((dateGroup) => (
                        <div key={dateGroup}>
                            {/* Date Header */}
                            <div className="flex items-center mb-4">
                                <div className="w-3 h-3 rounded-full bg-gradient-primary/20 mr-3"></div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded skeleton" />
                                    <div className="w-24 h-5 rounded skeleton" />
                                </div>
                            </div>

                            {/* Alert Items */}
                            <div className="space-y-4">
                                {[1, 2, 3].map((alert) => (
                                    <div key={alert} className="p-6 glass rounded-xl border backdrop-blur-xl shadow-lg bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mt-1 w-10 h-10 rounded-xl glass backdrop-blur-xl shadow-lg border border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                                <div className="w-6 h-6 rounded skeleton" />
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <div className="mb-2 w-64 h-6 rounded skeleton" />
                                                <div className="mb-2 w-full h-4 rounded skeleton" />
                                                <div className="w-3/4 h-4 rounded skeleton" />

                                                {/* Metadata */}
                                                <div className="mt-3 p-3 rounded-xl glass border border-primary-200/30 dark:border-primary-500/20 shadow-sm backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                                    <div className="w-48 h-4 rounded skeleton" />
                                                </div>

                                                {/* Actions */}
                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded skeleton" />
                                                        <div className="w-24 h-4 rounded skeleton" />
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-24 h-8 rounded skeleton" />
                                                        <div className="w-20 h-8 rounded skeleton" />
                                                        <div className="w-8 h-8 rounded-lg skeleton" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between py-4">
                    <div className="w-32 h-4 rounded skeleton" />
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl skeleton" />
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-xl skeleton" />
                        ))}
                        <div className="w-10 h-10 rounded-xl skeleton" />
                    </div>
                </div>
            </div>
        </div>
    );
};

