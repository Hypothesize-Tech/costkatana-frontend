import React from 'react';

interface CardShimmerProps {
    count?: number;
    className?: string;
}

const CardShimmer: React.FC<CardShimmerProps> = ({ count = 1, className = '' }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-6 ${className}`}
                >
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gradient-to-r from-primary-200/30 via-primary-300/20 to-primary-200/30 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-primary-900/30 rounded-lg w-3/5" />
                        <div className="space-y-3">
                            <div className="h-4 bg-gradient-to-r from-primary-200/30 via-primary-300/20 to-primary-200/30 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-primary-900/30 rounded-lg" />
                            <div className="h-4 bg-gradient-to-r from-primary-200/30 via-primary-300/20 to-primary-200/30 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-primary-900/30 rounded-lg w-5/6" />
                            <div className="h-4 bg-gradient-to-r from-primary-200/30 via-primary-300/20 to-primary-200/30 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-primary-900/30 rounded-lg w-4/6" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="h-8 bg-gradient-to-r from-primary-200/30 via-primary-300/20 to-primary-200/30 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-primary-900/30 rounded-lg w-3/5" />
                                    <div className="h-4 bg-gradient-to-r from-primary-200/30 via-primary-300/20 to-primary-200/30 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-primary-900/30 rounded-lg w-2/5" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default CardShimmer;
