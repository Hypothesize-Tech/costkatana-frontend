import React from "react";

export const PromptTemplatesShimmer: React.FC = () => {
    return (
        <div className="p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            {/* Header */}
            <div className="p-8 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="mb-4 w-64 h-10 rounded skeleton" />
                        <div className="w-96 h-6 rounded skeleton" />
                    </div>
                    <div className="flex gap-3">
                        <div className="w-28 h-11 rounded-lg skeleton" />
                        <div className="w-32 h-11 rounded-lg skeleton" />
                        <div className="w-36 h-11 rounded-lg skeleton" />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover"
                    >
                        <div className="flex items-center">
                            <div className="flex justify-center items-center mr-4 w-12 h-12 bg-gradient-to-br rounded-xl skeleton" />
                            <div>
                                <div className="mb-2 w-24 h-4 rounded skeleton" />
                                <div className="w-16 h-8 rounded skeleton" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Enhanced Filters */}
            <div className="p-6 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <div className="w-full h-12 rounded-lg skeleton" />
                    </div>
                    <div className="w-48 h-12 rounded-lg skeleton" />
                    <div className="w-40 h-12 rounded-xl skeleton" />
                </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6"
                    >
                        {/* Template Card Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <div className="mb-2 w-40 h-6 rounded skeleton" />
                                <div className="w-32 h-4 rounded skeleton" />
                            </div>
                            <div className="w-6 h-6 rounded skeleton" />
                        </div>

                        {/* Template Description */}
                        <div className="mb-4">
                            <div className="w-full h-4 rounded skeleton mb-2" />
                            <div className="w-3/4 h-4 rounded skeleton" />
                        </div>

                        {/* Template Tags/Category */}
                        <div className="flex gap-2 mb-4">
                            <div className="w-20 h-6 rounded-full skeleton" />
                            <div className="w-16 h-6 rounded-full skeleton" />
                        </div>

                        {/* Template Stats */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="w-24 h-4 rounded skeleton" />
                            <div className="w-20 h-4 rounded skeleton" />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <div className="flex-1 h-9 rounded-lg skeleton" />
                            <div className="w-9 h-9 rounded-lg skeleton" />
                            <div className="w-9 h-9 rounded-lg skeleton" />
                            <div className="w-9 h-9 rounded-lg skeleton" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

