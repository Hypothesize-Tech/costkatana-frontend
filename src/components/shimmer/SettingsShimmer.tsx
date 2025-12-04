import React from "react";

// Settings Header Shimmer
export const SettingsHeaderShimmer: React.FC = () => {
  return (
    <div className="p-8 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="mb-4 w-32 h-10 rounded skeleton" />
      <div className="w-96 h-5 rounded skeleton" />
    </div>
  );
};

// Profile Settings Tab Shimmer
export const ProfileSettingsShimmer: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div className="w-48 h-6 rounded skeleton" />
        </div>
      </div>

      {/* Form */}
      <div className="p-8 space-y-8 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <div className="mb-2 w-24 h-4 rounded skeleton" />
              <div className="w-full h-11 rounded-lg skeleton" />
            </div>
          ))}
        </div>

        {/* Account Information */}
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-info-200/30">
          <div className="flex gap-3 items-center mb-6">
            <div className="w-8 h-8 rounded-lg skeleton" />
            <div className="w-40 h-5 rounded skeleton" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-lg border glass border-primary-200/30">
                <div className="mb-2 w-32 h-4 rounded skeleton" />
                <div className="w-40 h-5 rounded skeleton" />
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
          <div className="flex gap-3 items-center mb-6">
            <div className="w-8 h-8 rounded-lg skeleton" />
            <div className="w-40 h-5 rounded skeleton" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border glass border-primary-200/30">
                <div className="mb-2 w-24 h-4 rounded skeleton" />
                <div className="w-32 h-6 rounded skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// API Keys Settings Tab Shimmer
export const ApiKeySettingsShimmer: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
        <div className="flex gap-3 items-center mb-4">
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div className="flex-1">
            <div className="mb-2 w-48 h-6 rounded skeleton" />
            <div className="w-full h-4 rounded skeleton" />
          </div>
        </div>
      </div>

      {/* Add Key Button */}
      <div className="w-40 h-11 rounded-lg skeleton" />

      {/* API Keys List */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex gap-3 items-center mb-4">
                  <div className="w-32 h-6 rounded skeleton" />
                  <div className="w-20 h-6 rounded-full skeleton" />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 w-48 h-4 rounded skeleton" />
                    <div className="w-full h-10 rounded-lg skeleton" />
                  </div>
                  <div className="p-4 rounded-lg border glass border-warning-200/30">
                    <div className="mb-2 w-32 h-5 rounded skeleton" />
                    <div className="w-full h-4 rounded skeleton" />
                  </div>
                  <div className="flex flex-wrap gap-4 items-center">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="w-32 h-6 rounded-full skeleton" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="ml-4 w-10 h-10 rounded-lg skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Notification Settings Tab Shimmer
export const NotificationSettingsShimmer: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div>
            <div className="mb-1 w-48 h-6 rounded skeleton" />
            <div className="w-80 h-4 rounded skeleton" />
          </div>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
        <div className="flex gap-3 items-center mb-6">
          <div className="w-8 h-8 rounded-lg skeleton" />
          <div className="w-40 h-5 rounded skeleton" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center p-4 rounded-lg border glass border-primary-200/30"
            >
              <div className="flex-1">
                <div className="mb-2 w-40 h-5 rounded skeleton" />
                <div className="w-64 h-4 rounded skeleton" />
              </div>
              <div className="w-11 h-6 rounded-full skeleton" />
            </div>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-secondary-200/30">
        <div className="flex gap-3 items-center mb-6">
          <div className="w-8 h-8 rounded-lg skeleton" />
          <div className="w-40 h-5 rounded skeleton" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center p-4 rounded-lg border glass border-secondary-200/30"
            >
              <div className="flex-1">
                <div className="w-40 h-5 rounded skeleton" />
              </div>
              <div className="w-11 h-6 rounded-full skeleton" />
            </div>
          ))}
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-warning-200/30">
        <div className="flex gap-3 items-center mb-6">
          <div className="w-8 h-8 rounded-lg skeleton" />
          <div className="w-40 h-5 rounded skeleton" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="mb-2 w-32 h-4 rounded skeleton" />
              <div className="w-full h-11 rounded-lg skeleton" />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <div className="w-32 h-11 rounded-lg skeleton" />
      </div>
    </div>
  );
};

// Firewall Analytics Shimmer
export const FirewallAnalyticsShimmer: React.FC = () => {
  return (
    <div className="p-6 rounded-lg border glass border-primary-200/30">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 text-center rounded-lg border glass border-info-200/30">
            <div className="mx-auto mb-2 w-16 h-8 rounded skeleton" />
            <div className="mx-auto w-24 h-4 rounded skeleton" />
          </div>
        ))}
      </div>
      <div className="pt-6 mt-6 border-t border-primary-200/30">
        <div className="mb-4 w-40 h-5 rounded skeleton" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-4 rounded-lg border glass border-danger-200/30">
              <div className="w-32 h-4 rounded skeleton" />
              <div className="flex gap-3 items-center">
                <div className="w-12 h-4 rounded skeleton" />
                <div className="w-24 h-4 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 mt-6 rounded-lg border glass border-success-200/30 bg-gradient-success/10">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-lg skeleton" />
          <div className="flex-1">
            <div className="mb-3 w-48 h-5 rounded skeleton" />
            <div className="mb-4 w-full h-4 rounded skeleton" />
            <div className="w-3/4 h-4 rounded skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Email Management Shimmer
