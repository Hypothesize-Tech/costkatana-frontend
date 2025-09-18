import React, { useState, useEffect } from "react";
import { FiPlus, FiMinus, FiSave } from "react-icons/fi";
import { Modal } from "../common/Modal";
import { PromptTemplate } from "../../types/promptTemplate.types";

interface EditTemplateModalProps {
  template: PromptTemplate;
  onClose: () => void;
  onSubmit: (templateId: string, templateData: any) => void;
}

export const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
  template,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: template.name,
    description: template.description || "",
    content: template.content,
    category: template.category,
    variables: template.variables || [],
    metadata: {
      tags: template.metadata.tags || [""],
      language: template.metadata.language || "en",
      estimatedTokens: template.metadata.estimatedTokens,
      recommendedModel: template.metadata.recommendedModel || "",
    },
    sharing: {
      visibility: template.sharing.visibility,
      allowFork: template.sharing.allowFork,
    },
  });

  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const categories = [
    { value: "general", label: "General" },
    { value: "coding", label: "Coding" },
    { value: "writing", label: "Writing" },
    { value: "analysis", label: "Analysis" },
    { value: "creative", label: "Creative" },
    { value: "business", label: "Business" },
    { value: "custom", label: "Custom" },
  ];

  // Check for changes
  useEffect(() => {
    const hasChanged =
      formData.name !== template.name ||
      formData.description !== (template.description || "") ||
      formData.content !== template.content ||
      formData.category !== template.category ||
      JSON.stringify(formData.variables) !==
      JSON.stringify(template.variables || []) ||
      JSON.stringify(formData.metadata.tags) !==
      JSON.stringify(template.metadata.tags || []) ||
      formData.metadata.language !== (template.metadata.language || "en") ||
      formData.metadata.estimatedTokens !== template.metadata.estimatedTokens ||
      formData.metadata.recommendedModel !==
      (template.metadata.recommendedModel || "") ||
      formData.sharing.visibility !== template.sharing.visibility ||
      formData.sharing.allowFork !== template.sharing.allowFork;

    setHasChanges(hasChanged);
  }, [formData, template]);

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

  const handleVariableChange = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.map((variable, i) =>
        i === index ? { ...variable, [field]: value } : variable,
      ),
    }));
  };

  const addVariable = () => {
    setFormData((prev) => ({
      ...prev,
      variables: [
        ...prev.variables,
        {
          name: "",
          type: "text",
          description: "",
          required: false,
          defaultValue: "",
        },
      ],
    }));
  };

  const removeVariable = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
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
      // Clean up empty tags
      const cleanedData = {
        ...formData,
        metadata: {
          ...formData.metadata,
          tags: formData.metadata.tags.filter((tag) => tag.trim() !== ""),
        },
      };

      await onSubmit(template._id, cleanedData);
      onClose();
    } catch (error) {
      console.error("Error updating template:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="" size="xl">
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="glass flex items-center justify-between p-8 border-b border-primary-200/30 backdrop-blur-xl rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">✏️</span>
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold gradient-text-primary">
                Edit Template
              </h2>
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                Modify your template settings and content
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1"
        >
          <div className="overflow-y-auto flex-1 p-8 space-y-8">
            {/* Basic Information */}
            <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-highlight flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">ℹ️</span>
                </div>
                <h3 className="text-xl font-display font-bold gradient-text-highlight">
                  Basic Information
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
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
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

            {/* Template Content */}
            <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">📝</span>
                </div>
                <h3 className="text-xl font-display font-bold gradient-text-success">
                  Template Content
                </h3>
              </div>

              <div>
                <label className="form-label">
                  Prompt Template *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={8}
                  className="input font-mono text-sm"
                  placeholder="Enter your prompt template here..."
                  required
                />
                <p className="mt-2 font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                  Use {"{{variable_name}}"} syntax for variables
                </p>
              </div>
            </div>

            {/* Variables */}
            <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">🏷️</span>
                  </div>
                  <h3 className="text-xl font-display font-bold gradient-text-secondary">
                    Variables
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addVariable}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Variable
                </button>
              </div>

              {formData.variables.map((variable, index) => (
                <div
                  key={index}
                  className="glass p-4 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-r from-primary-50/20 to-primary-100/20 dark:from-primary-900/10 dark:to-primary-800/10"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-display font-semibold gradient-text-primary">
                      Variable {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeVariable(index)}
                      className="btn-icon-danger"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="form-label text-sm">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={variable.name}
                        onChange={(e) =>
                          handleVariableChange(index, "name", e.target.value)
                        }
                        className="input text-sm"
                        placeholder="variable_name"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label text-sm">
                        Type
                      </label>
                      <select
                        value={variable.type}
                        onChange={(e) =>
                          handleVariableChange(index, "type", e.target.value)
                        }
                        className="input text-sm"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="array">Array</option>
                        <option value="object">Object</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="form-label text-sm">
                        Description
                      </label>
                      <input
                        type="text"
                        value={variable.description}
                        onChange={(e) =>
                          handleVariableChange(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                        className="input text-sm"
                        placeholder="Describe this variable"
                      />
                    </div>

                    <div>
                      <label className="form-label text-sm">
                        Default Value
                      </label>
                      <input
                        type="text"
                        value={variable.defaultValue}
                        onChange={(e) =>
                          handleVariableChange(
                            index,
                            "defaultValue",
                            e.target.value,
                          )
                        }
                        className="input text-sm"
                        placeholder="Optional default value"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={variable.required}
                          onChange={(e) =>
                            handleVariableChange(
                              index,
                              "required",
                              e.target.checked,
                            )
                          }
                          className="toggle-switch-sm"
                        />
                        <span className="font-body text-light-text-primary dark:text-dark-text-primary text-sm">
                          Required
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              {formData.variables.length === 0 && (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 rounded-xl bg-gradient-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏷️</span>
                  </div>
                  <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                    No variables defined. Click "Add Variable" to create one.
                  </p>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">📊</span>
                </div>
                <h3 className="text-xl font-display font-bold gradient-text-accent">
                  Metadata
                </h3>
              </div>

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
                        className="input flex-1"
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
                    <FiPlus className="w-4 h-4" />
                    Add Tag
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="form-label">
                    Language
                  </label>
                  <select
                    value={formData.metadata.language}
                    onChange={(e) =>
                      handleNestedInputChange(
                        ["metadata", "language"],
                        e.target.value,
                      )
                    }
                    className="select"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ru">Russian</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Estimated Tokens
                  </label>
                  <input
                    type="number"
                    value={formData.metadata.estimatedTokens || ""}
                    onChange={(e) =>
                      handleNestedInputChange(
                        ["metadata", "estimatedTokens"],
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                    className="input"
                    placeholder="e.g., 100"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">
                  Recommended Model
                </label>
                <input
                  type="text"
                  value={formData.metadata.recommendedModel}
                  onChange={(e) =>
                    handleNestedInputChange(
                      ["metadata", "recommendedModel"],
                      e.target.value,
                    )
                  }
                  className="input"
                  placeholder="e.g., gpt-4, claude-3, etc."
                />
              </div>
            </div>

            {/* Sharing Settings */}
            <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">🔗</span>
                </div>
                <h3 className="text-xl font-display font-bold gradient-text-secondary">
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
                  className="select"
                >
                  <option value="private">Private</option>
                  <option value="project">Project</option>
                  <option value="organization">Organization</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <div>
                <label className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    checked={formData.sharing.allowFork}
                    onChange={(e) =>
                      handleNestedInputChange(
                        ["sharing", "allowFork"],
                        e.target.checked,
                      )
                    }
                    className="checkbox"
                  />
                  <span className="font-body text-light-text-primary dark:text-dark-text-primary text-sm">
                    Allow others to fork this template
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel rounded-b-3xl">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center text-sm">
                {hasChanges ? (
                  <span className="gradient-text-accent font-medium">
                    You have unsaved changes
                  </span>
                ) : (
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">
                    No changes made
                  </span>
                )}
              </div>
              <div className="flex gap-3">
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
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
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
          </div>
        </form>
      </div>
    </Modal>
  );
};
