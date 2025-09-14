// src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  UserCircleIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { userService } from '../services/user.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { ApiKeySettings } from '../components/settings/ApiKeySettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { useNotifications } from '../contexts/NotificationContext';

type SettingsTab = 'profile' | 'api-keys' | 'notifications' | 'security';

export const Settings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { showNotification } = useNotifications();

  // Handle URL parameter to set active tab
  useEffect(() => {
    const tabParam = searchParams.get('tab') as SettingsTab;
    if (tabParam && ['profile', 'api-keys', 'notifications', 'security'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const { data: profile, isLoading } = useQuery(
    ['user-profile'],
    userService.getProfile
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

  if (isLoading) return <LoadingSpinner />;

  const tabs = [
    {
      id: 'profile' as const,
      name: 'Profile',
      icon: UserCircleIcon,
      component: ProfileSettings,
    },
    {
      id: 'api-keys' as const,
      name: 'API Keys',
      icon: KeyIcon,
      component: ApiKeySettings,
    },
    {
      id: 'notifications' as const,
      name: 'Notifications',
      icon: BellIcon,
      component: NotificationSettings,
    },
    {
      id: 'security' as const,
      name: 'Security',
      icon: ShieldCheckIcon,
      component: SecuritySettings,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200 px-4 py-8">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-8 mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text-primary mb-4">Settings</h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300">
          <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-2 mb-6">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 text-center font-display font-semibold text-sm transition-all duration-300 rounded-lg ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 hover:bg-primary-500/10'
                    }`}
                >
                  <tab.icon className="mx-auto mb-1 w-5 h-5" />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
          {activeTab === 'profile' && (
            <ProfileSettings
              profile={profile}
              onUpdate={updateProfileMutation.mutate}
            />
          )}
          {activeTab === 'api-keys' && (
            <ApiKeySettings
              profile={profile}
              onUpdate={updateProfileMutation.mutate}
            />
          )}
          {activeTab === 'notifications' && (
            <NotificationSettings
              onUpdate={updateProfileMutation.mutate}
            />
          )}
          {activeTab === 'security' && (
            <SecuritySettings
              onUpdate={updateProfileMutation.mutate}
              security={{
                twoFactorEnabled: false,
                activeSessions: []
              }}
            />
          )}
          </div>
        </div>
      </div>
    </div>
  );
};