export const EmailManagementShimmer: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Primary Email Section */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
        <div className="flex gap-2 items-center mb-4">
          <div className="w-6 h-6 rounded skeleton" />
          <div className="w-32 h-6 rounded skeleton" />
        </div>
        <div className="flex justify-between items-center p-4 rounded-lg border glass border-primary-200/30">
          <div className="flex flex-1 gap-3 items-center">
            <div className="w-10 h-10 rounded-lg skeleton" />
            <div className="flex-1">
              <div className="flex gap-2 items-center">
                <div className="w-48 h-5 rounded skeleton" />
                <div className="w-20 h-5 rounded-full skeleton" />
              </div>
              <div className="flex gap-2 items-center mt-1">
                <div className="w-24 h-4 rounded skeleton" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Emails Section */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-secondary-200/30">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2 items-center">
            <div className="w-6 h-6 rounded skeleton" />
            <div className="w-40 h-6 rounded skeleton" />
          </div>
          <div className="w-20 h-4 rounded skeleton" />
        </div>
        <div className="mb-4 space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center p-4 rounded-lg border glass border-secondary-200/30"
            >
              <div className="flex flex-1 gap-3 items-center">
                <div className="w-10 h-10 rounded-lg skeleton" />
                <div className="flex-1">
                  <div className="w-48 h-5 rounded skeleton" />
                  <div className="flex gap-3 items-center mt-1">
                    <div className="w-24 h-4 rounded skeleton" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-28 h-8 rounded skeleton" />
                <div className="w-10 h-10 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-lg border glass border-info-200/30 bg-gradient-info/5">
          <div className="mb-2 w-40 h-5 rounded skeleton" />
          <div className="flex gap-2">
            <div className="flex-1 h-11 rounded skeleton" />
            <div className="w-32 h-11 rounded skeleton" />
          </div>
          <div className="mt-2 w-64 h-4 rounded skeleton" />
        </div>
      </div>
    </div>
  );
};

// Security Settings Tab Shimmer
export const SecuritySettingsShimmer: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Prompt Firewall & Cost Shield */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-warning-200/30">
        <div className="flex gap-3 items-center mb-6">
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div className="w-64 h-6 rounded skeleton" />
        </div>
        <div className="p-6 rounded-lg border glass border-primary-200/30">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 text-center rounded-lg border glass border-info-200/30">
                <div className="mx-auto mb-2 w-16 h-8 rounded skeleton" />
                <div className="mx-auto w-24 h-4 rounded skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Email Management */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-info-200/30">
        <div className="flex gap-3 items-center mb-6">
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div className="w-40 h-6 rounded skeleton" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-4 rounded-lg border glass border-primary-200/30"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="mb-2 w-32 h-5 rounded skeleton" />
                  <div className="w-48 h-4 rounded skeleton" />
                </div>
                <div className="w-24 h-8 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-secondary-200/30">
        <div className="flex gap-3 items-center mb-6">
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div className="w-56 h-6 rounded skeleton" />
        </div>
        <div className="p-6 rounded-lg border glass border-primary-200/30">
          <div className="space-y-4">
            <div className="w-full h-12 rounded-lg skeleton" />
            <div className="w-full h-12 rounded-lg skeleton" />
          </div>
        </div>
      </div>

      {/* Backup Codes */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
        <div className="flex gap-3 items-center mb-6">
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div className="w-32 h-6 rounded skeleton" />
        </div>
        <div className="p-6 rounded-lg border glass border-primary-200/30">
          <div className="mb-4 w-full h-12 rounded-lg skeleton" />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="w-full h-10 rounded skeleton" />
            ))}
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-info-200/30">
        <div className="flex gap-3 items-center mb-6">
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div className="w-36 h-6 rounded skeleton" />
        </div>
        <div className="p-6 rounded-lg border glass border-info-200/30">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center p-4 rounded-lg border glass border-primary-200/30"
              >
                <div>
                  <div className="mb-2 w-32 h-5 rounded skeleton" />
                  <div className="w-48 h-4 rounded skeleton" />
                </div>
                <div className="w-24 h-8 rounded skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Session Replay Settings Tab Shimmer
