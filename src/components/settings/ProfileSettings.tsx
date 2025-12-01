// src/components/settings/ProfileSettings.tsx
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "../../types";
import { LoadingSpinner } from "../common/LoadingSpinner";
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

  if (!profile) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
        <div className="flex gap-3 items-center">
          <div className="flex justify-center items-center w-10 h-10 rounded-xl bg-gradient-accent glow-accent">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold font-display gradient-text">
            Profile Information
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              className="block mb-2 font-medium font-display gradient-text"
            >
              Email Address (Primary)
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={formData.email}
                disabled
                className="opacity-60 cursor-not-allowed input"
              />
              {profile.emailVerified ? (
                <div className="flex absolute right-3 top-1/2 gap-1 items-center -translate-y-1/2 text-success-600 dark:text-success-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-body">Verified</span>
                </div>
              ) : (
                <div className="flex absolute right-3 top-1/2 gap-1 items-center -translate-y-1/2 text-warning-600 dark:text-warning-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-body">Not Verified</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                This is your primary email. Manage additional emails in Security settings.
              </p>
              {!profile.emailVerified && (
                <button
                  onClick={handleResendVerification}
                  disabled={resendingVerification}
                  className="ml-2 text-sm underline whitespace-nowrap font-body text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 disabled:opacity-50"
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

        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-info-200/30">
          <div className="flex gap-3 items-center mb-6">
            <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-gradient-info glow-info">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold font-display gradient-text">
              Account Information
            </h3>
          </div>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="p-4 rounded-lg border glass border-primary-200/30">
              <dt className="mb-2 font-medium font-display gradient-text">
                Account Created
              </dt>
              <dd className="font-body text-light-text-primary dark:text-dark-text-primary">
                {new Date(profile.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div className="p-4 rounded-lg border glass border-primary-200/30">
              <dt className="mb-2 font-medium font-display gradient-text">
                Subscription Status
              </dt>
              <dd>
                <span
                  className={`glass px-3 py-1 rounded-full font-display font-semibold border ${profile.subscription?.status === "active"
                    ? "border-success-200/30 bg-gradient-success/20 text-success-700 dark:text-success-300"
                    : "border-accent-200/30 bg-gradient-accent/20 text-accent-700 dark:text-accent-300"
                    }`}
                >
                  {profile.subscription?.status || "Free"}
                </span>
              </dd>
            </div>
            <div className="p-4 rounded-lg border glass border-primary-200/30">
              <dt className="mb-2 font-medium font-display gradient-text">
                Total Usage
              </dt>
              <dd className="font-semibold font-display gradient-text-success">
                ${(stats?.totalSpent ?? profile.usage?.currentMonth?.totalCost ?? 0).toFixed(2)}
              </dd>
            </div>
            <div className="p-4 rounded-lg border glass border-primary-200/30">
              <dt className="mb-2 font-medium font-display gradient-text">
                Total Optimizations
              </dt>
              <dd className="font-semibold font-display gradient-text-secondary">
                {(stats?.optimizations ?? profile.usage?.currentMonth?.optimizationsSaved ?? 0).toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex gap-3 justify-end pt-6 border-t border-primary-200/30">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn-primary btn"
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
