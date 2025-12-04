import React from "react";

export const WebhookShimmer: React.FC = () => {
    return (
        <div className="p-4 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient sm:p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="p-6 mb-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-8 sm:mb-8">
                    <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
                        <div className="flex gap-4 items-center">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg shadow-[#06ec9e]/30">
                                <div className="w-6 h-6 rounded sm:w-8 sm:h-8 skeleton" />
                            </div>
                            <div>
                                <div className="mb-1 w-32 h-7 rounded sm:mb-2 sm:h-9 skeleton" />
                                <div className="w-64 h-4 rounded sm:h-5 skeleton" />
                            </div>
                        </div>
                        <div className="w-full h-11 rounded-xl sm:w-auto skeleton" />
                    </div>
                </div>

                {/* Queue Stats */}
                <div className="p-4 mb-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-6">
                    <div className="flex gap-3 items-center mb-4 sm:mb-6">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-[#06ec9e]/20 to-[#009454]/20 dark:from-[#06ec9e]/30 dark:to-[#009454]/30">
                            <div className="w-5 h-5 rounded skeleton" />
                        </div>
                        <div className="w-40 h-6 rounded sm:h-7 skeleton" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="p-4 text-center bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 sm:p-5"
                            >
                                <div className="mx-auto mb-2 w-6 h-6 rounded sm:w-8 sm:h-8 skeleton" />
                                <div className="mx-auto mb-2 w-12 h-7 rounded sm:h-9 skeleton" />
                                <div className="mx-auto w-16 h-3 rounded sm:h-4 skeleton" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:gap-6">
                    {/* Webhook List */}
                    <div className="lg:col-span-1">
                        <div className="p-4 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-6">
                            <div className="flex gap-3 items-center mb-4 sm:mb-6">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-[#06ec9e]/20 to-[#009454]/20 dark:from-[#06ec9e]/30 dark:to-[#009454]/30">
                                    <div className="w-5 h-5 rounded skeleton" />
                                </div>
                                <div className="w-36 h-6 rounded sm:h-7 skeleton" />
                            </div>
                            <div className="space-y-3 sm:space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-20 rounded-xl border sm:h-24 glass border-primary-200/30 dark:border-primary-500/20 skeleton" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Webhook Details */}
                    <div className="lg:col-span-2">
                        <div className="p-8 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-12">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#06ec9e]/10 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:to-[#009454]/20 w-fit mx-auto mb-4">
                                <div className="w-12 h-12 rounded sm:w-16 sm:h-16 skeleton" />
                            </div>
                            <div className="mx-auto mb-2 w-48 h-6 rounded sm:h-7 skeleton" />
                            <div className="mx-auto w-80 h-4 rounded sm:h-5 skeleton" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

