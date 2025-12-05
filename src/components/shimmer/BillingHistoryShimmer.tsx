import React from 'react';

export const BillingHistoryShimmer: React.FC = () => {
    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Header */}
            <div className="skeleton h-6 sm:h-7 md:h-8 w-40 sm:w-44 md:w-48 rounded" />

            {/* Table */}
            <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 overflow-hidden">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[600px]">
                        <thead className="bg-light-bg-secondary dark:bg-dark-bg-secondary">
                            <tr>
                                <th className="px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 text-left">
                                    <div className="skeleton h-3 sm:h-3.5 md:h-4 w-16 sm:w-18 md:w-20 rounded" />
                                </th>
                                <th className="px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 text-left">
                                    <div className="skeleton h-3 sm:h-3.5 md:h-4 w-14 sm:w-15 md:w-16 rounded" />
                                </th>
                                <th className="px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 text-left">
                                    <div className="skeleton h-3 sm:h-3.5 md:h-4 w-16 sm:w-18 md:w-20 rounded" />
                                </th>
                                <th className="px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 text-left">
                                    <div className="skeleton h-3 sm:h-3.5 md:h-4 w-14 sm:w-15 md:w-16 rounded" />
                                </th>
                                <th className="px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 text-right">
                                    <div className="skeleton h-3 sm:h-3.5 md:h-4 w-16 sm:w-18 md:w-20 rounded ml-auto" />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary-200/10 dark:divide-primary-800/10">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="hover:bg-light-bg-secondary/50 dark:hover:bg-dark-bg-secondary/50">
                                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 whitespace-nowrap">
                                        <div className="skeleton h-3 sm:h-3.5 md:h-4 w-28 sm:w-30 md:w-32 rounded" />
                                    </td>
                                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 whitespace-nowrap">
                                        <div className="skeleton h-3 sm:h-3.5 md:h-4 w-20 sm:w-22 md:w-24 rounded" />
                                    </td>
                                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 whitespace-nowrap">
                                        <div className="skeleton h-3 sm:h-3.5 md:h-4 w-16 sm:w-18 md:w-20 rounded" />
                                    </td>
                                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 whitespace-nowrap">
                                        <div className="skeleton h-5 sm:h-5.5 md:h-6 w-14 sm:w-15 md:w-16 rounded-full" />
                                    </td>
                                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                                            <div className="skeleton h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
                                            <div className="skeleton h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="skeleton h-3 sm:h-3.5 md:h-4 w-40 sm:w-44 md:w-48 rounded" />
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="skeleton h-8 w-18 sm:h-9 sm:w-20 rounded-lg" />
                    <div className="skeleton h-8 w-18 sm:h-9 sm:w-20 rounded-lg" />
                </div>
            </div>
        </div>
    );
};
