import React from "react";

// Profile Header Shimmer
export const ProfileHeaderShimmer: React.FC = () => {
  return (
    <div className="p-8 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="flex items-center space-x-8">
        {/* Avatar */}
        <div className="relative">
          <div className="w-28 h-28 rounded-2xl skeleton" />
          <div className="absolute -right-2 -bottom-2 w-10 h-10 rounded-full skeleton" />
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="mb-2 w-48 h-9 rounded skeleton" />
          <div className="mb-4 w-64 h-6 rounded skeleton" />
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-32 h-9 rounded-lg skeleton" />
            <div className="w-28 h-9 rounded-lg skeleton" />
            <div className="w-36 h-9 rounded-lg skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Overview Tab Shimmer
export const ProfileOverviewShimmer: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Profile Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="glass rounded-xl shadow-lg border border-primary-200/30 dark:border-primary-700/30 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6"
          >
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 rounded-xl skeleton" />
              <div className="flex-1">
                <div className="mb-1 w-24 h-4 rounded skeleton" />
                <div className="mb-1 w-32 h-8 rounded skeleton" />
                <div className="w-40 h-3 rounded skeleton" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel"
          >
            <div className="flex gap-3 items-center mb-2">
              <div className="w-8 h-8 rounded-lg skeleton" />
              <div className="w-32 h-5 rounded skeleton" />
            </div>
            <div className="w-24 h-7 rounded skeleton" />
          </div>
        ))}
      </div>

      {/* Usage Overview Section */}
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <div className="mr-3 w-6 h-6 rounded skeleton" />
          <div className="w-40 h-6 rounded skeleton" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Usage Overview */}
          <div className="lg:col-span-2">
            <div className="p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="mr-4 w-10 h-10 rounded-xl skeleton" />
                  <div className="w-40 h-7 rounded skeleton" />
                </div>
                <div className="w-24 h-8 rounded-full skeleton" />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-4 rounded-lg border glass border-primary-200/30 dark:border-primary-700/30">
                    <div className="flex justify-between items-center mb-2">
                      <div className="w-20 h-4 rounded skeleton" />
                      <div className="w-16 h-4 rounded skeleton" />
                    </div>
                    <div className="w-full h-2 rounded-full skeleton mb-2" />
                    <div className="w-24 h-3 rounded skeleton" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Usage Alerts */}
          <div>
            <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="mb-4 w-32 h-6 rounded skeleton" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg border glass border-primary-200/30 dark:border-primary-700/30">
                    <div className="w-full h-4 rounded skeleton mb-2" />
                    <div className="w-3/4 h-3 rounded skeleton" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Usage Trend Chart */}
        <div className="mt-6 p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="mb-4 w-40 h-6 rounded skeleton" />
          <div className="h-64 rounded skeleton" />
        </div>
      </div>
    </div>
  );
};

