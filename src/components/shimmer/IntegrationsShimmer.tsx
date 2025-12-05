import React from "react";

export const IntegrationsShimmer: React.FC = () => {
    return (
        <div className="px-3 py-4 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient sm:px-4 sm:py-6 md:px-6 md:py-8">
            <div className="mx-auto max-w-7xl lg:px-8">
                {/* Page Header */}
                <div className="p-4 mb-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6 sm:mb-6 md:p-8 md:mb-8">
                    <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-start">
                        <div className="flex-1 min-w-0 w-full">
                            <div className="mb-3 w-full h-8 rounded skeleton sm:mb-4 sm:w-48 sm:h-10" />
                            <div className="w-full h-3 rounded skeleton sm:w-96 sm:h-4" />
                        </div>
                        <div className="w-full h-10 rounded-lg skeleton sm:w-32 sm:h-11" />
                    </div>
                </div>

                {/* Integrations List Section */}
                <div>
                    <div className="flex flex-col gap-3 justify-between items-start mb-4 sm:flex-row sm:items-center sm:mb-6">
                        <div className="w-full h-7 rounded skeleton sm:w-40 sm:h-8" />
                        <div className="w-full h-6 rounded-full skeleton sm:w-32 sm:h-7" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 flex flex-col h-full sm:p-5 md:p-6"
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-3 sm:mb-4">
                                    <div className="flex flex-1 gap-2 items-center min-w-0 sm:gap-3">
                                        <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-xl shadow-lg skeleton sm:w-12 sm:h-12" />
                                        <div className="flex-1 min-w-0">
                                            <div className="mb-1 w-full h-5 rounded skeleton sm:w-24 sm:h-6" />
                                            <div className="w-full h-3 rounded skeleton sm:w-32 sm:h-4" />
                                        </div>
                                        <div className="w-full h-5 rounded-full skeleton flex-shrink-0 sm:w-20 sm:h-6" />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="flex-grow mb-3 sm:mb-4">
                                    <div className="w-full h-3 rounded skeleton mb-1.5 sm:mb-2 sm:h-4" />
                                    <div className="w-3/4 h-3 rounded skeleton sm:h-4" />
                                </div>

                                {/* GitHub Specific Info (for some cards) */}
                                {i <= 2 && (
                                    <div className="p-2 mb-3 rounded-lg border glass border-primary-200/20 dark:border-primary-500/10 sm:p-3 sm:mb-4">
                                        <div className="w-full h-2.5 rounded skeleton sm:w-40 sm:h-3" />
                                    </div>
                                )}

                                {/* Spacer */}
                                {i > 2 && <div className="flex-grow"></div>}

                                {/* Actions */}
                                <div className="mt-auto">
                                    {i % 2 === 0 ? (
                                        <div className="flex gap-2">
                                            <div className="flex-1 w-full h-9 rounded-xl skeleton sm:h-10" />
                                            <div className="w-9 h-9 rounded-xl skeleton sm:w-10 sm:h-10" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-9 rounded-xl skeleton sm:h-10" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

