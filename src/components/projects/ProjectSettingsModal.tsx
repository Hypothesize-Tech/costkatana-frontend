import React, { useState, useEffect } from "react";
import {
  Cog6ToothIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Modal } from "../common/Modal";
import { Project } from "../../types/project.types";

interface ProjectSettingsModalProps {
  project: Project;
  onClose: () => void;
  onSave: (settings: ProjectSettings) => void;
}

interface ProjectSettings {
  budget: {
    amount: number;
    period: "monthly" | "quarterly" | "yearly" | "one-time";
    currency: string;
    alerts: Array<{
      threshold: number;
      type: "email" | "in-app" | "both";
      recipients: string[];
    }>;
  };
  security: {
    requireApprovalAbove: number;
    allowedModels: string[];
    maxTokensPerRequest: number;
    restrictedUsers: string[];
  };
  features: {
    enablePromptLibrary: boolean;
    enableCostAllocation: boolean;
    enableAutoOptimization: boolean;
    enableAuditLog: boolean;
  };
  notifications: {
    budgetAlerts: boolean;
    usageReports: boolean;
    memberActivity: boolean;
    optimizationSuggestions: boolean;
  };
  advanced: {
    dataRetentionDays: number;
    exportFormat: "csv" | "json" | "excel";
    timezone: string;
    customFields: Array<{
      name: string;
      type: "text" | "number" | "boolean";
      required: boolean;
    }>;
  };
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  project,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<
    "budget" | "security" | "features" | "notifications" | "advanced"
  >("budget");
  const [settings, setSettings] = useState<ProjectSettings>({
    budget: {
      amount: project.budget?.amount || 1000,
      period: project.budget?.period || "monthly",
      currency: project.budget?.currency || "USD",
      alerts: project.budget?.alerts || [
        { threshold: 50, type: "in-app", recipients: [] },
        { threshold: 80, type: "both", recipients: [] },
        { threshold: 90, type: "both", recipients: [] },
      ],
    },
    security: {
      requireApprovalAbove: project.settings?.requireApprovalAbove || 100,
      allowedModels: project.settings?.allowedModels || [
        "gpt-3.5-turbo",
        "gpt-4",
      ],
      maxTokensPerRequest: project.settings?.maxTokensPerRequest || 4000,
      restrictedUsers: [],
    },
    features: {
      enablePromptLibrary: project.settings?.enablePromptLibrary !== false,
      enableCostAllocation: project.settings?.enableCostAllocation !== false,
      enableAutoOptimization: false,
      enableAuditLog: true,
    },
    notifications: {
      budgetAlerts: true,
      usageReports: true,
      memberActivity: false,
      optimizationSuggestions: true,
    },
    advanced: {
      dataRetentionDays: 90,
      exportFormat: "csv",
      timezone: "UTC",
      customFields: [],
    },
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableModels = [
    "gpt-3.5-turbo",
    "gpt-4",
    "gpt-4-turbo",
    "claude-3-haiku",
    "claude-3-sonnet",
    "claude-3-opus",
    "gemini-pro",
    "llama-2-70b",
  ];

  const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];
  const timezones = [
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Asia/Tokyo",
  ];

  useEffect(() => {
    // Check if settings have changed from original
    setHasChanges(true); // Simplified for demo
  }, [settings]);

  const handleInputChange = (path: string[], value: any) => {
    setSettings((prev) => {
      const newSettings = { ...prev };
      let current: any = newSettings;

      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;
      return newSettings;
    });
  };

  const handleArrayChange = (
    path: string[],
    index: number,
    field: string,
    value: any,
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev };
      let current: any = newSettings;

      for (const segment of path) {
        current = current[segment];
      }

      current[index][field] = value;
      return newSettings;
    });
  };

  const addAlert = () => {
    setSettings((prev) => ({
      ...prev,
      budget: {
        ...prev.budget,
        alerts: [
          ...prev.budget.alerts,
          { threshold: 95, type: "both", recipients: [] },
        ],
      },
    }));
  };

  const removeAlert = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      budget: {
        ...prev.budget,
        alerts: prev.budget.alerts.filter((_, i) => i !== index),
      },
    }));
  };

  const addCustomField = () => {
    setSettings((prev) => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        customFields: [
          ...prev.advanced.customFields,
          { name: "", type: "text", required: false },
        ],
      },
    }));
  };

  const removeCustomField = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        customFields: prev.advanced.customFields.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(settings);
      onClose();
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "budget", label: "Budget & Alerts", icon: CurrencyDollarIcon },
    { id: "security", label: "Security", icon: ShieldCheckIcon },
    { id: "features", label: "Features", icon: Cog6ToothIcon },
    { id: "notifications", label: "Notifications", icon: ExclamationTriangleIcon },
    { id: "advanced", label: "Advanced", icon: UserGroupIcon },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "budget":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                  Budget Amount
                </label>
                <input
                  type="number"
                  value={settings.budget.amount}
                  onChange={(e) =>
                    handleInputChange(
                      ["budget", "amount"],
                      Number(e.target.value),
                    )
                  }
                  className="input"
                />
              </div>
              <div>
                <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                  Currency
                </label>
                <select
                  value={settings.budget.currency}
                  onChange={(e) =>
                    handleInputChange(["budget", "currency"], e.target.value)
                  }
                  className="input"
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                Budget Period
              </label>
              <select
                value={settings.budget.period}
                onChange={(e) =>
                  handleInputChange(["budget", "period"], e.target.value)
                }
                className="input"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One-time</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display font-bold gradient-text-primary">
                  Budget Alerts
                </h3>
                <button
                  onClick={addAlert}
                  className="px-4 py-2.5 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex items-center gap-2 font-display font-semibold text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Alert
                </button>
              </div>
              <div className="space-y-4">
                {settings.budget.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block mb-2 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                          Threshold (%)
                        </label>
                        <input
                          type="number"
                          value={alert.threshold}
                          onChange={(e) =>
                            handleArrayChange(
                              ["budget", "alerts"],
                              index,
                              "threshold",
                              Number(e.target.value),
                            )
                          }
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                          Alert Type
                        </label>
                        <select
                          value={alert.type}
                          onChange={(e) =>
                            handleArrayChange(
                              ["budget", "alerts"],
                              index,
                              "type",
                              e.target.value,
                            )
                          }
                          className="input"
                        >
                          <option value="in-app">In-App Only</option>
                          <option value="email">Email Only</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeAlert(index)}
                          className="p-3 glass border border-danger-200/30 dark:border-danger-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-danger-600 dark:text-danger-400 rounded-lg hover:bg-danger-500/10 dark:hover:bg-danger-500/20 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-8">
            <div>
              <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                Require Approval Above ($)
              </label>
              <input
                type="number"
                value={settings.security.requireApprovalAbove}
                onChange={(e) =>
                  handleInputChange(
                    ["security", "requireApprovalAbove"],
                    Number(e.target.value),
                  )
                }
                className="input"
              />
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mt-2">
                API calls exceeding this amount will require approval
              </p>
            </div>

            <div>
              <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                Max Tokens Per Request
              </label>
              <input
                type="number"
                value={settings.security.maxTokensPerRequest}
                onChange={(e) =>
                  handleInputChange(
                    ["security", "maxTokensPerRequest"],
                    Number(e.target.value),
                  )
                }
                className="input"
              />
            </div>

            <div>
              <label className="block mb-4 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                Allowed Models
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableModels.map((model) => (
                  <label key={model} className="flex items-center gap-3 glass p-3 rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl hover:border-primary-300/50 transition-all duration-200">
                    <input
                      type="checkbox"
                      checked={settings.security.allowedModels.includes(model)}
                      onChange={(e) => {
                        const newModels = e.target.checked
                          ? [...settings.security.allowedModels, model]
                          : settings.security.allowedModels.filter(
                            (m) => m !== model,
                          );
                        handleInputChange(
                          ["security", "allowedModels"],
                          newModels,
                        );
                      }}
                      className="checkbox"
                    />
                    <span className="font-body text-light-text-primary dark:text-dark-text-primary">
                      {model}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case "features":
        return (
          <div className="space-y-6">
            {Object.entries(settings.features).map(([key, value]) => (
              <div key={key} className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </h3>
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                      {getFeatureDescription(key)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleInputChange(["features", key], !value)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${value ? "bg-gradient-primary" : "bg-secondary-300 dark:bg-secondary-600"
                      }`}
                    role="switch"
                    aria-checked={value}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="glass rounded-xl p-6 border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-display font-semibold text-secondary-900 dark:text-white">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </h3>
                  <p className="text-sm font-body text-secondary-600 dark:text-secondary-300 mt-1">
                    {getNotificationDescription(key)}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleInputChange(["notifications", key], !value)
                  }
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${value ? "bg-gradient-primary" : "bg-secondary-300 dark:bg-secondary-600"
                    }`}
                  role="switch"
                  aria-checked={value}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            ))}
          </div>
        );

      case "advanced":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Retention (Days)
                </label>
                <input
                  type="number"
                  value={settings.advanced.dataRetentionDays}
                  onChange={(e) =>
                    handleInputChange(
                      ["advanced", "dataRetentionDays"],
                      Number(e.target.value),
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Export Format
                </label>
                <select
                  value={settings.advanced.exportFormat}
                  onChange={(e) =>
                    handleInputChange(
                      ["advanced", "exportFormat"],
                      e.target.value,
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="excel">Excel</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={settings.advanced.timezone}
                onChange={(e) =>
                  handleInputChange(["advanced", "timezone"], e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-display font-bold gradient-text-primary">
                  Custom Fields
                </h3>
                <button
                  onClick={addCustomField}
                  className="px-4 py-2.5 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex items-center gap-2 font-display font-semibold text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Field
                </button>
              </div>
              <div className="space-y-3">
                {settings.advanced.customFields.map((field, index) => (
                  <div
                    key={index}
                    className="glass p-4 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block mb-2 font-display font-medium text-secondary-900 dark:text-white">
                          Field Name
                        </label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) =>
                            handleArrayChange(
                              ["advanced", "customFields"],
                              index,
                              "name",
                              e.target.value,
                            )
                          }
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-display font-medium text-secondary-900 dark:text-white">
                          Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            handleArrayChange(
                              ["advanced", "customFields"],
                              index,
                              "type",
                              e.target.value,
                            )
                          }
                          className="input"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              handleArrayChange(
                                ["advanced", "customFields"],
                                index,
                                "required",
                                e.target.checked,
                              )
                            }
                            className="w-5 h-5 text-primary-600 rounded border-primary-300 focus:ring-primary-500"
                          />
                          <span className="text-sm font-body text-secondary-900 dark:text-white">
                            Required
                          </span>
                        </label>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeCustomField(index)}
                          className="p-3 glass border border-danger-200/30 dark:border-danger-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-danger-600 dark:text-danger-400 rounded-lg hover:bg-danger-500/10 dark:hover:bg-danger-500/20 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getFeatureDescription = (key: string): string => {
    const descriptions = {
      enablePromptLibrary:
        "Allow team members to create and share prompt templates",
      enableCostAllocation:
        "Track costs by department, team, or custom categories",
      enableAutoOptimization: "Automatically optimize prompts to reduce costs",
      enableAuditLog: "Keep detailed logs of all project activities",
    };
    return descriptions[key as keyof typeof descriptions] || "";
  };

  const getNotificationDescription = (key: string): string => {
    const descriptions = {
      budgetAlerts: "Receive alerts when budget thresholds are reached",
      usageReports: "Get periodic reports on project usage and costs",
      memberActivity: "Be notified when team members join or leave",
      optimizationSuggestions: "Receive suggestions for cost optimization",
    };
    return descriptions[key as keyof typeof descriptions] || "";
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="" size="5xl">
      <div className="flex flex-col h-full max-h-[90vh] glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="glass rounded-t-xl p-8 border-b border-primary-200/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                <Cog6ToothIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold gradient-text-primary">
                  {project.name} Settings
                </h2>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Configure advanced settings for your project
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-secondary-600 dark:text-secondary-300 hover:text-danger-500 hover:bg-danger-500/10 transition-all duration-300 hover:scale-110"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-primary-200/30 bg-gradient-primary/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 font-display font-medium transition-all duration-200 ${activeTab === tab.id
                ? "text-primary-700 dark:text-primary-300 border-b-2 border-primary-500 bg-gradient-primary/10"
                : "text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gradient-primary/5"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">{renderTabContent()}</div>

        {/* Footer */}
        <div className="glass rounded-b-xl p-6 border-t border-primary-200/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 font-body text-secondary-600 dark:text-secondary-300">
              <InformationCircleIcon className="w-4 h-4" />
              <span>Changes will be applied immediately</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex items-center gap-2 font-display font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || loading}
                className="px-4 py-2.5 bg-gradient-primary hover:bg-gradient-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 font-display font-semibold text-sm"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
