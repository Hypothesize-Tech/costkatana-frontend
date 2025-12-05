import React from "react";

// Settings Header Shimmer
export const SettingsHeaderShimmer: React.FC = () => {
  return (
    <div className="p-4 mb-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6 sm:mb-6 md:p-8 md:mb-8">
      <div className="mb-3 w-full h-8 rounded skeleton sm:mb-4 sm:w-32 sm:h-9 md:h-10" />
      <div className="w-full h-4 rounded skeleton sm:w-96 sm:h-4.5 md:h-5" />
    </div>
  );
};

// Profile Settings Tab Shimmer
export const ProfileSettingsShimmer: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center sm:gap-2.5 md:gap-3">
          <div className="w-8 h-8 rounded-xl skeleton sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0" />
          <div className="w-full h-5 rounded skeleton sm:w-48 sm:h-5.5 md:h-6" />
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-6 sm:space-y-6 md:p-8 md:space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <div className="mb-2 w-full h-3 rounded skeleton sm:w-24 sm:h-4" />
              <div className="w-full h-10 rounded-lg skeleton sm:h-10.5 md:h-11" />
            </div>
          ))}
        </div>

        {/* Account Information */}
        <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-info-200/30 sm:p-5 md:p-6">
          <div className="flex gap-2 items-center mb-4 sm:gap-2.5 sm:mb-5 md:gap-3 md:mb-6">
            <div className="w-7 h-7 rounded-lg skeleton sm:w-7.5 sm:h-7.5 md:w-8 md:h-8 shrink-0" />
            <div className="w-full h-4 rounded skeleton sm:w-40 sm:h-4.5 md:h-5" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-lg border glass border-primary-200/30 sm:p-3.5 md:p-4">
                <div className="mb-2 w-full h-3 rounded skeleton sm:w-32 sm:h-4" />
                <div className="w-full h-4 rounded skeleton sm:w-40 sm:h-4.5 md:h-5" />
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
          <div className="flex gap-2 items-center mb-4 sm:gap-2.5 sm:mb-5 md:gap-3 md:mb-6">
            <div className="w-7 h-7 rounded-lg skeleton sm:w-7.5 sm:h-7.5 md:w-8 md:h-8 shrink-0" />
            <div className="w-full h-4 rounded skeleton sm:w-40 sm:h-4.5 md:h-5" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg border glass border-primary-200/30 sm:p-3.5 md:p-4">
                <div className="mb-2 w-full h-3 rounded skeleton sm:w-24 sm:h-4" />
                <div className="w-full h-5 rounded skeleton sm:w-32 sm:h-5.5 md:h-6" />
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
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center mb-3 sm:gap-2.5 sm:mb-3.5 md:gap-3 md:mb-4">
          <div className="w-8 h-8 rounded-xl skeleton sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="mb-2 w-full h-5 rounded skeleton sm:w-44 sm:h-5.5 md:w-48 md:h-6" />
            <div className="w-full h-3 rounded skeleton sm:h-3.5 md:h-4" />
          </div>
        </div>
      </div>

      {/* Add Key Button */}
      <div className="w-full h-10 rounded-lg skeleton sm:w-40 sm:h-10.5 md:h-11" />

      {/* API Keys List */}
      <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6"
          >
            <div className="flex flex-col gap-3 justify-between items-start mb-3 sm:flex-row sm:items-start sm:mb-4 sm:gap-0">
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-wrap gap-2 items-center mb-3 sm:gap-2.5 sm:mb-3.5 md:gap-3 md:mb-4">
                  <div className="w-full h-5 rounded skeleton sm:w-28 sm:h-5.5 md:w-32 md:h-6" />
                  <div className="w-full h-5 rounded-full skeleton sm:w-18 sm:h-5.5 md:w-20 md:h-6" />
                </div>
                <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
                  <div>
                    <div className="mb-2 w-full h-3 rounded skeleton sm:w-44 sm:h-3.5 md:w-48 md:h-4" />
                    <div className="w-full h-9 rounded-lg skeleton sm:h-9.5 md:h-10" />
                  </div>
                  <div className="p-3 rounded-lg border glass border-warning-200/30 sm:p-3.5 md:p-4">
                    <div className="mb-2 w-full h-4 rounded skeleton sm:w-28 sm:h-4.5 md:w-32 md:h-5" />
                    <div className="w-full h-3 rounded skeleton sm:h-3.5 md:h-4" />
                  </div>
                  <div className="flex flex-wrap gap-2 items-center sm:gap-3 md:gap-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="w-full h-5 rounded-full skeleton sm:w-28 sm:h-5.5 md:w-32 md:h-6" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="ml-0 w-full h-9 rounded-lg skeleton sm:ml-4 sm:w-9 sm:h-9 md:w-10 md:h-10" />
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
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center sm:gap-2.5 md:gap-3">
          <div className="w-8 h-8 rounded-xl skeleton sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="mb-1 w-full h-5 rounded skeleton sm:w-44 sm:h-5.5 md:w-48 md:h-6" />
            <div className="w-full h-3 rounded skeleton sm:w-76 sm:h-3.5 md:w-80 md:h-4" />
          </div>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center mb-4 sm:gap-2.5 sm:mb-5 md:gap-3 md:mb-6">
          <div className="w-7 h-7 rounded-lg skeleton sm:w-7.5 sm:h-7.5 md:w-8 md:h-8 shrink-0" />
          <div className="w-full h-4 rounded skeleton sm:w-36 sm:h-4.5 md:w-40 md:h-5" />
        </div>
        <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-2 justify-between items-start p-3 rounded-lg border glass border-primary-200/30 sm:flex-row sm:items-center sm:gap-0 sm:p-3.5 md:p-4"
            >
              <div className="flex-1 min-w-0 w-full">
                <div className="mb-2 w-full h-4 rounded skeleton sm:w-36 sm:h-4.5 md:w-40 md:h-5" />
                <div className="w-full h-3 rounded skeleton sm:w-60 sm:h-3.5 md:w-64 md:h-4" />
              </div>
              <div className="w-full h-5 rounded-full skeleton sm:w-10 sm:h-5.5 md:w-11 md:h-6" />
            </div>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-secondary-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center mb-4 sm:gap-2.5 sm:mb-5 md:gap-3 md:mb-6">
          <div className="w-7 h-7 rounded-lg skeleton sm:w-7.5 sm:h-7.5 md:w-8 md:h-8 shrink-0" />
          <div className="w-full h-4 rounded skeleton sm:w-36 sm:h-4.5 md:w-40 md:h-5" />
        </div>
        <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-2 justify-between items-start p-3 rounded-lg border glass border-secondary-200/30 sm:flex-row sm:items-center sm:gap-0 sm:p-3.5 md:p-4"
            >
              <div className="flex-1 min-w-0 w-full">
                <div className="w-full h-4 rounded skeleton sm:w-36 sm:h-4.5 md:w-40 md:h-5" />
              </div>
              <div className="w-full h-5 rounded-full skeleton sm:w-10 sm:h-5.5 md:w-11 md:h-6" />
            </div>
          ))}
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-warning-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center mb-4 sm:gap-2.5 sm:mb-5 md:gap-3 md:mb-6">
          <div className="w-7 h-7 rounded-lg skeleton sm:w-7.5 sm:h-7.5 md:w-8 md:h-8 shrink-0" />
          <div className="w-full h-4 rounded skeleton sm:w-36 sm:h-4.5 md:w-40 md:h-5" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="mb-2 w-full h-3 rounded skeleton sm:w-28 sm:h-3.5 md:w-32 md:h-4" />
              <div className="w-full h-10 rounded-lg skeleton sm:h-10.5 md:h-11" />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <div className="w-full h-10 rounded-lg skeleton sm:w-28 sm:h-10.5 md:w-32 md:h-11" />
      </div>
    </div>
  );
};

