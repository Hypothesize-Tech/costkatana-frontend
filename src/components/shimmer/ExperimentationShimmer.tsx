import React from "react";

type Tab = "cost-simulator" | "model-comparison" | "what-if-scenarios" | "leaderboard";

export const ExperimentationShimmer: React.FC<{ activeTab?: Tab }> = ({ activeTab = "cost-simulator" }) => {
    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            {/* Header */}
            <div className="mx-6 mt-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <div className="flex items-center mb-2">
                                <div className="mr-3 w-8 h-8 rounded skeleton" />
                                <div className="w-80 h-9 rounded skeleton" />
                            </div>
                            <div className="mt-2 w-96 h-4 rounded skeleton" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 rounded skeleton" />
                            <div className="w-48 h-4 rounded skeleton" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <div className="mb-1 w-32 h-4 rounded skeleton" />
                                    <div className="mt-1 mb-2 w-24 h-8 rounded skeleton" />
                                    <div className="flex items-center mt-2">
                                        <div className="w-20 h-3 rounded skeleton" />
                                        <div className="ml-1 w-32 h-3 rounded skeleton" />
                                    </div>
                                </div>
                                <div className="flex-shrink-0 p-3 bg-gradient-to-br rounded-lg border glass border-primary-200/30 from-primary-500/20 to-secondary-500/20">
                                    <div className="w-8 h-8 rounded skeleton" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recommendations Section - Show "Getting Started" style shimmer */}
                <div className="p-6 mb-8 bg-gradient-to-br rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20">
                    <div className="flex items-center">
                        <div className="mr-2 w-5 h-5 rounded skeleton" />
                        <div className="flex-1">
                            <div className="mb-1 w-64 h-4 rounded skeleton" />
                            <div className="mt-1 w-full h-3 rounded skeleton" />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    {/* Tab Navigation */}
                    <div className="border-b border-primary-200/30">
                        <nav className="flex px-6 space-x-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center px-1 py-4 space-x-2">
                                    <div className="w-5 h-5 rounded skeleton" />
                                    <div className="w-32 h-4 rounded skeleton" />
                                </div>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Descriptions */}
                    <div className="px-6 py-4 bg-gradient-to-r border-b from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50 border-primary-200/30">
                        <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 rounded skeleton mt-0.5" />
                            <div className="flex-1">
                                <div className="mb-1 w-48 h-4 rounded skeleton" />
                                <div className="w-full h-3 rounded skeleton" />
                            </div>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === "cost-simulator" && (
                            <div className="space-y-8">
                                {/* Header Section */}
                                <div className="mb-12 text-center">
                                    <div className="mx-auto mb-6 w-20 h-20 rounded-2xl skeleton" />
                                    <div className="flex gap-3 justify-center items-center mb-4">
                                        <div className="w-10 h-10 rounded skeleton" />
                                        <div className="w-96 h-10 rounded skeleton" />
                                    </div>
                                    <div className="mx-auto mb-6 max-w-4xl">
                                        <div className="w-full h-6 rounded skeleton" />
                                    </div>
                                    <div className="p-4 mx-auto max-w-3xl rounded-xl border glass border-primary-200/30">
                                        <div className="flex gap-2 items-center">
                                            <div className="w-5 h-5 rounded skeleton" />
                                            <div className="flex-1 h-4 rounded skeleton" />
                                        </div>
                                    </div>
                                </div>

                                {/* Input Section */}
                                <div className="p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                        {/* Prompt Input */}
                                        <div className="lg:col-span-2">
                                            <div className="mb-3 w-24 h-5 rounded skeleton" />
                                            <div className="w-full h-40 rounded-lg skeleton" />
                                            <div className="p-3 mt-3 rounded-xl border glass border-primary-200/30">
                                                <div className="w-48 h-4 rounded skeleton" />
                                            </div>
                                        </div>

                                        {/* Controls */}
                                        <div className="space-y-6">
                                            <div>
                                                <div className="mb-3 w-32 h-5 rounded skeleton" />
                                                <div className="w-full h-11 rounded-lg skeleton" />
                                                <div className="p-2 mt-2 rounded-lg border glass border-primary-200/30">
                                                    <div className="w-40 h-3 rounded skeleton" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="mb-3 w-32 h-5 rounded skeleton" />
                                                <div className="w-full h-11 rounded-lg skeleton" />
                                                <div className="p-2 mt-2 rounded-lg border glass border-accent-200/30">
                                                    <div className="w-48 h-3 rounded skeleton" />
                                                </div>
                                            </div>
                                            <div className="p-6 space-y-4 border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                                                <div className="flex items-center mb-4">
                                                    <div className="p-2 mr-3 w-9 h-9 rounded-lg skeleton" />
                                                    <div className="w-48 h-5 rounded skeleton" />
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="mb-2 w-40 h-4 rounded skeleton" />
                                                        <div className="w-full h-2 rounded-lg skeleton" />
                                                        <div className="flex justify-between mt-2">
                                                            <div className="w-24 h-3 rounded skeleton" />
                                                            <div className="w-20 h-3 rounded skeleton" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="mb-2 w-32 h-4 rounded skeleton" />
                                                        <div className="w-full h-2 rounded-lg skeleton" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Results Area */}
                                <div className="p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                                    <div className="mb-6 w-48 h-6 rounded skeleton" />
                                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="p-4 rounded-lg border glass border-primary-200/30">
                                                <div className="mb-2 w-24 h-4 rounded skeleton" />
                                                <div className="w-32 h-6 rounded skeleton" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="w-full h-64 rounded-lg skeleton" />
                                </div>
                            </div>
                        )}

                        {activeTab === "model-comparison" && (
                            <div className="space-y-6">
                                {/* Prompt Input Section */}
                                <div className="p-6 rounded-xl border glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <div className="mb-4 w-32 h-5 rounded skeleton" />
                                    <div className="mb-4 w-full h-32 rounded-lg skeleton" />
                                    <div className="flex gap-3 items-center">
                                        <div className="w-32 h-11 rounded-lg skeleton" />
                                        <div className="w-40 h-11 rounded-lg skeleton" />
                                    </div>
                                </div>

                                {/* Model Selection and Controls */}
                                <div className="p-6 rounded-xl border glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <div className="mb-4 w-48 h-6 rounded skeleton" />
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="p-4 rounded-lg border glass border-primary-200/30">
                                                <div className="mb-3 w-32 h-5 rounded skeleton" />
                                                <div className="mb-2 w-full h-11 rounded-lg skeleton" />
                                                <div className="w-full h-11 rounded-lg skeleton" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Comparison Table */}
                                <div className="p-6 rounded-xl border glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <div className="mb-4 w-48 h-5 rounded skeleton" />
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-primary-200/20 dark:divide-primary-700/20">
                                            <thead>
                                                <tr>
                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                                        <th key={i} className="px-6 py-3">
                                                            <div className="w-24 h-4 rounded skeleton" />
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-primary-200/20 dark:divide-primary-700/20">
                                                {[1, 2, 3, 4, 5, 6].map((row) => (
                                                    <tr key={row}>
                                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
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
                        )}

                        {activeTab === "what-if-scenarios" && (
                            <div className="space-y-6">
                                {/* Scenario Templates */}
                                <div className="p-6 rounded-xl border glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <div className="mb-4 w-48 h-6 rounded skeleton" />
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="p-4 rounded-lg border glass border-primary-200/30">
                                                <div className="mb-2 w-32 h-5 rounded skeleton" />
                                                <div className="mb-3 w-full h-3 rounded skeleton" />
                                                <div className="w-24 h-9 rounded-lg skeleton" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Scenario Builder */}
                                <div className="p-6 rounded-xl border glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <div className="mb-4 w-48 h-6 rounded skeleton" />
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="w-full h-11 rounded-lg skeleton" />
                                            ))}
                                        </div>
                                        <div className="w-full h-24 rounded-lg skeleton" />
                                        <div className="flex gap-3">
                                            <div className="w-32 h-11 rounded-lg skeleton" />
                                            <div className="w-24 h-11 rounded-lg skeleton" />
                                        </div>
                                    </div>
                                </div>

                                {/* Scenario Results */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="p-6 rounded-xl border glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                            <div className="mb-4 w-40 h-5 rounded skeleton" />
                                            <div className="space-y-3">
                                                {[1, 2, 3, 4].map((j) => (
                                                    <div key={j} className="flex justify-between items-center p-3 rounded-lg border glass border-primary-200/30">
                                                        <div className="w-32 h-4 rounded skeleton" />
                                                        <div className="w-24 h-4 rounded skeleton" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "leaderboard" && (
                            <div className="overflow-hidden rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                                {/* Header */}
                                <div className="p-8 rounded-t-xl border-b bg-gradient-primary/10 border-primary-200/30">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className="mr-4 w-12 h-12 rounded-xl skeleton" />
                                            <div>
                                                <div className="mb-1 w-48 h-6 rounded skeleton" />
                                                <div className="w-32 h-4 rounded skeleton" />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="mb-1 w-32 h-8 rounded skeleton" />
                                            <div className="w-24 h-4 rounded skeleton" />
                                        </div>
                                    </div>
                                </div>

                                {/* User Rank Section */}
                                <div className="p-6 border-b glass border-primary-200/30 bg-primary-500/5">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className="mr-3 w-6 h-6 rounded-full skeleton" />
                                            <div>
                                                <div className="mb-1 w-32 h-5 rounded skeleton" />
                                                <div className="w-48 h-4 rounded skeleton" />
                                            </div>
                                        </div>
                                        <div className="w-24 h-7 rounded-full skeleton" />
                                    </div>
                                </div>

                                {/* Leaderboard List */}
                                <div className="divide-y divide-primary-200/30">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                        <div key={i} className="p-6">
                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-1 items-center">
                                                    <div className="mr-6 w-6 h-6 rounded-full skeleton" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <div className="w-40 h-5 rounded skeleton" />
                                                            <div className="ml-3 w-12 h-5 rounded-xl skeleton" />
                                                        </div>
                                                        <div className="flex items-center space-x-6">
                                                            <div className="flex items-center p-2 rounded-lg border glass border-success-200/30">
                                                                <div className="mr-2 w-4 h-4 rounded skeleton" />
                                                                <div className="w-20 h-4 rounded skeleton" />
                                                            </div>
                                                            <div className="flex items-center p-2 rounded-lg border glass border-primary-200/30">
                                                                <div className="mr-2 w-4 h-4 rounded skeleton" />
                                                                <div className="w-16 h-4 rounded skeleton" />
                                                            </div>
                                                            <div className="flex items-center p-2 rounded-lg border glass border-accent-200/30">
                                                                <div className="mr-2 w-4 h-4 rounded skeleton" />
                                                                <div className="w-24 h-4 rounded skeleton" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="mb-1 w-32 h-7 rounded skeleton" />
                                                    <div className="w-24 h-3 rounded skeleton" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

