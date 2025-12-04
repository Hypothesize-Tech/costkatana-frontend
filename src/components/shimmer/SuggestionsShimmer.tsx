import React from "react";

interface SuggestionsShimmerProps {
    count?: number;
}

const ShimmerSuggestionCard: React.FC = () => {
    return (
        <div className="glass p-5 text-left shadow-xl backdrop-blur-xl border border-primary-200/30 rounded-xl bg-gradient-to-br from-white/80 to-white/50 dark:from-dark-card/80 dark:to-dark-card/50">
            <div className="flex items-start gap-3">
                {/* Icon Container */}
                <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 p-2.5 rounded-xl shadow-md shrink-0">
                    <div className="w-5 h-5 skeleton rounded" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                    <div className="skeleton h-4 w-full mb-3 rounded" />
                    <div className="skeleton h-3 w-20 rounded" />
                </div>

                {/* Arrow Icon */}
                <div className="w-4 h-4 skeleton rounded shrink-0" />
            </div>
        </div>
    );
};

export const SuggestionsShimmer: React.FC<SuggestionsShimmerProps> = ({
    count = 6,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <ShimmerSuggestionCard key={index} />
            ))}
        </div>
    );
};

