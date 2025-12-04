import React from "react";

export const IntegrationsShimmer: React.FC = () => {
    return (
        <div className="px-4 py-8 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="p-8 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="mb-4 w-48 h-10 rounded skeleton" />
                            <div className="w-96 h-4 rounded skeleton" />
                        </div>
                        <div className="w-32 h-11 rounded-lg skeleton" />
                    </div>
                </div>

                {/* Integrations List Section */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div className="w-40 h-8 rounded skeleton" />
                        <div className="w-32 h-7 rounded-full skeleton" />
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 flex flex-col h-full"
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-1 gap-3 items-center min-w-0">
                                        <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 rounded-xl shadow-lg skeleton" />
                                        <div className="flex-1 min-w-0">
                                            <div className="mb-1 w-24 h-6 rounded skeleton" />
                                            <div className="w-32 h-4 rounded skeleton" />
                                        </div>
                                        <div className="w-20 h-6 rounded-full skeleton flex-shrink-0" />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="flex-grow mb-4">
                                    <div className="w-full h-4 rounded skeleton mb-2" />
                                    <div className="w-3/4 h-4 rounded skeleton" />
                                </div>

                                {/* GitHub Specific Info (for some cards) */}
                                {i <= 2 && (
                                    <div className="p-3 mb-4 rounded-lg border glass border-primary-200/20 dark:border-primary-500/10">
                                        <div className="w-40 h-3 rounded skeleton" />
                                    </div>
                                )}

                                {/* Spacer */}
                                {i > 2 && <div className="flex-grow"></div>}

                                {/* Actions */}
                                <div className="mt-auto">
                                    {i % 2 === 0 ? (
                                        <div className="flex gap-2">
                                            <div className="flex-1 w-full h-10 rounded-xl skeleton" />
                                            <div className="w-10 h-10 rounded-xl skeleton" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-10 rounded-xl skeleton" />
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

