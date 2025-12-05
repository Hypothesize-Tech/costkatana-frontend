import React from "react";

export const MessageShimmer: React.FC = () => {
    return (
        <div className="flex justify-start animate-fade-in">
            <div className="max-w-4xl glass shadow-2xl backdrop-blur-xl border border-primary-200/30 bg-gradient-to-br from-white/80 to-white/50 dark:from-dark-card/80 dark:to-dark-card/50 p-3 rounded-2xl rounded-bl-sm transition-all sm:p-4 md:p-5">
                {/* Message Content Lines */}
                <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                    <div className="skeleton h-3 w-full rounded sm:h-3.5 md:h-4" />
                    <div className="skeleton h-3 w-full rounded sm:h-3.5 md:h-4" />
                    <div className="skeleton h-3 w-3/4 rounded sm:h-3.5 md:h-4" />
                </div>

                {/* Metadata Footer */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-primary-200/30 sm:gap-2 sm:mt-3.5 sm:pt-3.5 md:mt-4 md:pt-4">
                    <div className="skeleton h-2.5 w-full rounded sm:w-20 sm:h-3" />
                    <div className="skeleton h-4 w-full rounded-lg sm:w-16 sm:h-5" />
                </div>
            </div>
        </div>
    );
};

