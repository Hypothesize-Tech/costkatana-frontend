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
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
          <span className="text-white text-lg">⚙️</span>
        </div>
        <h2 className="text-2xl font-display font-bold gradient-text-primary">Preferences</h2>
      </div>

      <div className="space-y-8">
        {/* Display Preferences */}
        <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-white text-sm">🎨</span>
            </div>
            <h3 className="font-display font-semibold gradient-text-primary text-lg">
              Display Settings
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                Language
              </label>
              <select
                value={localPreferences.language}
                onChange={(e) => handleChange("language", e.target.value)}
                className="input"
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
              <label className="block font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                Timezone
              </label>
              <select
                value={localPreferences.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                className="input"
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
              <label className="block font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                Date Format
              </label>
              <select
                value={localPreferences.dateFormat}
                onChange={(e) => handleChange("dateFormat", e.target.value)}
                className="input"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                Currency
              </label>
              <select
                value={localPreferences.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="input"
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
        <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
              <span className="text-white text-sm">🌌</span>
            </div>
            <h3 className="font-display font-semibold gradient-text-secondary text-lg">Appearance</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-4">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(["light", "dark", "system"] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleChange("theme", theme)}
                    className={`px-6 py-3 font-display font-medium rounded-xl border transition-all duration-200 ${localPreferences.theme === theme
                      ? "border-primary-500 bg-gradient-primary/20 text-primary-700 dark:text-primary-300 scale-105 shadow-lg"
                      : "glass border-primary-200/30 text-light-text-primary dark:text-dark-text-primary hover:border-primary-300/50 hover:scale-105"
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
        <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
              <span className="text-white text-sm">📧</span>
            </div>
            <h3 className="font-display font-semibold gradient-text-accent text-lg">
              Email Preferences
            </h3>
          </div>
          <div>
            <label className="block font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
              Email Digest Frequency
            </label>
            <select
              value={localPreferences.emailDigest}
              onChange={(e) => handleChange("emailDigest", e.target.value)}
              className="input max-w-xs"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
              <span className="text-white text-sm">✨</span>
            </div>
            <h3 className="font-display font-semibold gradient-text-success text-lg">Features</h3>
          </div>
          <div className="space-y-6">
            <div className="glass rounded-lg p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl">
              <Switch
                checked={localPreferences.autoOptimize}
                onChange={(checked) => handleChange("autoOptimize", checked)}
                label="Auto-optimize prompts"
                description="Automatically apply optimizations to frequently used prompts"
              />
            </div>
            <div className="glass rounded-lg p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl">
              <Switch
                checked={localPreferences.showCostInHeader}
                onChange={(checked) => handleChange("showCostInHeader", checked)}
                label="Show current month cost in header"
                description="Display your current month's spending in the navigation bar"
              />
            </div>
            <div className="glass rounded-lg p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl">
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
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end space-x-4 pt-8 border-t border-primary-200/30">
            <button
              onClick={handleReset}
              className="btn-secondary"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}