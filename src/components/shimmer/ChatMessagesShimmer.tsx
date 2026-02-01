import React from "react";

interface ChatMessagesShimmerProps {
  /** Number of message pairs (user + assistant) to display */
  count?: number;
}

/**
 * UserMessageShimmer - Shimmer for user messages (right-aligned)
 */
const UserMessageShimmer: React.FC = () => {
  return (
    <div className="flex justify-end animate-fade-in">
      <div className="max-w-4xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-xl glow-primary p-3 rounded-2xl rounded-br-sm transition-all sm:p-4 md:p-5 min-w-[300px]">
        {/* Message Content Lines with bright shimmer */}
        <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
          <div className="h-4 w-full rounded relative overflow-hidden bg-white/10 sm:h-4 md:h-5">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-4 w-4/5 rounded relative overflow-hidden bg-white/10 sm:h-4 md:h-5">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <div className="h-4 w-3/5 rounded relative overflow-hidden bg-white/10 sm:h-4 md:h-5">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * AssistantMessageShimmer - Shimmer for assistant messages (left-aligned)
 */
const AssistantMessageShimmer: React.FC = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-4xl glass shadow-2xl backdrop-blur-xl border border-primary-200/30 bg-gradient-to-br from-white/80 to-white/50 dark:from-dark-card/80 dark:to-dark-card/50 p-3 rounded-2xl rounded-bl-sm transition-all sm:p-4 md:p-5">
        {/* Message Content Lines */}
        <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
          <div className="skeleton h-3 w-full rounded sm:h-3.5 md:h-4" />
          <div className="skeleton h-3 w-full rounded sm:h-3.5 md:h-4" />
          <div className="skeleton h-3 w-3/4 rounded sm:h-3.5 md:h-4" />
          <div className="skeleton h-3 w-5/6 rounded sm:h-3.5 md:h-4" />
        </div>

        {/* Metadata Footer */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-primary-200/30 sm:gap-2 sm:mt-3.5 sm:pt-3.5 md:mt-4 md:pt-4">
          <div className="skeleton h-2.5 w-16 rounded sm:w-20 sm:h-3" />
          <div className="skeleton h-2.5 w-1 rounded" />
          <div className="skeleton h-2.5 w-12 rounded sm:w-16 sm:h-3" />
        </div>
      </div>
    </div>
  );
};

/**
 * ChatMessagesShimmer - Shows loading state for chat messages
 * Displays alternating user and assistant message shimmers
 */
export const ChatMessagesShimmer: React.FC<ChatMessagesShimmerProps> = ({
  count = 2,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {/* User Message Shimmer */}
          <UserMessageShimmer />
          {/* Assistant Message Shimmer */}
          <AssistantMessageShimmer />
        </React.Fragment>
      ))}
    </div>
  );
};
