import React from "react";

interface ConversationsShimmerProps {
    count?: number;
    collapsed?: boolean;
}

const ShimmerConversationItem: React.FC = () => {
    return (
        <div className="group p-3 mx-2 mb-2 rounded-xl">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <div className="skeleton h-4 w-full mb-2 rounded" />

                    {/* Message count and timestamp */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="skeleton h-3 w-12 rounded" />
                        <div className="skeleton h-3 w-1 rounded" />
                        <div className="skeleton h-3 w-16 rounded" />
                    </div>

                    {/* Cost badge */}
                    <div className="skeleton h-5 w-20 rounded-lg" />
                </div>

                {/* Delete button placeholder */}
                <div className="w-6 h-6 skeleton rounded-lg shrink-0 ml-2" />
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

