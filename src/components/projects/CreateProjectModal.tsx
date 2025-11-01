import React, { useState } from "react";
import {
  PlusIcon,
  MinusIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  TagIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { Modal } from "../common/Modal";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (projectData: any) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budget: {
      amount: 1000,
      period: "monthly" as "monthly" | "yearly",
      alerts: {
        enabled: true,
        thresholds: [50, 80, 100],
      },
    },
    members: [""],
    tags: [""],
    settings: {
      costOptimization: {
        enabled: true,
        autoApply: false,
        strategies: ["context_trimming", "prompt_compression"],
      },
      notifications: {
        budgetAlerts: true,
        monthlyReports: true,
      },
    },
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (path: string[], value: any) => {
    setFormData((prev) => {
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const handleArrayChange = (
    field: "members" | "tags",
    index: number,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field: "members" | "tags") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (field: "members" | "tags", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Transform the data to match backend expectations
      const cleanData = {
        name: formData.name,
        description: formData.description,
        tags: formData.tags.filter((tag) => tag.trim() !== ""),
        budget: {
          amount: formData.budget.amount,
          period: formData.budget.period,
          startDate: new Date(),
          currency: "USD",
          alerts: formData.budget.alerts.enabled
            ? formData.budget.alerts.thresholds.map((threshold) => ({
              threshold,
              type: "both" as const,
              recipients: [],
            }))
            : [],
        },
        settings: {
          enablePromptLibrary: formData.settings.costOptimization.enabled,
          enableCostAllocation: true,
          requireApprovalAbove: formData.budget.amount * 0.1,
          ...formData.settings,
        },
      };

      await onCreate(cleanData);

      // Reset form
      setFormData({
        name: "",
        description: "",
        budget: {
          amount: 1000,
          period: "monthly",
          alerts: {
            enabled: true,
            thresholds: [50, 80, 100],
          },
        },
        members: [""],
        tags: [""],
        settings: {
          costOptimization: {
            enabled: true,
            autoApply: false,
            strategies: ["context_trimming", "prompt_compression"],
          },
          notifications: {
            budgetAlerts: true,
            monthlyReports: true,
          },
        },
      });
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="4xl">
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Basic Information */}
        <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-display font-bold gradient-text-primary">
              Basic Information
            </h3>
          </div>

          <div>
            <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="input"
              placeholder="Enter project name"
              required
            />
          </div>

          <div>
            <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className="input"
              placeholder="Describe your project"
            />
          </div>
        </div>

        {/* Budget Settings */}
        <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-display font-bold gradient-text-primary">
              Budget Settings
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                Budget Amount ($)
              </label>
              <input
                type="number"
                value={formData.budget.amount}
                onChange={(e) =>
                  handleNestedInputChange(
                    ["budget", "amount"],
                    Number(e.target.value),
                  )
                }
                className="input"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                Budget Period
              </label>
              <select
                value={formData.budget.period}
                onChange={(e) =>
                  handleNestedInputChange(["budget", "period"], e.target.value)
                }
                className="input"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-lg">
              <UserGroupIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-display font-bold gradient-text-primary">
              Team Members
            </h3>
          </div>

          <div className="space-y-4">
            {formData.members.map((member, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="email"
                  value={member}
                  onChange={(e) =>
                    handleArrayChange("members", index, e.target.value)
                  }
                  className="flex-1 input"
                  placeholder="Enter email address"
                />
                {formData.members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem("members", index)}
                    className="p-3 glass border border-danger-200/30 dark:border-danger-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-danger-600 dark:text-danger-400 rounded-lg hover:bg-danger-500/10 dark:hover:bg-danger-500/20 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                  >
                    <MinusIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem("members")}
              className="px-4 py-2.5 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex items-center gap-2 font-display font-semibold text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Add Member
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-lg">
              <TagIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-display font-bold gradient-text-primary">
              Tags
            </h3>
          </div>

          <div className="space-y-4">
            {formData.tags.map((tag, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) =>
                    handleArrayChange("tags", index, e.target.value)
                  }
                  className="flex-1 input"
                  placeholder="Enter tag"
                />
                {formData.tags.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem("tags", index)}
                    className="p-3 glass border border-danger-200/30 dark:border-danger-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-danger-600 dark:text-danger-400 rounded-lg hover:bg-danger-500/10 dark:hover:bg-danger-500/20 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                  >
                    <MinusIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem("tags")}
              className="px-4 py-2.5 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex items-center gap-2 font-display font-semibold text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Add Tag
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="glass rounded-xl p-6 border border-warning-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-warning flex items-center justify-center shadow-lg">
              <Cog6ToothIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-display font-bold gradient-text-primary">
              Project Settings
            </h3>
          </div>

          <div className="space-y-6">
            <div className="glass rounded-lg p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl">
              <label className="flex gap-3 items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.settings.costOptimization.enabled}
                  onChange={(e) =>
                    handleNestedInputChange(
                      ["settings", "costOptimization", "enabled"],
                      e.target.checked,
                    )
                  }
                  className="w-5 h-5 text-primary-600 rounded border-primary-300 focus:ring-primary-500"
                />
                <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                  Enable cost optimization
                </span>
              </label>
            </div>

            <div className="glass rounded-lg p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl">
              <label className="flex gap-3 items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.settings.notifications.budgetAlerts}
                  onChange={(e) =>
                    handleNestedInputChange(
                      ["settings", "notifications", "budgetAlerts"],
                      e.target.checked,
                    )
                  }
                  className="w-5 h-5 text-primary-600 rounded border-primary-300 focus:ring-primary-500"
                />
                <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                  Budget alerts
                </span>
              </label>
            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end pt-8 border-t border-primary-200/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex items-center gap-2 font-display font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="px-4 py-2.5 bg-gradient-primary hover:bg-gradient-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 font-display font-semibold text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Project</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
