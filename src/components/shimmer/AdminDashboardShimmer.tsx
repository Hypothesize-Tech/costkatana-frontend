import React from "react";

// Admin Dashboard Header Shimmer
export const AdminDashboardHeaderShimmer: React.FC = () => {
    return (
        <header className="p-3 sm:p-4 md:p-6 bg-gradient-to-r rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-white/90 via-white/70 to-white/90 dark:from-dark-card/90 dark:via-dark-card/70 dark:to-dark-card/90">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                <div className="flex gap-2 sm:gap-3 md:gap-4 items-center">
                    <div className="p-2 sm:p-2.5 md:p-3 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-36 sm:w-40 md:w-48 h-7 sm:h-8 md:h-9 rounded skeleton" />
                        <div className="w-56 sm:w-64 md:w-80 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                    <div className="w-24 sm:w-28 h-9 sm:h-10 rounded-lg skeleton" />
                    <div className="w-28 sm:w-32 h-9 sm:h-10 rounded-lg skeleton" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 pt-3 sm:pt-4 border-t border-primary-200/30 dark:border-primary-700/30">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((i) => (
                    <div key={i} className="w-24 sm:w-28 md:w-32 h-9 sm:h-10 rounded-lg skeleton" />
                ))}
            </div>
        </header>
    );
};

