import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/user.service';
import { analyticsService } from '../services/analytics.service';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileStats } from '../components/profile/ProfileStats';
import { ProfileActivity } from '../components/profile/ProfileActivity';
import { ProfilePreferences } from '../components/profile/ProfilePreferences';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotifications } from '../contexts/NotificationContext';
import { User } from '../types';
import {
  ShieldCheckIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showNotification } = useNotifications();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'preferences' | 'security' | 'subscription'>('overview');

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

  // Fetch recent usage for activity tab
  const { data: recentUsage, isLoading: usageLoading } = useQuery(
    ['recent-usage-profile', user?.id, activeTab],
    () => analyticsService.getRecentUsage({ limit: 20 }),
    {
      enabled: !!user?.id && activeTab === 'activity',
    }
  );

  // Also fetch user activities for additional context
  const { data: activityData, isLoading: activityLoading } = useQuery(
    ['user-activity', user?.id, activeTab],
    () => userService.getUserActivities({ limit: 10 }),
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
    { id: 'security' as const, label: 'Security' },
    { id: 'subscription' as const, label: 'Subscription' },
  ];

  const profileData = (profile as any)

  // Convert recent usage to activity format
  const formatUsageAsActivity = (usage: any) => ({
    id: usage._id,
    type: 'usage' as const,
    action: `${usage.service} API Call`,
    description: usage.prompt ?
      `Model: ${usage.model} | ${usage.prompt.substring(0, 100)}${usage.prompt.length > 100 ? '...' : ''}` :
      `Model: ${usage.model} | API Request`,
    timestamp: usage.createdAt ?
      new Date(usage.createdAt).toISOString() :
      new Date().toISOString(),
    metadata: {
      cost: usage.cost,
      tokens: usage.totalTokens,
      service: usage.service,
      model: usage.model,
      projectName: usage.projectName
    }
  });


  // Map activity types to friendly names and icons
  const formatActivity = (activity: any) => {
    const typeConfig: Record<string, { icon: string; color: string; type: 'usage' | 'optimization' | 'settings' | 'api_key' | 'login' }> = {
      login: { icon: '🔐', color: 'text-blue-600', type: 'login' },
      api_call: { icon: '📡', color: 'text-green-600', type: 'usage' },
      optimization_created: { icon: '✨', color: 'text-purple-600', type: 'optimization' },
      optimization_applied: { icon: '✅', color: 'text-green-600', type: 'optimization' },
      alert_created: { icon: '🔔', color: 'text-yellow-600', type: 'settings' },
      alert_resolved: { icon: '✓', color: 'text-green-600', type: 'settings' },
      tip_viewed: { icon: '👁️', color: 'text-blue-600', type: 'settings' },
      tip_applied: { icon: '💡', color: 'text-yellow-600', type: 'settings' },
      quality_scored: { icon: '⭐', color: 'text-yellow-600', type: 'settings' },
      settings_updated: { icon: '⚙️', color: 'text-gray-600', type: 'settings' },
      profile_updated: { icon: '👤', color: 'text-blue-600', type: 'settings' },
      api_key_added: { icon: '🔑', color: 'text-green-600', type: 'api_key' },
      api_key_removed: { icon: '🗑️', color: 'text-red-600', type: 'api_key' },
      file_uploaded: { icon: '📁', color: 'text-blue-600', type: 'settings' },
      export_generated: { icon: '📊', color: 'text-purple-600', type: 'settings' },
      bulk_optimization: { icon: '🚀', color: 'text-purple-600', type: 'optimization' },
      cost_audit_completed: { icon: '📋', color: 'text-green-600', type: 'settings' },
      subscription_changed: { icon: '💳', color: 'text-blue-600', type: 'settings' },
    };

    const config = typeConfig[activity.type] || { icon: '📌', color: 'text-gray-600', type: 'settings' as const };

    return {
      id: activity._id,
      type: config.type,
      action: activity.title,
      description: activity.description || '',
      timestamp: activity.createdAt ?
        new Date(activity.createdAt).toISOString() :
        new Date().toISOString(),
      metadata: activity.metadata
    };
  };

  // Combine and sort activities
  const usageActivities = recentUsage?.map(formatUsageAsActivity) || [];
  const systemActivities = activityData?.data?.map(formatActivity) || [];
  const allActivities = [...usageActivities, ...systemActivities]
    .sort((a, b) => {
      const aTime = a.timestamp === 'N/A' ? 0 : new Date(a.timestamp).getTime();
      const bTime = b.timestamp === 'N/A' ? 0 : new Date(b.timestamp).getTime();
      return bTime - aTime;
    })
    .slice(0, 30); // Limit to 30 most recent

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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded-lg p-6">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
            activities={allActivities}
            loading={usageLoading || activityLoading}
          />
        )}

        {activeTab === 'preferences' && (
          <ProfilePreferences
            preferences={preferences}
            onUpdate={(data) => updateProfileMutation.mutate({ preferences: data })}
          />
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Verification</h4>
                    <p className="text-sm text-gray-600">Verify your email address for enhanced security</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${profileData?.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {profileData?.emailVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    Enable 2FA
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">API Keys</h4>
                    <p className="text-sm text-gray-600">Manage your API keys and access tokens</p>
                  </div>
                  <button
                    onClick={() => navigate('/settings?tab=api-keys')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Manage Keys
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <CreditCardIcon className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Subscription Details</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Current Plan</h4>
                    <p className="text-sm text-gray-600">Your current subscription plan and features</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {profileData?.subscription?.plan || 'Free'} Plan
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">API Calls Limit</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {profileData?.subscription?.limits?.apiCalls?.toLocaleString() || '1,000'}
                    </p>
                    <p className="text-sm text-gray-600">calls per month</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Optimizations Limit</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {profileData?.subscription?.limits?.optimizations?.toLocaleString() || '10'}
                    </p>
                    <p className="text-sm text-gray-600">optimizations per month</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Upgrade Plan</h4>
                    <p className="text-sm text-gray-600">Get more features and higher limits</p>
                  </div>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive updates about your usage and optimizations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Cost Alerts</h4>
                    <p className="text-sm text-gray-600">Get notified when you reach cost thresholds</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Weekly Reports</h4>
                    <p className="text-sm text-gray-600">Receive weekly summaries of your usage and savings</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};