import React from 'react';

interface TableShimmerProps {
    rows?: number;
    columns?: number;
    className?: string;
}

const TableShimmer: React.FC<TableShimmerProps> = ({
    rows = 5,
    columns = 4,
    className = ''
}) => {
    return (
        <div className={`w-full ${className}`}>
            <div className="animate-pulse space-y-3">
                {/* Header row */}
                <div className="flex gap-4 pb-4 border-b border-primary-200/30 dark:border-primary-900/30">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div
                            key={`header-${colIndex}`}
                            className="flex-1 h-10 bg-gradient-to-r from-primary-200/30 via-primary-300/20 to-primary-200/30 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-primary-900/30 rounded-lg"
                        />
                    ))}
                </div>

                {/* Data rows */}
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="flex gap-4">
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <div
                                key={`cell-${rowIndex}-${colIndex}`}
                                className="flex-1 h-12 bg-gradient-to-r from-primary-100/20 via-primary-200/10 to-primary-100/20 dark:from-primary-900/20 dark:via-primary-800/10 dark:to-primary-900/20 rounded-lg"
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableShimmer;
