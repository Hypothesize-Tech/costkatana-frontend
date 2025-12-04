import React from "react";

export const KeyVaultShimmer: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="p-8 border-b border-primary-200/30">
                    <div className="flex flex-col gap-6 justify-between items-start lg:flex-row lg:items-center">
                        <div className="flex gap-4 items-center">
                            <div className="flex justify-center items-center w-16 h-16 rounded-xl shadow-lg bg-gradient-primary/20">
                                <div className="w-8 h-8 rounded skeleton" />
                            </div>
                            <div>
                                <div className="flex gap-2 items-center mb-2">
                                    <div className="w-8 h-8 rounded skeleton" />
                                    <div className="w-32 h-8 rounded skeleton" />
                                </div>
                                <div className="w-80 h-4 rounded skeleton" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-40 h-11 rounded-lg skeleton" />
                            <div className="w-40 h-11 rounded-lg skeleton" />
                        </div>
                    </div>
                </div>

                {/* Analytics Cards */}
                <div className="p-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                                <div className="flex gap-4 items-center">
                                    <div className="flex justify-center items-center w-12 h-12 rounded-xl shadow-lg bg-gradient-primary/20">
                                        <div className="w-6 h-6 rounded skeleton" />
                                    </div>
                                    <div>
                                        <div className="mb-1 w-24 h-4 rounded skeleton" />
                                        <div className="w-20 h-8 rounded skeleton" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Provider Keys Section */}
            <div className="rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="p-6 border-b border-primary-200/30">
                    <div className="flex gap-3 items-center mb-2">
                        <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-primary/20">
                            <div className="w-5 h-5 rounded skeleton" />
                        </div>
                        <div className="w-40 h-6 rounded skeleton" />
                    </div>
                    <div className="w-96 h-4 rounded skeleton" />
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="mb-2 w-32 h-5 rounded skeleton" />
                                        <div className="w-24 h-4 rounded skeleton" />
                                    </div>
                                    <div className="w-20 h-6 rounded-full skeleton" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 rounded-lg border glass border-primary-200/30">
                                        <div className="w-24 h-4 rounded skeleton" />
                                        <div className="w-32 h-4 rounded skeleton" />
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-lg border glass border-primary-200/30">
                                        <div className="w-32 h-4 rounded skeleton" />
                                        <div className="w-24 h-4 rounded skeleton" />
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-lg border glass border-primary-200/30">
                                        <div className="w-28 h-4 rounded skeleton" />
                                        <div className="w-20 h-4 rounded skeleton" />
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <div className="w-24 h-9 rounded-lg skeleton" />
                                    <div className="w-24 h-9 rounded-lg skeleton" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Proxy Keys Section */}
            <div className="rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="p-6 border-b border-primary-200/30">
                    <div className="flex gap-3 items-center mb-2">
                        <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-secondary/20">
                            <div className="w-5 h-5 rounded skeleton" />
                        </div>
                        <div className="w-32 h-6 rounded skeleton" />
                    </div>
                    <div className="w-96 h-4 rounded skeleton" />
                </div>
                <div className="p-6">
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="mb-2 w-48 h-5 rounded skeleton" />
                                        <div className="w-64 h-4 rounded skeleton" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-20 h-6 rounded-full skeleton" />
                                        <div className="w-20 h-6 rounded-full skeleton" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <div className="w-24 h-3 rounded skeleton" />
                                            <div className="w-32 h-4 rounded skeleton" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="w-28 h-3 rounded skeleton" />
                                            <div className="w-24 h-4 rounded skeleton" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="w-32 h-3 rounded skeleton" />
                                            <div className="w-20 h-4 rounded skeleton" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <div className="w-24 h-3 rounded skeleton" />
                                            <div className="w-28 h-4 rounded skeleton" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="w-28 h-3 rounded skeleton" />
                                            <div className="w-24 h-4 rounded skeleton" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="w-32 h-3 rounded skeleton" />
                                            <div className="w-20 h-4 rounded skeleton" />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <div className="w-24 h-9 rounded-lg skeleton" />
                                    <div className="w-24 h-9 rounded-lg skeleton" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

