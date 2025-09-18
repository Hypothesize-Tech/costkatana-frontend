// src/components/profile/ProfileHeader.tsx
import React from "react";
import { User } from "../../types";
import { CameraIcon } from "@heroicons/react/24/outline";

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
    <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="flex items-center space-x-8">
        {/* Avatar */}
        <div className="relative">
          <div className="flex justify-center items-center w-28 h-28 text-3xl font-display font-bold text-white bg-gradient-primary rounded-2xl shadow-lg">
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
            <label className="absolute -bottom-2 -right-2 glass rounded-full p-3 shadow-xl cursor-pointer hover:scale-110 transition-all duration-200 border border-primary-200/30">
              <CameraIcon className="w-5 h-5 text-light-text-primary dark:text-dark-text-primary" />
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
          <h1 className="text-3xl font-display font-bold gradient-text-primary mb-2">
            {user.name || "User"}
          </h1>
          <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-lg mb-4">{user.email}</p>
          <div className="flex items-center flex-wrap gap-4">
            {user.company && (
              <div className="glass rounded-lg px-4 py-2 border border-primary-200/30">
                <span className="flex items-center gap-2 font-body text-light-text-primary dark:text-dark-text-primary">
                  <div className="w-4 h-4 rounded bg-gradient-primary flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H7a1 1 0 00-1 1v6a1 1 0 01-1 1H2a1 1 0 110-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {user.company}
                </span>
              </div>
            )}
            {user.role && (
              <div className="glass rounded-lg px-4 py-2 border border-secondary-200/30">
                <span className="flex items-center gap-2 font-body text-light-text-primary dark:text-dark-text-primary">
                  <div className="w-4 h-4 rounded bg-gradient-secondary flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {user.role}
                </span>
              </div>
            )}
            <div className="glass rounded-lg px-4 py-2 border border-accent-200/30">
              <span className="flex items-center gap-2 font-body text-light-text-primary dark:text-dark-text-primary">
                <div className="w-4 h-4 rounded bg-gradient-accent flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                Joined{" "}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Recently"}
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Badge */}
        <div className="text-right">
          <div className="glass rounded-xl p-4 border border-success-200/30 shadow-lg backdrop-blur-xl">
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
                <p className="mt-3 font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
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
