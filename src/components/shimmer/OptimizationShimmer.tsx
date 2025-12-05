import React from "react";

export const OptimizationShimmer: React.FC<{ activeTab?: 'quick' | 'bulk' | 'visual' | 'visual-batch' | 'visual-dashboard' }> = ({ activeTab = 'quick' }) => {
    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="px-3 py-4 mx-auto max-w-7xl sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">
                {/* Header */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                    <div className="p-4 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6 sm:rounded-xl md:p-8">
                        <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:justify-between sm:items-center sm:mb-4 md:gap-4">
                            <div className="w-48 h-8 rounded skeleton sm:w-56 sm:h-9 md:w-64" />
                            <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 md:space-x-0">
                                <div className="flex-1 h-9 rounded-lg skeleton min-w-[120px] sm:flex-none sm:w-36 sm:h-10 sm:rounded-xl md:w-40" />
                                <div className="flex-1 h-9 rounded-lg skeleton min-w-[140px] sm:flex-none sm:w-40 sm:h-10 sm:rounded-xl md:w-48" />
                            </div>
                        </div>
                        <div className="w-full h-4 rounded skeleton sm:w-80 md:w-96" />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 sm:gap-4 sm:mb-6 md:grid-cols-3 md:gap-6 md:mb-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 sm:rounded-xl md:p-6">
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <div className="mb-2 w-28 h-3.5 rounded skeleton sm:w-32 sm:h-4 md:mb-2" />
                                    <div className="w-20 h-6 rounded skeleton sm:w-24 sm:h-7 md:h-7" />
                                </div>
                                <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-lg bg-gradient-primary/20 sm:w-11 sm:h-11 sm:rounded-xl md:w-12 md:h-12">
                                    <div className="w-5 h-5 rounded skeleton sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs Navigation */}
                <div className="mb-4 sm:mb-5 md:mb-6">
                    <div className="flex overflow-x-auto space-x-2 border-b border-primary-200 dark:border-primary-700 scrollbar-hide">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex-shrink-0 w-24 h-9 rounded skeleton sm:w-28 sm:h-10 md:w-32" />
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'quick' && (
                    <div className="space-y-4 sm:space-y-6 md:space-y-8">
                        {/* Quick Optimize Form */}
                        <div className="p-4 mb-4 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 sm:mb-6 sm:rounded-xl md:p-6 md:mb-8">
                            <div className="mb-3 w-40 h-5 rounded skeleton sm:mb-4 sm:w-44 sm:h-6 md:w-48" />
                            <div className="space-y-3 sm:space-y-4">
                                <div className="w-full h-24 rounded-lg skeleton sm:h-28 md:h-32" />
                                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                                    <div className="flex-1 h-10 rounded-lg skeleton sm:h-11" />
                                    <div className="w-full h-10 rounded-lg skeleton sm:w-28 sm:h-11 md:w-32" />
                                </div>
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:justify-between sm:items-center sm:mb-5 md:mb-6">
                            <div className="w-48 h-6 rounded skeleton sm:w-52 sm:h-7 md:w-56" />
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex-1 h-9 rounded-lg skeleton min-w-[80px] sm:flex-none sm:w-20 sm:h-10 md:w-24" />
                                ))}
                            </div>
                        </div>

                        {/* Latest Optimization Preview */}
                        <div className="p-4 mb-4 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 sm:mb-6 sm:rounded-xl md:p-6 md:mb-8">
                            <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:justify-between sm:items-center sm:mb-4 md:gap-0">
                                <div className="w-40 h-5 rounded skeleton sm:w-44 sm:h-6 md:w-48" />
                                <div className="w-28 h-3.5 rounded skeleton sm:w-32 sm:h-4" />
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-3 sm:gap-2.5 sm:mb-4 md:gap-3 lg:grid-cols-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="p-2 text-center rounded-lg border glass border-primary-200/30 sm:p-2.5 md:p-3">
                                        <div className="mx-auto mb-1.5 w-14 h-4 rounded skeleton sm:w-16 sm:h-5 sm:mb-2 md:mb-2" />
                                        <div className="mx-auto w-10 h-3 rounded skeleton sm:w-12" />
                                    </div>
                                ))}
                            </div>

                            {/* Query and Answer Sections */}
                            <div className="space-y-2.5 sm:space-y-3">
                                <div>
                                    <div className="mb-1 w-20 h-3.5 rounded skeleton sm:w-24 sm:h-4" />
                                    <div className="p-2.5 rounded-lg border glass border-primary-200/30 sm:p-3">
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <div className="w-full h-3.5 rounded skeleton sm:h-4" />
                                            <div className="w-3/4 h-3.5 rounded skeleton sm:h-4" />
                                            <div className="w-1/2 h-3.5 rounded skeleton sm:h-4" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-1 w-32 h-3.5 rounded skeleton sm:w-36 sm:h-4 md:w-40" />
                                    <div className="p-2.5 rounded-lg border glass border-success-200/30 sm:p-3">
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <div className="w-full h-3.5 rounded skeleton sm:h-4" />
                                            <div className="w-5/6 h-3.5 rounded skeleton sm:h-4" />
                                            <div className="w-4/5 h-3.5 rounded skeleton sm:h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Optimization Cards List */}
                        <div className="space-y-3 sm:space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 sm:rounded-xl md:p-6">
                                    <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:justify-between sm:items-start sm:mb-4 md:gap-0">
                                        <div className="flex-1">
                                            <div className="mb-2 w-40 h-4.5 rounded skeleton sm:w-44 sm:h-5 md:w-48" />
                                            <div className="w-28 h-3.5 rounded skeleton sm:w-32 sm:h-4" />
                                        </div>
                                        <div className="w-16 h-5 rounded-full skeleton sm:w-18 sm:h-6 md:w-20" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4 md:gap-4">
                                        {[1, 2, 3, 4].map((j) => (
                                            <div key={j} className="p-2.5 rounded-lg border glass border-primary-200/30 sm:p-3">
                                                <div className="mb-1 w-14 h-3 rounded skeleton sm:w-16" />
                                                <div className="w-16 h-4.5 rounded skeleton sm:w-20 sm:h-5" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col gap-3 p-3 mt-4 rounded-lg border glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:flex-row sm:justify-between sm:items-center sm:p-4 sm:mt-6 sm:rounded-xl md:mt-8">
                            <div className="w-40 h-3.5 rounded skeleton sm:w-44 sm:h-4 md:w-48" />
                            <div className="flex items-center space-x-1.5 overflow-x-auto sm:space-x-2 scrollbar-hide">
                                <div className="flex-shrink-0 w-9 h-9 rounded-md skeleton sm:w-10 sm:h-10" />
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex-shrink-0 w-9 h-9 rounded-md skeleton sm:w-10 sm:h-10" />
                                ))}
                                <div className="flex-shrink-0 w-9 h-9 rounded-md skeleton sm:w-10 sm:h-10" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'bulk' && (
                    <div className="mb-4 sm:mb-6 md:mb-8">
                        <div className="p-4 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 sm:rounded-xl md:p-6">
                            <div className="mb-3 w-40 h-5 rounded skeleton sm:mb-4 sm:w-44 sm:h-6 md:w-48" />
                            <div className="space-y-3 sm:space-y-4">
                                <div className="w-full h-32 rounded-lg skeleton sm:h-36 md:h-40" />
                                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                                    <div className="flex-1 h-10 rounded-lg skeleton sm:h-11" />
                                    <div className="w-full h-10 rounded-lg skeleton sm:w-28 sm:h-11 md:w-32" />
                                </div>
                                <div className="w-full h-48 rounded-lg skeleton sm:h-56 md:h-64" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'visual' && (
                    <div className="mb-4 sm:mb-6 md:mb-8">
                        <div className="p-4 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 sm:rounded-xl md:p-6">
                            <div className="mb-3 w-48 h-5 rounded skeleton sm:mb-4 sm:w-52 sm:h-6 md:w-56" />
                            <div className="space-y-3 sm:space-y-4">
                                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                                    <div className="w-full h-48 rounded-lg skeleton sm:h-56 md:h-64" />
                                    <div className="w-full h-48 rounded-lg skeleton sm:h-56 md:h-64" />
                                </div>
                                <div className="w-full h-24 rounded-lg skeleton sm:h-28 md:h-32" />
                                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                                    <div className="flex-1 h-10 rounded-lg skeleton sm:h-11" />
                                    <div className="w-full h-10 rounded-lg skeleton sm:w-28 sm:h-11 md:w-32" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'visual-batch' && (
                    <div className="mb-4 sm:mb-6 md:mb-8">
                        <div className="p-4 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 sm:rounded-xl md:p-6">
                            <div className="mb-3 w-40 h-5 rounded skeleton sm:mb-4 sm:w-44 sm:h-6 md:w-48" />
                            <div className="space-y-3 sm:space-y-4">
                                <div className="w-full h-32 rounded-lg skeleton sm:h-36 md:h-40" />
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-full h-24 rounded-lg skeleton sm:h-28 md:h-32" />
                                    ))}
                                </div>
                                <div className="w-full h-48 rounded-lg skeleton sm:h-56 md:h-64" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'visual-dashboard' && (
                    <div className="mb-4 sm:mb-6 md:mb-8">
                        <div className="space-y-4 sm:space-y-5 md:space-y-6">
                            {/* Dashboard Header */}
                            <div className="p-4 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 sm:rounded-xl md:p-6">
                                <div className="mb-3 w-52 h-6 rounded skeleton sm:mb-4 sm:w-56 sm:h-7 md:w-64" />
                                <div className="w-full h-3.5 rounded skeleton sm:w-80 sm:h-4 md:w-96" />
                            </div>

                            {/* Dashboard Stats */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6 lg:grid-cols-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="p-4 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 sm:rounded-xl md:p-6">
                                        <div className="mb-2 w-28 h-3.5 rounded skeleton sm:w-32 sm:h-4" />
                                        <div className="w-20 h-6 rounded skeleton sm:w-24 sm:h-7" />
                                    </div>
                                ))}
                            </div>

                            {/* Dashboard Charts */}
                            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-2">
                                {[1, 2].map((i) => (
                                    <div key={i} className="p-4 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 sm:rounded-xl md:p-6">
                                        <div className="mb-3 w-40 h-5 rounded skeleton sm:mb-4 sm:w-44 sm:h-6 md:w-48" />
                                        <div className="w-full h-48 rounded-lg skeleton sm:h-56 md:h-64" />
                                    </div>
                                ))}
                            </div>

                            {/* Dashboard Table */}
                            <div className="p-4 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 sm:rounded-xl md:p-6">
                                <div className="mb-3 w-48 h-5 rounded skeleton sm:mb-4 sm:w-52 sm:h-6 md:w-56" />
                                <div className="overflow-x-auto -mx-4 sm:mx-0">
                                    <div className="inline-block min-w-full align-middle">
                                        <table className="min-w-full divide-y divide-primary-200/20 dark:divide-primary-700/20">
                                            <thead>
                                                <tr>
                                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                                        <th key={i} className="px-3 py-2 sm:px-4 sm:py-3 md:px-6">
                                                            <div className="w-20 h-3.5 rounded skeleton sm:w-24 sm:h-4" />
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-primary-200/20 dark:divide-primary-700/20">
                                                {[1, 2, 3, 4, 5].map((row) => (
                                                    <tr key={row}>
                                                        {[1, 2, 3, 4, 5, 6].map((col) => (
                                                            <td key={col} className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
                                                                <div className="w-16 h-3.5 rounded skeleton sm:w-20 sm:h-4" />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
