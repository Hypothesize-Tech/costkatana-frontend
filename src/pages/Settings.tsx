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
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <tab.icon className="mx-auto mb-1 w-5 h-5" />
              {tab.name}
            </button>
          ))}
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
  );
};