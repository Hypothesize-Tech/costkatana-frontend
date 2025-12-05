import React from "react";

interface ConversationsShimmerProps {
    count?: number;
    collapsed?: boolean;
}

const ShimmerConversationItem: React.FC = () => {
    return (
        <div className="group p-2 mx-1 mb-1.5 rounded-xl sm:p-2.5 sm:mx-1.5 sm:mb-2 md:p-3 md:mx-2 md:mb-2">
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <div className="skeleton h-3.5 w-full mb-1.5 rounded sm:h-4 sm:mb-2" />

                    {/* Message count and timestamp */}
                    <div className="flex items-center gap-1.5 mb-1.5 sm:gap-2 sm:mb-2">
                        <div className="skeleton h-2.5 w-10 rounded sm:h-3 sm:w-12" />
                        <div className="skeleton h-2.5 w-0.5 rounded sm:h-3 sm:w-1" />
                        <div className="skeleton h-2.5 w-14 rounded sm:h-3 sm:w-16" />
                    </div>

                    {/* Cost badge */}
                    <div className="skeleton h-4 w-18 rounded-lg sm:h-4.5 sm:w-20 md:h-5" />
                </div>

                {/* Delete button placeholder */}
                <div className="w-5 h-5 skeleton rounded-lg shrink-0 ml-1.5 sm:w-5.5 sm:h-5.5 sm:ml-2 md:w-6 md:h-6" />
            </div>
        </div>
    );
};

export const ConversationsShimmer: React.FC<ConversationsShimmerProps> = ({
    count = 5,
    collapsed = false,
}) => {
    if (collapsed) {
        return (
            <div className="flex-1 flex flex-col items-center justify-start pt-4">
                {/* Conversation count indicator */}
                <div className="skeleton w-8 h-8 rounded-full mb-2" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            {/* Conversations List */}
            <div className="space-y-0">
                {Array.from({ length: count }).map((_, index) => (
                    <ShimmerConversationItem key={index} />
                ))}
            </div>
        </div>
    );
};

