import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "../../types";
import { ProfileSettingsShimmer } from "../shimmer/SettingsShimmer";
import { CheckCircle, AlertCircle, User as UserIcon, BarChart3 } from "lucide-react";
import { emailService } from "../../services/email.service";
import { userService } from "../../services/user.service";
import { useNotifications } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";

interface ProfileSettingsProps {
  profile: User | undefined;
  onUpdate: (data: any) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profile,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    timezone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const { showNotification } = useNotifications();
  const { user } = useAuth();

  // Fetch user stats to get accurate usage data
  const { data: stats, } = useQuery(
    ['user-stats', user?.id],
    () => userService.getUserStats(),
    {
      enabled: !!user?.id,
      retry: 1,
    }
  );


  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        company: profile.company || "",
        role: profile.role || "",
        timezone: profile.preferences?.timezone || "UTC",
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleResendVerification = async () => {
    if (!profile?.email) return;

    try {
      setResendingVerification(true);
      await emailService.resendVerification(profile.email);
      showNotification("Verification email sent! Please check your inbox.", "success");
    } catch (error: any) {
      showNotification(error.message || "Failed to send verification email", "error");
    } finally {
      setResendingVerification(false);
    }
  };

  // Only show shimmer if profile is not available and we're not in an error state
  // The parent component (Settings) handles the initial loading state
  if (!profile) {
    return <ProfileSettingsShimmer />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center sm:gap-2.5 md:gap-3">
          <div className="flex justify-center items-center w-8 h-8 rounded-xl bg-gradient-accent glow-accent sm:w-9 sm:h-9 md:w-10 md:h-10">
            <UserIcon className="w-4 h-4 text-white sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
          </div>
          <h2 className="text-lg font-bold font-display gradient-text sm:text-xl md:text-xl">
            Profile Information
          </h2>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-6 sm:space-y-6 md:p-8 md:space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6">
          <div>
            <label
              htmlFor="name"
              className="block mb-2 font-medium font-display gradient-text"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={!isEditing}
              className={`input ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium font-display gradient-text sm:text-base"
            >
              Email Address (Primary)
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={formData.email}
                disabled
                className="opacity-60 cursor-not-allowed input pr-24 sm:pr-28"
              />
              {profile.emailVerified ? (
                <div className="flex absolute right-2 top-1/2 gap-1 items-center -translate-y-1/2 text-success-600 dark:text-success-400 sm:right-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs font-body sm:text-sm">Verified</span>
                </div>
              ) : (
                <div className="flex absolute right-2 top-1/2 gap-1 items-center -translate-y-1/2 text-warning-600 dark:text-warning-400 sm:right-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs font-body sm:text-sm">Not Verified</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 mt-2 sm:flex-row sm:justify-between sm:items-center">
              <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                This is your primary email. Manage additional emails in Security settings.
              </p>
              {!profile.emailVerified && (
                <button
                  onClick={handleResendVerification}
                  disabled={resendingVerification}
                  className="text-xs underline whitespace-nowrap font-body text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 disabled:opacity-50 self-start sm:ml-2 sm:text-sm"
                >
                  {resendingVerification ? "Sending..." : "Resend Verification"}
                </button>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="company"
              className="block mb-2 font-medium font-display gradient-text"
            >
              Company
            </label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
              disabled={!isEditing}
              className={`input ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block mb-2 font-medium font-display gradient-text"
            >
              Role
            </label>
            <input
              type="text"
              id="role"
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
              disabled={!isEditing}
              className={`input ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label
              htmlFor="timezone"
              className="block mb-2 font-medium font-display gradient-text"
            >
              Timezone
            </label>
            <select
              id="timezone"
              value={formData.timezone}
              onChange={(e) => handleChange("timezone", e.target.value)}
              disabled={!isEditing}
              className={`input ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Shanghai">Shanghai</option>
              <option value="Australia/Sydney">Sydney</option>
            </select>
          </div>
        </div>

        {/* Account Information - Responsive */}
        <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-info-200/30 sm:p-5 md:p-6">
          <div className="flex gap-2 items-center mb-4 sm:gap-2.5 sm:mb-5 md:gap-3 md:mb-6">
            <div className="flex justify-center items-center w-7 h-7 rounded-lg bg-gradient-info glow-info sm:w-8 sm:h-8">
              <BarChart3 className="w-3.5 h-3.5 text-white sm:w-4 sm:h-4" />
            </div>
            <h3 className="text-base font-semibold font-display gradient-text sm:text-lg md:text-lg">
              Account Information
            </h3>
          </div>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6">
            <div className="p-3 rounded-lg border glass border-primary-200/30 sm:p-3.5 md:p-4">
              <dt className="mb-1.5 text-sm font-medium font-display gradient-text sm:mb-2 md:text-base">
                Account Created
              </dt>
              <dd className="text-sm font-body text-light-text-primary dark:text-dark-text-primary sm:text-base">
                {new Date(profile.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div className="p-3 rounded-lg border glass border-primary-200/30 sm:p-3.5 md:p-4">
              <dt className="mb-1.5 text-sm font-medium font-display gradient-text sm:mb-2 md:text-base">
                Subscription Status
              </dt>
              <dd>
                <span
                  className={`glass px-2.5 py-0.5 rounded-full text-xs font-display font-semibold border sm:px-3 sm:py-1 sm:text-sm ${profile.subscription?.status === "active"
                    ? "border-success-200/30 bg-gradient-success/20 text-success-700 dark:text-success-300"
                    : "border-accent-200/30 bg-gradient-accent/20 text-accent-700 dark:text-accent-300"
                    }`}
                >
                  {profile.subscription?.status || "Free"}
                </span>
              </dd>
            </div>
            <div className="p-3 rounded-lg border glass border-primary-200/30 sm:p-3.5 md:p-4">
              <dt className="mb-1.5 text-sm font-medium font-display gradient-text sm:mb-2 md:text-base">
                Total Usage
              </dt>
              <dd className="text-base font-semibold font-display gradient-text-success sm:text-lg md:text-xl">
                ${(stats?.totalSpent ?? profile.usage?.currentMonth?.totalCost ?? 0).toFixed(2)}
              </dd>
            </div>
            <div className="p-3 rounded-lg border glass border-primary-200/30 sm:p-3.5 md:p-4">
              <dt className="mb-1.5 text-sm font-medium font-display gradient-text sm:mb-2 md:text-base">
                Total Optimizations
              </dt>
              <dd className="text-base font-semibold font-display gradient-text-secondary sm:text-lg md:text-xl">
                {(stats?.optimizations ?? profile.usage?.currentMonth?.optimizationsSaved ?? 0).toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Action Buttons - Responsive */}
        <div className="flex flex-col gap-2 justify-end pt-4 border-t border-primary-200/30 sm:flex-row sm:gap-3 sm:pt-5 md:pt-6">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn-primary btn w-full sm:w-auto"
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