// Firewall Analytics Shimmer
export const FirewallAnalyticsShimmer: React.FC = () => {
  return (
    <div className="p-4 rounded-lg border glass border-primary-200/30 sm:p-5 md:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 text-center rounded-lg border glass border-info-200/30 sm:p-3.5 md:p-4">
            <div className="mx-auto mb-2 w-full h-7 rounded skeleton sm:w-14 sm:h-7.5 md:w-16 md:h-8" />
            <div className="mx-auto w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
          </div>
        ))}
      </div>
      <div className="pt-4 mt-4 border-t border-primary-200/30 sm:pt-5 sm:mt-5 md:pt-6 md:mt-6">
        <div className="mb-3 w-full h-4 rounded skeleton sm:mb-3.5 sm:w-36 sm:h-4.5 md:mb-4 md:w-40 md:h-5" />
        <div className="space-y-2.5 sm:space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2 justify-between items-start p-3 rounded-lg border glass border-danger-200/30 sm:flex-row sm:items-center sm:gap-0 sm:p-3.5 md:p-4">
              <div className="w-full h-3 rounded skeleton sm:w-28 sm:h-3.5 md:w-32 md:h-4" />
              <div className="flex gap-2 items-center w-full sm:gap-2.5 sm:w-auto md:gap-3">
                <div className="w-full h-3 rounded skeleton sm:w-10 sm:h-3.5 md:w-12 md:h-4" />
                <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 mt-4 rounded-lg border glass border-success-200/30 bg-gradient-success/10 sm:p-5 sm:mt-5 md:p-6 md:mt-6">
        <div className="flex gap-3 items-start sm:gap-3.5 md:gap-4">
          <div className="w-9 h-9 rounded-lg skeleton sm:w-9.5 sm:h-9.5 md:w-10 md:h-10 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="mb-2 w-full h-4 rounded skeleton sm:mb-2.5 sm:w-44 sm:h-4.5 md:mb-3 md:w-48 md:h-5" />
            <div className="mb-3 w-full h-3 rounded skeleton sm:mb-3.5 sm:h-3.5 md:mb-4 md:h-4" />
            <div className="w-3/4 h-3 rounded skeleton sm:h-3.5 md:h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Email Management Shimmer
