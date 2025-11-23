import React, { useState } from "react";
import { FiCopy, FiSettings, FiFileText, FiLock, FiInfo, FiEye } from "react-icons/fi";
import { Modal } from "../common/Modal";
import { PromptTemplate } from "../../types/promptTemplate.types";

interface DuplicateTemplateModalProps {
  template: PromptTemplate;
  onClose: () => void;
  onSubmit: (templateData: any) => void;
}

export const DuplicateTemplateModal: React.FC<DuplicateTemplateModalProps> = ({
  template,
  onClose,
  onSubmit,
}) => {
  // Helper function to extract compliance criteria from variables
  const getComplianceCriteria = () => {
    return template.variables
      .filter(v => v.type === 'text' && v.name.startsWith('criterion_'))
      .sort((a, b) => {
        const aNum = parseInt(a.name.split('_')[1] || '0');
        const bNum = parseInt(b.name.split('_')[1] || '0');
        return aNum - bNum;
      });
  };

  const [formData, setFormData] = useState({
    name: `Copy of ${template.name}`,
    description: template.description || "",
    content: template.content,
    category: template.category,
    variables: template.variables || [],
    metadata: {
      tags: template.metadata.tags || [],
      language: template.metadata.language || "en",
      estimatedTokens: template.metadata.estimatedTokens,
      recommendedModel: template.metadata.recommendedModel || "",
    },
    sharing: {
      visibility: "private" as const, // Always start as private for duplicates
      allowFork: template.sharing.allowFork !== undefined ? template.sharing.allowFork : true,
    },
    // Preserve visual compliance config if present
    isVisualCompliance: template.isVisualCompliance || false,
    visualComplianceConfig: template.visualComplianceConfig || undefined,
  });

  const [loading, setLoading] = useState(false);
  const complianceCriteria = getComplianceCriteria();

  const categories = [
    { value: "general", label: "General" },
    { value: "coding", label: "Coding" },
    { value: "writing", label: "Writing" },
    { value: "analysis", label: "Analysis" },
    { value: "creative", label: "Creative" },
    { value: "business", label: "Business" },
    { value: "custom", label: "Custom" },
    { value: "visual-compliance", label: "Visual Compliance" },
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error duplicating template:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="4xl" title="">
      <div className="glass rounded-3xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="glass flex items-center gap-4 p-8 border-b border-primary-200/30 backdrop-blur-xl rounded-t-3xl">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
            <FiCopy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold gradient-text-primary">
              Duplicate Template
            </h2>
            <p className="font-body text-light-text-secondary dark:text-white">
              Create a copy of "{template.name}" with customizable settings
            </p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="glass rounded-xl p-6 border border-highlight-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-r from-highlight-50/30 to-highlight-100/30 dark:from-highlight-900/20 dark:to-highlight-800/20">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-gradient-highlight flex items-center justify-center shadow-lg">
                  <FiCopy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold gradient-text-highlight mb-2">
                    Duplicating "{template.name}"
                  </h3>
                  <p className="font-body text-light-text-primary dark:text-white">
                    This will create a copy of the template with all its content and
                    variables. You can modify the details below before creating the
                    duplicate.
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                  <FiSettings className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold gradient-text-primary">
                  Template Details
                </h3>
              </div>

              <div>
                <label className="form-label">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="input"
                  placeholder="Enter template name"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  className="input"
                  placeholder="Describe your template"
                />
              </div>

              <div>
                <label className="form-label">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="input"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content Preview */}
            <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                  <FiFileText className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold gradient-text-success">
                  Content Preview
                </h3>
              </div>
              <div className="glass p-4 rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="mb-3 font-display font-medium gradient-text-secondary">
                  Template Content:
                </div>
                <div className="overflow-y-auto p-4 max-h-32 font-mono text-sm text-light-text-primary dark:text-white glass rounded border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-r from-primary-50/20 to-primary-100/20 dark:from-primary-900/10 dark:to-primary-800/10">
                  {formData.content}
                </div>
              </div>

              {formData.variables.length > 0 && (
                <div className="glass p-4 rounded-lg border border-secondary-200/30 shadow-lg backdrop-blur-xl">
                  <div className="mb-3 font-display font-medium gradient-text-secondary">
                    Variables ({formData.variables.length}):
                  </div>
                  <div className="space-y-3">
                    {formData.variables.map((variable, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <span className="glass px-3 py-1 font-mono border border-secondary-200/30 bg-gradient-secondary/20 text-secondary-700 dark:text-white rounded-full font-semibold text-sm">
                          {variable.name}
                        </span>
                        <span className="glass px-2 py-1 rounded-full border border-accent-200/30 bg-gradient-accent/20 text-accent-700 dark:text-white font-display font-medium text-sm">
                          ({variable.type})
                        </span>
                        {variable.required && (
                          <span className="glass px-2 py-1 rounded-full border border-danger-200/30 bg-gradient-danger/20 text-danger-700 dark:text-white font-display font-semibold text-xs">
                            Required
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Visual Compliance Info */}
            {formData.isVisualCompliance && formData.visualComplianceConfig && (
              <div className="glass rounded-xl p-6 border border-info-200/30 shadow-lg backdrop-blur-xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-info flex items-center justify-center shadow-lg">
                    <FiEye className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-bold gradient-text-info">
                    Visual Compliance Configuration
                  </h3>
                </div>
                <div className="glass p-4 rounded-lg border border-info-200/30 shadow-lg backdrop-blur-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-medium text-light-text-secondary dark:text-white">
                      Industry:
                    </span>
                    <span className="glass px-3 py-1 rounded-full border border-info-200/30 bg-gradient-info/20 text-info-700 dark:text-info-300 font-display font-semibold text-sm">
                      {formData.visualComplianceConfig.industry}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-medium text-light-text-secondary dark:text-white">
                      Mode:
                    </span>
                    <span className="glass px-3 py-1 rounded-full border border-success-200/30 bg-gradient-success/20 text-success-700 dark:text-success-300 font-display font-semibold text-sm">
                      {formData.visualComplianceConfig.mode || 'optimized'}
                    </span>
                  </div>
                </div>

                {/* Compliance Criteria */}
                {complianceCriteria.length > 0 && (
                  <div className="glass p-4 rounded-lg border border-warning-200/30 shadow-lg backdrop-blur-xl">
                    <div className="mb-3 flex items-center gap-2">
                      <FiInfo className="w-4 h-4 text-warning-600 dark:text-warning-400" />
                      <span className="font-display font-semibold gradient-text-warning">
                        Compliance Criteria ({complianceCriteria.length})
                      </span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {complianceCriteria.map((criterion, index) => (
                        <div key={criterion.name} className="flex gap-3 items-start glass p-3 rounded-lg border border-info-200/20 hover:border-info-300/30 transition-colors">
                          <div className="w-6 h-6 rounded-full bg-gradient-info/20 border border-info-200/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-info-700 dark:text-info-300 font-display font-bold text-xs">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-light-text-primary dark:text-white text-sm leading-relaxed break-words">
                              {criterion.description || criterion.defaultValue || criterion.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 font-body text-light-text-secondary dark:text-dark-text-secondary text-xs">
                      All compliance criteria will be preserved in the duplicated template.
                    </p>
                  </div>
                )}

                <p className="font-body text-light-text-secondary dark:text-white text-sm">
                  This is a visual compliance template. All image variables and compliance criteria will be preserved in the duplicate.
                </p>
              </div>
            )}

            {/* Sharing Settings */}
            <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
                  <FiLock className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold gradient-text-accent">
                  Sharing Settings
                </h3>
              </div>

              <div>
                <label className="form-label">
                  Visibility
                </label>
                <select
                  value={formData.sharing.visibility}
                  onChange={(e) =>
                    handleNestedInputChange(
                      ["sharing", "visibility"],
                      e.target.value,
                    )
                  }
                  className="input"
                >
                  <option value="private">Private</option>
                  <option value="project">Project</option>
                  <option value="organization">Organization</option>
                  <option value="public">Public</option>
                </select>
                <p className="mt-2 font-body text-light-text-secondary dark:text-white text-sm">
                  Duplicated templates start as private by default for security.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-4 h-4" />
                      Create Duplicate
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
