// src/components/profile/ProfileActivity.tsx
import React from 'react';
import { formatDate } from '../../utils/formatters';

interface Activity {
    id: string;
    type: 'usage' | 'optimization' | 'settings' | 'api_key' | 'login';
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
    const getActivityIcon = (type: Activity['type']) => {
        switch (type) {
            case 'usage':
                return (
                    <div className="bg-blue-100 p-2 rounded-full">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                );
            case 'optimization':
                return (
                    <div className="bg-green-100 p-2 rounded-full">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                );
            case 'settings':
                return (
                    <div className="bg-purple-100 p-2 rounded-full">
                        <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                );
            case 'api_key':
                return (
                    <div className="bg-yellow-100 p-2 rounded-full">
                        <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                );
            case 'login':
                return (
                    <div className="bg-gray-100 p-2 rounded-full">
                        <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-start space-x-3">
                            <div className="h-9 w-9 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>

                {activities.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No recent activity</p>
                ) : (
                    <div className="flow-root">
                        <ul className="-mb-8">
                            {activities.map((activity, index) => (
                                <li key={activity.id}>
                                    <div className="relative pb-8">
                                        {index !== activities.length - 1 && (
                                            <span
                                                className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                                                aria-hidden="true"
                                            />
                                        )}
                                        <div className="relative flex items-start space-x-3">
                                            {getActivityIcon(activity.type)}
                                            <div className="min-w-0 flex-1">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {activity.action}
                                                    </p>
                                                    <p className="mt-0.5 text-sm text-gray-500">
                                                        {activity.description}
                                                    </p>
                                                </div>
                                                <div className="mt-1 text-xs text-gray-400">
                                                    {formatDate(activity.timestamp, 'relative')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};