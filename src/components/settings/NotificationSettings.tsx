import React, { useState } from "react";
import { Switch } from "@headlessui/react";
import { Bell, Mail, Megaphone, AlertTriangle } from "lucide-react";

interface NotificationSettings {
  email: {
    costAlerts: boolean;
    optimizationSuggestions: boolean;
    monthlyReports: boolean;
    anomalyDetection: boolean;
  };
  push: {
    costAlerts: boolean;
    optimizationSuggestions: boolean;
    anomalyDetection: boolean;
  };
}

interface ThresholdSettings {
  dailyCostLimit: number;
  weeklyCostLimit: number;
  monthlyCostLimit: number;
  anomalyPercentage: number;
}

interface SettingsState extends NotificationSettings {
  thresholds: ThresholdSettings;
}

interface NotificationSettingsProps {
  onUpdate: (data: { notifications: NotificationSettings }) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onUpdate,
}) => {
  const [settings, setSettings] = useState<SettingsState>({
    email: {
      costAlerts: true,
      optimizationSuggestions: true,
      monthlyReports: false,
      anomalyDetection: true,
    },
    push: {
      costAlerts: true,
      optimizationSuggestions: false,
      anomalyDetection: true,
    },
    thresholds: {
      dailyCostLimit: 100,
      weeklyCostLimit: 500,
      monthlyCostLimit: 2000,
      anomalyPercentage: 50,
    },
  });

  const handleToggle = (
    category: "email" | "push",
    setting:
      | keyof NotificationSettings["email"]
      | keyof NotificationSettings["push"],
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]:
          !prev[category][setting as keyof (typeof prev)[typeof category]],
      },
    }));
  };

  const handleThresholdChange = (field: string, value: number) => {
    setSettings({
      ...settings,
      thresholds: {
        ...settings.thresholds,
        [field]: value,
      },
    });
  };

  const handleSave = () => {
    onUpdate({ notifications: settings });
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
        <div className="flex flex-col gap-2 items-start sm:flex-row sm:gap-3 sm:items-center">
          <div className="flex justify-center items-center w-8 h-8 rounded-xl bg-gradient-warning glow-warning sm:w-9 sm:h-9 md:w-10 md:h-10">
            <Bell className="w-4 h-4 text-white sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display gradient-text sm:text-xl md:text-xl">
              Notification Preferences
            </h2>
            <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm md:text-base">
              Choose how you want to be notified about important events
            </p>
          </div>
        </div>
      </div>

      {/* Email Notifications - Responsive */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center mb-4 sm:gap-3 sm:mb-5 md:mb-6">
          <div className="flex justify-center items-center w-7 h-7 rounded-lg bg-gradient-primary glow-primary sm:w-8 sm:h-8">
            <Mail className="w-3.5 h-3.5 text-white sm:w-4 sm:h-4" />
          </div>
          <h3 className="text-base font-semibold font-display gradient-text sm:text-lg md:text-lg">
            Email Notifications
          </h3>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {Object.entries(settings.email).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-3 justify-between items-start p-3 rounded-lg border glass border-primary-200/30 sm:flex-row sm:items-center sm:p-4">
              <div className="flex-1">
                <label className="text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary sm:text-base">
                  {key.charAt(0).toUpperCase() +
                    key.slice(1).replace(/([A-Z])/g, " $1")}
                </label>
                <p className="mt-1 text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                  {key === "costAlerts" &&
                    "Get notified when costs exceed thresholds"}
                  {key === "optimizationSuggestions" &&
                    "Receive AI-powered optimization tips"}
                  {key === "monthlyReports" &&
                    "Detailed monthly analytics report"}
                  {key === "anomalyDetection" &&
                    "Alert on unusual usage patterns"}
                </p>
              </div>
              <Switch
                checked={value}
                onChange={() =>
                  handleToggle(
                    "email",
                    key as keyof NotificationSettings["email"],
                  )
                }
                className={`${value ? "bg-gradient-primary glow-primary" : "bg-light-surface-secondary dark:bg-dark-surface-secondary"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 border border-primary-200/30 flex-shrink-0`}
              >
                <span
                  className={`${value ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform`}
                />
              </Switch>
            </div>
          ))}
        </div>
      </div>

      {/* Push Notifications - Responsive */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-secondary-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center mb-4 sm:gap-3 sm:mb-5 md:mb-6">
          <div className="flex justify-center items-center w-7 h-7 rounded-lg bg-gradient-secondary glow-secondary sm:w-8 sm:h-8">
            <Megaphone className="w-3.5 h-3.5 text-white sm:w-4 sm:h-4" />
          </div>
          <h3 className="text-base font-semibold font-display gradient-text-secondary sm:text-lg md:text-lg">
            Push Notifications
          </h3>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {Object.entries(settings.push).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-3 justify-between items-start p-3 rounded-lg border glass border-secondary-200/30 sm:flex-row sm:items-center sm:p-4">
              <div className="flex-1">
                <label className="text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary sm:text-base">
                  {key.charAt(0).toUpperCase() +
                    key.slice(1).replace(/([A-Z])/g, " $1")}
                </label>
              </div>
              <Switch
                checked={value}
                onChange={() =>
                  handleToggle(
                    "push",
                    key as keyof NotificationSettings["push"],
                  )
                }
                className={`${value ? "bg-gradient-secondary glow-secondary" : "bg-light-surface-secondary dark:bg-dark-surface-secondary"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 border border-secondary-200/30 flex-shrink-0`}
              >
                <span
                  className={`${value ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform`}
                />
              </Switch>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Thresholds - Responsive */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-warning-200/30 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center mb-4 sm:gap-3 sm:mb-5 md:mb-6">
          <div className="flex justify-center items-center w-7 h-7 rounded-lg bg-gradient-warning glow-warning sm:w-8 sm:h-8">
            <AlertTriangle className="w-3.5 h-3.5 text-white sm:w-4 sm:h-4" />
          </div>
          <h3 className="text-base font-semibold font-display gradient-text-warning sm:text-lg md:text-lg">
            Alert Thresholds
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium font-display gradient-text sm:text-base">
              Daily Cost Limit ($)
            </label>
            <input
              type="number"
              value={settings.thresholds.dailyCostLimit}
              onChange={(e) =>
                handleThresholdChange("dailyCostLimit", Number(e.target.value))
              }
              className="input"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium font-display gradient-text sm:text-base">
              Weekly Cost Limit ($)
            </label>
            <input
              type="number"
              value={settings.thresholds.weeklyCostLimit}
              onChange={(e) =>
                handleThresholdChange("weeklyCostLimit", Number(e.target.value))
              }
              className="input"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium font-display gradient-text sm:text-base">
              Monthly Cost Limit ($)
            </label>
            <input
              type="number"
              value={settings.thresholds.monthlyCostLimit}
              onChange={(e) =>
                handleThresholdChange(
                  "monthlyCostLimit",
                  Number(e.target.value),
                )
              }
              className="input"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium font-display gradient-text sm:text-base">
              Anomaly Detection Threshold (%)
            </label>
            <input
              type="number"
              value={settings.thresholds.anomalyPercentage}
              onChange={(e) =>
                handleThresholdChange(
                  "anomalyPercentage",
                  Number(e.target.value),
                )
              }
              className="input"
            />
            <p className="mt-2 text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
              Alert when usage exceeds normal by this percentage
            </p>
          </div>
        </div>
      </div>

      {/* Save Button - Responsive */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="btn-primary btn w-full sm:w-auto"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};
