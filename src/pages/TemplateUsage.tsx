import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCopy, FiPlay, FiStar, FiCheck, FiLoader, FiTag, FiEdit3 } from "react-icons/fi";
import { PromptTemplateService } from "../services/promptTemplate.service";
import { PromptTemplate } from "../types/promptTemplate.types";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useNotification } from "../contexts/NotificationContext";

const TemplateUsagePage: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [usingTemplate, setUsingTemplate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await PromptTemplateService.getTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load templates";
      console.error("Error loading templates:", error);
      setTemplates([]);
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    // Initialize variables
    const vars: Record<string, string> = {};
    template.variables?.forEach((variable) => {
      vars[variable.name] = variable.defaultValue || "";
    });
    setVariables(vars);
    generatePrompt(template, vars);
  };

  const generatePrompt = (
    template: PromptTemplate,
    vars: Record<string, string>,
  ) => {
    let prompt = template.content;
    Object.entries(vars).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, "g"), value);
    });
    setGeneratedPrompt(prompt);
  };

  const handleVariableChange = (name: string, value: string) => {
    const newVariables = { ...variables, [name]: value };
    setVariables(newVariables);
    if (selectedTemplate) {
      generatePrompt(selectedTemplate, newVariables);
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopySuccess(true);
      showNotification("Prompt copied to clipboard!", "success");
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      showNotification("Failed to copy prompt", "error");
    }
  };

  const handleTemplateUsage = async () => {
    if (!selectedTemplate) return;

    try {
      setUsingTemplate(true);
      const templateService = PromptTemplateService;
      await templateService.useTemplate(selectedTemplate._id, variables);
      showNotification(
        `Template "${selectedTemplate.name}" used successfully!`,
        "success",
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to use template";
      console.error("Error using template:", error);
      showNotification(errorMessage, "error");
    } finally {
      setUsingTemplate(false);
    }
  };

  // Filter templates based on search query
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-success-600/10 rounded-2xl blur-3xl"></div>
          <div className="relative glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate("/templates")}
                className="btn btn-secondary flex gap-2 items-center"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to Templates
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-primary rounded-xl shadow-lg glow-primary">
                <FiEdit3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold gradient-text-primary">
                  Template Workshop
                </h1>
                <p className="text-secondary-600 dark:text-secondary-300 mt-2">
                  Select and customize prompt templates to match your exact needs
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          {/* Enhanced Template Selection */}
          <div className="xl:col-span-4">
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-success rounded-lg">
                  <FiTag className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold text-secondary-900 dark:text-white">
                  Template Library
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
                <div className="absolute left-3 top-3.5">
                  <svg className="w-4 h-4 text-secondary-600 dark:text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Template Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-3 rounded-lg border border-primary-200/50 dark:border-primary-700/50">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{filteredTemplates.length}</div>
                  <div className="text-xs text-primary-600/80 dark:text-primary-400/80">Available</div>
                </div>
                <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 p-3 rounded-lg border border-accent-200/50 dark:border-accent-700/50">
                  <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">{templates.filter(t => t.isFavorite).length}</div>
                  <div className="text-xs text-accent-600/80 dark:text-accent-400/80">Favorites</div>
                </div>
              </div>

              {/* Template List */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {filteredTemplates.length > 0 ? filteredTemplates.map((template) => (
                  <div
                    key={template._id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 ${selectedTemplate?._id === template._id
                      ? "border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 shadow-lg scale-102"
                      : "border-secondary-200/50 hover:border-secondary-300 dark:border-secondary-600/50 dark:hover:border-secondary-500 bg-white/50 dark:bg-secondary-700/50 hover:bg-white dark:hover:bg-secondary-700"
                      }`}
                  >
                    {selectedTemplate?._id === template._id && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <FiCheck className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between pr-8">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-secondary-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {template.name}
                          </h3>
                          {template.isFavorite && (
                            <FiStar className="w-4 h-4 text-accent-500 fill-current flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2 mb-3">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-secondary-100 to-secondary-200 dark:from-secondary-600 dark:to-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-full">
                            {template.category}
                          </span>
                          {template.variables && template.variables.length > 0 && (
                            <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-success-100 to-success-200 dark:from-success-900/30 dark:to-success-800/30 text-success-700 dark:text-success-300 rounded-full">
                              {template.variables.length} variables
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 dark:bg-secondary-700 rounded-full flex items-center justify-center">
                      <FiTag className="w-8 h-8 text-secondary-400" />
                    </div>
                    <p className="text-secondary-500 dark:text-secondary-400">No templates found</p>
                    <p className="text-sm text-secondary-400 dark:text-secondary-500 mt-1">Try adjusting your search</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Template Customization */}
          <div className="xl:col-span-8">
            {selectedTemplate ? (
              <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                {/* Template Header */}
                <div className="border-b border-primary-200/50 dark:border-primary-600/50 pb-6 mb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                          {selectedTemplate.name}
                        </h2>
                        {selectedTemplate.isFavorite && (
                          <FiStar className="w-5 h-5 text-accent-500 fill-current" />
                        )}
                      </div>
                      <p className="text-secondary-600 dark:text-secondary-400 mb-3">
                        {selectedTemplate.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 rounded-full">
                          {selectedTemplate.category}
                        </span>
                        {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                          <span className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-success-100 to-success-200 dark:from-success-900/30 dark:to-success-800/30 text-success-700 dark:text-success-300 rounded-full">
                            {selectedTemplate.variables.length} variables
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variables Section */}
                {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-accent-500 to-warning-600 rounded-lg">
                        <FiEdit3 className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                        Template Variables
                      </h3>
                    </div>
                    <div className="grid gap-6">
                      {selectedTemplate.variables.map((variable, index) => (
                        <div key={variable.name} className="group">
                          <div className="bg-gradient-to-r from-secondary-50 to-secondary-100/50 dark:from-secondary-700/50 dark:to-secondary-600/50 rounded-xl p-4 border border-secondary-200/50 dark:border-secondary-600/50 transition-all duration-200 hover:shadow-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-highlight-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-secondary-900 dark:text-white">
                                    {variable.name}
                                    {variable.required && (
                                      <span className="text-danger-500 ml-1 text-lg">*</span>
                                    )}
                                  </label>
                                  {variable.description && (
                                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                                      {variable.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${variable.required
                                  ? "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300"
                                  : "bg-secondary-100 text-secondary-600 dark:bg-secondary-600 dark:text-secondary-300"
                                  }`}>
                                  {variable.required ? "Required" : "Optional"}
                                </span>
                              </div>
                            </div>

                            {variable.type === "text" && variable.name.toLowerCase().includes("description") ? (
                              <textarea
                                value={variables[variable.name] || ""}
                                onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                                placeholder={variable.defaultValue || `Enter ${variable.name}...`}
                                rows={4}
                                className="input resize-none"
                              />
                            ) : (
                              <input
                                type="text"
                                value={variables[variable.name] || ""}
                                onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                                placeholder={variable.defaultValue || `Enter ${variable.name}...`}
                                className="input"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Generated Prompt Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-highlight-500 to-accent-600 rounded-lg">
                      <FiPlay className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                      Generated Prompt
                    </h3>
                  </div>

                  <div className="relative">
                    <div className="bg-gradient-to-br from-secondary-900 to-secondary-800 dark:from-secondary-800 dark:to-secondary-900 rounded-xl border border-primary-300 dark:border-primary-600 overflow-hidden shadow-2xl">
                      {/* Code Header */}
                      <div className="flex items-center justify-between bg-secondary-800/50 dark:bg-secondary-700/50 px-4 py-3 border-b border-primary-600">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-2">
                            <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                          </div>
                          <span className="text-sm text-secondary-300 font-medium">prompt.txt</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCopyPrompt}
                            disabled={!generatedPrompt}
                            className={`flex gap-2 items-center px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${copySuccess
                              ? "bg-success-500 text-white"
                              : !generatedPrompt
                                ? "bg-secondary-600 text-secondary-400 cursor-not-allowed"
                                : "bg-secondary-600 text-secondary-200 hover:bg-secondary-500 hover:scale-105"
                              }`}
                          >
                            {copySuccess ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                            {copySuccess ? "Copied!" : "Copy"}
                          </button>
                          <button
                            onClick={handleTemplateUsage}
                            disabled={!generatedPrompt || usingTemplate}
                            className={`flex gap-2 items-center px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${!generatedPrompt
                              ? "bg-secondary-600 text-secondary-400 cursor-not-allowed"
                              : usingTemplate
                                ? "bg-primary-400 text-white cursor-not-allowed"
                                : "bg-gradient-primary text-white hover:bg-gradient-to-r hover:from-primary-600 hover:to-success-700 hover:scale-105 shadow-lg"
                              }`}
                          >
                            {usingTemplate ? (
                              <FiLoader className="w-4 h-4 animate-spin" />
                            ) : (
                              <FiPlay className="w-4 h-4" />
                            )}
                            {usingTemplate ? "Using..." : "Use Template"}
                          </button>
                        </div>
                      </div>

                      {/* Code Content */}
                      <div className="p-6 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary-600 scrollbar-track-secondary-800">
                        {generatedPrompt ? (
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-secondary-100 font-mono">
                            {generatedPrompt}
                          </pre>
                        ) : (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-secondary-700 rounded-full flex items-center justify-center">
                              <FiEdit3 className="w-8 h-8 text-secondary-400" />
                            </div>
                            <p className="text-secondary-400 mb-2">Generated prompt will appear here</p>
                            <p className="text-sm text-secondary-500">Fill in the variables above to see the result</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Character Count */}
                    {generatedPrompt && (
                      <div className="flex items-center justify-between mt-3 px-1">
                        <div className="text-sm text-secondary-500 dark:text-secondary-400">
                          {generatedPrompt.length} characters • {generatedPrompt.split(' ').length} words
                        </div>
                        <div className="text-sm text-success-500 dark:text-success-400">
                          Ready to use
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Enhanced Empty State */
              <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
                <div className="text-center py-12">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-100 to-success-100 dark:from-primary-900/30 dark:to-success-900/30 rounded-full flex items-center justify-center">
                      <FiEdit3 className="w-12 h-12 text-primary-400" />
                    </div>
                    <div className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-2">
                      <div className="w-6 h-6 bg-accent-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-3">
                    Ready to Create?
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-6 max-w-md mx-auto">
                    Select a template from the library to start customizing and generating your perfect prompt
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl border border-primary-200/50 dark:border-primary-700/50">
                      <div className="text-primary-600 dark:text-primary-400 font-bold text-lg mb-1">1</div>
                      <div className="text-sm text-primary-600/80 dark:text-primary-400/80">Choose Template</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-highlight-50 to-highlight-100 dark:from-highlight-900/20 dark:to-highlight-800/20 rounded-xl border border-highlight-200/50 dark:border-highlight-700/50">
                      <div className="text-highlight-600 dark:text-highlight-400 font-bold text-lg mb-1">2</div>
                      <div className="text-sm text-highlight-600/80 dark:text-highlight-400/80">Fill Variables</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 rounded-xl border border-success-200/50 dark:border-success-700/50">
                      <div className="text-success-600 dark:text-success-400 font-bold text-lg mb-1">3</div>
                      <div className="text-sm text-success-600/80 dark:text-success-400/80">Generate & Use</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateUsagePage;
