import React from "react";

type Tab = "cost-simulator" | "model-comparison" | "what-if-scenarios" | "leaderboard";

export const ExperimentationShimmer: React.FC<{ activeTab?: Tab }> = ({ activeTab = "cost-simulator" }) => {
    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            {/* Header */}
            <div className="mx-3 mt-3 sm:mx-4 sm:mt-4 md:mx-6 md:mt-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="px-3 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-5 md:py-6 gap-4 sm:gap-0">
                        <div className="w-full sm:w-auto">
                            <div className="flex items-center mb-2">
                                <div className="mr-2 sm:mr-3 w-6 h-6 sm:w-8 sm:h-8 rounded skeleton" />
                                <div className="w-48 sm:w-64 md:w-80 h-7 sm:h-8 md:h-9 rounded skeleton" />
                            </div>
                            <div className="mt-2 w-full sm:w-72 md:w-96 h-3 sm:h-4 rounded skeleton" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded skeleton" />
                            <div className="w-32 sm:w-40 md:w-48 h-3 sm:h-4 rounded skeleton" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-3 py-4 mx-auto max-w-7xl sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">
                <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 sm:gap-4 md:gap-6 md:mb-8 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <div className="mb-1 w-24 sm:w-28 md:w-32 h-3 sm:h-4 rounded skeleton" />
                                    <div className="mt-1 mb-2 w-20 sm:w-22 md:w-24 h-6 sm:h-7 md:h-8 rounded skeleton" />
                                    <div className="flex items-center mt-2">
                                        <div className="w-16 sm:w-18 md:w-20 h-2 sm:h-3 rounded skeleton" />
                                        <div className="ml-1 w-24 sm:w-28 md:w-32 h-2 sm:h-3 rounded skeleton" />
                                    </div>
                                </div>
                                <div className="flex-shrink-0 p-2 sm:p-2.5 md:p-3 bg-gradient-to-br rounded-lg border glass border-primary-200/30 from-primary-500/20 to-secondary-500/20">
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded skeleton" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recommendations Section - Show "Getting Started" style shimmer */}
                <div className="p-4 mb-4 sm:p-5 sm:mb-6 md:p-6 md:mb-8 bg-gradient-to-br rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20">
                    <div className="flex items-start sm:items-center">
                        <div className="mr-2 w-4 h-4 sm:w-5 sm:h-5 rounded skeleton flex-shrink-0 mt-0.5 sm:mt-0" />
                        <div className="flex-1 min-w-0">
                            <div className="mb-1 w-48 sm:w-56 md:w-64 h-3 sm:h-4 rounded skeleton" />
                            <div className="mt-1 w-full h-2 sm:h-3 rounded skeleton" />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    {/* Tab Navigation */}
                    <div className="border-b border-primary-200/30 overflow-x-auto">
                        <nav className="flex px-3 sm:px-4 md:px-6 space-x-4 sm:space-x-6 md:space-x-8 min-w-max">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center px-1 py-3 sm:py-4 space-x-1.5 sm:space-x-2">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded skeleton" />
                                    <div className="w-24 sm:w-28 md:w-32 h-3 sm:h-4 rounded skeleton" />
                                </div>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Descriptions */}
                    <div className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 bg-gradient-to-r border-b from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50 border-primary-200/30">
                        <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded skeleton mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="mb-1 w-36 sm:w-40 md:w-48 h-3 sm:h-4 rounded skeleton" />
                                <div className="w-full h-2 sm:h-3 rounded skeleton" />
                            </div>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-3 sm:p-4 md:p-6">
                        {activeTab === "cost-simulator" && (
                            <div className="space-y-4 sm:space-y-6 md:space-y-8">
                                {/* Header Section */}
                                <div className="mb-6 sm:mb-8 md:mb-12 text-center">
                                    <div className="mx-auto mb-4 sm:mb-5 md:mb-6 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl skeleton" />
                                    <div className="flex gap-2 sm:gap-3 justify-center items-center mb-3 sm:mb-4">
                                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded skeleton" />
                                        <div className="w-64 sm:w-80 md:w-96 h-8 sm:h-9 md:h-10 rounded skeleton" />
                                    </div>
                                    <div className="mx-auto mb-4 sm:mb-5 md:mb-6 max-w-4xl px-2">
                                        <div className="w-full h-5 sm:h-6 rounded skeleton" />
                                    </div>
                                    <div className="p-3 sm:p-4 mx-auto max-w-3xl rounded-xl border glass border-primary-200/30">
                                        <div className="flex gap-2 items-center">
                                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded skeleton flex-shrink-0" />
                                            <div className="flex-1 h-3 sm:h-4 rounded skeleton" />
                                        </div>
                                    </div>
                                </div>

                                {/* Input Section */}
                                <div className="p-4 sm:p-6 md:p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
                                        {/* Prompt Input */}
                                        <div className="lg:col-span-2">
                                            <div className="mb-2 sm:mb-3 w-20 sm:w-22 md:w-24 h-4 sm:h-5 rounded skeleton" />
                                            <div className="w-full h-32 sm:h-36 md:h-40 rounded-lg skeleton" />
                                            <div className="p-2 sm:p-3 mt-2 sm:mt-3 rounded-xl border glass border-primary-200/30">
                                                <div className="w-40 sm:w-44 md:w-48 h-3 sm:h-4 rounded skeleton" />
                                            </div>
                                        </div>

                                        {/* Controls */}
                                        <div className="space-y-4 sm:space-y-5 md:space-y-6">
                                            <div>
                                                <div className="mb-2 sm:mb-3 w-28 sm:w-30 md:w-32 h-4 sm:h-5 rounded skeleton" />
                                                <div className="w-full h-10 sm:h-11 rounded-lg skeleton" />
                                                <div className="p-2 mt-2 rounded-lg border glass border-primary-200/30">
                                                    <div className="w-32 sm:w-36 md:w-40 h-2 sm:h-3 rounded skeleton" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="mb-2 sm:mb-3 w-28 sm:w-30 md:w-32 h-4 sm:h-5 rounded skeleton" />
                                                <div className="w-full h-10 sm:h-11 rounded-lg skeleton" />
                                                <div className="p-2 mt-2 rounded-lg border glass border-accent-200/30">
                                                    <div className="w-40 sm:w-44 md:w-48 h-2 sm:h-3 rounded skeleton" />
                                                </div>
                                            </div>
                                            <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                                                <div className="flex items-center mb-3 sm:mb-4">
                                                    <div className="p-1.5 sm:p-2 mr-2 sm:mr-3 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg skeleton" />
                                                    <div className="w-40 sm:w-44 md:w-48 h-4 sm:h-5 rounded skeleton" />
                                                </div>
                                                <div className="space-y-3 sm:space-y-4">
                                                    <div>
                                                        <div className="mb-2 w-32 sm:w-36 md:w-40 h-3 sm:h-4 rounded skeleton" />
                                                        <div className="w-full h-2 rounded-lg skeleton" />
                                                        <div className="flex justify-between mt-2">
                                                            <div className="w-20 sm:w-22 md:w-24 h-2 sm:h-3 rounded skeleton" />
                                                            <div className="w-16 sm:w-18 md:w-20 h-2 sm:h-3 rounded skeleton" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="mb-2 w-28 sm:w-30 md:w-32 h-3 sm:h-4 rounded skeleton" />
                                                        <div className="w-full h-2 rounded-lg skeleton" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Results Area */}
                                <div className="p-4 sm:p-6 md:p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                                    <div className="mb-4 sm:mb-5 md:mb-6 w-40 sm:w-44 md:w-48 h-5 sm:h-6 rounded skeleton" />
                                    <div className="grid grid-cols-1 gap-3 mb-4 sm:gap-4 sm:mb-5 md:grid-cols-3 md:mb-6">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="p-3 sm:p-4 rounded-lg border glass border-primary-200/30">
                                                <div className="mb-2 w-20 sm:w-22 md:w-24 h-3 sm:h-4 rounded skeleton" />
                                                <div className="w-24 sm:w-28 md:w-32 h-5 sm:h-6 rounded skeleton" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="w-full h-48 sm:h-56 md:h-64 rounded-lg skeleton" />
                                </div>
                            </div>
                        )}

                        {activeTab === "model-comparison" && (
                            <div className="space-y-4 sm:space-y-5 md:space-y-6">
                                {/* Prompt Input Section */}
                                <div className="p-4 sm:p-5 md:p-6 rounded-xl border glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <div className="mb-3 sm:mb-4 w-28 sm:w-30 md:w-32 h-4 sm:h-5 rounded skeleton" />
                                    <div className="mb-3 sm:mb-4 w-full h-24 sm:h-28 md:h-32 rounded-lg skeleton" />
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                                        <div className="w-full sm:w-32 h-10 sm:h-11 rounded-lg skeleton" />
                                        <div className="w-full sm:w-40 h-10 sm:h-11 rounded-lg skeleton" />
                                    </div>
                                </div>

                                {/* Model Selection and Controls */}
                                <div className="p-4 sm:p-5 md:p-6 rounded-xl border glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <div className="mb-3 sm:mb-4 w-40 sm:w-44 md:w-48 h-5 sm:h-6 rounded skeleton" />
                                    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="p-3 sm:p-4 rounded-lg border glass border-primary-200/30">
                                                <div className="mb-2 sm:mb-3 w-28 sm:w-30 md:w-32 h-4 sm:h-5 rounded skeleton" />
                                                <div className="mb-2 w-full h-10 sm:h-11 rounded-lg skeleton" />
                                                <div className="w-full h-10 sm:h-11 rounded-lg skeleton" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Comparison Table */}
                                <div className="p-4 sm:p-5 md:p-6 rounded-xl border glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <div className="mb-3 sm:mb-4 w-40 sm:w-44 md:w-48 h-4 sm:h-5 rounded skeleton" />
                                    <div className="overflow-x-auto -mx-4 sm:-mx-5 md:-mx-6 px-4 sm:px-5 md:px-6">
                                        <table className="min-w-full divide-y divide-primary-200/20 dark:divide-primary-700/20">
                                            <thead>
                                                <tr>
                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                                        <th key={i} className="px-3 py-2 sm:px-4 sm:py-3 md:px-6">
                                                            <div className="w-16 sm:w-20 md:w-24 h-3 sm:h-4 rounded skeleton" />
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-primary-200/20 dark:divide-primary-700/20">
                                                {[1, 2, 3, 4, 5, 6].map((row) => (
                                                    <tr key={row}>
                                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                                                            <td key={col} className="px-3 py-3 sm:px-4 sm:py-4 md:px-6">
                                                                <div className="w-14 sm:w-16 md:w-20 h-3 sm:h-4 rounded skeleton" />
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
                            <div className="space-y-4 sm:space-y-5 md:space-y-6">
                                {/* Scenario Templates */}
                                <div className="p-4 sm:p-5 md:p-6 rounded-xl border glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <div className="mb-3 sm:mb-4 w-40 sm:w-44 md:w-48 h-5 sm:h-6 rounded skeleton" />
                                    <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="p-3 sm:p-4 rounded-lg border glass border-primary-200/30">
                                                <div className="mb-2 w-28 sm:w-30 md:w-32 h-4 sm:h-5 rounded skeleton" />
                                                <div className="mb-2 sm:mb-3 w-full h-2 sm:h-3 rounded skeleton" />
                                                <div className="w-20 sm:w-22 md:w-24 h-8 sm:h-9 rounded-lg skeleton" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Scenario Builder */}
                                <div className="p-4 sm:p-5 md:p-6 rounded-xl border glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <div className="mb-3 sm:mb-4 w-40 sm:w-44 md:w-48 h-5 sm:h-6 rounded skeleton" />
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="w-full h-10 sm:h-11 rounded-lg skeleton" />
                                            ))}
                                        </div>
                                        <div className="w-full h-20 sm:h-22 md:h-24 rounded-lg skeleton" />
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                            <div className="w-full sm:w-32 h-10 sm:h-11 rounded-lg skeleton" />
                                            <div className="w-full sm:w-24 h-10 sm:h-11 rounded-lg skeleton" />
                                        </div>
                                    </div>
                                </div>

                                {/* Scenario Results */}
                                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 md:grid-cols-2">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="p-4 sm:p-5 md:p-6 rounded-xl border glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                            <div className="mb-3 sm:mb-4 w-32 sm:w-36 md:w-40 h-4 sm:h-5 rounded skeleton" />
                                            <div className="space-y-2 sm:space-y-3">
                                                {[1, 2, 3, 4].map((j) => (
                                                    <div key={j} className="flex justify-between items-center p-2 sm:p-3 rounded-lg border glass border-primary-200/30">
                                                        <div className="w-24 sm:w-28 md:w-32 h-3 sm:h-4 rounded skeleton" />
                                                        <div className="w-20 sm:w-22 md:w-24 h-3 sm:h-4 rounded skeleton" />
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
                                <div className="p-4 sm:p-6 md:p-8 rounded-t-xl border-b bg-gradient-primary/10 border-primary-200/30">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                                        <div className="flex items-center">
                                            <div className="mr-3 sm:mr-4 w-10 h-10 sm:w-12 sm:h-12 rounded-xl skeleton" />
                                            <div>
                                                <div className="mb-1 w-40 sm:w-44 md:w-48 h-5 sm:h-6 rounded skeleton" />
                                                <div className="w-24 sm:w-28 md:w-32 h-3 sm:h-4 rounded skeleton" />
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right w-full sm:w-auto">
                                            <div className="mb-1 w-28 sm:w-32 h-6 sm:h-7 md:h-8 rounded skeleton" />
                                            <div className="w-20 sm:w-22 md:w-24 h-3 sm:h-4 rounded skeleton" />
                                        </div>
                                    </div>
                                </div>

                                {/* User Rank Section */}
                                <div className="p-4 sm:p-5 md:p-6 border-b glass border-primary-200/30 bg-primary-500/5">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                                        <div className="flex items-center">
                                            <div className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full skeleton" />
                                            <div>
                                                <div className="mb-1 w-28 sm:w-30 md:w-32 h-4 sm:h-5 rounded skeleton" />
                                                <div className="w-40 sm:w-44 md:w-48 h-3 sm:h-4 rounded skeleton" />
                                            </div>
                                        </div>
                                        <div className="w-20 sm:w-22 md:w-24 h-6 sm:h-7 rounded-full skeleton" />
                                    </div>
                                </div>

                                {/* Leaderboard List */}
                                <div className="divide-y divide-primary-200/30">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                        <div key={i} className="p-3 sm:p-4 md:p-6">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                                                <div className="flex flex-1 items-start sm:items-center w-full">
                                                    <div className="mr-3 sm:mr-4 md:mr-6 w-5 h-5 sm:w-6 sm:h-6 rounded-full skeleton flex-shrink-0 mt-0.5 sm:mt-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2 gap-2 sm:gap-0">
                                                            <div className="w-32 sm:w-36 md:w-40 h-4 sm:h-5 rounded skeleton" />
                                                            <div className="ml-0 sm:ml-3 w-10 sm:w-12 h-4 sm:h-5 rounded-xl skeleton" />
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-6">
                                                            <div className="flex items-center p-1.5 sm:p-2 rounded-lg border glass border-success-200/30">
                                                                <div className="mr-1.5 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 rounded skeleton" />
                                                                <div className="w-16 sm:w-18 md:w-20 h-3 sm:h-4 rounded skeleton" />
                                                            </div>
                                                            <div className="flex items-center p-1.5 sm:p-2 rounded-lg border glass border-primary-200/30">
                                                                <div className="mr-1.5 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 rounded skeleton" />
                                                                <div className="w-12 sm:w-14 md:w-16 h-3 sm:h-4 rounded skeleton" />
                                                            </div>
                                                            <div className="flex items-center p-1.5 sm:p-2 rounded-lg border glass border-accent-200/30">
                                                                <div className="mr-1.5 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 rounded skeleton" />
                                                                <div className="w-20 sm:w-22 md:w-24 h-3 sm:h-4 rounded skeleton" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-left sm:text-right w-full sm:w-auto">
                                                    <div className="mb-1 w-28 sm:w-30 md:w-32 h-5 sm:h-6 md:h-7 rounded skeleton" />
                                                    <div className="w-20 sm:w-22 md:w-24 h-2 sm:h-3 rounded skeleton" />
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
