import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/user.service';
import { analyticsService } from '../services/analytics.service';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileStats } from '../components/profile/ProfileStats';
import { ProfileActivity } from '../components/profile/ProfileActivity';
import { ProfilePreferences } from '../components/profile/ProfilePreferences';
import {
  ProfileShimmer,
  ProfileOverviewShimmer,
  ProfilePreferencesShimmer,
  ProfileSecurityShimmer,
  ProfileSubscriptionShimmer
} from '../components/shimmer/ProfileShimmer';
import { useNotifications } from '../contexts/NotificationContext';
import { User } from '../types';
import { UsageOverview } from '../components/guardrails/UsageOverview';
import { UsageAlerts } from '../components/guardrails/UsageAlerts';
import { UsageTrendChart } from '../components/guardrails/UsageTrendChart';
import {
  ShieldCheckIcon,
  ChartBarIcon,
  LockClosedIcon,
  SignalIcon,
  SparklesIcon,
  CheckCircleIcon,
  BellIcon,
  EyeIcon,
  LightBulbIcon,
  StarIcon,
  CogIcon,
  UserIcon,
  KeyIcon,
  TrashIcon,
  FolderIcon,
  ChartPieIcon,
  RocketLaunchIcon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { MFASetup } from '../components/auth/MFASetup';
import { SubscriptionDashboard } from '../components/subscription/SubscriptionDashboard';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showNotification } = useNotifications();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'preferences' | 'security' | 'subscription'>('overview');

  // Handle URL parameter to set active tab
  useEffect(() => {
    const tabParam = searchParams.get('tab') as 'overview' | 'activity' | 'preferences' | 'security' | 'subscription';
    if (tabParam && ['overview', 'activity', 'preferences', 'security', 'subscription'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const { data: profile, isLoading: profileLoading } = useQuery(
    ['user-profile', user?.id],
    () => userService.getProfile(),
    {
      enabled: !!user?.id,
      onSuccess: (data) => {
        // Sync fresh profile data to AuthContext to update sidebar and other components
        if (data && updateUser) {
          updateUser(data);
        }
      },
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

  if (profileLoading) {
    return <ProfileShimmer activeTab={activeTab} />;
  }

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
    const typeConfig: Record<string, { icon: React.ComponentType<any>; color: string; type: 'usage' | 'optimization' | 'settings' | 'api_key' | 'login' }> = {
      login: { icon: LockClosedIcon, color: 'text-blue-600', type: 'login' },
      api_call: { icon: SignalIcon, color: 'text-green-600', type: 'usage' },
      optimization_created: { icon: SparklesIcon, color: 'text-purple-600', type: 'optimization' },
      optimization_applied: { icon: CheckCircleIcon, color: 'text-green-600', type: 'optimization' },
      alert_created: { icon: BellIcon, color: 'text-yellow-600', type: 'settings' },
      alert_resolved: { icon: CheckCircleIcon, color: 'text-green-600', type: 'settings' },
      tip_viewed: { icon: EyeIcon, color: 'text-blue-600', type: 'settings' },
      tip_applied: { icon: LightBulbIcon, color: 'text-yellow-600', type: 'settings' },
      quality_scored: { icon: StarIcon, color: 'text-yellow-600', type: 'settings' },
      settings_updated: { icon: CogIcon, color: 'text-gray-600', type: 'settings' },
      profile_updated: { icon: UserIcon, color: 'text-blue-600', type: 'settings' },
      api_key_added: { icon: KeyIcon, color: 'text-green-600', type: 'api_key' },
      api_key_removed: { icon: TrashIcon, color: 'text-red-600', type: 'api_key' },
      file_uploaded: { icon: FolderIcon, color: 'text-blue-600', type: 'settings' },
      export_generated: { icon: ChartPieIcon, color: 'text-purple-600', type: 'settings' },
      bulk_optimization: { icon: RocketLaunchIcon, color: 'text-purple-600', type: 'optimization' },
      cost_audit_completed: { icon: ClipboardDocumentCheckIcon, color: 'text-green-600', type: 'settings' },
      subscription_changed: { icon: CreditCardIcon, color: 'text-blue-600', type: 'settings' },
    };

    const config = typeConfig[activity.type] || { icon: DocumentDuplicateIcon, color: 'text-gray-600', type: 'settings' as const };

    return {
      id: activity._id,
      type: config.type,
      action: activity.title,
      description: activity.description || '',
      timestamp: activity.createdAt ?
        new Date(activity.createdAt).toISOString() :
        new Date().toISOString(),
      metadata: activity.metadata,
      icon: config.icon,
      iconColor: config.color
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
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="px-3 py-4 mx-auto max-w-7xl sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">
        <ProfileHeader
          user={profileData}
          onAvatarChange={handleAvatarChange}
          editable={true}
        />

        <div className="mt-4 sm:mt-6 md:mt-8">
          <div className="p-1.5 sm:p-2 mb-4 sm:mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <nav className="flex overflow-x-auto space-x-1.5 sm:space-x-2 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    navigate(`/profile?tab=${tab.id}`, { replace: true });
                  }}
                  className={`py-2 px-3 sm:py-3 sm:px-4 rounded-xl font-display font-semibold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-gradient-primary text-white shadow-lg glow-primary transform scale-105'
                    : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-500/10 dark:hover:bg-primary-500/20'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-4 sm:mt-6 md:mt-8">
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                {statsLoading ? (
                  <ProfileOverviewShimmer />
                ) : (
                  <>
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

                    <div className="mt-4 sm:mt-6 md:mt-8">
                      <div className="flex items-center mb-3 sm:mb-4">
                        <ChartBarIcon className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                        <h3 className="text-base sm:text-lg font-medium text-secondary-900 dark:text-white">Usage Overview</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                          <UsageOverview />
                        </div>
                        <div>
                          <UsageAlerts />
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-6">
                        <UsageTrendChart days={7} chartType="area" />
                      </div>
                    </div>
                  </>
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
              profileLoading ? (
                <ProfilePreferencesShimmer />
              ) : (
                <ProfilePreferences
                  preferences={preferences}
                  onUpdate={(data) => updateProfileMutation.mutate({ preferences: data })}
                />
              )
            )}

            {activeTab === 'security' && (
              profileLoading ? (
                <ProfileSecurityShimmer />
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="p-4 sm:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <ShieldCheckIcon className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6 text-success-600 dark:text-success-400" />
                      <h3 className="text-base sm:text-lg font-medium text-secondary-900 dark:text-white">Security Settings</h3>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 p-3 sm:p-4 rounded-lg border backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm sm:text-base text-secondary-900 dark:text-white">Email Verification</h4>
                          <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">Verify your email address for enhanced security</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold self-start sm:self-auto ${profileData?.emailVerified
                          ? 'bg-gradient-success text-white shadow-md'
                          : 'bg-gradient-warning text-white shadow-md'
                          }`}>
                          {profileData?.emailVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>

                      <div className="p-3 sm:p-4 rounded-lg border backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <MFASetup />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 p-3 sm:p-4 rounded-lg border backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm sm:text-base text-secondary-900 dark:text-white">API Keys</h4>
                          <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">Manage your API keys and access tokens</p>
                        </div>
                        <button
                          onClick={() => navigate('/settings?tab=api-keys')}
                          className="px-3 sm:px-4 py-2 sm:py-2.5 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center gap-2 font-display font-semibold text-xs sm:text-sm self-start sm:self-auto"
                        >
                          Manage Keys
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            {activeTab === 'subscription' && (
              profileLoading ? (
                <ProfileSubscriptionShimmer />
              ) : (
                <SubscriptionDashboard />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};