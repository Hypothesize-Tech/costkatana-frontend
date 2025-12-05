import React from 'react';

// MFA Setup Shimmer Component
export const MFASetupShimmer: React.FC = () => {
    return (
        <div className="space-y-6 sm:space-y-7 md:space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton flex-shrink-0" />
                <div className="w-48 sm:w-56 md:w-64 h-7 sm:h-8 md:h-9 rounded skeleton" />
            </div>

            {/* Status Overview Card */}
            <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-3 sm:mb-4 w-36 sm:w-40 h-5 sm:h-6 rounded skeleton" />
                <div className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                        <div className="w-full sm:w-44 md:w-48 h-3 sm:h-4 rounded skeleton" />
                        <div className="w-full sm:w-20 md:w-24 h-5 sm:h-6 rounded-xl skeleton" />
                    </div>
                    <div className="w-full sm:w-52 md:w-56 h-3 sm:h-4 rounded skeleton" />
                </div>
            </div>

            {/* Setup Methods */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Email MFA Card */}
                <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-primary-50/50 to-primary-100/50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="flex justify-center items-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl skeleton flex-shrink-0" />
                            <div>
                                <div className="mb-1 w-32 sm:w-36 md:w-40 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
                                <div className="w-56 sm:w-60 md:w-64 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                            <div className="w-full sm:w-18 md:w-20 h-5 sm:h-6 rounded-xl skeleton" />
                            <div className="w-full sm:w-20 md:w-24 h-9 sm:h-10 rounded-xl skeleton" />
                        </div>
                    </div>
                </div>

                {/* TOTP MFA Card */}
                <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-success-200/30 from-success-50/50 to-success-100/50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="flex justify-center items-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl skeleton flex-shrink-0" />
                            <div>
                                <div className="mb-1 w-32 sm:w-36 md:w-40 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
                                <div className="w-56 sm:w-60 md:w-64 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                            <div className="w-full sm:w-18 md:w-20 h-5 sm:h-6 rounded-xl skeleton" />
                            <div className="w-full sm:w-20 md:w-24 h-9 sm:h-10 rounded-xl skeleton" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

