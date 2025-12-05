import React from "react";

export const KeyVaultShimmer: React.FC = () => {
    return (
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Header */}
            <div className="rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="p-4 border-b border-primary-200/30 sm:p-6 md:p-8">
                    <div className="flex flex-col gap-4 justify-between items-start sm:gap-5 md:gap-6 lg:flex-row lg:items-center">
                        <div className="flex flex-col gap-3 items-start sm:flex-row sm:items-center sm:gap-4">
                            <div className="flex justify-center items-center w-12 h-12 rounded-xl shadow-lg bg-gradient-primary/20 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0">
                                <div className="w-6 h-6 rounded skeleton sm:w-7 sm:h-7 md:w-8 md:h-8" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-2 items-start mb-2 sm:flex-row sm:items-center">
                                    <div className="w-7 h-7 rounded skeleton sm:w-8 sm:h-8" />
                                    <div className="w-full h-7 rounded skeleton sm:w-32 sm:h-8" />
                                </div>
                                <div className="w-full h-3 rounded skeleton sm:w-80 sm:h-4" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 w-full sm:flex-row sm:gap-3 sm:w-auto">
                            <div className="w-full h-10 rounded-lg skeleton sm:w-40 sm:h-11" />
                            <div className="w-full h-10 rounded-lg skeleton sm:w-40 sm:h-11" />
                        </div>
                    </div>
                </div>

                {/* Analytics Cards */}
                <div className="p-4 sm:p-6 md:p-8">
                    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-4 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
                                <div className="flex gap-3 items-center sm:gap-4">
                                    <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-primary/20 sm:w-11 sm:h-11 md:w-12 md:h-12 shrink-0">
                                        <div className="w-5 h-5 rounded skeleton sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="mb-1 w-full h-3 rounded skeleton sm:w-24 sm:h-4" />
                                        <div className="w-full h-7 rounded skeleton sm:w-20 sm:h-8" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Provider Keys Section */}
            <div className="rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="p-4 border-b border-primary-200/30 sm:p-5 md:p-6">
                    <div className="flex gap-2 items-center mb-2 sm:gap-3">
                        <div className="flex justify-center items-center w-9 h-9 rounded-xl shadow-lg bg-gradient-primary/20 sm:w-10 sm:h-10 shrink-0">
                            <div className="w-4 h-4 rounded skeleton sm:w-5 sm:h-5" />
                        </div>
                        <div className="w-full h-5 rounded skeleton sm:w-40 sm:h-6" />
                    </div>
                    <div className="w-full h-3 rounded skeleton sm:w-96 sm:h-4" />
                </div>
                <div className="p-4 sm:p-5 md:p-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-6">
                                <div className="flex flex-col gap-2 justify-between items-start mb-3 sm:flex-row sm:items-start sm:mb-4">
                                    <div className="flex-1 min-w-0 w-full">
                                        <div className="mb-2 w-full h-4 rounded skeleton sm:w-32 sm:h-5" />
                                        <div className="w-full h-3 rounded skeleton sm:w-24 sm:h-4" />
                                    </div>
                                    <div className="w-full h-5 rounded-full skeleton sm:w-20 sm:h-6" />
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex justify-between items-center p-2 rounded-lg border glass border-primary-200/30 sm:p-3">
                                        <div className="w-full h-3 rounded skeleton sm:w-24 sm:h-4" />
                                        <div className="w-full h-3 rounded skeleton sm:w-32 sm:h-4" />
                                    </div>
                                    <div className="flex justify-between items-center p-2 rounded-lg border glass border-primary-200/30 sm:p-3">
                                        <div className="w-full h-3 rounded skeleton sm:w-32 sm:h-4" />
                                        <div className="w-full h-3 rounded skeleton sm:w-24 sm:h-4" />
                                    </div>
                                    <div className="flex justify-between items-center p-2 rounded-lg border glass border-primary-200/30 sm:p-3">
                                        <div className="w-full h-3 rounded skeleton sm:w-28 sm:h-4" />
                                        <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-4" />
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
                                    <div className="w-full h-8 rounded-lg skeleton sm:w-24 sm:h-9" />
                                    <div className="w-full h-8 rounded-lg skeleton sm:w-24 sm:h-9" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Proxy Keys Section */}
            <div className="rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="p-4 border-b border-primary-200/30 sm:p-5 md:p-6">
                    <div className="flex gap-2 items-center mb-2 sm:gap-3">
                        <div className="flex justify-center items-center w-9 h-9 rounded-xl shadow-lg bg-gradient-secondary/20 sm:w-10 sm:h-10 shrink-0">
                            <div className="w-4 h-4 rounded skeleton sm:w-5 sm:h-5" />
                        </div>
                        <div className="w-full h-5 rounded skeleton sm:w-32 sm:h-6" />
                    </div>
                    <div className="w-full h-3 rounded skeleton sm:w-96 sm:h-4" />
                </div>
                <div className="p-4 sm:p-5 md:p-6">
                    <div className="space-y-4 sm:space-y-5 md:space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-6">
                                <div className="flex flex-col gap-2 justify-between items-start mb-3 sm:flex-row sm:items-start sm:mb-4">
                                    <div className="flex-1 min-w-0 w-full">
                                        <div className="mb-2 w-full h-4 rounded skeleton sm:w-48 sm:h-5" />
                                        <div className="w-full h-3 rounded skeleton sm:w-64 sm:h-4" />
                                    </div>
                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                        <div className="w-full h-5 rounded-full skeleton sm:w-20 sm:h-6" />
                                        <div className="w-full h-5 rounded-full skeleton sm:w-20 sm:h-6" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <div className="flex justify-between items-center">
                                            <div className="w-full h-2.5 rounded skeleton sm:w-24 sm:h-3" />
                                            <div className="w-full h-3 rounded skeleton sm:w-32 sm:h-4" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="w-full h-2.5 rounded skeleton sm:w-28 sm:h-3" />
                                            <div className="w-full h-3 rounded skeleton sm:w-24 sm:h-4" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="w-full h-2.5 rounded skeleton sm:w-32 sm:h-3" />
                                            <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-4" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <div className="flex justify-between items-center">
                                            <div className="w-full h-2.5 rounded skeleton sm:w-24 sm:h-3" />
                                            <div className="w-full h-3 rounded skeleton sm:w-28 sm:h-4" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="w-full h-2.5 rounded skeleton sm:w-28 sm:h-3" />
                                            <div className="w-full h-3 rounded skeleton sm:w-24 sm:h-4" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="w-full h-2.5 rounded skeleton sm:w-32 sm:h-3" />
                                            <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-4" />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
                                    <div className="w-full h-8 rounded-lg skeleton sm:w-24 sm:h-9" />
                                    <div className="w-full h-8 rounded-lg skeleton sm:w-24 sm:h-9" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