export const EmailManagementShimmer: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Primary Email Section */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
        <div className="flex gap-1.5 items-center mb-3 sm:gap-2 sm:mb-3.5 md:mb-4">
          <div className="w-5 h-5 rounded skeleton sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 shrink-0" />
          <div className="w-full h-5 rounded skeleton sm:w-28 sm:h-5.5 md:w-32 md:h-6" />
        </div>
        <div className="flex flex-col gap-2 justify-between items-start p-3 rounded-lg border glass border-primary-200/30 sm:flex-row sm:items-center sm:gap-0 sm:p-3.5 md:p-4">
          <div className="flex flex-1 gap-2 items-center w-full sm:gap-2.5 md:gap-3">
            <div className="w-9 h-9 rounded-lg skeleton sm:w-9.5 sm:h-9.5 md:w-10 md:h-10 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 items-center sm:gap-2">
                <div className="w-full h-4 rounded skeleton sm:w-44 sm:h-4.5 md:w-48 md:h-5" />
                <div className="w-full h-4 rounded-full skeleton sm:w-18 sm:h-4.5 md:w-20 md:h-5" />
              </div>
              <div className="flex gap-1.5 items-center mt-1 sm:gap-2">
                <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Emails Section */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-secondary-200/30 sm:p-5 md:p-6">
        <div className="flex flex-col gap-2 justify-between items-start mb-3 sm:flex-row sm:items-center sm:mb-3.5 sm:gap-0 md:mb-4">
          <div className="flex gap-1.5 items-center sm:gap-2">
            <div className="w-5 h-5 rounded skeleton sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 shrink-0" />
            <div className="w-full h-5 rounded skeleton sm:w-36 sm:h-5.5 md:w-40 md:h-6" />
          </div>
          <div className="w-full h-3 rounded skeleton sm:w-18 sm:h-3.5 md:w-20 md:h-4" />
        </div>
        <div className="mb-3 space-y-2.5 sm:mb-3.5 sm:space-y-3 md:mb-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-2 justify-between items-start p-3 rounded-lg border glass border-secondary-200/30 sm:flex-row sm:items-center sm:gap-0 sm:p-3.5 md:p-4"
            >
              <div className="flex flex-1 gap-2 items-center w-full sm:gap-2.5 md:gap-3">
                <div className="w-9 h-9 rounded-lg skeleton sm:w-9.5 sm:h-9.5 md:w-10 md:h-10 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="w-full h-4 rounded skeleton sm:w-44 sm:h-4.5 md:w-48 md:h-5" />
                  <div className="flex gap-2 items-center mt-1 sm:gap-2.5 md:gap-3">
                    <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 items-center w-full sm:gap-2 sm:w-auto">
                <div className="w-full h-7 rounded skeleton sm:w-24 sm:h-7.5 md:w-28 md:h-8" />
                <div className="w-full h-9 rounded skeleton sm:w-9 sm:h-9 md:w-10 md:h-10" />
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-lg border glass border-info-200/30 bg-gradient-info/5 sm:p-3.5 md:p-4">
          <div className="mb-2 w-full h-4 rounded skeleton sm:w-36 sm:h-4.5 md:w-40 md:h-5" />
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <div className="flex-1 h-10 rounded skeleton sm:h-10.5 md:h-11" />
            <div className="w-full h-10 rounded skeleton sm:w-28 sm:h-10.5 md:w-32 md:h-11" />
          </div>
          <div className="mt-2 w-full h-3 rounded skeleton sm:w-60 sm:h-3.5 md:w-64 md:h-4" />
        </div>
      </div>
    </div>
  );
};

