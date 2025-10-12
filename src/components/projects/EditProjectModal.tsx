import React, { useState, useEffect } from "react";
import { FiPlus, FiMinus, FiSave } from "react-icons/fi";
import { Modal } from "../common/Modal";
import { Project } from "../../types/project.types";

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSubmit: (projectId: string, projectData: any) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  project,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    budget: {
      amount: project.budget?.amount || 0,
      period: project.budget?.period || "monthly",
      alerts: [
        { threshold: 50, enabled: true },
        { threshold: 80, enabled: true },
        { threshold: 100, enabled: true },
      ],
    },
    tags: project.tags || [""],
    settings: {
      costOptimization: {
        enabled: project.settings?.costOptimization?.enabled || false,
        autoApply: project.settings?.costOptimization?.autoApply || false,
        strategies: project.settings?.costOptimization?.strategies || [],
        level: project.settings?.costOptimization?.level || "low",
      },
      notifications: {
        budgetAlerts: project.settings?.notifications?.budgetAlerts || true,
        monthlyReports:
          project.settings?.notifications?.monthlyReports || false,
      },
    },
  });

  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes
  useEffect(() => {
    const hasChanged =
      formData.name !== project.name ||
      formData.description !== (project.description || "") ||
      formData.budget.amount !== (project.budget?.amount || 0) ||
      formData.budget.period !== (project.budget?.period || "monthly") ||
      JSON.stringify(formData.budget.alerts) !==
      JSON.stringify([
        { threshold: 50, enabled: true },
        { threshold: 80, enabled: true },
        { threshold: 100, enabled: true },
      ]) ||
      JSON.stringify(formData.tags) !== JSON.stringify(project.tags || []) ||
      JSON.stringify(formData.settings) !==
      JSON.stringify(project.settings || {});

    setHasChanges(hasChanged);
  }, [formData, project]);

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

  const handleTagChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.map((tag, i) => (i === index ? value : tag)),
    }));
  };

  const addTag = () => {
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, ""],
    }));
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleAlertChange = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      budget: {
        ...prev.budget,
        alerts: prev.budget.alerts.map((alert, i) =>
          i === index ? { ...alert, [field]: value } : alert,
        ),
      },
    }));
  };

  const addAlert = () => {
    setFormData((prev) => ({
      ...prev,
      budget: {
        ...prev.budget,
        alerts: [...prev.budget.alerts, { threshold: 90, enabled: true }],
      },
    }));
  };

  const removeAlert = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      budget: {
        ...prev.budget,
        alerts: prev.budget.alerts.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      // Format data to match backend expectations
      const cleanedData = {
        name: formData.name,
        description: formData.description,
        tags: formData.tags.filter((tag) => tag.trim() !== ""),
        budget: {
          amount: formData.budget.amount,
          period: formData.budget.period,
          startDate: new Date(), // Required field
          currency: "USD", // Required field
          alerts: formData.budget.alerts
            .filter((alert) => alert.enabled)
            .map((alert) => ({
              threshold: alert.threshold,
              type: "both" as const,
              recipients: [],
            })),
        },
        settings: {
          requireApprovalAbove: undefined,
          allowedModels: undefined,
          maxTokensPerRequest: undefined,
          enablePromptLibrary: formData.settings.costOptimization.enabled,
          enableCostAllocation: formData.settings.notifications.budgetAlerts,
        },
      };

      await onSubmit(project._id, cleanedData);
      onClose();
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Project" size="lg">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col h-full max-h-[90vh]"
      >
        <div className="overflow-y-auto flex-1 p-8 space-y-8">
          {/* Basic Information */}
          <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">📋</span>
              </div>
              <h3 className="text-xl font-display font-bold gradient-text-primary">
                Basic Information
              </h3>
            </div>
            <div className="space-y-6">
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
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="input"
                  placeholder="Describe your project"
                />
              </div>

              <div>
                <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                  Tags
                </label>
                <div className="space-y-3">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => handleTagChange(index, e.target.value)}
                        className="flex-1 input"
                        placeholder="Enter tag"
                      />
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="glass p-3 rounded-lg border border-danger-200/30 shadow-lg backdrop-blur-xl text-danger-600 hover:scale-110 transition-all duration-200"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTag}
                    className="flex gap-2 items-center font-display font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Tag
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Configuration */}
          <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">💰</span>
              </div>
              <h3 className="text-xl font-display font-bold gradient-text-success">
                Budget Configuration
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                  Budget Amount ($) *
                </label>
                <input
                  type="number"
                  value={formData.budget.amount}
                  onChange={(e) =>
                    handleNestedInputChange(
                      ["budget", "amount"],
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
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
                    handleNestedInputChange(
                      ["budget", "period"],
                      e.target.value,
                    )
                  }
                  className="input"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="one-time">One-time</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-4 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                Budget Alerts
              </label>
              <div className="space-y-4">
                {formData.budget.alerts.map((alert, index) => (
                  <div key={index} className="glass rounded-lg p-4 border border-warning-200/30 shadow-lg backdrop-blur-xl">
                    <div className="flex gap-4 items-center">
                      <input
                        type="number"
                        value={alert.threshold}
                        onChange={(e) =>
                          handleAlertChange(
                            index,
                            "threshold",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-20 input"
                        min="1"
                        max="100"
                      />
                      <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                        % of budget
                      </span>
                      <label className="flex gap-3 items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alert.enabled}
                          onChange={(e) =>
                            handleAlertChange(index, "enabled", e.target.checked)
                          }
                          className="w-5 h-5 text-primary-600 rounded border-primary-300 focus:ring-primary-500"
                        />
                        <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                          Enabled
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeAlert(index)}
                        className="glass p-2 rounded-lg border border-danger-200/30 shadow-lg backdrop-blur-xl text-danger-600 hover:scale-110 transition-all duration-200"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAlert}
                  className="flex gap-2 items-center font-display font-medium text-success-600 dark:text-success-400 hover:text-success-700 dark:hover:text-success-300 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Alert
                </button>
              </div>
            </div>
          </div>

          {/* Project Settings */}
          <div className="glass rounded-xl p-6 border border-warning-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-warning flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">⚙️</span>
              </div>
              <h3 className="text-xl font-display font-bold gradient-text-warning">
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

                {formData.settings.costOptimization.enabled && (
                  <div className="mt-4 ml-8">
                    <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                      Optimization Level
                    </label>
                    <select
                      value={formData.settings.costOptimization.level}
                      onChange={(e) =>
                        handleNestedInputChange(
                          ["settings", "costOptimization", "level"],
                          e.target.value,
                        )
                      }
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                )}
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

              <div className="glass rounded-lg p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <label className="flex gap-3 items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.settings.notifications.monthlyReports}
                    onChange={(e) =>
                      handleNestedInputChange(
                        ["settings", "notifications", "monthlyReports"],
                        e.target.checked,
                      )
                    }
                    className="w-5 h-5 text-primary-600 rounded border-primary-300 focus:ring-primary-500"
                  />
                  <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                    Monthly reports
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center p-8 border-t border-primary-200/30">
          <div className="flex gap-2 items-center font-body text-light-text-secondary dark:text-dark-text-secondary">
            {hasChanges ? (
              <span className="text-warning-600 dark:text-warning-400">
                You have unsaved changes
              </span>
            ) : (
              <span>No changes made</span>
            )}
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !hasChanges}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
