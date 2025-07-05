// src/pages/Profile.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/user.service';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileStats } from '../components/profile/ProfileStats';
import { ProfileActivity } from '../components/profile/ProfileActivity';
import { ProfilePreferences } from '../components/profile/ProfilePreferences';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotifications } from '../contexts/NotificationContext';
import { User } from '../types';

export const Profile: React.FC = () => {
    const { user, updateUser } = useAuth();
    const { showNotification } = useNotifications();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'preferences'>('overview');

    const { data: profile, isLoading: profileLoading } = useQuery(
        ['user-profile', user?.id],
        () => userService.getProfile(),
        {
            enabled: !!user?.id,
        }
    );

    const { data: stats, isLoading: statsLoading } = useQuery(
        ['user-stats', user?.id],
        () => userService.getUserStats(),
        {
            enabled: !!user?.id && activeTab === 'overview',
        }
    );

    const { data: activityData, isLoading: activityLoading } = useQuery(
        ['user-activity', user?.id, activeTab],
        () => userService.getUserActivities({ limit: 50 }),
        {
            enabled: !!user?.id && activeTab === 'activity',
        }
    );

    const updateProfileMutation = useMutation(
        (data: any) => userService.updateProfile(data),
        {
            onSuccess: (data: User) => {
                updateUser(data);
                queryClient.setQueryData(['user-profile', user?.id], (oldData: any) => {
                    return {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            ...data
                        }
                    }
                });
                showNotification('Profile updated successfully', 'success');
            },
            onError: () => {
                showNotification('Failed to update profile', 'error');
            },
        }
    );

    const handleAvatarChange = async (file: File) => {
        try {
            // 1. Get pre-signed URL from backend
            const { uploadUrl, finalUrl } = await userService.getAvatarUploadUrl(file.name, file.type);

            // 2. Upload file to S3
            await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            // 3. Update profile with new avatar URL
            updateProfileMutation.mutate({ avatar: finalUrl });
        } catch (error) {
            showNotification('Failed to update avatar', 'error');
        }
    };

    if (profileLoading) return <LoadingSpinner />;

    const tabs = [
        { id: 'overview' as const, label: 'Overview' },
        { id: 'activity' as const, label: 'Activity' },
        { id: 'preferences' as const, label: 'Preferences' },
    ];

    const profileData = (profile as any)?.data;

    // Map activity types to friendly names and icons
    const formatActivity = (activity: any) => {
        const typeConfig: Record<string, { icon: string; color: string }> = {
            login: { icon: '🔐', color: 'text-blue-600' },
            api_call: { icon: '📡', color: 'text-green-600' },
            optimization_created: { icon: '✨', color: 'text-purple-600' },
            optimization_applied: { icon: '✅', color: 'text-green-600' },
            alert_created: { icon: '🔔', color: 'text-yellow-600' },
            alert_resolved: { icon: '✓', color: 'text-green-600' },
            tip_viewed: { icon: '👁️', color: 'text-blue-600' },
            tip_applied: { icon: '💡', color: 'text-yellow-600' },
            quality_scored: { icon: '⭐', color: 'text-yellow-600' },
            settings_updated: { icon: '⚙️', color: 'text-gray-600' },
            profile_updated: { icon: '👤', color: 'text-blue-600' },
            api_key_added: { icon: '🔑', color: 'text-green-600' },
            api_key_removed: { icon: '🗑️', color: 'text-red-600' },
            file_uploaded: { icon: '📁', color: 'text-blue-600' },
            export_generated: { icon: '📊', color: 'text-purple-600' },
            bulk_optimization: { icon: '🚀', color: 'text-purple-600' },
            cost_audit_completed: { icon: '📋', color: 'text-green-600' },
            subscription_changed: { icon: '💳', color: 'text-blue-600' },
        };

        const config = typeConfig[activity.type] || { icon: '📌', color: 'text-gray-600' };

        return {
            id: activity._id,
            icon: config.icon,
            title: activity.title,
            description: activity.description || '',
            timestamp: new Date(activity.createdAt).toLocaleString(),
            color: config.color,
            metadata: activity.metadata
        };
    };

    const activities = activityData?.data?.map(formatActivity) || [];

    const preferences = {
        ...(profileData?.preferences),
        language: 'English',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        theme: 'system',
        emailDigest: 'weekly',
        autoOptimize: true,
        showCostInHeader: true,
        enableBetaFeatures: false,
    };

    return (
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <ProfileHeader
                user={profileData || user!}
                onAvatarChange={handleAvatarChange}
                editable={true}
            />

            <div className="mt-8 border-b border-gray-200">
                <nav className="flex -mb-px space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-8">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {statsLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <ProfileStats stats={stats || {
                                totalSpent: 0,
                                totalSaved: 0,
                                apiCalls: 0,
                                optimizations: 0,
                                currentMonthSpent: 0,
                                currentMonthSaved: 0,
                                avgDailyCost: 0,
                                mostUsedService: 'N/A',
                                mostUsedModel: 'N/A',
                                accountAge: 0,
                                savingsRate: 0
                            }} />
                        )}
                    </div>
                )}

                {activeTab === 'activity' && (
                    <ProfileActivity
                        activities={activities}
                        loading={activityLoading}
                    />
                )}

                {activeTab === 'preferences' && (
                    <ProfilePreferences
                        preferences={preferences}
                        onUpdate={(data) => updateProfileMutation.mutate({ preferences: data })}
                    />
                )}
            </div>
        </div>
    );
};