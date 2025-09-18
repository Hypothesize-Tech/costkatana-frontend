import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiMinus,
  FiInfo,
  FiCheck,
  FiCode,
  FiTag,
  FiSettings,
  FiZap,
  FiBookOpen,
  FiStar,
  FiEye,
} from "react-icons/fi";
import { Modal } from "../common/Modal";
import { TemplateVariable } from "../../types/promptTemplate.types";

interface CreateTemplateModalProps {
  onClose: () => void;
  onSubmit: (templateData: any) => void;
}

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    category: "general",
    variables: [] as TemplateVariable[],
    metadata: {
      tags: [""],
      language: "en",
    },
    sharing: {
      visibility: "private" as "private" | "project" | "organization" | "public",
      allowFork: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const categories = [
    { value: "general", label: "General", icon: FiBookOpen, color: "bg-gray-100 text-gray-800" },
    { value: "coding", label: "Coding", icon: FiCode, color: "bg-blue-100 text-blue-800" },
    { value: "writing", label: "Writing", icon: FiBookOpen, color: "bg-green-100 text-green-800" },
    { value: "analysis", label: "Analysis", icon: FiZap, color: "bg-purple-100 text-purple-800" },
    { value: "creative", label: "Creative", icon: FiStar, color: "bg-pink-100 text-pink-800" },
    { value: "business", label: "Business", icon: FiSettings, color: "bg-yellow-100 text-yellow-800" },
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

  const handleTagChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: prev.metadata.tags.map((tag, i) => (i === index ? value : tag)),
      },
    }));
  };

  const addTag = () => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: [...prev.metadata.tags, ""],
      },
    }));
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: prev.metadata.tags.filter((_, i) => i !== index),
      },
    }));
  };

  const handleVariableChange = (
    index: number,
    field: keyof TemplateVariable,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.map((variable, i) =>
        i === index ? { ...variable, [field]: value } : variable,
      ),
    }));
  };

  const removeVariable = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  };

  // Auto-detect variables when content changes
  useEffect(() => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = formData.content.match(variableRegex);

    if (matches) {
      const newVariables = matches.map((match) => {
        const name = match.replace(/\{\{|\}\}/g, "");
        return {
          name,
          type: "text" as const,
          description: "",
          required: false,
          defaultValue: "",
        };
      });

      setFormData((prev) => ({
        ...prev,
        variables: newVariables,
      }));
    }
  }, [formData.content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanData = {
        ...formData,
        metadata: {
          ...formData.metadata,
          tags: formData.metadata.tags.filter((tag) => tag.trim() !== ""),
        },
      };

      await onSubmit(cleanData);

      setFormData({
        name: "",
        description: "",
        content: "",
        category: "general",
        variables: [],
        metadata: {
          tags: [""],
          language: "en",
        },
        sharing: {
          visibility: "private",
          allowFork: false,
        },
      });
    } catch (error) {
      console.error("Error creating template:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title=""
      size="xl"
    >
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="glass flex items-center justify-between p-8 border-b border-primary-200/30 backdrop-blur-xl rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">✨</span>
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold gradient-text-primary">
                Create New Template
              </h2>
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mt-1">
                Create a reusable prompt template with variables
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-highlight flex items-center justify-center shadow-lg">
                  <FiInfo className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold gradient-text-highlight">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="input"
                    placeholder="e.g., Email Writer, Code Reviewer"
                    required
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

              <div>
                <label className="form-label">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  className="input"
                  placeholder="Describe what this template does and when to use it"
                />
              </div>
            </div>

            {/* Template Content */}
            <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                  <FiCode className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold gradient-text-success">
                  Template Content *
                </h3>
              </div>

              <div className="relative">
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={8}
                  className="input font-mono text-sm"
                  placeholder="Write your prompt template here. Use {{variable_name}} for dynamic content.

Example:
You are a helpful assistant. Please help me with the following task:

Task: {{task_description}}
Context: {{context}}
Tone: {{tone}}

Please provide a detailed response that is {{response_length}}."
                  required
                />
                <div className="absolute bottom-4 right-4">
                  <div className="glass rounded-lg p-3 border border-highlight-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-r from-highlight-50/50 to-highlight-100/50 dark:from-highlight-900/20 dark:to-highlight-800/20 max-w-xs">
                    <p className="text-xs font-body text-highlight-700 dark:text-highlight-300">
                      💡 Use {"{{variable_name}}"} for dynamic content
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Variables Section */}
            {formData.variables.length > 0 && (
              <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
                    <FiTag className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-bold gradient-text-secondary">
                    Variables ({formData.variables.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.variables.map((variable, index) => (
                    <div
                      key={index}
                      className="glass p-4 space-y-3 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-gradient-secondary rounded-full shadow-lg"></div>
                          <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                            {variable.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVariable(index)}
                          className="btn-icon-danger"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={variable.description}
                        onChange={(e) =>
                          handleVariableChange(index, "description", e.target.value)
                        }
                        className="input text-sm"
                        placeholder="Describe what this variable is for (optional)"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Options */}
            <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel space-y-6">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-3 font-display font-semibold gradient-text-accent hover:scale-105 transition-all duration-200"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
                  <FiPlus className={`w-3 h-3 text-white transform transition-transform ${showAdvanced ? 'rotate-45' : ''}`} />
                </div>
                Advanced Options
              </button>

              {showAdvanced && (
                <div className="space-y-6 glass p-6 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-r from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20">
                  {/* Tags */}
                  <div>
                    <label className="form-label">
                      Tags
                    </label>
                    <div className="space-y-3">
                      {formData.metadata.tags.map((tag, index) => (
                        <div key={index} className="flex gap-3">
                          <input
                            type="text"
                            value={tag}
                            onChange={(e) => handleTagChange(index, e.target.value)}
                            className="input flex-1 text-sm"
                            placeholder="Enter tag"
                          />
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="btn-icon-danger"
                          >
                            <FiMinus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addTag}
                        className="btn-secondary inline-flex items-center gap-2"
                      >
                        <FiPlus className="w-4 h-4" /> Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className="form-label">
                      Visibility
                    </label>
                    <select
                      value={formData.sharing.visibility}
                      onChange={(e) =>
                        handleNestedInputChange(["sharing", "visibility"], e.target.value)
                      }
                      className="input"
                    >
                      <option value="private">Private - Only you can see this</option>
                      <option value="project">Project - Team members can see this</option>
                      <option value="organization">Organization - Everyone in your org can see this</option>
                      <option value="public">Public - Anyone can see this</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            {(formData.name || formData.content) && (
              <div className="glass rounded-xl p-6 border border-highlight-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-highlight flex items-center justify-center shadow-lg">
                    <FiEye className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-bold gradient-text-highlight">
                    Preview
                  </h3>
                </div>

                <div className="glass p-6 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-r from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20">
                  {formData.name && (
                    <div className="mb-6">
                      <h4 className="font-display font-bold gradient-text-primary text-lg mb-2">
                        {formData.name}
                      </h4>
                      {formData.description && (
                        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                          {formData.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        <span className="glass px-3 py-1 rounded-full border border-accent-200/30 bg-gradient-accent/20 text-accent-700 dark:text-accent-300 font-display font-semibold text-sm">
                          {categories.find(c => c.value === formData.category)?.label}
                        </span>
                        {formData.variables.length > 0 && (
                          <span className="glass px-3 py-1 rounded-full border border-secondary-200/30 bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 font-display font-semibold text-sm">
                            {formData.variables.length} variable{formData.variables.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.content && (
                    <div>
                      <h5 className="font-display font-semibold gradient-text-secondary mb-3">
                        Template Content:
                      </h5>
                      <pre className="font-mono text-sm text-light-text-primary dark:text-dark-text-primary whitespace-pre-wrap glass p-4 rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-r from-primary-50/20 to-primary-100/20 dark:from-primary-900/10 dark:to-primary-800/10">
                        {formData.content}
                      </pre>
                    </div>
                  )}

                  {formData.variables.length > 0 && (
                    <div className="mt-6">
                      <h5 className="font-display font-semibold gradient-text-accent mb-3">
                        Variables:
                      </h5>
                      <div className="flex flex-wrap gap-3">
                        {formData.variables.map((variable, index) => (
                          <div key={index} className="glass rounded-lg p-3 border border-secondary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-r from-secondary-50/30 to-secondary-100/30 dark:from-secondary-900/20 dark:to-secondary-800/20">
                            <span className="font-mono font-semibold text-secondary-700 dark:text-secondary-300">{variable.name}</span>
                            {variable.description && (
                              <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm block mt-1">- {variable.description}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="glass flex justify-between items-center p-8 border-t border-primary-200/30 backdrop-blur-xl rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.content}
            className="btn-primary inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                Create Template
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
