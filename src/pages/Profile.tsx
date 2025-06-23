// src/pages/Profile.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/user.service';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileStats } from '../components/profile/ProfileStats';
import { ProfileActivity } from '../components/profile/ProfileActivity';
import { ProfilePreferences } from '../components/profile/ProfilePreferences';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotifications } from '../contexts/NotificationContext';
import { usageService } from '@/services/usage.service';

export const Profile: React.FC = () => {
    const { user } = useAuth();
    const { showNotification } = useNotifications();
    const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'preferences'>('overview');

    const { data: profile, isLoading: profileLoading } = useQuery(
        'user-profile',
        userService.getProfile
    );

    const { data: stats, isLoading: statsLoading } = useQuery(
        'user-stats',
        () => usageService.getUsageStats()
    );

    const { data: activity, isLoading: activityLoading } = useQuery(
        'user-activity',
        () => usageService.getActivity({ limit: 20 }),
        {
            enabled: activeTab === 'activity',
        }
    );

    const updateProfileMutation = useMutation(
        (data: any) => userService.updateProfile(data),
        {
            onSuccess: () => {
                showNotification('Profile updated successfully', 'success');
            },
            onError: () => {
                showNotification('Failed to update profile', 'error');
            },
        }
    );

    const handleAvatarChange = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            await userService.updateProfile({ name: file.name });
            showNotification('Avatar updated successfully', 'success');
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

    // Mock stats data - in real app, this would come from the API
    const mockStats = {
        totalSpent: stats?.data?.totalSpent || 1250.50,
        totalSaved: stats?.data?.totalSaved || 325.25,
        apiCalls: stats?.data?.apiCalls || 15420,
        optimizations: stats?.data?.optimizations || 142,
        currentMonthSpent: stats?.data?.currentMonthSpent || 125.50,
        currentMonthSaved: stats?.data?.currentMonthSaved || 45.75,
        avgDailyCost: stats?.data?.avgDailyCost || 4.18,
        mostUsedService: stats?.data?.mostUsedService || 'openai',
        mostUsedModel: stats?.data?.mostUsedModel || 'gpt-4',
        accountAge: stats?.data?.accountAge || 45,
    };

    // Mock activity data
    const mockActivity = activity?.data || [
        {
            id: '1',
            type: 'usage' as const,
            action: 'API Call',
            description: 'Used GPT-4 for code generation',
            timestamp: new Date().toISOString(),
        },
        {
            id: '2',
            type: 'optimization' as const,
            action: 'Prompt Optimized',
            description: 'Saved 45% on frequently used prompt',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
            id: '3',
            type: 'settings' as const,
            action: 'Settings Updated',
            description: 'Updated notification preferences',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
    ];

    // Mock preferences
    const defaultPreferences = {
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        theme: 'light' as 'light' | 'dark' | 'system',
        emailDigest: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'never',
        autoOptimize: true,
        showCostInHeader: true,
        enableBetaFeatures: false,
    };
    const preferences = {
        ...defaultPreferences,
        ...(profile?.preferences || {}),
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Header */}
            <ProfileHeader
                user={profile || user!}
                onAvatarChange={handleAvatarChange}
                editable={true}
            />

            {/* Tabs */}
            <div className="mt-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
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

            {/* Tab Content */}
            <div className="mt-8">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {statsLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <ProfileStats stats={mockStats} />
                        )}
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