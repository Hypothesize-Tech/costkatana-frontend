import React from "react";

export const ProjectsShimmer: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
            {/* Header */}
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="mb-2 w-32 h-9 rounded skeleton" />
                        <div className="w-64 h-4 rounded skeleton" />
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="w-36 h-10 rounded-xl skeleton" />
                        <div className="w-28 h-10 rounded-xl skeleton" />
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6"
                    >
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30 dark:border-primary-500/20 mr-4 shadow-lg">
                                <div className="w-6 h-6 rounded skeleton" />
                            </div>
                            <div>
                                <div className="mb-2 w-24 h-4 rounded skeleton" />
                                <div className="w-16 h-8 rounded skeleton" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6"
                    >
                        {/* Project Card Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <div className="mb-2 w-32 h-6 rounded skeleton" />
                                <div className="w-24 h-4 rounded skeleton" />
                            </div>
                            <div className="w-6 h-6 rounded skeleton" />
                        </div>

                        {/* Project Stats */}
                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between items-center">
                                <div className="w-20 h-4 rounded skeleton" />
                                <div className="w-24 h-5 rounded skeleton" />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="w-24 h-4 rounded skeleton" />
                                <div className="w-20 h-5 rounded skeleton" />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="w-28 h-4 rounded skeleton" />
                                <div className="w-16 h-5 rounded skeleton" />
                            </div>
                        </div>

                        {/* Budget Progress Bar */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <div className="w-16 h-3 rounded skeleton" />
                                <div className="w-20 h-3 rounded skeleton" />
                            </div>
                            <div className="w-full h-2 rounded-full skeleton" />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <div className="flex-1 h-9 rounded-lg skeleton" />
                            <div className="w-9 h-9 rounded-lg skeleton" />
                            <div className="w-9 h-9 rounded-lg skeleton" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

