import React from "react";

interface SuggestionsShimmerProps {
    count?: number;
}

const ShimmerSuggestionCard: React.FC = () => {
    return (
        <div className="p-3 text-left rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-to-br from-white/80 to-white/50 dark:from-dark-card/80 dark:to-dark-card/50 sm:p-3.5 md:p-4 lg:p-5">
            <div className="flex gap-2 items-start sm:gap-2.5 md:gap-3">
                {/* Icon Container */}
                <div className="p-1.5 rounded-lg shadow-md bg-gradient-to-br from-primary-500/20 to-primary-600/20 shrink-0 sm:p-2 sm:rounded-xl md:p-2.5">
                    <div className="w-3.5 h-3.5 rounded skeleton sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                    <div className="mb-1.5 w-full h-2.5 rounded skeleton sm:mb-2 sm:h-3 md:mb-2.5 md:h-3.5 lg:mb-3 lg:h-4" />
                    <div className="w-full h-2 rounded skeleton sm:w-18 sm:h-2.5 md:w-20 md:h-3" />
                </div>

                {/* Arrow Icon */}
                <div className="w-3 h-3 rounded skeleton shrink-0 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
            </div>
        </div>
    );
};

export const SuggestionsShimmer: React.FC<SuggestionsShimmerProps> = ({
    count = 6,
}) => {
    return (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:gap-3.5 lg:grid-cols-3 lg:gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <ShimmerSuggestionCard key={index} />
            ))}
        </div>
    );
};
