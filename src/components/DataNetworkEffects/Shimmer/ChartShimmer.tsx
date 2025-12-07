import React from 'react';

interface ChartShimmerProps {
    type?: 'bar' | 'line' | 'pie';
    height?: number;
    className?: string;
}

const ChartShimmer: React.FC<ChartShimmerProps> = ({
    type = 'bar',
    height = 300,
    className = ''
}) => {
    if (type === 'bar') {
        return (
            <div className={`glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 flex items-end gap-2 p-4 ${className}`} style={{ height: `${height}px` }}>
                <div className="animate-pulse flex items-end gap-2 w-full h-full">
                    {Array.from({ length: 7 }).map((_, index) => {
                        const heights = ['60%', '80%', '45%', '95%', '70%', '55%', '85%'];
                        return (
                            <div
                                key={index}
                                className="flex-1 bg-gradient-to-t from-primary-500/40 via-primary-400/30 to-primary-300/20 dark:from-primary-600/40 dark:via-primary-500/30 dark:to-primary-400/20 rounded-t"
                                style={{ height: heights[index] }}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }

    if (type === 'pie') {
        return (
            <div
                className={`glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 flex items-center justify-center p-6 ${className}`}
                style={{ height: `${height}px` }}
            >
                <div
                    className="animate-pulse bg-gradient-to-r from-primary-200/30 via-primary-300/20 to-primary-200/30 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-primary-900/30 rounded-full"
                    style={{
                        width: `${Math.min(height - 48, 200)}px`,
                        height: `${Math.min(height - 48, 200)}px`
                    }}
                />
            </div>
        );
    }

    // Line chart
    return (
        <div className={`glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-4 ${className}`} style={{ height: `${height}px` }}>
            <div className="animate-pulse h-full w-full bg-gradient-to-r from-primary-200/30 via-primary-300/20 to-primary-200/30 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-primary-900/30 rounded-lg" />
        </div>
    );
};

export default ChartShimmer;
