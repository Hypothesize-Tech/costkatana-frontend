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
    <Modal isOpen={true} onClose={onClose} title="Edit Template" size="xl">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col h-full max-h-[90vh]"
      >
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Basic Information
            </h3>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Template Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter template name"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Describe your template"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Template Content
            </h3>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Prompt Template *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                rows={8}
                className="px-3 py-2 w-full font-mono text-sm rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your prompt template here..."
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Use {"{variable_name}"} syntax for variables
              </p>
            </div>
          </div>

          {/* Variables */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Variables
              </h3>
              <button
                type="button"
                onClick={addVariable}
                className="flex gap-2 items-center px-3 py-1 text-sm text-blue-600 rounded-lg transition-colors dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <FiPlus className="w-4 h-4" />
                Add Variable
              </button>
            </div>

            {formData.variables.map((variable, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Variable {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeVariable(index)}
                    className="p-1 text-red-600 rounded transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={variable.name}
                      onChange={(e) =>
                        handleVariableChange(index, "name", e.target.value)
                      }
                      className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="variable_name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Type
                    </label>
                    <select
                      value={variable.type}
                      onChange={(e) =>
                        handleVariableChange(index, "type", e.target.value)
                      }
                      className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="array">Array</option>
                      <option value="object">Object</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Describe this variable"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Optional default value"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex gap-2 items-center">
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
                        className="text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Required
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}

            {formData.variables.length === 0 && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No variables defined. Click "Add Variable" to create one.
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Metadata
            </h3>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags
              </label>
              <div className="space-y-2">
                {formData.metadata.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter tag"
                    />
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="p-2 text-red-600 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTag}
                  className="flex gap-2 items-center px-3 py-1 text-sm text-blue-600 rounded-lg transition-colors dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Tag
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 100"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., gpt-4, claude-3, etc."
              />
            </div>
          </div>

          {/* Sharing Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Sharing Settings
            </h3>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="private">Private</option>
                <option value="project">Project</option>
                <option value="organization">Organization</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div>
              <label className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={formData.sharing.allowFork}
                  onChange={(e) =>
                    handleNestedInputChange(
                      ["sharing", "allowFork"],
                      e.target.checked,
                    )
                  }
                  className="text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Allow others to fork this template
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 items-center text-sm text-gray-500 dark:text-gray-400">
            {hasChanges ? (
              <span className="text-amber-600 dark:text-amber-400">
                You have unsaved changes
              </span>
            ) : (
              <span>No changes made</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 rounded-lg transition-colors dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !hasChanges}
              className="flex gap-2 items-center px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
