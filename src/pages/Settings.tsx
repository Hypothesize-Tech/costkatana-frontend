// src/pages/Settings.tsx
import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
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
import { SettingsShimmer } from '../components/shimmer/SettingsShimmer';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { ApiKeySettings } from '../components/settings/ApiKeySettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import SessionReplaySettings from '../components/settings/SessionReplaySettings';
import { AccountClosure } from '../components/settings/AccountClosure';
import { TeamManagement } from '../components/team/TeamManagement';
import { useNotifications } from '../contexts/NotificationContext';

type SettingsTab = 'profile' | 'api-keys' | 'notifications' | 'security' | 'session-replay' | 'team' | 'integrations' | 'account';

const VALID_TABS: SettingsTab[] = ['profile', 'api-keys', 'notifications', 'security', 'session-replay', 'team', 'integrations', 'account'];

export const Settings: React.FC = () => {
  const { tab } = useParams<{ tab: SettingsTab }>();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Validate and set active tab from URL params
  const activeTab: SettingsTab = (tab && VALID_TABS.includes(tab)) ? tab : 'profile';

  // Redirect to profile if invalid tab
  useEffect(() => {
    if (tab && !VALID_TABS.includes(tab)) {
      navigate('/settings/profile', { replace: true });
    }
  }, [tab, navigate]);

  const { data: profile, isLoading } = useQuery(
    ['user-profile'],
    userService.getProfile,
    {
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    }
  );

  const updateProfileMutation = useMutation(
    (data: Record<string, unknown>) => userService.updateProfile(data),
    {
      onSuccess: (updatedProfile) => {
        showNotification('Profile updated successfully', 'success');
        // Optimistically update the cache instead of invalidating
        queryClient.setQueryData(['user-profile'], updatedProfile);
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || 'Failed to update profile';
        showNotification(errorMessage, 'error');
      },
    }
  );

  // Only show shimmer on initial load, not when refetching
  if (isLoading && !profile) {
    return <SettingsShimmer activeTab={activeTab} />;
  }

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
            <div className="flex gap-2">
              {tabs.map((tabItem) => (
                <button
                  key={tabItem.id}
                  onClick={() => navigate(`/settings/${tabItem.id}`)}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 px-2 text-center font-display font-semibold text-sm transition-all duration-300 rounded-lg ${activeTab === tabItem.id
                    ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                    : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10'
                    }`}
                >
                  <tabItem.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="leading-tight">{tabItem.name}</span>
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
