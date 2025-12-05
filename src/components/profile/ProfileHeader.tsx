import React from "react";
import { Camera, Building2, Briefcase, Calendar } from "lucide-react";
import { User } from "../../types";

interface ProfileHeaderProps {
  user: User;
  onAvatarChange?: (file: File) => void;
  editable?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onAvatarChange,
  editable = false,
}) => {
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n?.[0])
      .join("")
      .toUpperCase() || user.email?.[0].toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarChange) {
      onAvatarChange(file);
    }
  };

  // Get subscription plan with fallback
  const subscriptionPlan = user.subscription?.plan?.toLowerCase() || "free";
  const subscriptionStatus = user.subscription?.status;

  return (
    <div className="p-4 sm:p-6 md:p-8 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-8">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="flex justify-center items-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-xl sm:text-2xl md:text-3xl font-bold text-white rounded-2xl shadow-lg font-display bg-gradient-primary">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="object-cover w-full h-full rounded-2xl"
              />
            ) : (
              initials
            )}
          </div>
          {editable && (
            <label className="absolute -right-1 -bottom-1 sm:-right-2 sm:-bottom-2 p-2 sm:p-3 rounded-full border shadow-xl transition-all duration-200 cursor-pointer glass hover:scale-110 border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-light-text-primary dark:text-dark-text-primary" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <h1 className="mb-1 sm:mb-2 text-xl sm:text-2xl md:text-3xl font-bold font-display gradient-text-primary truncate">
            {user.name || "User"}
          </h1>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base md:text-lg font-body text-light-text-secondary dark:text-dark-text-secondary truncate">
            {user.email}
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 items-center">
            {user.company && (
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <span className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm font-body text-light-text-primary dark:text-dark-text-primary">
                  <div className="flex justify-center items-center w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-primary">
                    <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </div>
                  <span className="truncate max-w-[120px] sm:max-w-none">{user.company}</span>
                </span>
              </div>
            )}
            {user.role && (
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border glass border-secondary-200/30 dark:border-secondary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <span className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm font-body text-light-text-primary dark:text-dark-text-primary">
                  <div className="flex justify-center items-center w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-secondary">
                    <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </div>
                  <span className="truncate max-w-[120px] sm:max-w-none">{user.role}</span>
                </span>
              </div>
            )}
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border glass border-accent-200/30 dark:border-accent-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <span className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm font-body text-light-text-primary dark:text-dark-text-primary">
                <div className="flex justify-center items-center w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-accent">
                  <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
                <span className="whitespace-nowrap">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Badge */}
        <div className="w-full sm:w-auto text-left sm:text-right self-start sm:self-auto">
          <div className="p-3 sm:p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-success-200/30 dark:border-success-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <span
              className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm md:text-base font-display font-bold text-white shadow-lg ${subscriptionPlan === "pro"
                  ? "bg-gradient-secondary"
                  : subscriptionPlan === "enterprise"
                    ? "bg-gradient-warning"
                    : "bg-gradient-primary"
                }`}
            >
              {subscriptionPlan.charAt(0).toUpperCase() + subscriptionPlan.slice(1)} Plan
            </span>
            {subscriptionStatus === "active" &&
              user.subscription?.currentPeriodEnd && (
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Renews{" "}
                  {new Date(
                    user.subscription.currentPeriodEnd,
                  ).toLocaleDateString()}
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