// Security Settings Tab Shimmer
export const SecuritySettingsShimmer: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Prompt Firewall & Cost Shield */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-warning-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center mb-4 sm:gap-2.5 sm:mb-5 md:gap-3 md:mb-6">
          <div className="w-8 h-8 rounded-xl skeleton sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0" />
          <div className="w-full h-5 rounded skeleton sm:w-60 sm:h-5.5 md:w-64 md:h-6" />
        </div>
        <div className="p-4 rounded-lg border glass border-primary-200/30 sm:p-5 md:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 text-center rounded-lg border glass border-info-200/30 sm:p-3.5 md:p-4">
                <div className="mx-auto mb-2 w-full h-7 rounded skeleton sm:w-14 sm:h-7.5 md:w-16 md:h-8" />
                <div className="mx-auto w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Email Management */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-info-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center mb-4 sm:gap-2.5 sm:mb-5 md:gap-3 md:mb-6">
          <div className="w-8 h-8 rounded-xl skeleton sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0" />
          <div className="w-full h-5 rounded skeleton sm:w-36 sm:h-5.5 md:w-40 md:h-6" />
        </div>
        <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-3 rounded-lg border glass border-primary-200/30 sm:p-3.5 md:p-4"
            >
              <div className="flex flex-col gap-2 justify-between items-start sm:flex-row sm:items-center sm:gap-0">
                <div className="flex-1 min-w-0 w-full">
                  <div className="mb-2 w-full h-4 rounded skeleton sm:w-28 sm:h-4.5 md:w-32 md:h-5" />
                  <div className="w-full h-3 rounded skeleton sm:w-44 sm:h-3.5 md:w-48 md:h-4" />
                </div>
                <div className="w-full h-7 rounded skeleton sm:w-20 sm:h-7.5 md:w-24 md:h-8" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-secondary-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center mb-4 sm:gap-2.5 sm:mb-5 md:gap-3 md:mb-6">
          <div className="w-8 h-8 rounded-xl skeleton sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0" />
          <div className="w-full h-5 rounded skeleton sm:w-52 sm:h-5.5 md:w-56 md:h-6" />
        </div>
        <div className="p-4 rounded-lg border glass border-primary-200/30 sm:p-5 md:p-6">
          <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
            <div className="w-full h-11 rounded-lg skeleton sm:h-11.5 md:h-12" />
            <div className="w-full h-11 rounded-lg skeleton sm:h-11.5 md:h-12" />
          </div>
        </div>
      </div>

      {/* Backup Codes */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center mb-4 sm:gap-2.5 sm:mb-5 md:gap-3 md:mb-6">
          <div className="w-8 h-8 rounded-xl skeleton sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0" />
          <div className="w-full h-5 rounded skeleton sm:w-28 sm:h-5.5 md:w-32 md:h-6" />
        </div>
        <div className="p-4 rounded-lg border glass border-primary-200/30 sm:p-5 md:p-6">
          <div className="mb-3 w-full h-11 rounded-lg skeleton sm:mb-3.5 sm:h-11.5 md:mb-4 md:h-12" />
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="w-full h-9 rounded skeleton sm:h-9.5 md:h-10" />
            ))}
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-info-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center mb-4 sm:gap-2.5 sm:mb-5 md:gap-3 md:mb-6">
          <div className="w-8 h-8 rounded-xl skeleton sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0" />
          <div className="w-full h-5 rounded skeleton sm:w-32 sm:h-5.5 md:w-36 md:h-6" />
        </div>
        <div className="p-4 rounded-lg border glass border-info-200/30 sm:p-5 md:p-6">
          <div className="space-y-2.5 sm:space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-2 justify-between items-start p-3 rounded-lg border glass border-primary-200/30 sm:flex-row sm:items-center sm:gap-0 sm:p-3.5 md:p-4"
              >
                <div className="flex-1 min-w-0 w-full">
                  <div className="mb-2 w-full h-4 rounded skeleton sm:w-28 sm:h-4.5 md:w-32 md:h-5" />
                  <div className="w-full h-3 rounded skeleton sm:w-44 sm:h-3.5 md:w-48 md:h-4" />
                </div>
                <div className="w-full h-7 rounded skeleton sm:w-20 sm:h-7.5 md:w-24 md:h-8" />
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
    <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
      {/* Header */}
      <div className="flex gap-2 items-center mb-4 sm:gap-2.5 sm:mb-5 md:gap-3 md:mb-6">
        <div className="w-8 h-8 rounded-xl skeleton sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0" />
        <div className="w-full h-5 rounded skeleton sm:w-44 sm:h-5.5 md:w-48 md:h-6" />
      </div>

      {/* Description */}
      <div className="p-3 mb-4 rounded-lg border glass border-info-200/30 sm:p-3.5 sm:mb-5 md:p-4 md:mb-6">
        <div className="w-full h-3 rounded skeleton sm:h-3.5 md:h-4" />
      </div>

      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* Enable Session Replay */}
        <div className="p-4 rounded-lg border glass border-primary-200/30 sm:p-5 md:p-6">
          <div className="flex flex-col gap-2 justify-between items-start mb-3 sm:flex-row sm:items-center sm:mb-3.5 sm:gap-0 md:mb-4">
            <div className="flex-1 min-w-0 w-full">
              <div className="mb-2 w-full h-4 rounded skeleton sm:w-36 sm:h-4.5 md:w-40 md:h-5" />
              <div className="w-full h-3 rounded skeleton sm:h-3.5 md:h-4" />
            </div>
            <div className="w-full h-5 rounded-full skeleton sm:w-10 sm:h-5.5 md:w-11 md:h-6" />
          </div>
        </div>

        {/* Session Timeout */}
        <div className="p-4 rounded-lg border glass border-primary-200/30 sm:p-5 md:p-6">
          <div className="mb-3 w-full h-4 rounded skeleton sm:mb-3.5 sm:w-36 sm:h-4.5 md:mb-4 md:w-40 md:h-5" />
          <div className="mb-2 w-full h-10 rounded-lg skeleton sm:h-10.5 md:h-11" />
          <div className="w-full h-3 rounded skeleton sm:w-60 sm:h-3.5 md:w-64 md:h-4" />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <div className="w-full h-10 rounded-lg skeleton sm:w-28 sm:h-10.5 md:w-32 md:h-11" />
        </div>
      </div>
    </div>
  );
};

