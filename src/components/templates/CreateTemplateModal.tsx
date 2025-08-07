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
  FiX,
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Template
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create a reusable prompt template with variables
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <FiInfo className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Email Writer, Code Reviewer"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Describe what this template does and when to use it"
                />
              </div>
            </div>

            {/* Template Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FiCode className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Template Content *
                </h3>
              </div>

              <div className="relative">
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 font-mono text-sm rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 max-w-xs">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      💡 Use {"{{variable_name}}"} for dynamic content
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Variables Section */}
            {formData.variables.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FiTag className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Variables ({formData.variables.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.variables.map((variable, index) => (
                    <div
                      key={index}
                      className="p-4 space-y-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {variable.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVariable(index)}
                          className="text-red-600 hover:text-red-700 p-1"
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
                        className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Describe what this variable is for (optional)"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Options */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <FiPlus className={`transform transition-transform ${showAdvanced ? 'rotate-45' : ''}`} />
                Advanced Options
              </button>

              {showAdvanced && (
                <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  {/* Tags */}
                  <div>
                    <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tags
                    </label>
                    <div className="space-y-2">
                      {formData.metadata.tags.map((tag, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={tag}
                            onChange={(e) => handleTagChange(index, e.target.value)}
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Enter tag"
                          />
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-700"
                          >
                            <FiMinus />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addTag}
                        className="flex gap-2 items-center text-sm text-blue-600 hover:text-blue-700"
                      >
                        <FiPlus /> Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Visibility
                    </label>
                    <select
                      value={formData.sharing.visibility}
                      onChange={(e) =>
                        handleNestedInputChange(["sharing", "visibility"], e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FiEye className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Preview
                  </h3>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  {formData.name && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {formData.name}
                      </h4>
                      {formData.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {formData.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${categories.find(c => c.value === formData.category)?.color || 'bg-gray-100 text-gray-800'
                          }`}>
                          {categories.find(c => c.value === formData.category)?.label}
                        </span>
                        {formData.variables.length > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formData.variables.length} variable{formData.variables.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.content && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        Template Content:
                      </h5>
                      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        {formData.content}
                      </pre>
                    </div>
                  )}

                  {formData.variables.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        Variables:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {formData.variables.map((variable, index) => (
                          <div key={index} className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                            <span className="font-mono">{variable.name}</span>
                            {variable.description && (
                              <span className="text-xs opacity-75">- {variable.description}</span>
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
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-700 rounded-xl transition-colors dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.content}
            className="flex items-center gap-2 px-8 py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