// Overview Tab Shimmer
export const AdminOverviewShimmer: React.FC = () => {
    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="p-4 sm:p-5 md:p-6 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30"
                    >
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <div className="p-2 sm:p-2.5 md:p-3 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl skeleton" />
                            <div className="w-14 sm:w-16 h-5 sm:h-6 rounded-lg skeleton" />
                        </div>
                        <div className="mb-1.5 sm:mb-2 w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                        <div className="w-28 sm:w-32 h-7 sm:h-8 md:h-9 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Growth Chart */}
            <div className="p-4 sm:p-6 md:p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="p-1.5 sm:p-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-36 sm:w-40 md:w-48 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                        <div className="w-48 sm:w-56 md:w-64 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="h-64 sm:h-72 md:h-80 rounded skeleton" />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-2">
                {/* Top Models */}
                <div className="p-4 sm:p-6 md:p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                    <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                        <div className="p-1.5 sm:p-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton" />
                        <div>
                            <div className="mb-1 w-32 sm:w-36 md:w-40 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
                            <div className="w-40 sm:w-44 md:w-48 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                        </div>
                    </div>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="w-full min-w-[500px]">
                            <thead>
                                <tr className="border-b border-primary-200/30">
                                    {[1, 2, 3, 4].map((i) => (
                                        <th key={i} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                            <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5].map((row) => (
                                    <tr key={row}>
                                        {[1, 2, 3, 4].map((col) => (
                                            <td key={col} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                                <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Feature Usage */}
                <div className="p-4 sm:p-6 md:p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                    <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                        <div className="p-1.5 sm:p-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton" />
                        <div>
                            <div className="mb-1 w-28 sm:w-30 md:w-32 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
                            <div className="w-36 sm:w-38 md:w-40 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                        </div>
                    </div>
                    <div className="h-48 sm:h-56 md:h-64 rounded skeleton" />
                </div>
            </div>
        </div>
    );
};

// User Growth Tab Shimmer
export const AdminGrowthShimmer: React.FC = () => {
    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30">
                        <div className="mb-1.5 sm:mb-2 w-28 sm:w-32 h-4 sm:h-5 rounded skeleton" />
                        <div className="w-20 sm:w-24 h-7 sm:h-8 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Growth Chart */}
            <div className="p-4 sm:p-6 md:p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="p-1.5 sm:p-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-36 sm:w-40 md:w-48 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                        <div className="w-48 sm:w-56 md:w-64 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="h-64 sm:h-80 md:h-96 rounded skeleton" />
            </div>
        </div>
    );
};

// Alerts Tab Shimmer
export const AdminAlertsShimmer: React.FC = () => {
    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="p-4 sm:p-6 md:p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                    <div className="flex gap-2 sm:gap-3 items-center">
                        <div className="p-1.5 sm:p-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton" />
                        <div>
                            <div className="mb-1 w-32 sm:w-36 md:w-40 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                            <div className="w-40 sm:w-44 md:w-48 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                        </div>
                    </div>
                    <div className="w-20 sm:w-24 h-7 sm:h-8 rounded-full skeleton" />
                </div>
                <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 sm:p-5 md:p-6 rounded-xl border glass border-primary-200/30">
                            <div className="flex gap-3 sm:gap-4 items-start">
                                <div className="flex-shrink-0 p-2 sm:p-2.5 md:p-3 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl skeleton" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                        <div className="w-16 sm:w-20 h-5 sm:h-6 rounded-lg skeleton" />
                                        <div className="w-40 sm:w-48 h-5 sm:h-6 rounded skeleton" />
                                    </div>
                                    <div className="mb-3 sm:mb-4 w-full h-3 sm:h-4 rounded skeleton" />
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                        <div className="w-28 sm:w-32 h-3 sm:h-4 rounded skeleton" />
                                        <div className="w-20 sm:w-24 h-5 sm:h-6 rounded-lg skeleton" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Models Tab Shimmer
export const AdminModelsShimmer: React.FC = () => {
    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Model Comparison */}
            <div className="p-4 sm:p-6 md:p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="p-1.5 sm:p-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-32 sm:w-36 md:w-40 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                        <div className="w-40 sm:w-44 md:w-48 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <th key={i} className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
                                        <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5, 6].map((col) => (
                                        <td key={col} className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
                                            <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Service Comparison */}
            <div className="p-4 sm:p-6 md:p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="p-1.5 sm:p-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-32 sm:w-36 md:w-40 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                        <div className="w-40 sm:w-44 md:w-48 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <th key={i} className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
                                        <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5, 6].map((col) => (
                                        <td key={col} className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
                                            <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Features Tab Shimmer
export const AdminFeaturesShimmer: React.FC = () => {
    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Feature Usage */}
            <div className="p-4 sm:p-6 md:p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="p-1.5 sm:p-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-36 sm:w-40 md:w-48 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                        <div className="w-44 sm:w-50 md:w-56 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <th key={i} className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
                                        <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5, 6].map((col) => (
                                        <td key={col} className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
                                            <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Feature Adoption */}
            <div className="p-4 sm:p-6 md:p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="p-1.5 sm:p-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-36 sm:w-40 md:w-44 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                        <div className="w-40 sm:w-44 md:w-48 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <th key={i} className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
                                        <div className="w-24 sm:w-28 h-3 sm:h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5].map((col) => (
                                        <td key={col} className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
                                            <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Projects Tab Shimmer
export const AdminProjectsShimmer: React.FC = () => {
    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Projects */}
            <div className="p-4 sm:p-6 md:p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="p-1.5 sm:p-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-32 sm:w-36 md:w-40 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                        <div className="w-40 sm:w-44 md:w-48 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <th key={i} className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
                                        <div className="w-24 sm:w-28 h-3 sm:h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5, 6].map((col) => (
                                        <td key={col} className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
                                            <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Workspaces */}
            <div className="p-4 sm:p-6 md:p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="p-1.5 sm:p-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-36 sm:w-40 md:w-44 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                        <div className="w-40 sm:w-44 md:w-48 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <th key={i} className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
                                        <div className="w-24 sm:w-28 h-3 sm:h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5].map((col) => (
                                        <td key={col} className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
                                            <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// User Management Tab Shimmer
export const AdminUsersShimmer: React.FC = () => {
    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30"
                    >
                        <div className="mb-1.5 sm:mb-2 w-28 sm:w-32 h-4 sm:h-5 rounded skeleton" />
                        <div className="w-20 sm:w-24 h-7 sm:h-8 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                    <div className="w-full sm:w-56 md:w-64 h-10 sm:h-11 rounded-lg skeleton" />
                    <div className="w-full sm:w-28 md:w-32 h-10 sm:h-11 rounded-lg skeleton" />
                    <div className="w-full sm:w-28 md:w-32 h-10 sm:h-11 rounded-lg skeleton" />
                    <div className="w-full sm:w-28 md:w-32 h-10 sm:h-11 rounded-lg skeleton" />
                </div>
            </div>

            {/* Users Table */}
            <div className="p-4 sm:p-6 md:p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                    <div className="flex gap-2 sm:gap-3 items-center">
                        <div className="p-1.5 sm:p-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton" />
                        <div>
                            <div className="mb-1 w-20 sm:w-24 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                            <div className="w-28 sm:w-32 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                        </div>
                    </div>
                    <div className="w-24 sm:w-28 h-9 sm:h-10 rounded-xl skeleton" />
                </div>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <th key={i} className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
                                        <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                                        <td key={col} className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
                                            <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Discount Management Tab Shimmer
export const AdminDiscountShimmer: React.FC = () => {
    return (
        <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="mx-auto space-y-4 sm:space-y-5 md:space-y-6 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                    <div className="flex gap-2 sm:gap-3 md:gap-4 items-center">
                        <div className="p-2 sm:p-2.5 md:p-3 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl skeleton" />
                        <div>
                            <div className="mb-1 w-36 sm:w-40 md:w-48 h-7 sm:h-8 md:h-9 rounded skeleton" />
                            <div className="w-56 sm:w-64 md:w-80 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                        <div className="w-20 sm:w-24 h-9 sm:h-10 rounded-lg skeleton" />
                        <div className="w-24 sm:w-28 h-9 sm:h-10 rounded-lg skeleton" />
                        <div className="w-32 sm:w-36 h-9 sm:h-10 rounded-lg skeleton" />
                    </div>
                </div>

                {/* Filters */}
                <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="w-full h-10 sm:h-11 rounded skeleton" />
                        <div className="w-full h-10 sm:h-11 rounded skeleton" />
                        <div className="w-full h-10 sm:h-11 rounded skeleton" />
                        <div className="w-full h-10 sm:h-11 rounded skeleton" />
                    </div>
                </div>

                {/* Discounts Table */}
                <div className="overflow-hidden bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                    <div className="overflow-x-auto -mx-3 sm:mx-0">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gradient-to-r border-b from-primary-50/50 to-success-50/50 dark:from-primary-950/30 dark:to-success-950/30 border-primary-200/30">
                                <tr>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <th key={i} className="px-3 sm:px-4 py-2.5 sm:py-3 text-left">
                                            <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-200/20 dark:divide-primary-800/20">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                    <tr key={row}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                                            <td key={col} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                                <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 px-3 sm:px-4 py-2.5 sm:py-3 border-t border-primary-200/30 dark:border-primary-800/30">
                        <div className="w-40 sm:w-48 h-3 sm:h-4 rounded skeleton text-center sm:text-left" />
                        <div className="flex gap-2 justify-center sm:justify-end">
                            <div className="w-18 sm:w-20 h-8 sm:h-9 rounded-lg skeleton" />
                            <div className="w-18 sm:w-20 h-8 sm:h-9 rounded-lg skeleton" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Activity Feed Tab Shimmer
export const AdminActivityShimmer: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                <div className="flex gap-2 sm:gap-3 items-center">
                    <div className="p-1.5 sm:p-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-36 sm:w-40 md:w-48 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                        <div className="w-44 sm:w-50 md:w-56 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="w-20 sm:w-24 h-7 sm:h-8 rounded-full skeleton" />
            </div>

            <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <div
                        key={i}
                        className="p-3 sm:p-4 rounded-xl border glass border-primary-200/30"
                    >
                        <div className="flex gap-3 sm:gap-4 items-start">
                            <div className="flex-shrink-0 p-1.5 sm:p-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg skeleton" />
                            <div className="flex-1 min-w-0">
                                <div className="mb-1.5 sm:mb-2 w-40 sm:w-48 h-4 sm:h-5 rounded skeleton" />
                                <div className="mb-1.5 sm:mb-2 w-full h-3 sm:h-4 rounded skeleton" />
                                <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
                                    <div className="w-28 sm:w-32 h-3 sm:h-4 rounded skeleton" />
                                    <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                    <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Revenue Tab Shimmer
export const AdminRevenueShimmer: React.FC = () => {
    return (
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
            <div className="flex gap-2 sm:gap-3 items-center pb-3 sm:pb-4 mb-4 sm:mb-5 md:mb-6 border-b border-primary-200/30">
                <div className="p-2 sm:p-2.5 rounded-xl skeleton w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" />
                <div>
                    <div className="mb-1 w-44 sm:w-50 md:w-56 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                    <div className="w-52 sm:w-58 md:w-64 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                </div>
            </div>

            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                        <div className="mb-1.5 sm:mb-2 w-28 sm:w-32 h-4 sm:h-5 rounded skeleton" />
                        <div className="w-20 sm:w-24 h-7 sm:h-8 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Subscription Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                        <div className="mb-1.5 sm:mb-2 w-36 sm:w-40 h-4 sm:h-5 rounded skeleton" />
                        <div className="w-20 sm:w-24 h-7 sm:h-8 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Upcoming Renewals */}
            <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-3 sm:mb-4 w-52 sm:w-58 md:w-64 h-5 sm:h-6 rounded skeleton" />
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4].map((i) => (
                                    <th key={i} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                        <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4].map((col) => (
                                        <td key={col} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                            <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Conversion Metrics */}
            <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-3 sm:mb-4 w-40 sm:w-44 md:w-48 h-5 sm:h-6 rounded skeleton" />
                <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-3 sm:mb-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-3 sm:p-4 rounded-xl border backdrop-blur-sm glass border-primary-200/30">
                            <div className="mb-1.5 sm:mb-2 w-28 sm:w-32 h-4 sm:h-5 rounded skeleton" />
                            <div className="w-20 sm:w-24 h-5 sm:h-6 rounded skeleton" />
                        </div>
                    ))}
                </div>
                <div className="p-3 sm:p-4 rounded-xl border backdrop-blur-sm glass border-primary-200/30">
                    <div className="mb-2 sm:mb-3 w-36 sm:w-40 h-4 sm:h-5 rounded skeleton" />
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i}>
                                <div className="mb-1 w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                <div className="w-14 sm:w-16 h-4 sm:h-5 rounded skeleton" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// API Keys Tab Shimmer
export const AdminApiKeysShimmer: React.FC = () => {
    return (
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
            <div className="flex gap-2 sm:gap-3 items-center pb-3 sm:pb-4 mb-4 sm:mb-5 md:mb-6 border-b border-primary-200/30">
                <div className="p-2 sm:p-2.5 rounded-xl skeleton w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" />
                <div>
                    <div className="mb-1 w-36 sm:w-40 md:w-48 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                    <div className="w-52 sm:w-58 md:w-64 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                </div>
            </div>

            {/* API Key Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                        <div className="mb-1.5 sm:mb-2 w-28 sm:w-32 h-4 sm:h-5 rounded skeleton" />
                        <div className="w-20 sm:w-24 h-7 sm:h-8 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Top API Keys */}
            <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-3 sm:mb-4 w-40 sm:w-44 md:w-48 h-5 sm:h-6 rounded skeleton" />
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4].map((i) => (
                                    <th key={i} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                        <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4].map((col) => (
                                        <td key={col} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                            <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* API Key Usage */}
            <div className="p-4 sm:p-5 md:p-6 bg-white rounded-xl border border-gray-200 dark:bg-dark-card dark:border-gray-800">
                <div className="mb-3 sm:mb-4 w-40 sm:w-44 md:w-48 h-5 sm:h-6 rounded skeleton" />
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <th key={i} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                        <div className="w-24 sm:w-28 h-3 sm:h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5].map((col) => (
                                        <td key={col} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                            <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Endpoints Tab Shimmer
export const AdminEndpointsShimmer: React.FC = () => {
    return (
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
            <div className="flex gap-2 sm:gap-3 items-center pb-3 sm:pb-4 mb-4 sm:mb-5 md:mb-6 border-b border-primary-200/30">
                <div className="p-2 sm:p-2.5 rounded-xl skeleton w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" />
                <div>
                    <div className="mb-1 w-36 sm:w-40 md:w-48 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                    <div className="w-44 sm:w-50 md:w-56 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                </div>
            </div>

            {/* Top Endpoints */}
            <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-3 sm:mb-4 w-28 sm:w-32 h-5 sm:h-6 rounded skeleton" />
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4].map((i) => (
                                    <th key={i} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                        <div className="w-24 sm:w-28 h-3 sm:h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4].map((col) => (
                                        <td key={col} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                            <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Endpoint Trends */}
            <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-3 sm:mb-4 w-36 sm:w-40 h-5 sm:h-6 rounded skeleton" />
                <div className="h-48 sm:h-56 md:h-64 rounded skeleton" />
            </div>

            {/* Endpoint Performance */}
            <div className="p-4 sm:p-5 md:p-6 bg-white rounded-xl border border-gray-200 dark:bg-dark-card dark:border-gray-800">
                <div className="mb-3 sm:mb-4 w-44 sm:w-50 md:w-56 h-5 sm:h-6 rounded skeleton" />
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <th key={i} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                        <div className="w-24 sm:w-28 h-3 sm:h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5].map((col) => (
                                        <td key={col} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                            <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Geographic Tab Shimmer
export const AdminGeographicShimmer: React.FC = () => {
    return (
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
            <div className="flex gap-2 sm:gap-3 items-center pb-3 sm:pb-4 mb-4 sm:mb-5 md:mb-6 border-b border-primary-200/30">
                <div className="p-2 sm:p-2.5 rounded-xl skeleton w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" />
                <div>
                    <div className="mb-1 w-52 sm:w-58 md:w-64 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                    <div className="w-40 sm:w-44 md:w-48 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                </div>
            </div>

            {/* Geographic Usage */}
            <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-3 sm:mb-4 w-36 sm:w-40 h-5 sm:h-6 rounded skeleton" />
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <th key={i} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                        <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5].map((col) => (
                                        <td key={col} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                            <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Usage Patterns */}
            <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-3 sm:mb-4 w-40 sm:w-44 md:w-48 h-5 sm:h-6 rounded skeleton" />
                <div className="h-48 sm:h-56 md:h-64 rounded skeleton" />
            </div>

            {/* Peak Usage Times */}
            <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-3 sm:mb-4 w-36 sm:w-40 h-5 sm:h-6 rounded skeleton" />
                <div className="h-48 sm:h-56 md:h-64 rounded skeleton" />
            </div>

            {/* Cost Distribution */}
            <div className="p-4 sm:p-5 md:p-6 bg-white rounded-xl border border-gray-200 dark:bg-dark-card dark:border-gray-800">
                <div className="mb-3 sm:mb-4 w-44 sm:w-50 md:w-56 h-5 sm:h-6 rounded skeleton" />
                <div className="h-48 sm:h-56 md:h-64 rounded skeleton" />
            </div>
        </div>
    );
};

// Budget Tab Shimmer
export const AdminBudgetShimmer: React.FC = () => {
    return (
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
            <div className="flex gap-2 sm:gap-3 items-center pb-3 sm:pb-4 mb-4 sm:mb-5 md:mb-6 border-b border-primary-200/30">
                <div className="p-2 sm:p-2.5 rounded-xl skeleton w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" />
                <div>
                    <div className="mb-1 w-36 sm:w-40 md:w-48 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                    <div className="w-44 sm:w-50 md:w-56 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                </div>
            </div>

            {/* Budget Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                        <div className="mb-1.5 sm:mb-2 w-28 sm:w-32 h-4 sm:h-5 rounded skeleton" />
                        <div className="w-20 sm:w-24 h-7 sm:h-8 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Budget Alerts */}
            <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-3 sm:mb-4 w-28 sm:w-32 h-5 sm:h-6 rounded skeleton" />
                <div className="space-y-2 sm:space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-900/50 dark:border-gray-800">
                            <div className="flex gap-2 sm:gap-3 items-center">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded skeleton flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="mb-1.5 sm:mb-2 w-40 sm:w-48 h-4 sm:h-5 rounded skeleton" />
                                    <div className="w-28 sm:w-32 h-3 sm:h-4 rounded skeleton" />
                                </div>
                                <div className="w-20 sm:w-24 h-5 sm:h-6 rounded-lg skeleton flex-shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Project Budget Status */}
            <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-3 sm:mb-4 w-40 sm:w-44 md:w-48 h-5 sm:h-6 rounded skeleton" />
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4].map((i) => (
                                    <th key={i} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                        <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4].map((col) => (
                                        <td key={col} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                            <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Budget Trends */}
            <div className="p-4 sm:p-5 md:p-6 bg-white rounded-xl border border-gray-200 dark:bg-dark-card dark:border-gray-800">
                <div className="mb-3 sm:mb-4 w-32 sm:w-36 h-5 sm:h-6 rounded skeleton" />
                <div className="h-48 sm:h-56 md:h-64 rounded skeleton" />
            </div>
        </div>
    );
};

// Integrations Tab Shimmer
export const AdminIntegrationsShimmer: React.FC = () => {
    return (
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
            <div className="flex gap-2 sm:gap-3 items-center pb-3 sm:pb-4 mb-4 sm:mb-5 md:mb-6 border-b border-primary-200/30">
                <div className="p-2 sm:p-2.5 rounded-xl skeleton w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" />
                <div>
                    <div className="mb-1 w-36 sm:w-40 md:w-48 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                    <div className="w-52 sm:w-58 md:w-64 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                </div>
            </div>

            {/* Integration Statistics */}
            <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-3 sm:mb-4 w-44 sm:w-48 md:w-52 h-5 sm:h-6 rounded skeleton" />
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4].map((i) => (
                                    <th key={i} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                        <div className="w-24 sm:w-28 h-3 sm:h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4].map((col) => (
                                        <td key={col} className="px-3 sm:px-4 py-2.5 sm:py-3">
                                            <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Integration Health */}
            <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-3 sm:mb-4 w-36 sm:w-40 md:w-44 h-5 sm:h-6 rounded skeleton" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-900/50 dark:border-gray-800">
                            <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                                <div className="w-20 sm:w-24 h-4 sm:h-5 rounded skeleton" />
                                <div className="w-16 sm:w-20 h-5 sm:h-6 rounded-lg skeleton" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[1, 2, 3, 4].map((j) => (
                                    <div key={j} className="w-full h-2.5 sm:h-3 rounded skeleton" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Integration Trends */}
            <div className="p-4 sm:p-5 md:p-6 bg-white rounded-xl border border-gray-200 dark:bg-dark-card dark:border-gray-800">
                <div className="mb-3 sm:mb-4 w-36 sm:w-40 md:w-44 h-5 sm:h-6 rounded skeleton" />
                <div className="h-48 sm:h-56 md:h-64 rounded skeleton" />
            </div>
        </div>
    );
};

// Admin User Spending Shimmer
export const AdminUserSpendingShimmer: React.FC = () => {
    return (
        <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="mx-auto space-y-4 sm:space-y-5 md:space-y-6 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                    <div className="flex gap-2 sm:gap-3 md:gap-4 items-center">
                        <div className="p-2 sm:p-2.5 md:p-3 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl skeleton" />
                        <div>
                            <div className="mb-1 w-48 sm:w-56 md:w-64 h-7 sm:h-8 md:h-9 rounded skeleton" />
                            <div className="w-72 sm:w-80 md:w-96 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                        <div className="w-28 sm:w-32 h-9 sm:h-10 rounded-lg skeleton" />
                        <div className="w-24 sm:w-28 h-9 sm:h-10 rounded-lg skeleton" />
                        <div className="w-24 sm:w-28 h-9 sm:h-10 rounded-lg skeleton" />
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30"
                        >
                            <div className="mb-1.5 sm:mb-2 w-28 sm:w-32 h-4 sm:h-5 rounded skeleton" />
                            <div className="w-20 sm:w-24 h-7 sm:h-8 rounded skeleton" />
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30">
                    <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                        <div className="w-full sm:w-44 md:w-48 h-10 sm:h-11 rounded-lg skeleton" />
                        <div className="w-full sm:w-36 md:w-40 h-10 sm:h-11 rounded-lg skeleton" />
                        <div className="w-full sm:w-36 md:w-40 h-10 sm:h-11 rounded-lg skeleton" />
                        <div className="w-full sm:w-28 md:w-32 h-10 sm:h-11 rounded-lg skeleton" />
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
                    {/* Spending Chart */}
                    <div className="p-4 sm:p-5 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                        <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                            <div className="p-2 sm:p-2.5 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton" />
                            <div>
                                <div className="mb-1 w-32 sm:w-36 md:w-40 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
                                <div className="w-40 sm:w-44 md:w-48 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                            </div>
                        </div>
                        <div className="h-48 sm:h-56 md:h-64 rounded skeleton" />
                    </div>

                    {/* Top Users Chart */}
                    <div className="p-4 sm:p-5 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                        <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                            <div className="p-2 sm:p-2.5 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton" />
                            <div>
                                <div className="mb-1 w-32 sm:w-36 md:w-40 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
                                <div className="w-28 sm:w-30 md:w-32 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                            </div>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-center p-2.5 sm:p-3 rounded-lg border backdrop-blur-sm glass bg-white/50 dark:bg-gray-800/50 border-primary-200/30"
                                >
                                    <div className="flex gap-2 sm:gap-3 items-center">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full skeleton flex-shrink-0" />
                                        <div className="w-28 sm:w-32 h-3 sm:h-4 rounded skeleton" />
                                    </div>
                                    <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* User Spending Table */}
                <div className="p-4 sm:p-6 md:p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                        <div className="flex gap-2 sm:gap-3 items-center">
                            <div className="p-1.5 sm:p-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton" />
                            <div>
                                <div className="mb-1 w-32 sm:w-36 md:w-40 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                                <div className="w-40 sm:w-44 md:w-48 h-3 sm:h-3.5 md:h-4 rounded skeleton" />
                            </div>
                        </div>
                        <div className="w-24 sm:w-28 h-9 sm:h-10 rounded-xl skeleton" />
                    </div>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-primary-200/30">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <th key={i} className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
                                            <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                    <tr key={row}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                                            <td key={col} className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
                                                <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Admin Dashboard Shimmer Component
export const AdminDashboardShimmer: React.FC<{
    activeTab?: 'overview' | 'growth' | 'alerts' | 'models' | 'features' | 'projects' | 'activity' | 'users' |
    'revenue' | 'api-keys' | 'endpoints' | 'geographic' | 'budget' | 'integrations';
}> = ({ activeTab = 'overview' }) => {
    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="max-w-[1600px] mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
                <AdminDashboardHeaderShimmer />

                {/* Tab Content */}
                {activeTab === 'overview' && <AdminOverviewShimmer />}
                {activeTab === 'growth' && <AdminGrowthShimmer />}
                {activeTab === 'alerts' && <AdminAlertsShimmer />}
                {activeTab === 'models' && <AdminModelsShimmer />}
                {activeTab === 'features' && <AdminFeaturesShimmer />}
                {activeTab === 'projects' && <AdminProjectsShimmer />}
                {activeTab === 'users' && <AdminUsersShimmer />}
                {activeTab === 'activity' && <AdminActivityShimmer />}
                {activeTab === 'revenue' && <AdminRevenueShimmer />}
                {activeTab === 'api-keys' && <AdminApiKeysShimmer />}
                {activeTab === 'endpoints' && <AdminEndpointsShimmer />}
                {activeTab === 'geographic' && <AdminGeographicShimmer />}
                {activeTab === 'budget' && <AdminBudgetShimmer />}
                {activeTab === 'integrations' && <AdminIntegrationsShimmer />}
            </div>
        </div>
    );
};


