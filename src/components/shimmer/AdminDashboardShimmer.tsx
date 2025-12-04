import React from "react";

// Admin Dashboard Header Shimmer
export const AdminDashboardHeaderShimmer: React.FC = () => {
    return (
        <header className="p-6 bg-gradient-to-r rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-white/90 via-white/70 to-white/90 dark:from-dark-card/90 dark:via-dark-card/70 dark:to-dark-card/90">
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 items-center">
                    <div className="p-3 w-12 h-12 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-48 h-9 rounded skeleton" />
                        <div className="w-80 h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="w-28 h-10 rounded-lg skeleton" />
                    <div className="w-32 h-10 rounded-lg skeleton" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-primary-200/30 dark:border-primary-700/30">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((i) => (
                    <div key={i} className="w-32 h-10 rounded-lg skeleton" />
                ))}
            </div>
        </header>
    );
};

// Overview Tab Shimmer
export const AdminOverviewShimmer: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="p-3 w-12 h-12 rounded-xl skeleton" />
                            <div className="w-16 h-6 rounded-lg skeleton" />
                        </div>
                        <div className="mb-2 w-24 h-4 rounded skeleton" />
                        <div className="w-32 h-9 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Growth Chart */}
            <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-3 items-center mb-6">
                    <div className="p-2 w-10 h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-48 h-7 rounded skeleton" />
                        <div className="w-64 h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="h-80 rounded skeleton" />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Top Models */}
                <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                    <div className="flex gap-3 items-center mb-6">
                        <div className="p-2 w-10 h-10 rounded-xl skeleton" />
                        <div>
                            <div className="mb-1 w-40 h-6 rounded skeleton" />
                            <div className="w-48 h-4 rounded skeleton" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-primary-200/30">
                                    {[1, 2, 3, 4].map((i) => (
                                        <th key={i} className="px-4 py-3">
                                            <div className="w-20 h-4 rounded skeleton" />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5].map((row) => (
                                    <tr key={row}>
                                        {[1, 2, 3, 4].map((col) => (
                                            <td key={col} className="px-4 py-3">
                                                <div className="w-24 h-4 rounded skeleton" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Feature Usage */}
                <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                    <div className="flex gap-3 items-center mb-6">
                        <div className="p-2 w-10 h-10 rounded-xl skeleton" />
                        <div>
                            <div className="mb-1 w-32 h-6 rounded skeleton" />
                            <div className="w-40 h-4 rounded skeleton" />
                        </div>
                    </div>
                    <div className="h-64 rounded skeleton" />
                </div>
            </div>
        </div>
    );
};

// User Growth Tab Shimmer
export const AdminGrowthShimmer: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30">
                        <div className="mb-2 w-32 h-5 rounded skeleton" />
                        <div className="w-24 h-8 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Growth Chart */}
            <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-3 items-center mb-6">
                    <div className="p-2 w-10 h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-48 h-7 rounded skeleton" />
                        <div className="w-64 h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="h-96 rounded skeleton" />
            </div>
        </div>
    );
};

// Alerts Tab Shimmer
export const AdminAlertsShimmer: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-3 items-center">
                        <div className="p-2 w-10 h-10 rounded-xl skeleton" />
                        <div>
                            <div className="mb-1 w-40 h-7 rounded skeleton" />
                            <div className="w-48 h-4 rounded skeleton" />
                        </div>
                    </div>
                    <div className="w-24 h-8 rounded-full skeleton" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-6 rounded-xl border glass border-primary-200/30">
                            <div className="flex gap-4 items-start">
                                <div className="flex-shrink-0 p-3 w-12 h-12 rounded-xl skeleton" />
                                <div className="flex-1">
                                    <div className="flex gap-3 items-center mb-3">
                                        <div className="w-20 h-6 rounded-lg skeleton" />
                                        <div className="w-48 h-6 rounded skeleton" />
                                    </div>
                                    <div className="mb-4 w-full h-4 rounded skeleton" />
                                    <div className="flex gap-4 items-center">
                                        <div className="w-32 h-4 rounded skeleton" />
                                        <div className="w-24 h-6 rounded-lg skeleton" />
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
        <div className="space-y-6">
            {/* Model Comparison */}
            <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-3 items-center mb-6">
                    <div className="p-2 w-10 h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-40 h-7 rounded skeleton" />
                        <div className="w-48 h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <th key={i} className="px-5 py-4">
                                        <div className="w-24 h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5, 6].map((col) => (
                                        <td key={col} className="px-5 py-4">
                                            <div className="w-20 h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Service Comparison */}
            <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-3 items-center mb-6">
                    <div className="p-2 w-10 h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-40 h-7 rounded skeleton" />
                        <div className="w-48 h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <th key={i} className="px-5 py-4">
                                        <div className="w-24 h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5, 6].map((col) => (
                                        <td key={col} className="px-5 py-4">
                                            <div className="w-20 h-4 rounded skeleton" />
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
        <div className="space-y-6">
            {/* Feature Usage */}
            <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-3 items-center mb-6">
                    <div className="p-2 w-10 h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-48 h-7 rounded skeleton" />
                        <div className="w-56 h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <th key={i} className="px-5 py-4">
                                        <div className="w-24 h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5, 6].map((col) => (
                                        <td key={col} className="px-5 py-4">
                                            <div className="w-20 h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Feature Adoption */}
            <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-3 items-center mb-6">
                    <div className="p-2 w-10 h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-44 h-7 rounded skeleton" />
                        <div className="w-48 h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <th key={i} className="px-5 py-4">
                                        <div className="w-28 h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5].map((col) => (
                                        <td key={col} className="px-5 py-4">
                                            <div className="w-24 h-4 rounded skeleton" />
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
        <div className="space-y-6">
            {/* Projects */}
            <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-3 items-center mb-6">
                    <div className="p-2 w-10 h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-40 h-7 rounded skeleton" />
                        <div className="w-48 h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <th key={i} className="px-5 py-4">
                                        <div className="w-28 h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5, 6].map((col) => (
                                        <td key={col} className="px-5 py-4">
                                            <div className="w-24 h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Workspaces */}
            <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-3 items-center mb-6">
                    <div className="p-2 w-10 h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-44 h-7 rounded skeleton" />
                        <div className="w-48 h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <th key={i} className="px-5 py-4">
                                        <div className="w-28 h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5].map((col) => (
                                        <td key={col} className="px-5 py-4">
                                            <div className="w-24 h-4 rounded skeleton" />
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
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30"
                    >
                        <div className="mb-2 w-32 h-5 rounded skeleton" />
                        <div className="w-24 h-8 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="w-64 h-11 rounded-lg skeleton" />
                    <div className="w-32 h-11 rounded-lg skeleton" />
                    <div className="w-32 h-11 rounded-lg skeleton" />
                    <div className="w-32 h-11 rounded-lg skeleton" />
                </div>
            </div>

            {/* Users Table */}
            <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-3 items-center">
                        <div className="p-2 w-10 h-10 rounded-xl skeleton" />
                        <div>
                            <div className="mb-1 w-24 h-7 rounded skeleton" />
                            <div className="w-32 h-4 rounded skeleton" />
                        </div>
                    </div>
                    <div className="w-28 h-10 rounded-xl skeleton" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <th key={i} className="px-5 py-4">
                                        <div className="w-24 h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                                        <td key={col} className="px-5 py-4">
                                            <div className="w-20 h-4 rounded skeleton" />
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
        <div className="p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="mx-auto space-y-6 max-w-7xl">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <div className="p-3 w-12 h-12 rounded-xl skeleton" />
                        <div>
                            <div className="mb-1 w-48 h-9 rounded skeleton" />
                            <div className="w-80 h-4 rounded skeleton" />
                        </div>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="w-24 h-10 rounded-lg skeleton" />
                        <div className="w-28 h-10 rounded-lg skeleton" />
                        <div className="w-36 h-10 rounded-lg skeleton" />
                    </div>
                </div>

                {/* Filters */}
                <div className="p-5 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="w-full h-11 rounded skeleton" />
                        <div className="w-full h-11 rounded skeleton" />
                        <div className="w-full h-11 rounded skeleton" />
                        <div className="w-full h-11 rounded skeleton" />
                    </div>
                </div>

                {/* Discounts Table */}
                <div className="overflow-hidden bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r border-b from-primary-50/50 to-success-50/50 dark:from-primary-950/30 dark:to-success-950/30 border-primary-200/30">
                                <tr>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <th key={i} className="px-4 py-3 text-left">
                                            <div className="w-20 h-4 rounded skeleton" />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-200/20 dark:divide-primary-800/20">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                    <tr key={row}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                                            <td key={col} className="px-4 py-3">
                                                <div className="w-20 h-4 rounded skeleton" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center px-4 py-3 border-t border-primary-200/30 dark:border-primary-800/30">
                        <div className="w-48 h-4 rounded skeleton" />
                        <div className="flex gap-2">
                            <div className="w-20 h-9 rounded-lg skeleton" />
                            <div className="w-20 h-9 rounded-lg skeleton" />
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
        <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3 items-center">
                    <div className="p-2 w-10 h-10 rounded-xl skeleton" />
                    <div>
                        <div className="mb-1 w-48 h-7 rounded skeleton" />
                        <div className="w-56 h-4 rounded skeleton" />
                    </div>
                </div>
                <div className="w-24 h-8 rounded-full skeleton" />
            </div>

            <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <div
                        key={i}
                        className="p-4 rounded-xl border glass border-primary-200/30"
                    >
                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 p-2 w-10 h-10 rounded-lg skeleton" />
                            <div className="flex-1">
                                <div className="mb-2 w-48 h-5 rounded skeleton" />
                                <div className="mb-2 w-full h-4 rounded skeleton" />
                                <div className="flex gap-4 items-center">
                                    <div className="w-32 h-4 rounded skeleton" />
                                    <div className="w-24 h-4 rounded skeleton" />
                                    <div className="w-20 h-4 rounded skeleton" />
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
        <div className="p-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
            <div className="flex gap-3 items-center pb-4 mb-6 border-b border-primary-200/30">
                <div className="p-2.5 rounded-xl skeleton w-10 h-10" />
                <div>
                    <div className="mb-1 w-56 h-7 rounded skeleton" />
                    <div className="w-64 h-4 rounded skeleton" />
                </div>
            </div>

            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                        <div className="mb-2 w-32 h-5 rounded skeleton" />
                        <div className="w-24 h-8 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Subscription Metrics */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                        <div className="mb-2 w-40 h-5 rounded skeleton" />
                        <div className="w-24 h-8 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Upcoming Renewals */}
            <div className="p-6 mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-4 w-64 h-6 rounded skeleton" />
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4].map((i) => (
                                    <th key={i} className="px-4 py-3">
                                        <div className="w-24 h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4].map((col) => (
                                        <td key={col} className="px-4 py-3">
                                            <div className="w-20 h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Conversion Metrics */}
            <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-4 w-48 h-6 rounded skeleton" />
                <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-xl border backdrop-blur-sm glass border-primary-200/30">
                            <div className="mb-2 w-32 h-5 rounded skeleton" />
                            <div className="w-24 h-6 rounded skeleton" />
                        </div>
                    ))}
                </div>
                <div className="p-4 rounded-xl border backdrop-blur-sm glass border-primary-200/30">
                    <div className="mb-3 w-40 h-5 rounded skeleton" />
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i}>
                                <div className="mb-1 w-24 h-4 rounded skeleton" />
                                <div className="w-16 h-5 rounded skeleton" />
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
        <div className="p-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
            <div className="flex gap-3 items-center pb-4 mb-6 border-b border-primary-200/30">
                <div className="p-2.5 rounded-xl skeleton w-10 h-10" />
                <div>
                    <div className="mb-1 w-48 h-7 rounded skeleton" />
                    <div className="w-64 h-4 rounded skeleton" />
                </div>
            </div>

            {/* API Key Stats */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                        <div className="mb-2 w-32 h-5 rounded skeleton" />
                        <div className="w-24 h-8 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Top API Keys */}
            <div className="p-6 mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-4 w-48 h-6 rounded skeleton" />
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4].map((i) => (
                                    <th key={i} className="px-4 py-3">
                                        <div className="w-24 h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4].map((col) => (
                                        <td key={col} className="px-4 py-3">
                                            <div className="w-20 h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* API Key Usage */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 dark:bg-dark-card dark:border-gray-800">
                <div className="mb-4 w-48 h-6 rounded skeleton" />
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <th key={i} className="px-4 py-3">
                                        <div className="w-28 h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5].map((col) => (
                                        <td key={col} className="px-4 py-3">
                                            <div className="w-20 h-4 rounded skeleton" />
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
        <div className="p-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
            <div className="flex gap-3 items-center pb-4 mb-6 border-b border-primary-200/30">
                <div className="p-2.5 rounded-xl skeleton w-10 h-10" />
                <div>
                    <div className="mb-1 w-48 h-7 rounded skeleton" />
                    <div className="w-56 h-4 rounded skeleton" />
                </div>
            </div>

            {/* Top Endpoints */}
            <div className="p-6 mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-4 w-32 h-6 rounded skeleton" />
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4].map((i) => (
                                    <th key={i} className="px-4 py-3">
                                        <div className="w-28 h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4].map((col) => (
                                        <td key={col} className="px-4 py-3">
                                            <div className="w-24 h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Endpoint Trends */}
            <div className="p-6 mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-4 w-40 h-6 rounded skeleton" />
                <div className="h-64 rounded skeleton" />
            </div>

            {/* Endpoint Performance */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 dark:bg-dark-card dark:border-gray-800">
                <div className="mb-4 w-56 h-6 rounded skeleton" />
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <th key={i} className="px-4 py-3">
                                        <div className="w-28 h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5].map((col) => (
                                        <td key={col} className="px-4 py-3">
                                            <div className="w-20 h-4 rounded skeleton" />
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
        <div className="p-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
            <div className="flex gap-3 items-center pb-4 mb-6 border-b border-primary-200/30">
                <div className="p-2.5 rounded-xl skeleton w-10 h-10" />
                <div>
                    <div className="mb-1 w-64 h-7 rounded skeleton" />
                    <div className="w-48 h-4 rounded skeleton" />
                </div>
            </div>

            {/* Geographic Usage */}
            <div className="p-6 mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-4 w-40 h-6 rounded skeleton" />
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <th key={i} className="px-4 py-3">
                                        <div className="w-24 h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5].map((col) => (
                                        <td key={col} className="px-4 py-3">
                                            <div className="w-20 h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Usage Patterns */}
            <div className="p-6 mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-4 w-48 h-6 rounded skeleton" />
                <div className="h-64 rounded skeleton" />
            </div>

            {/* Peak Usage Times */}
            <div className="p-6 mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-4 w-40 h-6 rounded skeleton" />
                <div className="h-64 rounded skeleton" />
            </div>

            {/* Cost Distribution */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 dark:bg-dark-card dark:border-gray-800">
                <div className="mb-4 w-56 h-6 rounded skeleton" />
                <div className="h-64 rounded skeleton" />
            </div>
        </div>
    );
};

// Budget Tab Shimmer
export const AdminBudgetShimmer: React.FC = () => {
    return (
        <div className="p-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
            <div className="flex gap-3 items-center pb-4 mb-6 border-b border-primary-200/30">
                <div className="p-2.5 rounded-xl skeleton w-10 h-10" />
                <div>
                    <div className="mb-1 w-48 h-7 rounded skeleton" />
                    <div className="w-56 h-4 rounded skeleton" />
                </div>
            </div>

            {/* Budget Overview */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                        <div className="mb-2 w-32 h-5 rounded skeleton" />
                        <div className="w-24 h-8 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Budget Alerts */}
            <div className="p-6 mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-4 w-32 h-6 rounded skeleton" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-900/50 dark:border-gray-800">
                            <div className="flex gap-3 items-center">
                                <div className="w-5 h-5 rounded skeleton" />
                                <div className="flex-1">
                                    <div className="mb-2 w-48 h-5 rounded skeleton" />
                                    <div className="w-32 h-4 rounded skeleton" />
                                </div>
                                <div className="w-24 h-6 rounded-lg skeleton" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Project Budget Status */}
            <div className="p-6 mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-4 w-48 h-6 rounded skeleton" />
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4].map((i) => (
                                    <th key={i} className="px-4 py-3">
                                        <div className="w-24 h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4].map((col) => (
                                        <td key={col} className="px-4 py-3">
                                            <div className="w-20 h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Budget Trends */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 dark:bg-dark-card dark:border-gray-800">
                <div className="mb-4 w-36 h-6 rounded skeleton" />
                <div className="h-64 rounded skeleton" />
            </div>
        </div>
    );
};

// Integrations Tab Shimmer
export const AdminIntegrationsShimmer: React.FC = () => {
    return (
        <div className="p-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
            <div className="flex gap-3 items-center pb-4 mb-6 border-b border-primary-200/30">
                <div className="p-2.5 rounded-xl skeleton w-10 h-10" />
                <div>
                    <div className="mb-1 w-48 h-7 rounded skeleton" />
                    <div className="w-64 h-4 rounded skeleton" />
                </div>
            </div>

            {/* Integration Statistics */}
            <div className="p-6 mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-4 w-52 h-6 rounded skeleton" />
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                {[1, 2, 3, 4].map((i) => (
                                    <th key={i} className="px-4 py-3">
                                        <div className="w-28 h-4 rounded skeleton" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4].map((col) => (
                                        <td key={col} className="px-4 py-3">
                                            <div className="w-24 h-4 rounded skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Integration Health */}
            <div className="p-6 mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="mb-4 w-44 h-6 rounded skeleton" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-900/50 dark:border-gray-800">
                            <div className="flex justify-between items-center mb-2">
                                <div className="w-24 h-5 rounded skeleton" />
                                <div className="w-20 h-6 rounded-lg skeleton" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[1, 2, 3, 4].map((j) => (
                                    <div key={j} className="w-full h-3 rounded skeleton" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Integration Trends */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 dark:bg-dark-card dark:border-gray-800">
                <div className="mb-4 w-44 h-6 rounded skeleton" />
                <div className="h-64 rounded skeleton" />
            </div>
        </div>
    );
};

// Admin User Spending Shimmer
export const AdminUserSpendingShimmer: React.FC = () => {
    return (
        <div className="p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="mx-auto space-y-6 max-w-7xl">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <div className="p-3 w-12 h-12 rounded-xl skeleton" />
                        <div>
                            <div className="mb-1 w-64 h-9 rounded skeleton" />
                            <div className="w-96 h-4 rounded skeleton" />
                        </div>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="w-32 h-10 rounded-lg skeleton" />
                        <div className="w-28 h-10 rounded-lg skeleton" />
                        <div className="w-28 h-10 rounded-lg skeleton" />
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30"
                        >
                            <div className="mb-2 w-32 h-5 rounded skeleton" />
                            <div className="w-24 h-8 rounded skeleton" />
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="w-48 h-11 rounded-lg skeleton" />
                        <div className="w-40 h-11 rounded-lg skeleton" />
                        <div className="w-40 h-11 rounded-lg skeleton" />
                        <div className="w-32 h-11 rounded-lg skeleton" />
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {/* Spending Chart */}
                    <div className="p-5 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                        <div className="flex gap-3 items-center mb-6">
                            <div className="p-2.5 w-10 h-10 rounded-xl skeleton" />
                            <div>
                                <div className="mb-1 w-40 h-6 rounded skeleton" />
                                <div className="w-48 h-4 rounded skeleton" />
                            </div>
                        </div>
                        <div className="h-64 rounded skeleton" />
                    </div>

                    {/* Top Users Chart */}
                    <div className="p-5 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                        <div className="flex gap-3 items-center mb-6">
                            <div className="p-2.5 w-10 h-10 rounded-xl skeleton" />
                            <div>
                                <div className="mb-1 w-40 h-6 rounded skeleton" />
                                <div className="w-32 h-4 rounded skeleton" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-center p-3 rounded-lg border backdrop-blur-sm glass bg-white/50 dark:bg-gray-800/50 border-primary-200/30"
                                >
                                    <div className="flex gap-3 items-center">
                                        <div className="w-8 h-8 rounded-full skeleton" />
                                        <div className="w-32 h-4 rounded skeleton" />
                                    </div>
                                    <div className="w-20 h-4 rounded skeleton" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* User Spending Table */}
                <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-3 items-center">
                            <div className="p-2 w-10 h-10 rounded-xl skeleton" />
                            <div>
                                <div className="mb-1 w-40 h-7 rounded skeleton" />
                                <div className="w-48 h-4 rounded skeleton" />
                            </div>
                        </div>
                        <div className="w-28 h-10 rounded-xl skeleton" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-primary-200/30">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <th key={i} className="px-5 py-4">
                                            <div className="w-24 h-4 rounded skeleton" />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                                    <tr key={row}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                                            <td key={col} className="px-5 py-4">
                                                <div className="w-20 h-4 rounded skeleton" />
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
            <div className="max-w-[1600px] mx-auto p-6 space-y-6">
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