// Team Management Tab Shimmer
export const TeamManagementShimmer: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header with Workspace Switcher */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
        <div className="flex flex-col gap-3 justify-between items-start mb-3 sm:flex-row sm:items-center sm:mb-3.5 sm:gap-0 md:mb-4">
          <div className="w-full h-9 rounded-lg skeleton sm:w-44 sm:h-9.5 md:w-48 md:h-10" />
          <div className="w-full h-5 rounded skeleton sm:w-28 sm:h-5.5 md:w-32 md:h-6" />
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1.5 overflow-x-auto sm:gap-2">
          <div className="w-full h-9 rounded-xl skeleton sm:w-36 sm:h-9.5 md:w-40 md:h-10 min-w-max" />
          <div className="w-full h-9 rounded-xl skeleton sm:w-28 sm:h-9.5 md:w-32 md:h-10 min-w-max" />
        </div>
      </div>

      {/* Workspace Settings / Team Members */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
        <div className="mb-4 w-full h-5 rounded skeleton sm:mb-5 sm:w-44 sm:h-5.5 md:mb-6 md:w-48 md:h-6" />

        {/* Search and Add Button */}
        <div className="flex flex-col gap-2 items-stretch mb-4 sm:flex-row sm:items-center sm:gap-3 sm:mb-5 md:gap-4 md:mb-6">
          <div className="flex-1 h-10 rounded-lg skeleton sm:h-10.5 md:h-11" />
          <div className="w-full h-10 rounded-lg skeleton sm:w-28 sm:h-10.5 md:w-32 md:h-11" />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border glass border-primary-200/30">
          <table className="w-full min-w-max">
            <thead className="bg-gradient-to-r border-b from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/10 border-primary-200/30">
              <tr>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <th key={i} className="px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4">
                    <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-200/10">
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row}>
                  {[1, 2, 3, 4, 5, 6].map((col) => (
                    <td key={col} className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
                      <div className="w-full h-3 rounded skeleton sm:w-16 sm:h-3.5 md:w-20 md:h-4" />
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
    <div className="py-4 sm:py-5 md:py-6">
      <div className="p-4 mb-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6 sm:mb-5 md:p-8 md:mb-6">
        <div className="flex gap-3 items-center mb-4 sm:gap-3.5 sm:mb-5 md:gap-4 md:mb-6">
          <div className="w-10 h-10 rounded-xl skeleton sm:w-11 sm:h-11 md:w-12 md:h-12 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="mb-1 w-full h-6 rounded skeleton sm:w-28 sm:h-6.5 md:w-32 md:h-7" />
            <div className="w-full h-3 rounded skeleton sm:w-76 sm:h-3.5 md:w-80 md:h-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 sm:gap-3.5 sm:mb-5 md:gap-4 md:mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 sm:p-4.5 md:p-5">
              <div className="flex flex-col gap-2 justify-between items-start mb-2 sm:flex-row sm:items-center sm:mb-2.5 sm:gap-0 md:mb-3">
                <div className="flex gap-2 items-center w-full sm:gap-2.5 md:gap-3">
                  <div className="w-9 h-9 rounded-xl skeleton sm:w-9.5 sm:h-9.5 md:w-10 md:h-10 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 w-full h-4 rounded skeleton sm:w-20 sm:h-4.5 md:w-24 md:h-5" />
                    <div className="w-full h-2.5 rounded skeleton sm:w-28 sm:h-3 md:w-32" />
                  </div>
                </div>
                <div className="w-full h-5 rounded-full skeleton sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
              </div>
            </div>
          ))}
        </div>

        <div className="w-full h-10 rounded-xl skeleton sm:h-11 md:h-12" />
      </div>
    </div>
  );
};

