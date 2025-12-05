import React from 'react';

export const PaymentMethodManagerShimmer: React.FC = () => {
    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <div className="skeleton h-6 w-full rounded sm:h-7 sm:w-48 md:h-8" />
                <div className="skeleton h-9 w-full rounded-lg sm:h-10 sm:w-48" />
            </div>

            {/* Payment Method Cards Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {[1, 2].map((i) => (
                    <div key={i} className="card p-4 sm:p-5 md:p-6">
                        <div className="flex flex-col gap-3 items-start justify-between mb-3 sm:flex-row sm:items-start sm:mb-4 sm:gap-0">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="skeleton h-9 w-9 rounded-lg sm:h-10 sm:w-10 shrink-0" />
                                <div className="space-y-1.5 sm:space-y-2">
                                    <div className="skeleton h-4 w-full rounded sm:w-24 sm:h-5" />
                                    <div className="skeleton h-3 w-full rounded sm:w-32 sm:h-4" />
                                </div>
                            </div>
                            <div className="skeleton h-5 w-full rounded-full sm:w-16 sm:h-6" />
                        </div>
                        <div className="skeleton h-3 w-full rounded mb-3 sm:w-28 sm:h-4 sm:mb-4" />
                        <div className="flex items-center gap-2">
                            <div className="skeleton h-8 flex-1 rounded-lg sm:h-9" />
                            <div className="skeleton h-8 w-8 rounded-lg sm:h-9 sm:w-9" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

