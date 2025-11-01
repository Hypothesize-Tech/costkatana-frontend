// src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  UserCircleIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  PlayCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  LinkIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { userService } from '../services/user.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { ApiKeySettings } from '../components/settings/ApiKeySettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import SessionReplaySettings from '../components/settings/SessionReplaySettings';
import { AccountClosure } from '../components/settings/AccountClosure';
import { TeamManagement } from '../components/team/TeamManagement';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { BellAlertIcon } from '@heroicons/react/24/outline';

type SettingsTab = 'profile' | 'api-keys' | 'notifications' | 'security' | 'session-replay' | 'team' | 'integrations' | 'account';

export const Settings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { showNotification } = useNotifications();
  const navigate = useNavigate();

  // Handle URL parameter to set active tab
  useEffect(() => {
    const tabParam = searchParams.get('tab') as SettingsTab;
    if (tabParam && ['profile', 'api-keys', 'notifications', 'security', 'session-replay', 'team', 'integrations', 'account'].includes(tabParam)) {
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
    {
      id: 'session-replay' as const,
      name: 'Session Replay',
      icon: PlayCircleIcon,
      component: SessionReplaySettings,
    },
    {
      id: 'team' as const,
      name: 'Team',
      icon: UserGroupIcon,
      component: TeamManagement,
    },
    {
      id: 'integrations' as const,
      name: 'Integrations',
      icon: BellAlertIcon,
      component: () => null, // Rendered inline below
    },
    {
      id: 'account' as const,
      name: 'Account',
      icon: ExclamationTriangleIcon,
      component: AccountClosure,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient px-4 py-8">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text-primary mb-4">Settings</h1>
          <p className="text-secondary-600 dark:text-secondary-300">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-2 mb-6">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 text-center font-display font-semibold text-sm transition-all duration-300 rounded-lg ${activeTab === tab.id
                    ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                    : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10'
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
            {activeTab === 'session-replay' && (
              <SessionReplaySettings />
            )}
            {activeTab === 'team' && (
              <TeamManagement />
            )}
            {activeTab === 'integrations' && (
              <div className="py-6">
                <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 mb-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg glow-primary">
                      <LinkIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-bold gradient-text-primary mb-1">
                        Integrations
                      </h3>
                      <p className="text-secondary-600 dark:text-secondary-300 font-body">
                        Connect and manage your external service integrations
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-primary/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-display font-semibold text-secondary-900 dark:text-white">GitHub</p>
                            <p className="text-xs text-secondary-600 dark:text-secondary-300">Repository integrations</p>
                          </div>
                        </div>
                        <CheckCircleIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
                      </div>
                    </div>

                    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-accent/20 flex items-center justify-center">
                            <BellAlertIcon className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                          </div>
                          <div>
                            <p className="font-display font-semibold text-secondary-900 dark:text-white">Slack & Discord</p>
                            <p className="text-xs text-secondary-600 dark:text-secondary-300">Alert notifications</p>
                          </div>
                        </div>
                        <CheckCircleIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/integrations')}
                    className="w-full py-3.5 px-6 bg-gradient-primary hover:bg-gradient-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 font-display font-semibold text-base"
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                    Manage All Integrations
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'account' && (
              <AccountClosure />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};