import React from "react";

export const WebhookShimmer: React.FC = () => {
    return (
        <div className="p-3 md:p-4 lg:p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="p-4 md:p-6 lg:p-8 mb-4 md:mb-6 lg:mb-8 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                    <div className="flex flex-col gap-3 md:gap-4 justify-between items-start sm:flex-row sm:items-center">
                        <div className="flex gap-3 md:gap-4 items-center flex-1 min-w-0">
                            <div className="p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg shadow-[#06ec9e]/30 flex-shrink-0">
                                <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded skeleton" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="mb-1 md:mb-2 w-full sm:w-28 md:w-32 h-6 md:h-7 lg:h-9 rounded skeleton" />
                                <div className="w-full sm:w-56 md:w-64 h-3 md:h-4 lg:h-5 rounded skeleton" />
                            </div>
                        </div>
                        <div className="w-full sm:w-auto h-10 md:h-11 rounded-xl skeleton" />
                    </div>
                </div>

                {/* Queue Stats */}
                <div className="p-4 md:p-6 mb-4 md:mb-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                    <div className="flex gap-2 md:gap-3 items-center mb-3 md:mb-4 lg:mb-6">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-[#06ec9e]/20 to-[#009454]/20 dark:from-[#06ec9e]/30 dark:to-[#009454]/30 flex-shrink-0">
                            <div className="w-4 h-4 md:w-5 md:h-5 rounded skeleton" />
                        </div>
                        <div className="w-full sm:w-36 md:w-40 h-5 md:h-6 lg:h-7 rounded skeleton" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="p-3 md:p-4 lg:p-5 text-center bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20"
                            >
                                <div className="mx-auto mb-2 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded skeleton" />
                                <div className="mx-auto mb-2 w-10 md:w-12 h-6 md:h-7 lg:h-9 rounded skeleton" />
                                <div className="mx-auto w-14 md:w-16 h-3 md:h-4 rounded skeleton" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
                    {/* Webhook List */}
                    <div className="lg:col-span-1">
                        <div className="p-4 md:p-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                            <div className="flex gap-2 md:gap-3 items-center mb-3 md:mb-4 lg:mb-6">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-[#06ec9e]/20 to-[#009454]/20 dark:from-[#06ec9e]/30 dark:to-[#009454]/30 flex-shrink-0">
                                    <div className="w-4 h-4 md:w-5 md:h-5 rounded skeleton" />
                                </div>
                                <div className="w-full sm:w-32 md:w-36 h-5 md:h-6 lg:h-7 rounded skeleton" />
                            </div>
                            <div className="space-y-3 md:space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-18 md:h-20 lg:h-24 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 skeleton" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Webhook Details */}
                    <div className="lg:col-span-2">
                        <div className="p-4 md:p-6 lg:p-8 xl:p-12 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                            <div className="p-3 md:p-4 rounded-2xl bg-gradient-to-br from-[#06ec9e]/10 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:to-[#009454]/20 w-fit mx-auto mb-3 md:mb-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded skeleton" />
                            </div>
                            <div className="mx-auto mb-2 w-full sm:w-40 md:w-48 h-5 md:h-6 lg:h-7 rounded skeleton" />
                            <div className="mx-auto w-full sm:w-72 md:w-80 h-3 md:h-4 lg:h-5 rounded skeleton" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

