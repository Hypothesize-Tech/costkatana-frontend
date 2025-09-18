// src/components/profile/ProfileActivity.tsx
import React from "react";
import { formatRelativeTime } from "../../utils/formatters";

interface Activity {
  id: string;
  type: "usage" | "optimization" | "settings" | "api_key" | "login";
  action: string;
  description: string;
  timestamp: string;
  icon?: string;
  metadata?: any;
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
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl shadow-lg">
            <svg
              className="w-6 h-6 text-white"
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
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-success rounded-xl shadow-lg">
            <svg
              className="w-6 h-6 text-white"
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
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-secondary rounded-xl shadow-lg">
            <svg
              className="w-6 h-6 text-white"
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
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-warning rounded-xl shadow-lg">
            <svg
              className="w-6 h-6 text-white"
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
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-accent rounded-xl shadow-lg">
            <svg
              className="w-6 h-6 text-white"
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
      <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="space-y-6 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-gradient-primary/20 rounded-xl"></div>
              <div className="flex-1 space-y-3">
                <div className="w-3/4 h-4 bg-gradient-primary/20 rounded-lg"></div>
                <div className="w-1/2 h-3 bg-gradient-primary/10 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
            <span className="text-white text-lg">📈</span>
          </div>
          <h2 className="text-2xl font-display font-bold gradient-text-primary">
            Recent Activity
          </h2>
        </div>

        {activities.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-primary/20 rounded-2xl flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-display font-semibold gradient-text-primary text-lg mb-2">No recent activity</h3>
            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
              Your activity will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="glass rounded-xl p-6 border border-primary-200/30 hover:border-primary-300/50 transition-all duration-200 hover:scale-[1.01]"
              >
                <div className="flex items-start space-x-6">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display font-semibold gradient-text-primary truncate">
                        {activity.action}
                      </h3>
                      <span className="glass rounded-lg px-3 py-1 border border-primary-200/30 font-body text-light-text-secondary dark:text-dark-text-secondary text-xs ml-4 flex-shrink-0">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                    <p className="font-body text-light-text-primary dark:text-dark-text-primary mb-4 line-clamp-2">
                      {activity.description}
                    </p>
                    {activity.metadata && (
                      <div className="flex items-center flex-wrap gap-3">
                        {activity.metadata.cost && (
                          <span className="glass rounded-lg px-3 py-1 border border-success-200/30 font-body text-light-text-primary dark:text-dark-text-primary text-xs">
                            Cost: ${activity.metadata.cost.toFixed(4)}
                          </span>
                        )}
                        {activity.metadata.tokens && (
                          <span className="glass rounded-lg px-3 py-1 border border-primary-200/30 font-body text-light-text-primary dark:text-dark-text-primary text-xs">
                            Tokens: {activity.metadata.tokens.toLocaleString()}
                          </span>
                        )}
                        {activity.metadata.service && (
                          <span className="px-3 py-1 bg-gradient-accent/20 text-accent-700 dark:text-accent-300 border border-accent-200/30 rounded-lg font-display font-medium text-xs">
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
