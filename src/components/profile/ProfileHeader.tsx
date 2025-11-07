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

  return (
    <div className="p-8 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="flex items-center space-x-8">
        {/* Avatar */}
        <div className="relative">
          <div className="flex justify-center items-center w-28 h-28 text-3xl font-bold text-white rounded-2xl shadow-lg font-display bg-gradient-primary">
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
            <label className="absolute -right-2 -bottom-2 p-3 rounded-full border shadow-xl transition-all duration-200 cursor-pointer glass hover:scale-110 border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <Camera className="w-5 h-5 text-light-text-primary dark:text-dark-text-primary" />
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
        <div className="flex-1">
          <h1 className="mb-2 text-3xl font-bold font-display gradient-text-primary">
            {user.name || "User"}
          </h1>
          <p className="mb-4 text-lg font-body text-light-text-secondary dark:text-dark-text-secondary">
            {user.email}
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            {user.company && (
              <div className="px-4 py-2 rounded-lg border glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <span className="flex gap-2 items-center font-body text-light-text-primary dark:text-dark-text-primary">
                  <div className="flex justify-center items-center w-4 h-4 rounded bg-gradient-primary">
                    <Building2 className="w-3 h-3 text-white" />
                  </div>
                  {user.company}
                </span>
              </div>
            )}
            {user.role && (
              <div className="px-4 py-2 rounded-lg border glass border-secondary-200/30 dark:border-secondary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <span className="flex gap-2 items-center font-body text-light-text-primary dark:text-dark-text-primary">
                  <div className="flex justify-center items-center w-4 h-4 rounded bg-gradient-secondary">
                    <Briefcase className="w-3 h-3 text-white" />
                  </div>
                  {user.role}
                </span>
              </div>
            )}
            <div className="px-4 py-2 rounded-lg border glass border-accent-200/30 dark:border-accent-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <span className="flex gap-2 items-center font-body text-light-text-primary dark:text-dark-text-primary">
                <div className="flex justify-center items-center w-4 h-4 rounded bg-gradient-accent">
                  <Calendar className="w-3 h-3 text-white" />
                </div>
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Badge */}
        <div className="text-right">
          <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-success-200/30 dark:border-success-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-xl font-display font-bold text-white shadow-lg ${user.subscription?.plan === "pro"
                ? "bg-gradient-secondary"
                : user.subscription?.plan === "enterprise"
                  ? "bg-gradient-warning"
                  : "bg-gradient-primary"
                }`}
            >
              {user.subscription?.plan || "Free"} Plan
            </span>
            {user.subscription?.status === "active" &&
              user.subscription?.currentPeriodEnd && (
                <p className="mt-3 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
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
