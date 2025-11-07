// src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  UserCircle,
  Key,
  Bell,
  ShieldCheck,
  PlayCircle,
  AlertTriangle,
  Users,
  Link as LinkIcon,
  CheckCircle,
  Settings as SettingsIcon,
  BellRing,
  Github,
} from 'lucide-react';
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
      icon: UserCircle,
      component: ProfileSettings,
    },
    {
      id: 'api-keys' as const,
      name: 'API Keys',
      icon: Key,
      component: ApiKeySettings,
    },
    {
      id: 'notifications' as const,
      name: 'Notifications',
      icon: Bell,
      component: NotificationSettings,
    },
    {
      id: 'security' as const,
      name: 'Security',
      icon: ShieldCheck,
      component: SecuritySettings,
    },
    {
      id: 'session-replay' as const,
      name: 'Session Replay',
      icon: PlayCircle,
      component: SessionReplaySettings,
    },
    {
      id: 'team' as const,
      name: 'Team',
      icon: Users,
      component: TeamManagement,
    },
    {
      id: 'integrations' as const,
      name: 'Integrations',
      icon: BellRing,
      component: () => null, // Rendered inline below
    },
    {
      id: 'account' as const,
      name: 'Account',
      icon: AlertTriangle,
      component: AccountClosure,
    },
  ];

  return (
    <div className="px-4 py-8 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="p-8 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <h1 className="mb-4 text-4xl font-bold font-display gradient-text-primary">Settings</h1>
          <p className="text-secondary-600 dark:text-secondary-300">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="p-2 mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`btn flex-1 py-3 px-4 text-center font-display font-semibold text-sm transition-all duration-300 rounded-lg ${activeTab === tab.id
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
                <div className="p-8 mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                  <div className="flex gap-4 items-center mb-6">
                    <div className="flex justify-center items-center w-12 h-12 rounded-xl shadow-lg bg-gradient-primary glow-primary">
                      <LinkIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-2xl font-bold font-display gradient-text-primary">
                        Integrations
                      </h3>
                      <p className="text-secondary-600 dark:text-secondary-300 font-body">
                        Connect and manage your external service integrations
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                    <div className="p-5 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex gap-3 items-center">
                          <div className="flex justify-center items-center w-10 h-10 rounded-xl bg-gradient-primary/20">
                            <Github className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <p className="font-semibold font-display text-secondary-900 dark:text-white">GitHub</p>
                            <p className="text-xs text-secondary-600 dark:text-secondary-300">Repository integrations</p>
                          </div>
                        </div>
                        <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
                      </div>
                    </div>

                    <div className="p-5 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex gap-3 items-center">
                          <div className="flex justify-center items-center w-10 h-10 rounded-xl bg-gradient-accent/20">
                            <BellRing className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                          </div>
                          <div>
                            <p className="font-semibold font-display text-secondary-900 dark:text-white">Slack & Discord</p>
                            <p className="text-xs text-secondary-600 dark:text-secondary-300">Alert notifications</p>
                          </div>
                        </div>
                        <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/integrations')}
                    className="btn btn-primary w-full py-3.5 px-6 bg-gradient-primary hover:bg-gradient-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 font-display font-semibold text-base"
                  >
                    <SettingsIcon className="w-5 h-5" />
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