export const SessionReplaySettingsShimmer: React.FC = () => {
  return (
    <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
      {/* Header */}
      <div className="flex gap-3 items-center mb-6">
        <div className="w-10 h-10 rounded-xl skeleton" />
        <div className="w-48 h-6 rounded skeleton" />
      </div>

      {/* Description */}
      <div className="p-4 mb-6 rounded-lg border glass border-info-200/30">
        <div className="w-full h-4 rounded skeleton" />
      </div>

      <div className="space-y-6">
        {/* Enable Session Replay */}
        <div className="p-6 rounded-lg border glass border-primary-200/30">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <div className="mb-2 w-40 h-5 rounded skeleton" />
              <div className="w-full h-4 rounded skeleton" />
            </div>
            <div className="w-11 h-6 rounded-full skeleton" />
          </div>
        </div>

        {/* Session Timeout */}
        <div className="p-6 rounded-lg border glass border-primary-200/30">
          <div className="mb-4 w-40 h-5 rounded skeleton" />
          <div className="mb-2 w-full h-11 rounded-lg skeleton" />
          <div className="w-64 h-4 rounded skeleton" />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <div className="w-32 h-11 rounded-lg skeleton" />
        </div>
      </div>
    </div>
  );
};

// Team Management Tab Shimmer
export const TeamManagementShimmer: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header with Workspace Switcher */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
          <div className="w-48 h-10 rounded-lg skeleton" />
          <div className="w-32 h-6 rounded skeleton" />
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2">
          <div className="w-40 h-10 rounded-xl skeleton" />
          <div className="w-32 h-10 rounded-xl skeleton" />
        </div>
      </div>

      {/* Workspace Settings / Team Members */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
        <div className="mb-6 w-48 h-6 rounded skeleton" />

        {/* Search and Add Button */}
        <div className="flex gap-4 items-center mb-6">
          <div className="flex-1 h-11 rounded-lg skeleton" />
          <div className="w-32 h-11 rounded-lg skeleton" />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border glass border-primary-200/30">
          <table className="w-full">
            <thead className="bg-gradient-to-r border-b from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/10 border-primary-200/30">
              <tr>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <th key={i} className="px-6 py-4">
                    <div className="w-24 h-4 rounded skeleton" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-200/10">
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row}>
                  {[1, 2, 3, 4, 5, 6].map((col) => (
                    <td key={col} className="px-6 py-4">
                      <div className="w-20 h-4 rounded skeleton" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Integrations Tab Shimmer
export const IntegrationsShimmer: React.FC = () => {
  return (
    <div className="py-6">
      <div className="p-8 mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex gap-4 items-center mb-6">
          <div className="w-12 h-12 rounded-xl skeleton" />
          <div>
            <div className="mb-1 w-32 h-7 rounded skeleton" />
            <div className="w-80 h-4 rounded skeleton" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="p-5 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
              <div className="flex justify-between items-center mb-3">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-xl skeleton" />
                  <div>
                    <div className="mb-1 w-24 h-5 rounded skeleton" />
                    <div className="w-32 h-3 rounded skeleton" />
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full skeleton" />
              </div>
            </div>
          ))}
        </div>

        <div className="w-full h-12 rounded-xl skeleton" />
      </div>
    </div>
  );
};

// Account Closure Tab Shimmer
export const AccountClosureShimmer: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Warning Section */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-warning-200/30">
        <div className="flex gap-3 items-center mb-4">
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div className="w-48 h-6 rounded skeleton" />
        </div>
        <div className="mb-2 w-full h-4 rounded skeleton" />
        <div className="w-3/4 h-4 rounded skeleton" />
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-xl border glass border-danger-200/30">
        <div className="flex gap-3 items-center mb-4">
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div className="w-32 h-6 rounded skeleton" />
        </div>
        <div className="mb-4 w-full h-4 rounded skeleton" />
        <div className="w-40 h-11 rounded-lg skeleton" />
      </div>
    </div>
  );
};

// Main Settings Shimmer Component
export const SettingsShimmer: React.FC<{
  activeTab?: 'profile' | 'api-keys' | 'notifications' | 'security' | 'session-replay' | 'team' | 'integrations' | 'account';
}> = ({ activeTab = 'profile' }) => {
  return (
    <div className="px-4 py-8 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <SettingsHeaderShimmer />

        <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          {/* Tabs */}
          <div className="p-2 mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex-1 mx-1 h-16 rounded-lg skeleton" />
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && <ProfileSettingsShimmer />}
            {activeTab === 'api-keys' && <ApiKeySettingsShimmer />}
            {activeTab === 'notifications' && <NotificationSettingsShimmer />}
            {activeTab === 'security' && <SecuritySettingsShimmer />}
            {activeTab === 'session-replay' && <SessionReplaySettingsShimmer />}
            {activeTab === 'team' && <TeamManagementShimmer />}
            {activeTab === 'integrations' && <IntegrationsShimmer />}
            {activeTab === 'account' && <AccountClosureShimmer />}
          </div>
        </div>
      </div>
    </div>
  );
};

