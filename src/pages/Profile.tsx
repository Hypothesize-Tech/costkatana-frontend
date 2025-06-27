// src/pages/Profile.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/user.service';
import { usageService } from '../services/usage.service';
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

    const { data: activity, isLoading: activityLoading } = useQuery(
        ['user-activity', user?.id, activeTab],
        () => usageService.getActivity({ limit: 20 }),
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
    const usageData = profileData?.usage?.currentMonth;

    const mockStats = {
        totalSpent: usageData?.totalCost || 0,
        totalSaved: usageData?.optimizationsSaved || 0,
        apiCalls: usageData?.apiCalls || 0,
        optimizations: 0,
        currentMonthSpent: usageData?.totalCost || 0,
        currentMonthSaved: usageData?.optimizationsSaved || 0,
        avgDailyCost: 0,
        mostUsedService: 'N/A',
        mostUsedModel: 'N/A',
        accountAge: 0,
    };

    const mockActivity = (activity as any)?.data || [];

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
                        <ProfileStats stats={mockStats as any} />
                    </div>
                )}

                {activeTab === 'activity' && (
                    <ProfileActivity
                        activities={mockActivity}
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