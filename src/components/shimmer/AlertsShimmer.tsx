import React from "react";
import { BellIcon } from "@heroicons/react/24/outline";

export const AlertsShimmer: React.FC = () => {
    return (
        <div className="p-3 min-h-screen sm:p-4 md:p-6 lg:p-8 bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            {/* Header */}
            <div className="p-4 sm:p-6 md:p-8 mb-6 sm:mb-7 md:mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <div className="flex gap-2 sm:gap-3 items-center mb-3 sm:mb-4">
                            <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl shadow-lg bg-gradient-danger/20">
                                <BellIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-danger-500/50" />
                            </div>
                            <div className="w-28 sm:w-30 md:w-32 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                        </div>
                        <div className="w-72 sm:w-80 md:w-96 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-12 md:ml-16 sm:flex-none">
                        <div className="w-full sm:w-36 md:w-40 h-10 sm:h-11 rounded-xl skeleton" />
                    </div>
                </div>
            </div>

            {/* Alert Summary */}
            <div className="glass rounded-xl p-4 sm:p-6 md:p-8 border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel mb-6 sm:mb-7 md:mb-8">
                <div className="flex items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl bg-gradient-primary/20 mr-3 sm:mr-4">
                        <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 rounded skeleton" />
                    </div>
                    <div className="w-36 sm:w-38 md:w-40 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-7 md:mb-8">
                    {[1, 2].map((i) => (
                        <div key={i} className="glass rounded-xl p-4 sm:p-5 md:p-6 border border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded skeleton" />
                                <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                            </div>
                            <div className="w-18 sm:w-20 h-7 sm:h-8 md:h-9 rounded skeleton" />
                        </div>
                    ))}
                </div>

                {/* Severity Breakdown */}
                <div className="space-y-3 sm:space-y-4">
                    <div className="w-28 sm:w-32 h-4 sm:h-5 rounded skeleton" />
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="glass rounded-xl p-3 sm:p-4 border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl shadow-lg bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-gradient-primary/20 mb-2 sm:mb-3">
                                        <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 rounded skeleton" />
                                    </div>
                                    <div className="mb-1 w-14 sm:w-16 h-2.5 sm:h-3 rounded skeleton" />
                                    <div className="w-10 sm:w-12 h-6 sm:h-7 rounded skeleton" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Type Breakdown */}
                <div className="mt-6 sm:mt-7 md:mt-8">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded skeleton" />
                        <div className="w-20 sm:w-24 h-4 sm:h-5 rounded skeleton" />
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-sm backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                <div className="w-36 sm:w-40 h-3 sm:h-4 rounded skeleton" />
                                <div className="w-6 sm:w-8 h-3 sm:h-4 rounded skeleton" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters and Alert List */}
            <div className="p-3 sm:p-4 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                {/* Alert Filter */}
                <div className="glass rounded-xl p-4 sm:p-5 md:p-6 border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel mb-4 sm:mb-5 md:mb-6">
                    <div className="flex items-center mb-4 sm:mb-5 md:mb-6">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-primary/20 mr-2 sm:mr-3">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded skeleton" />
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded skeleton" />
                            <div className="w-20 sm:w-24 h-4 sm:h-5 rounded skeleton" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i}>
                                <div className="mb-1.5 sm:mb-2 w-14 sm:w-16 h-3 sm:h-4 rounded skeleton" />
                                <div className="w-full h-10 sm:h-11 rounded skeleton" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 sm:mt-5 md:mt-6 flex justify-end">
                        <div className="w-28 sm:w-32 h-8 sm:h-9 rounded skeleton" />
                    </div>
                </div>

                {/* Alert List */}
                <div className="space-y-6 sm:space-y-7 md:space-y-8">
                    {[1, 2].map((dateGroup) => (
                        <div key={dateGroup}>
                            {/* Date Header */}
                            <div className="flex items-center mb-3 sm:mb-4">
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-primary/20 mr-2 sm:mr-3"></div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded skeleton" />
                                    <div className="w-20 sm:w-24 h-4 sm:h-5 rounded skeleton" />
                                </div>
                            </div>

                            {/* Alert Items */}
                            <div className="space-y-3 sm:space-y-4">
                                {[1, 2, 3].map((alert) => (
                                    <div key={alert} className="p-4 sm:p-5 md:p-6 glass rounded-xl border backdrop-blur-xl shadow-lg bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <div className="flex-shrink-0 mt-1 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl glass backdrop-blur-xl shadow-lg border border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                                <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 rounded skeleton" />
                                            </div>
                                            <div className="ml-2 sm:ml-4 flex-1 min-w-0">
                                                <div className="mb-1.5 sm:mb-2 w-52 sm:w-58 md:w-64 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
                                                <div className="mb-1.5 sm:mb-2 w-full h-3 sm:h-4 rounded skeleton" />
                                                <div className="w-3/4 h-3 sm:h-4 rounded skeleton" />

                                                {/* Metadata */}
                                                <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 rounded-xl glass border border-primary-200/30 dark:border-primary-500/20 shadow-sm backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                                    <div className="w-40 sm:w-44 md:w-48 h-3 sm:h-4 rounded skeleton" />
                                                </div>

                                                {/* Actions */}
                                                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded skeleton" />
                                                        <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                                    </div>
                                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                                        <div className="w-20 sm:w-24 h-7 sm:h-8 rounded skeleton" />
                                                        <div className="w-16 sm:w-20 h-7 sm:h-8 rounded skeleton" />
                                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg skeleton" />
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
                <div className="mt-4 sm:mt-5 md:mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 py-3 sm:py-4">
                    <div className="w-28 sm:w-32 h-3 sm:h-4 rounded skeleton" />
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl skeleton" />
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl skeleton" />
                        ))}
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl skeleton" />
                    </div>
                </div>
            </div>
        </div>
    );
};

