import React from 'react';

export const UsageAnalyticsShimmer: React.FC = () => {
    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6 px-3 sm:px-0">
            {/* Header */}
            <div className="skeleton h-6 sm:h-7 md:h-8 w-full sm:w-40 md:w-48 rounded" />

            {/* Current Usage Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="card p-3 sm:p-4 md:p-5 lg:p-6">
                        <div className="skeleton h-3 sm:h-4 w-20 sm:w-24 rounded mb-2" />
                        <div className="skeleton h-7 sm:h-8 md:h-9 w-28 sm:w-32 rounded mb-1" />
                        <div className="skeleton h-3 w-16 sm:w-20 rounded" />
                    </div>
                ))}
            </div>

            {/* Projected Usage Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="card p-3 sm:p-4 md:p-5 lg:p-6">
                        <div className="skeleton h-3 sm:h-4 w-24 sm:w-28 rounded mb-2" />
                        <div className="skeleton h-7 sm:h-8 md:h-9 w-28 sm:w-32 rounded" />
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                {[1, 2].map((i) => (
                    <div key={i} className="card p-3 sm:p-4 md:p-5 lg:p-6">
                        <div className="skeleton h-5 sm:h-6 w-full sm:w-36 md:w-40 rounded mb-3 sm:mb-4" />
                        <div className="skeleton h-40 sm:h-48 md:h-56 lg:h-64 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );
};

