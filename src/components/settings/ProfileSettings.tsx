// src/components/settings/ProfileSettings.tsx
import React, { useState, useEffect } from "react";
import { User } from "../../types";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { emailService } from "../../services/email.service";
import { useNotifications } from "../../contexts/NotificationContext";

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
      <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center glow-accent">
            <span className="text-white text-lg">👤</span>
          </div>
          <h2 className="text-xl font-display font-bold gradient-text">
            Profile Information
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl space-y-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block font-display font-medium gradient-text mb-2"
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
              className="block font-display font-medium gradient-text mb-2"
            >
              Email Address (Primary)
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={formData.email}
                disabled
                className="input opacity-60 cursor-not-allowed"
              />
              {profile.emailVerified ? (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-success-600 dark:text-success-400">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span className="text-sm font-body">Verified</span>
                </div>
              ) : (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-warning-600 dark:text-warning-400">
                  <ExclamationCircleIcon className="h-5 w-5" />
                  <span className="text-sm font-body">Not Verified</span>
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                This is your primary email. Manage additional emails in Security settings.
              </p>
              {!profile.emailVerified && (
                <button
                  onClick={handleResendVerification}
                  disabled={resendingVerification}
                  className="text-sm font-body text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline disabled:opacity-50 whitespace-nowrap ml-2"
                >
                  {resendingVerification ? "Sending..." : "Resend Verification"}
                </button>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="company"
              className="block font-display font-medium gradient-text mb-2"
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
              className="block font-display font-medium gradient-text mb-2"
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
              className="block font-display font-medium gradient-text mb-2"
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

        <div className="glass rounded-xl p-6 border border-info-200/30 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-info flex items-center justify-center glow-info">
              <span className="text-white text-sm">📊</span>
            </div>
            <h3 className="font-display font-semibold gradient-text text-lg">
              Account Information
            </h3>
          </div>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="glass rounded-lg p-4 border border-primary-200/30">
              <dt className="font-display font-medium gradient-text mb-2">
                Account Created
              </dt>
              <dd className="font-body text-light-text-primary dark:text-dark-text-primary">
                {new Date(profile.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div className="glass rounded-lg p-4 border border-primary-200/30">
              <dt className="font-display font-medium gradient-text mb-2">
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
            <div className="glass rounded-lg p-4 border border-primary-200/30">
              <dt className="font-display font-medium gradient-text mb-2">
                Monthly Usage
              </dt>
              <dd className="font-display font-semibold gradient-text-success">
                ${profile.usage?.currentMonth.totalCost.toFixed(2) || "0.00"}
              </dd>
            </div>
            <div className="glass rounded-lg p-4 border border-primary-200/30">
              <dt className="font-display font-medium gradient-text mb-2">
                Total Optimizations
              </dt>
              <dd className="font-display font-semibold gradient-text-secondary">
                {profile.usage?.currentMonth.optimizationsSaved.toFixed(2) ||
                  "0.00"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-primary-200/30">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
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
