import React, { useState } from "react";
import { Switch } from "@headlessui/react";

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
    <div className="space-y-8">
      <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-warning flex items-center justify-center glow-warning">
            <span className="text-white text-lg">🔔</span>
          </div>
          <div>
            <h2 className="text-xl font-display font-bold gradient-text">
              Notification Preferences
            </h2>
            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
              Choose how you want to be notified about important events
            </p>
          </div>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center glow-primary">
            <span className="text-white text-sm">📧</span>
          </div>
          <h3 className="font-display font-semibold gradient-text text-lg">
            Email Notifications
          </h3>
        </div>
        <div className="space-y-4">
          {Object.entries(settings.email).map(([key, value]) => (
            <div key={key} className="glass rounded-lg p-4 border border-primary-200/30 flex items-center justify-between">
              <div className="flex-1">
                <label className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                  {key.charAt(0).toUpperCase() +
                    key.slice(1).replace(/([A-Z])/g, " $1")}
                </label>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm mt-1">
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
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 border border-primary-200/30`}
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

      {/* Push Notifications */}
      <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center glow-secondary">
            <span className="text-white text-sm">📢</span>
          </div>
          <h3 className="font-display font-semibold gradient-text-secondary text-lg">
            Push Notifications
          </h3>
        </div>
        <div className="space-y-4">
          {Object.entries(settings.push).map(([key, value]) => (
            <div key={key} className="glass rounded-lg p-4 border border-secondary-200/30 flex items-center justify-between">
              <div className="flex-1">
                <label className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">
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
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 border border-secondary-200/30`}
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

      {/* Alert Thresholds */}
      <div className="glass rounded-xl p-6 border border-warning-200/30 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-warning flex items-center justify-center glow-warning">
            <span className="text-white text-sm">⚠️</span>
          </div>
          <h3 className="font-display font-semibold gradient-text-warning text-lg">
            Alert Thresholds
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-display font-medium gradient-text mb-2">
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
            <label className="block font-display font-medium gradient-text mb-2">
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
            <label className="block font-display font-medium gradient-text mb-2">
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
            <label className="block font-display font-medium gradient-text mb-2">
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
            <p className="mt-2 font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
              Alert when usage exceeds normal by this percentage
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="btn-primary"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};
