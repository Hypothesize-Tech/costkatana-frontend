import React from "react";

export const OptimizationShimmer: React.FC<{ activeTab?: 'quick' | 'bulk' | 'visual' | 'visual-batch' | 'visual-dashboard' }> = ({ activeTab = 'quick' }) => {
    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex justify-between items-center mb-4">
                            <div className="w-64 h-9 rounded skeleton" />
                            <div className="flex space-x-4">
                                <div className="w-40 h-10 rounded-xl skeleton" />
                                <div className="w-48 h-10 rounded-xl skeleton" />
                            </div>
                        </div>
                        <div className="w-96 h-4 rounded skeleton" />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <div className="mb-2 w-32 h-4 rounded skeleton" />
                                    <div className="w-24 h-7 rounded skeleton" />
                                </div>
                                <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 rounded-xl bg-gradient-primary/20">
                                    <div className="w-6 h-6 rounded skeleton" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs Navigation */}
                <div className="mb-6">
                    <div className="flex space-x-2 border-b border-primary-200 dark:border-primary-700">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="w-32 h-10 rounded skeleton" />
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'quick' && (
                    <div className="space-y-8">
                        {/* Quick Optimize Form */}
                        <div className="p-6 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="mb-4 w-48 h-6 rounded skeleton" />
                            <div className="space-y-4">
                                <div className="w-full h-32 rounded-lg skeleton" />
                                <div className="flex gap-4">
                                    <div className="flex-1 h-11 rounded-lg skeleton" />
                                    <div className="w-32 h-11 rounded-lg skeleton" />
                                </div>
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="w-56 h-7 rounded skeleton" />
                            <div className="flex gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-24 h-10 rounded-lg skeleton" />
                                ))}
                            </div>
                        </div>

                        {/* Latest Optimization Preview */}
                        <div className="p-6 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="flex justify-between items-center mb-4">
                                <div className="w-48 h-6 rounded skeleton" />
                                <div className="w-32 h-4 rounded skeleton" />
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4 md:grid-cols-3 lg:grid-cols-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="p-3 text-center rounded-lg border glass border-primary-200/30">
                                        <div className="mx-auto mb-2 w-16 h-5 rounded skeleton" />
                                        <div className="mx-auto w-12 h-3 rounded skeleton" />
                                    </div>
                                ))}
                            </div>

                            {/* Query and Answer Sections */}
                            <div className="space-y-3">
                                <div>
                                    <div className="mb-1 w-24 h-4 rounded skeleton" />
                                    <div className="p-3 rounded-lg border glass border-primary-200/30">
                                        <div className="space-y-2">
                                            <div className="w-full h-4 rounded skeleton" />
                                            <div className="w-3/4 h-4 rounded skeleton" />
                                            <div className="w-1/2 h-4 rounded skeleton" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-1 w-40 h-4 rounded skeleton" />
                                    <div className="p-3 rounded-lg border glass border-success-200/30">
                                        <div className="space-y-2">
                                            <div className="w-full h-4 rounded skeleton" />
                                            <div className="w-5/6 h-4 rounded skeleton" />
                                            <div className="w-4/5 h-4 rounded skeleton" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Optimization Cards List */}
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="mb-2 w-48 h-5 rounded skeleton" />
                                            <div className="w-32 h-4 rounded skeleton" />
                                        </div>
                                        <div className="w-20 h-6 rounded-full skeleton" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                        {[1, 2, 3, 4].map((j) => (
                                            <div key={j} className="p-3 rounded-lg border glass border-primary-200/30">
                                                <div className="mb-1 w-16 h-3 rounded skeleton" />
                                                <div className="w-20 h-5 rounded skeleton" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-between items-center p-4 mt-8 rounded-xl border glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="w-48 h-4 rounded skeleton" />
                            <div className="flex items-center space-x-2">
                                <div className="w-10 h-10 rounded-md skeleton" />
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-md skeleton" />
                                ))}
                                <div className="w-10 h-10 rounded-md skeleton" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'bulk' && (
                    <div className="mb-8">
                        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="mb-4 w-48 h-6 rounded skeleton" />
                            <div className="space-y-4">
                                <div className="w-full h-40 rounded-lg skeleton" />
                                <div className="flex gap-4">
                                    <div className="flex-1 h-11 rounded-lg skeleton" />
                                    <div className="w-32 h-11 rounded-lg skeleton" />
                                </div>
                                <div className="w-full h-64 rounded-lg skeleton" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'visual' && (
                    <div className="mb-8">
                        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="mb-4 w-56 h-6 rounded skeleton" />
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="w-full h-64 rounded-lg skeleton" />
                                    <div className="w-full h-64 rounded-lg skeleton" />
                                </div>
                                <div className="w-full h-32 rounded-lg skeleton" />
                                <div className="flex gap-4">
                                    <div className="flex-1 h-11 rounded-lg skeleton" />
                                    <div className="w-32 h-11 rounded-lg skeleton" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'visual-batch' && (
                    <div className="mb-8">
                        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="mb-4 w-48 h-6 rounded skeleton" />
                            <div className="space-y-4">
                                <div className="w-full h-40 rounded-lg skeleton" />
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-full h-32 rounded-lg skeleton" />
                                    ))}
                                </div>
                                <div className="w-full h-64 rounded-lg skeleton" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'visual-dashboard' && (
                    <div className="mb-8">
                        <div className="space-y-6">
                            {/* Dashboard Header */}
                            <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                <div className="mb-4 w-64 h-7 rounded skeleton" />
                                <div className="w-96 h-4 rounded skeleton" />
                            </div>

                            {/* Dashboard Stats */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                        <div className="mb-2 w-32 h-4 rounded skeleton" />
                                        <div className="w-24 h-7 rounded skeleton" />
                                    </div>
                                ))}
                            </div>

                            {/* Dashboard Charts */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {[1, 2].map((i) => (
                                    <div key={i} className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                        <div className="mb-4 w-48 h-6 rounded skeleton" />
                                        <div className="w-full h-64 rounded-lg skeleton" />
                                    </div>
                                ))}
                            </div>

                            {/* Dashboard Table */}
                            <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                <div className="mb-4 w-56 h-6 rounded skeleton" />
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-primary-200/20 dark:divide-primary-700/20">
                                        <thead>
                                            <tr>
                                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                                    <th key={i} className="px-6 py-3">
                                                        <div className="w-24 h-4 rounded skeleton" />
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-primary-200/20 dark:divide-primary-700/20">
                                            {[1, 2, 3, 4, 5].map((row) => (
                                                <tr key={row}>
                                                    {[1, 2, 3, 4, 5, 6].map((col) => (
                                                        <td key={col} className="px-6 py-4">
                                                            <div className="w-20 h-4 rounded skeleton" />
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
                )}
            </div>
        </div>
    );
};

