import React from 'react';

export const UserSessionShimmer: React.FC = () => {
    return (
        <div className="space-y-3 sm:space-y-4 px-3 sm:px-0">
            {/* Current session shimmer */}
            <div className="p-3 sm:p-4 rounded-lg border glass border-success-200/30 bg-gradient-success/5">
                <div className="flex gap-2 sm:gap-3 items-start">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg skeleton flex-shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex flex-wrap gap-2 items-center">
                            <div className="w-full sm:w-28 md:w-32 h-4 sm:h-5 rounded skeleton" />
                            <div className="w-full sm:w-20 md:w-24 h-4 sm:h-5 rounded skeleton" />
                        </div>
                        <div className="flex flex-wrap gap-3 sm:gap-4">
                            <div className="w-full sm:w-20 md:w-24 h-3 sm:h-4 rounded skeleton" />
                            <div className="w-full sm:w-28 md:w-32 h-3 sm:h-4 rounded skeleton" />
                            <div className="w-full sm:w-16 md:w-20 h-3 sm:h-4 rounded skeleton" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Other sessions shimmer */}
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="p-3 sm:p-4 rounded-lg border glass border-primary-200/30"
                    >
                        <div className="flex gap-2 sm:gap-3 items-start justify-between">
                            <div className="flex gap-2 sm:gap-3 items-start flex-1 min-w-0">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg skeleton flex-shrink-0" />
                                <div className="flex-1 space-y-2 min-w-0">
                                    <div className="w-full sm:w-36 md:w-40 h-4 sm:h-5 rounded skeleton" />
                                    <div className="flex flex-wrap gap-3 sm:gap-4">
                                        <div className="w-full sm:w-20 md:w-24 h-3 sm:h-4 rounded skeleton" />
                                        <div className="w-full sm:w-28 md:w-32 h-3 sm:h-4 rounded skeleton" />
                                        <div className="w-full sm:w-16 md:w-20 h-3 sm:h-4 rounded skeleton" />
                                    </div>
                                </div>
                            </div>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg skeleton flex-shrink-0" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

