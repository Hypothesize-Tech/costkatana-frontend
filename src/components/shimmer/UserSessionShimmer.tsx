import React from 'react';

export const UserSessionShimmer: React.FC = () => {
    return (
        <div className="space-y-4">
            {/* Current session shimmer */}
            <div className="p-4 rounded-lg border glass border-success-200/30 bg-gradient-success/5">
                <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-lg skeleton" />
                    <div className="flex-1 space-y-2">
                        <div className="flex gap-2 items-center">
                            <div className="w-32 h-5 rounded skeleton" />
                            <div className="w-24 h-5 rounded skeleton" />
                        </div>
                        <div className="flex gap-4">
                            <div className="w-24 h-4 rounded skeleton" />
                            <div className="w-32 h-4 rounded skeleton" />
                            <div className="w-20 h-4 rounded skeleton" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Other sessions shimmer */}
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="p-4 rounded-lg border glass border-primary-200/30"
                    >
                        <div className="flex gap-3 items-start justify-between">
                            <div className="flex gap-3 items-start flex-1">
                                <div className="w-10 h-10 rounded-lg skeleton" />
                                <div className="flex-1 space-y-2">
                                    <div className="w-40 h-5 rounded skeleton" />
                                    <div className="flex gap-4">
                                        <div className="w-24 h-4 rounded skeleton" />
                                        <div className="w-32 h-4 rounded skeleton" />
                                        <div className="w-20 h-4 rounded skeleton" />
                                    </div>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-lg skeleton" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

