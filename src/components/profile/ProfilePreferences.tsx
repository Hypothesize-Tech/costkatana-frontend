import React, { useState } from "react";
import { Settings, Palette, Moon, Mail, Sparkles } from "lucide-react";
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
  onUpdate: (preferences: ProfilePreferencesProps["preferences"]) => void;
}

export const ProfilePreferences: React.FC<ProfilePreferencesProps> = ({
  preferences,
  onUpdate,
}) => {
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (
    key: keyof ProfilePreferencesProps["preferences"],
    value: string | boolean,
  ) => {
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
      <div className="flex gap-4 items-center mb-8">
        <div className="flex justify-center items-center w-12 h-12 rounded-xl shadow-lg bg-gradient-primary">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold font-display gradient-text-primary">
          Preferences
        </h2>
      </div>

      <div className="space-y-8">
        {/* Display Preferences */}
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-3 items-center mb-6">
            <div className="flex justify-center items-center w-8 h-8 rounded-lg shadow-lg bg-gradient-primary">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold font-display gradient-text-primary">
              Display Settings
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-3 font-medium font-display text-light-text-primary dark:text-dark-text-primary">
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
              <label className="block mb-3 font-medium font-display text-light-text-primary dark:text-dark-text-primary">
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
              <label className="block mb-3 font-medium font-display text-light-text-primary dark:text-dark-text-primary">
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
              <label className="block mb-3 font-medium font-display text-light-text-primary dark:text-dark-text-primary">
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
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-secondary-200/30 dark:border-secondary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-3 items-center mb-6">
            <div className="flex justify-center items-center w-8 h-8 rounded-lg shadow-lg bg-gradient-secondary">
              <Moon className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold font-display gradient-text-secondary">
              Appearance
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block mb-4 font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(["light", "dark", "system"] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleChange("theme", theme)}
                    className={`btn px-6 py-3 font-display font-medium rounded-xl border transition-all duration-200 ${localPreferences.theme === theme
                      ? "border-primary-500 dark:border-primary-400 bg-gradient-primary/20 text-primary-700 dark:text-primary-300 scale-105 shadow-lg"
                      : "glass border-primary-200/30 dark:border-primary-700/30 text-light-text-primary dark:text-dark-text-primary hover:border-primary-300/50 dark:hover:border-primary-600/50 hover:scale-105"
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
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-accent-200/30 dark:border-accent-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-3 items-center mb-6">
            <div className="flex justify-center items-center w-8 h-8 rounded-lg shadow-lg bg-gradient-accent">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold font-display gradient-text-accent">
              Email Preferences
            </h3>
          </div>
          <div>
            <label className="block mb-3 font-medium font-display text-light-text-primary dark:text-dark-text-primary">
              Email Digest Frequency
            </label>
            <select
              value={localPreferences.emailDigest}
              onChange={(e) => handleChange("emailDigest", e.target.value)}
              className="max-w-xs input"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-success-200/30 dark:border-success-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-3 items-center mb-6">
            <div className="flex justify-center items-center w-8 h-8 rounded-lg shadow-lg bg-gradient-success">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold font-display gradient-text-success">
              Features
            </h3>
          </div>
          <div className="space-y-6">
            <div className="p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <Switch
                checked={localPreferences.autoOptimize}
                onChange={(checked) => handleChange("autoOptimize", checked)}
                label="Auto-optimize prompts"
                description="Automatically apply optimizations to frequently used prompts"
              />
            </div>
            <div className="p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <Switch
                checked={localPreferences.showCostInHeader}
                onChange={(checked) => handleChange("showCostInHeader", checked)}
                label="Show current month cost in header"
                description="Display your current month's spending in the navigation bar"
              />
            </div>
            <div className="p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
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
          <div className="flex justify-end pt-8 space-x-4 border-t border-primary-200/30 dark:border-primary-700/30">
            <button onClick={handleReset} className="btn btn-secondary">
              Reset
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
