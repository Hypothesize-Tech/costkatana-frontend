// src/components/profile/ProfilePreferences.tsx
import React, { useState } from "react";
import { Switch } from "../common/Switch";

interface ProfilePreferencesProps {
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    theme: "light" | "dark" | "system";
    emailDigest: "daily" | "weekly" | "monthly" | "never";
    autoOptimize: boolean;
    showCostInHeader: boolean;
    enableBetaFeatures: boolean;
  };
  onUpdate: (preferences: any) => void;
}

export const ProfilePreferences: React.FC<ProfilePreferencesProps> = ({
  preferences,
  onUpdate,
}) => {
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: string, value: any) => {
    setLocalPreferences({ ...localPreferences, [key]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(localPreferences);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Preferences</h2>

      <div className="space-y-6">
        {/* Display Preferences */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Display Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={localPreferences.language}
                onChange={(e) => handleChange("language", e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                value={localPreferences.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Format
              </label>
              <select
                value={localPreferences.dateFormat}
                onChange={(e) => handleChange("dateFormat", e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={localPreferences.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CNY">CNY (¥)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Theme */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Appearance</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["light", "dark", "system"] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleChange("theme", theme)}
                    className={`px-4 py-2 text-sm font-medium rounded-md border ${
                      localPreferences.theme === theme
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Email Preferences */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Email Preferences
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Digest Frequency
            </label>
            <select
              value={localPreferences.emailDigest}
              onChange={(e) => handleChange("emailDigest", e.target.value)}
              className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>

        {/* Feature Toggles */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Features</h3>
          <div className="space-y-4">
            <Switch
              checked={localPreferences.autoOptimize}
              onChange={(checked) => handleChange("autoOptimize", checked)}
              label="Auto-optimize prompts"
              description="Automatically apply optimizations to frequently used prompts"
            />
            <Switch
              checked={localPreferences.showCostInHeader}
              onChange={(checked) => handleChange("showCostInHeader", checked)}
              label="Show current month cost in header"
              description="Display your current month's spending in the navigation bar"
            />
            <Switch
              checked={localPreferences.enableBetaFeatures}
              onChange={(checked) =>
                handleChange("enableBetaFeatures", checked)
              }
              label="Enable beta features"
              description="Get early access to new features that are still in testing"
            />
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
