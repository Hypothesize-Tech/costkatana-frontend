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
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
            <svg
              className="w-5 h-5 text-blue-600"
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
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
            <svg
              className="w-5 h-5 text-green-600"
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
          <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
            <svg
              className="w-5 h-5 text-purple-600"
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
          <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full">
            <svg
              className="w-5 h-5 text-yellow-600"
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
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
            <svg
              className="w-5 h-5 text-gray-600"
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
      <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="space-y-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Recent Activity
        </h2>

        {activities.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
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
            <p className="text-gray-500">No recent activity</p>
            <p className="text-sm text-gray-400 mt-1">
              Your activity will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {getActivityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {activity.action}
                    </h3>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {activity.description}
                  </p>
                  {activity.metadata && (
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      {activity.metadata.cost && (
                        <span>Cost: ${activity.metadata.cost.toFixed(4)}</span>
                      )}
                      {activity.metadata.tokens && (
                        <span>
                          Tokens: {activity.metadata.tokens.toLocaleString()}
                        </span>
                      )}
                      {activity.metadata.service && (
                        <span className="px-2 py-1 bg-gray-100 rounded-full">
                          {activity.metadata.service}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
