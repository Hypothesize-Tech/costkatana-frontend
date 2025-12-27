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
import { useAuth } from '../hooks';

type SettingsTab = 'profile' | 'api-keys' | 'notifications' | 'security' | 'session-replay' | 'team' | 'integrations' | 'account';

const VALID_TABS: SettingsTab[] = ['profile', 'api-keys', 'notifications', 'security', 'session-replay', 'team', 'integrations', 'account'];

export const Settings: React.FC = () => {
  const { tab } = useParams<{ tab: SettingsTab }>();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const { updateUser } = useAuth();
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
      onSuccess: (data) => {
        // Sync fresh profile data to AuthContext to update sidebar and other components
        if (data && updateUser) {
          updateUser(data);
        }
      },
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
    <div className="px-3 py-4 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient sm:px-4 sm:py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl sm:px-2 md:px-4 lg:px-8">
        {/* Header - Responsive */}
        <div className="p-4 mb-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6 sm:mb-6 md:p-8 md:mb-8">
          <h1 className="mb-2 text-2xl font-bold font-display gradient-text-primary sm:text-3xl sm:mb-3 md:text-4xl md:mb-4">
            Settings
          </h1>
          <p className="text-sm text-secondary-600 dark:text-secondary-300 sm:text-base">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Main Settings Container */}
        <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          {/* Tabs Navigation - Responsive with horizontal scroll on mobile */}
          <div className="p-1.5 mb-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-2 sm:mb-5 md:mb-6">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide sm:gap-2 md:flex-wrap">
              {tabs.map((tabItem) => (
                <button
                  key={tabItem.id}
                  onClick={() => navigate(`/settings/${tabItem.id}`)}
                  className={`flex flex-col items-center justify-center gap-1.5 py-2 px-2 text-center font-display font-semibold text-xs transition-all duration-300 rounded-lg min-w-[70px] whitespace-nowrap sm:flex-1 sm:gap-2 sm:py-2.5 sm:px-2.5 sm:text-sm md:py-3 md:text-sm ${activeTab === tabItem.id
                    ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                    : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10'
                    }`}
                >
                  <tabItem.icon className="w-4 h-4 flex-shrink-0 sm:w-5 sm:h-5" />
                  <span className="leading-tight">{tabItem.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content - Responsive padding */}
          <div className="p-3 sm:p-4 md:p-6">
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
              <div className="py-3 sm:py-4 md:py-6">
                <div className="p-4 mb-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6 sm:mb-5 md:p-8 md:mb-6">
                  <div className="flex flex-col gap-3 items-start mb-4 sm:flex-row sm:gap-4 sm:items-center sm:mb-5 md:mb-6">
                    <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-primary glow-primary sm:w-11 sm:h-11 md:w-12 md:h-12">
                      <LinkIcon className="w-5 h-5 text-white sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-lg font-bold font-display gradient-text-primary sm:text-xl md:text-2xl">
                        Integrations
                      </h3>
                      <p className="text-xs text-secondary-600 dark:text-secondary-300 font-body sm:text-sm md:text-base">
                        Connect and manage your external service integrations
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 mb-4 sm:gap-4 sm:mb-5 md:grid-cols-2 md:mb-6">
                    <div className="p-4 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 sm:p-4.5 md:p-5">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center sm:gap-2.5 md:gap-3">
                          <div className="flex justify-center items-center w-8 h-8 rounded-xl bg-gradient-primary/20 sm:w-9 sm:h-9 md:w-10 md:h-10">
                            <Github className="w-4 h-4 text-primary-600 dark:text-primary-400 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold font-display text-secondary-900 dark:text-white md:text-base">GitHub</p>
                            <p className="text-xs text-secondary-600 dark:text-secondary-300">Repository integrations</p>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 sm:p-4.5 md:p-5">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center sm:gap-2.5 md:gap-3">
                          <div className="flex justify-center items-center w-8 h-8 rounded-xl bg-gradient-accent/20 sm:w-9 sm:h-9 md:w-10 md:h-10">
                            <BellRing className="w-4 h-4 text-accent-600 dark:text-accent-400 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold font-display text-secondary-900 dark:text-white md:text-base">Slack & Discord</p>
                            <p className="text-xs text-secondary-600 dark:text-secondary-300">Alert notifications</p>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/integrations')}
                    className="btn btn-primary w-full py-3 px-4 bg-gradient-primary hover:bg-gradient-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 font-display font-semibold text-sm sm:py-3.5 sm:px-5 sm:text-base md:px-6 md:text-base"
                  >
                    <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
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
