import React from 'react';

// MFA Setup Shimmer Component
export const MFASetupShimmer: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center">
                <div className="flex justify-center items-center mr-4 w-10 h-10 rounded-xl skeleton" />
                <div className="w-64 h-9 rounded skeleton" />
            </div>

            {/* Status Overview Card */}
            <div className="p-6 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-4 w-40 h-6 rounded skeleton" />
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="w-48 h-4 rounded skeleton" />
                        <div className="w-24 h-6 rounded-xl skeleton" />
                    </div>
                    <div className="w-56 h-4 rounded skeleton" />
                </div>
            </div>

            {/* Setup Methods */}
            <div className="space-y-6">
                {/* Email MFA Card */}
                <div className="p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-primary-50/50 to-primary-100/50">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center">
                            <div className="flex justify-center items-center mr-4 w-12 h-12 rounded-xl skeleton" />
                            <div>
                                <div className="mb-1 w-40 h-6 rounded skeleton" />
                                <div className="w-64 h-4 rounded skeleton" />
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-20 h-6 rounded-xl skeleton" />
                            <div className="w-24 h-10 rounded-xl skeleton" />
                        </div>
                    </div>
                </div>

                {/* TOTP MFA Card */}
                <div className="p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-success-200/30 from-success-50/50 to-success-100/50">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center">
                            <div className="flex justify-center items-center mr-4 w-12 h-12 rounded-xl skeleton" />
                            <div>
                                <div className="mb-1 w-40 h-6 rounded skeleton" />
                                <div className="w-64 h-4 rounded skeleton" />
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-20 h-6 rounded-xl skeleton" />
                            <div className="w-24 h-10 rounded-xl skeleton" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

