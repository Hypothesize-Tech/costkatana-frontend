import React from "react";

export const MessageShimmer: React.FC = () => {
    return (
        <div className="flex justify-start animate-fade-in">
            <div className="max-w-4xl glass shadow-2xl backdrop-blur-xl border border-primary-200/30 bg-gradient-to-br from-white/80 to-white/50 dark:from-dark-card/80 dark:to-dark-card/50 p-5 rounded-2xl rounded-bl-sm transition-all">
                {/* Message Content Lines */}
                <div className="space-y-3">
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-3/4 rounded" />
                </div>

                {/* Metadata Footer */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-primary-200/30">
                    <div className="skeleton h-3 w-20 rounded" />
                    <div className="skeleton h-5 w-16 rounded-lg" />
                </div>
            </div>
        </div>
    );
};

