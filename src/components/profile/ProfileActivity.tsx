import React from "react";
import { TrendingUp, Clock } from "lucide-react";
import { formatRelativeTime } from "../../utils/formatters";

interface Activity {
  id: string;
  type: "usage" | "optimization" | "settings" | "api_key" | "login";
  action: string;
  description: string;
  timestamp: string;
  icon?: string;
  metadata?: {
    cost?: number;
    tokens?: number;
    service?: string;
    [key: string]: unknown;
  };
}

interface ProfileActivityProps {
  activities: Activity[];
  loading?: boolean;
}

export const ProfileActivity: React.FC<ProfileActivityProps> = ({
  activities,
  loading = false,
}) => {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "usage":
        return (
          <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg bg-gradient-primary">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        );
      case "optimization":
        return (
          <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg bg-gradient-success">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        );
      case "settings":
        return (
          <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg bg-gradient-secondary">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        );
      case "api_key":
        return (
          <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg bg-gradient-warning">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
        );
      case "login":
        return (
          <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg bg-gradient-accent">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex gap-3 sm:gap-4 items-center mb-4 sm:mb-6 md:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl skeleton flex-shrink-0" />
            <div className="w-32 sm:w-48 h-6 sm:h-7 rounded skeleton" />
          </div>

          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="glass rounded-xl p-4 sm:p-5 md:p-6 border border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel"
              >
                <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl skeleton flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-2 sm:mb-3">
                      <div className="w-32 sm:w-48 h-4 sm:h-5 rounded skeleton" />
                      <div className="w-16 sm:w-20 h-4 sm:h-5 rounded-lg skeleton flex-shrink-0 sm:ml-4" />
                    </div>
                    <div className="mb-3 sm:mb-4 w-full h-3 sm:h-4 rounded skeleton" />
                    <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                      <div className="w-20 sm:w-24 h-5 sm:h-6 rounded-lg skeleton" />
                      <div className="w-24 sm:w-28 h-5 sm:h-6 rounded-lg skeleton" />
                      <div className="w-16 sm:w-20 h-5 sm:h-6 rounded-lg skeleton" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex gap-3 sm:gap-4 items-center mb-4 sm:mb-6 md:mb-8">
          <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg bg-gradient-primary flex-shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display gradient-text-primary">
            Recent Activity
          </h2>
        </div>

        {activities.length === 0 ? (
          <div className="py-12 sm:py-16 text-center">
            <div className="flex justify-center items-center mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-primary/20">
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-primary-500 dark:text-primary-400" />
            </div>
            <h3 className="mb-2 text-base sm:text-lg font-semibold font-display gradient-text-primary">
              No recent activity
            </h3>
            <p className="text-sm sm:text-base font-body text-light-text-secondary dark:text-dark-text-secondary">
              Your activity will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="glass rounded-xl p-4 sm:p-5 md:p-6 border border-primary-200/30 dark:border-primary-700/30 hover:border-primary-300/50 dark:hover:border-primary-600/50 transition-all duration-200 hover:scale-[1.01] bg-gradient-light-panel dark:bg-gradient-dark-panel"
              >
                <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
                  <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-2 sm:mb-3">
                      <h3 className="font-semibold truncate text-sm sm:text-base font-display gradient-text-primary">
                        {activity.action}
                      </h3>
                      <span className="flex-shrink-0 px-2 sm:px-3 py-1 text-xs rounded-lg border glass border-primary-200/30 dark:border-primary-700/30 font-body text-light-text-secondary dark:text-dark-text-secondary self-start sm:self-auto">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                    <p className="mb-3 sm:mb-4 text-sm sm:text-base font-body text-light-text-primary dark:text-dark-text-primary line-clamp-2">
                      {activity.description}
                    </p>
                    {activity.metadata && (
                      <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                        {activity.metadata.cost && (
                          <span className="px-2 sm:px-3 py-1 text-xs rounded-lg border glass border-success-200/30 dark:border-success-700/30 font-body text-light-text-primary dark:text-dark-text-primary">
                            Cost: ${activity.metadata.cost.toFixed(4)}
                          </span>
                        )}
                        {activity.metadata.tokens && (
                          <span className="px-2 sm:px-3 py-1 text-xs rounded-lg border glass border-primary-200/30 dark:border-primary-700/30 font-body text-light-text-primary dark:text-dark-text-primary">
                            Tokens: {activity.metadata.tokens.toLocaleString()}
                          </span>
                        )}
                        {activity.metadata.service && (
                          <span className="px-2 sm:px-3 py-1 text-xs font-medium rounded-lg border bg-gradient-accent/20 text-accent-700 dark:text-accent-300 border-accent-200/30 dark:border-accent-700/30 font-display">
                            {activity.metadata.service}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