// Activity Tab Shimmer
export const ProfileActivityShimmer: React.FC = () => {
  return (
    <div className="rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="p-8">
        <div className="flex gap-4 items-center mb-8">
          <div className="w-12 h-12 rounded-xl skeleton" />
          <div className="w-48 h-7 rounded skeleton" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="glass rounded-xl p-6 border border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel"
            >
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 rounded-xl skeleton flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-3">
                    <div className="w-48 h-5 rounded skeleton" />
                    <div className="w-20 h-5 rounded-lg skeleton flex-shrink-0 ml-4" />
                  </div>
                  <div className="mb-4 w-full h-4 rounded skeleton" />
                  <div className="flex flex-wrap gap-3 items-center">
                    <div className="w-24 h-6 rounded-lg skeleton" />
                    <div className="w-28 h-6 rounded-lg skeleton" />
                    <div className="w-20 h-6 rounded-lg skeleton" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Preferences Tab Shimmer
export const ProfilePreferencesShimmer: React.FC = () => {
  return (
    <div>
      <div className="flex gap-4 items-center mb-8">
        <div className="w-12 h-12 rounded-xl skeleton" />
        <div className="w-40 h-7 rounded skeleton" />
      </div>

      <div className="space-y-8">
        {/* Display Preferences */}
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-3 items-center mb-6">
            <div className="w-8 h-8 rounded-lg skeleton" />
            <div className="w-40 h-6 rounded skeleton" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="mb-3 w-24 h-4 rounded skeleton" />
                <div className="w-full h-11 rounded-lg skeleton" />
              </div>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-secondary-200/30 dark:border-secondary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-3 items-center mb-6">
            <div className="w-8 h-8 rounded-lg skeleton" />
            <div className="w-32 h-6 rounded skeleton" />
          </div>
          <div>
            <div className="mb-4 w-20 h-4 rounded skeleton" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl skeleton" />
              ))}
            </div>
          </div>
        </div>

        {/* Email Preferences */}
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-accent-200/30 dark:border-accent-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-3 items-center mb-6">
            <div className="w-8 h-8 rounded-lg skeleton" />
            <div className="w-44 h-6 rounded skeleton" />
          </div>
          <div>
            <div className="mb-3 w-48 h-4 rounded skeleton" />
            <div className="w-48 h-11 rounded-lg skeleton" />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-success-200/30 dark:border-success-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-3 items-center mb-6">
            <div className="w-8 h-8 rounded-lg skeleton" />
            <div className="w-24 h-6 rounded skeleton" />
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-lg border glass border-primary-200/30 dark:border-primary-700/30"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="mb-2 w-48 h-5 rounded skeleton" />
                    <div className="w-64 h-4 rounded skeleton" />
                  </div>
                  <div className="w-12 h-6 rounded-full skeleton" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Security Tab Shimmer
export const ProfileSecurityShimmer: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
        <div className="flex items-center mb-4">
          <div className="mr-3 w-6 h-6 rounded skeleton" />
          <div className="w-40 h-6 rounded skeleton" />
        </div>

        <div className="space-y-4">
          {/* Email Verification */}
          <div className="flex justify-between items-center p-4 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel rounded-lg">
            <div>
              <div className="mb-2 w-40 h-5 rounded skeleton" />
              <div className="w-64 h-4 rounded skeleton" />
            </div>
            <div className="w-24 h-7 rounded-full skeleton" />
          </div>

          {/* MFA Setup */}
          <div className="p-4 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel rounded-lg">
            <div className="mb-4 w-32 h-5 rounded skeleton" />
            <div className="space-y-3">
              <div className="w-full h-12 rounded-lg skeleton" />
              <div className="w-full h-12 rounded-lg skeleton" />
            </div>
          </div>

          {/* API Keys */}
          <div className="flex justify-between items-center p-4 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel rounded-lg">
            <div>
              <div className="mb-2 w-24 h-5 rounded skeleton" />
              <div className="w-56 h-4 rounded skeleton" />
            </div>
            <div className="w-32 h-10 rounded-xl skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Subscription Tab Shimmer
export const ProfileSubscriptionShimmer: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="mb-2 w-32 h-6 rounded skeleton" />
            <div className="w-48 h-4 rounded skeleton" />
          </div>
          <div className="w-24 h-8 rounded-full skeleton" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20">
              <div className="mb-2 w-24 h-4 rounded skeleton" />
              <div className="w-32 h-6 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>

      {/* Usage Meters */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="w-32 h-5 rounded skeleton" />
              <div className="w-20 h-5 rounded skeleton" />
            </div>
            <div className="w-full h-3 rounded-full skeleton mb-2" />
            <div className="flex justify-between items-center">
              <div className="w-24 h-4 rounded skeleton" />
              <div className="w-32 h-4 rounded skeleton" />
            </div>
          </div>
        ))}
      </div>

      {/* Billing History */}
      <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="mb-6 w-40 h-6 rounded skeleton" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center p-4 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20"
            >
              <div>
                <div className="mb-2 w-32 h-5 rounded skeleton" />
                <div className="w-24 h-4 rounded skeleton" />
              </div>
              <div className="w-24 h-6 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Profile Shimmer Component
export const ProfileShimmer: React.FC<{ activeTab?: 'overview' | 'activity' | 'preferences' | 'security' | 'subscription' }> = ({ activeTab = 'overview' }) => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <ProfileHeaderShimmer />

        <div className="mt-8">
          {/* Tabs */}
          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-2 mb-6">
            <nav className="flex space-x-2 overflow-x-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-28 h-11 rounded-xl skeleton" />
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'overview' && <ProfileOverviewShimmer />}
            {activeTab === 'activity' && <ProfileActivityShimmer />}
            {activeTab === 'preferences' && <ProfilePreferencesShimmer />}
            {activeTab === 'security' && <ProfileSecurityShimmer />}
            {activeTab === 'subscription' && <ProfileSubscriptionShimmer />}
          </div>
        </div>
      </div>
    </div>
  );
};

