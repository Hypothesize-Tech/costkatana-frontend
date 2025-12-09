import React from 'react';

interface GoogleServiceShimmerProps {
    count?: number;
    type?: 'list' | 'grid' | 'table';
}

export const GoogleServiceShimmer: React.FC<GoogleServiceShimmerProps> = ({
    count = 5,
    type = 'list'
}) => {
    const shimmerClass = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-shimmer";

    if (type === 'grid') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: count }).map((_, index) => (
                    <div key={index} className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20">
                        <div className={`h-4 ${shimmerClass} rounded mb-3`} />
                        <div className={`h-3 ${shimmerClass} rounded mb-2 w-3/4`} />
                        <div className={`h-3 ${shimmerClass} rounded w-1/2`} />
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'table') {
        return (
            <div className="overflow-auto">
                <table className="min-w-full border-collapse border border-primary-200 dark:border-primary-700">
                    <thead>
                        <tr className="bg-primary-100 dark:bg-primary-900/30">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <th key={index} className="border border-primary-200 dark:border-primary-700 px-3 py-2">
                                    <div className={`h-4 ${shimmerClass} rounded`} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: count }).map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                {Array.from({ length: 4 }).map((_, cellIndex) => (
                                    <td key={cellIndex} className="border border-primary-200 dark:border-primary-700 px-3 py-2">
                                        <div className={`h-3 ${shimmerClass} rounded`} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // Default list type
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20">
                    <div className="flex items-start justify-between mb-2">
                        <div className={`h-4 ${shimmerClass} rounded w-2/3`} />
                        <div className={`h-3 ${shimmerClass} rounded w-16`} />
                    </div>
                    <div className={`h-3 ${shimmerClass} rounded mb-2 w-1/2`} />
                    <div className="flex items-center gap-2">
                        <div className={`h-2 ${shimmerClass} rounded w-20`} />
                        <div className={`h-2 ${shimmerClass} rounded w-24`} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export const GoogleViewerShimmer: React.FC = () => {
    const shimmerClass = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-shimmer";

    return (
        <div className="h-full flex flex-col">
            {/* Header Shimmer */}
            <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 ${shimmerClass} rounded`} />
                        <div className={`h-5 ${shimmerClass} rounded w-24`} />
                    </div>
                    <div className="flex gap-2">
                        <div className={`w-9 h-9 ${shimmerClass} rounded-lg`} />
                        <div className={`w-9 h-9 ${shimmerClass} rounded-lg`} />
                    </div>
                </div>
            </div>

            {/* Content Shimmer */}
            <div className="flex-1 overflow-auto p-4">
                <GoogleServiceShimmer count={6} type="list" />
            </div>

            {/* Actions Shimmer */}
            <div className="p-4 border-t border-primary-200/30 dark:border-primary-500/20 flex gap-2">
                <div className={`h-9 ${shimmerClass} rounded-lg w-32`} />
                <div className={`h-9 ${shimmerClass} rounded-lg w-40`} />
            </div>
        </div>
    );
};

export const GmailShimmer: React.FC<{ count?: number }> = ({ count = 5 }) => {
    const shimmerClass = "animate-pulse bg-gradient-to-r from-primary-200/50 via-primary-300/50 to-primary-200/50 dark:from-primary-700/50 dark:via-primary-600/50 dark:to-primary-700/50 bg-[length:200%_100%]";

    return (
        <div className="divide-y divide-primary-200/30 dark:divide-primary-500/20">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className={`h-4 ${shimmerClass} rounded w-48`} />
                        <div className={`h-3 ${shimmerClass} rounded w-20`} />
                    </div>
                    <div className={`h-4 ${shimmerClass} rounded mb-2 w-3/4`} />
                    <div className={`h-3 ${shimmerClass} rounded w-full`} />
                </div>
            ))}
        </div>
    );
};

export const GmailDetailShimmer: React.FC = () => {
    const shimmerClass = "animate-pulse bg-gradient-to-r from-primary-200/50 via-primary-300/50 to-primary-200/50 dark:from-primary-700/50 dark:via-primary-600/50 dark:to-primary-700/50 bg-[length:200%_100%]";

    return (
        <div className="border-t border-primary-200/30 dark:border-primary-500/20 p-4 bg-primary-50 dark:bg-primary-900/10">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className={`h-5 ${shimmerClass} rounded mb-2 w-3/4`} />
                    <div className={`h-3 ${shimmerClass} rounded w-64`} />
                </div>
                <div className="flex gap-2 ml-4">
                    <div className={`w-9 h-9 ${shimmerClass} rounded-lg`} />
                    <div className={`w-9 h-9 ${shimmerClass} rounded-lg`} />
                    <div className={`w-9 h-9 ${shimmerClass} rounded-lg`} />
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-primary-200/30 dark:border-primary-500/20">
                <div className="space-y-2">
                    <div className={`h-3 ${shimmerClass} rounded w-full`} />
                    <div className={`h-3 ${shimmerClass} rounded w-full`} />
                    <div className={`h-3 ${shimmerClass} rounded w-5/6`} />
                    <div className={`h-3 ${shimmerClass} rounded w-full`} />
                    <div className={`h-3 ${shimmerClass} rounded w-4/5`} />
                </div>
            </div>
        </div>
    );
};

export const DriveFileShimmer: React.FC<{ count?: number }> = ({ count = 6 }) => {
    const shimmerClass = "animate-pulse bg-gradient-to-r from-primary-200/30 via-primary-300/20 to-primary-200/30 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-primary-900/30 bg-[length:200%_100%] animate-shimmer";

    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-primary-200/30 dark:border-primary-500/20"
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Icon placeholder */}
                        <div className={`w-8 h-8 ${shimmerClass} rounded flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                            {/* File name */}
                            <div className={`h-4 ${shimmerClass} rounded mb-2 w-3/4`} />
                            {/* Date */}
                            <div className={`h-3 ${shimmerClass} rounded w-24`} />
                        </div>
                    </div>
                    {/* Eye icon placeholder */}
                    <div className={`w-8 h-8 ${shimmerClass} rounded flex-shrink-0`} />
                </div>
            ))}
        </div>
    );
};

export const GooglePanelShimmer: React.FC = () => {
    const shimmerClass = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-shimmer";

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-primary-200/30 dark:border-primary-500/20">
            {/* Header Shimmer */}
            <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 ${shimmerClass} rounded`} />
                        <div className={`h-6 ${shimmerClass} rounded w-40`} />
                    </div>
                    <div className={`w-6 h-6 ${shimmerClass} rounded`} />
                </div>
            </div>

            {/* Tabs Shimmer */}
            <div className="flex overflow-x-auto border-b border-primary-200/30 dark:border-primary-500/20">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="flex-shrink-0 px-4 py-3 border-b-2 border-transparent">
                        <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 ${shimmerClass} rounded`} />
                            <div className={`h-4 ${shimmerClass} rounded w-16`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Shimmer */}
            <div className="flex-1 overflow-hidden">
                <GoogleViewerShimmer />
            </div>
        </div>
    );
};