// Account Closure Tab Shimmer
export const AccountClosureShimmer: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Warning Section */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-warning-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center mb-3 sm:gap-2.5 sm:mb-3.5 md:gap-3 md:mb-4">
          <div className="w-8 h-8 rounded-xl skeleton sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0" />
          <div className="w-full h-5 rounded skeleton sm:w-44 sm:h-5.5 md:w-48 md:h-6" />
        </div>
        <div className="mb-2 w-full h-3 rounded skeleton sm:h-3.5 md:h-4" />
        <div className="w-3/4 h-3 rounded skeleton sm:h-3.5 md:h-4" />
      </div>

      {/* Danger Zone */}
      <div className="p-4 rounded-xl border glass border-danger-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center mb-3 sm:gap-2.5 sm:mb-3.5 md:gap-3 md:mb-4">
          <div className="w-8 h-8 rounded-xl skeleton sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0" />
          <div className="w-full h-5 rounded skeleton sm:w-28 sm:h-5.5 md:w-32 md:h-6" />
        </div>
        <div className="mb-3 w-full h-3 rounded skeleton sm:mb-3.5 sm:h-3.5 md:mb-4 md:h-4" />
        <div className="w-full h-10 rounded-lg skeleton sm:w-36 sm:h-10.5 md:w-40 md:h-11" />
      </div>
    </div>
  );
};

// Main Settings Shimmer Component
export const SettingsShimmer: React.FC<{
  activeTab?: 'profile' | 'api-keys' | 'notifications' | 'security' | 'session-replay' | 'team' | 'integrations' | 'account';
}> = ({ activeTab = 'profile' }) => {
  return (
    <div className="px-3 py-4 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient sm:px-4 sm:py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl lg:px-8">
        <SettingsHeaderShimmer />

        <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          {/* Tabs */}
          <div className="p-1.5 mb-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-2 sm:mb-5 md:mb-6">
            <div className="flex overflow-x-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex-1 mx-0.5 h-12 rounded-lg skeleton sm:mx-1 sm:h-14 md:h-16 min-w-max" />
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-5 md:p-6">
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

