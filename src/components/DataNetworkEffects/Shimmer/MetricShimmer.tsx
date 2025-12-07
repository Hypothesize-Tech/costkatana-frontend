import React from 'react';

interface MetricShimmerProps {
    count?: number;
    className?: string;
}

const MetricShimmer: React.FC<MetricShimmerProps> = ({
    count = 4,
    className = ''
}) => {
    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-5"
                >
                    <div className="animate-pulse space-y-3">
                        <div className="h-8 bg-gradient-to-r from-primary-200/30 via-primary-300/20 to-primary-200/30 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-primary-900/30 rounded-lg w-3/5" />
                        <div className="h-4 bg-gradient-to-r from-primary-200/30 via-primary-300/20 to-primary-200/30 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-primary-900/30 rounded-lg w-2/5" />
                        <div className="flex items-center gap-2 pt-2">
                            <div className="w-5 h-5 bg-gradient-to-r from-primary-200/30 via-primary-300/20 to-primary-200/30 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-primary-900/30 rounded" />
                            <div className="h-3 bg-gradient-to-r from-primary-200/30 via-primary-300/20 to-primary-200/30 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-primary-900/30 rounded-lg w-16" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MetricShimmer;
