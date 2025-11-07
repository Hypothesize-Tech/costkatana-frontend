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
      <div className="p-6 mx-auto max-w-7xl">
        {/* Enhanced Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r rounded-2xl blur-3xl from-primary-600/10 to-success-600/10"></div>
          <div className="relative p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex gap-4 items-center mb-4">
              <button
                onClick={() => navigate("/templates")}
                className="flex gap-2 items-center btn btn-secondary"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to Templates
              </button>
            </div>
            <div className="flex gap-4 items-center">
              <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary">
                <FiEdit3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-display gradient-text-primary">
                  Template Workshop
                </h1>
                <p className="mt-2 text-secondary-600 dark:text-secondary-300">
                  Select and customize prompt templates to match your exact needs
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          {/* Enhanced Template Selection */}
          <div className="xl:col-span-4">
            <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex gap-3 items-center mb-6">
                <div className="p-2 rounded-lg bg-gradient-success">
                  <FiTag className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-2xl font-bold font-display text-secondary-900 dark:text-white">
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
                  className="pl-10 input"
                />
                <div className="absolute left-3 top-3.5">
                  <svg className="w-4 h-4 text-secondary-600 dark:text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Template Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br rounded-lg border from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200/50 dark:border-primary-700/50">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{filteredTemplates.length}</div>
                  <div className="text-xs text-primary-600/80 dark:text-primary-400/80">Available</div>
                </div>
                <div className="p-3 bg-gradient-to-br rounded-lg border from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 border-accent-200/50 dark:border-accent-700/50">
                  <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">{templates.filter(t => t.isFavorite).length}</div>
                  <div className="text-xs text-accent-600/80 dark:text-accent-400/80">Favorites</div>
                </div>
              </div>

              {/* Template List */}
              <div className="overflow-y-auto pr-2 space-y-3 max-h-96 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
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
                        <div className="flex justify-center items-center w-6 h-6 rounded-full bg-primary-500">
                          <FiCheck className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-start pr-8">
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-2 items-center mb-2">
                          <h3 className="font-semibold truncate transition-colors text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                            {template.name}
                          </h3>
                          {template.isFavorite && (
                            <FiStar className="flex-shrink-0 w-4 h-4 fill-current text-accent-500" />
                          )}
                        </div>
                        <p className="mb-3 text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex gap-2 items-center">
                          <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r rounded-full from-secondary-100 to-secondary-200 dark:from-secondary-600 dark:to-secondary-700 text-secondary-700 dark:text-secondary-300">
                            {template.category}
                          </span>
                          {template.variables && template.variables.length > 0 && (
                            <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r rounded-full from-success-100 to-success-200 dark:from-success-900/30 dark:to-success-800/30 text-success-700 dark:text-success-300">
                              {template.variables.length} variables
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-8 text-center">
                    <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full bg-secondary-100 dark:bg-secondary-700">
                      <FiTag className="w-8 h-8 text-secondary-400" />
                    </div>
                    <p className="text-secondary-500 dark:text-secondary-400">No templates found</p>
                    <p className="mt-1 text-sm text-secondary-400 dark:text-secondary-500">Try adjusting your search</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Template Customization */}
          <div className="xl:col-span-8">
            {selectedTemplate ? (
              <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                {/* Template Header */}
                <div className="pb-6 mb-6 border-b border-primary-200/50 dark:border-primary-600/50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex gap-3 items-center mb-2">
                        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                          {selectedTemplate.name}
                        </h2>
                        {selectedTemplate.isFavorite && (
                          <FiStar className="w-5 h-5 fill-current text-accent-500" />
                        )}
                      </div>
                      <p className="mb-3 text-secondary-600 dark:text-secondary-400">
                        {selectedTemplate.description}
                      </p>
                      <div className="flex gap-2 items-center">
                        <span className="px-3 py-1 text-sm font-medium bg-gradient-to-r rounded-full from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300">
                          {selectedTemplate.category}
                        </span>
                        {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                          <span className="px-3 py-1 text-sm font-medium bg-gradient-to-r rounded-full from-success-100 to-success-200 dark:from-success-900/30 dark:to-success-800/30 text-success-700 dark:text-success-300">
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
                    <div className="flex gap-3 items-center mb-6">
                      <div className="p-2 bg-gradient-to-br rounded-lg from-accent-500 to-warning-600">
                        <FiEdit3 className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                        Template Variables
                      </h3>
                    </div>
                    <div className="grid gap-6">
                      {selectedTemplate.variables.map((variable, index) => (
                        <div key={variable.name} className="group">
                          <div className="p-4 bg-gradient-to-r rounded-xl border transition-all duration-200 from-secondary-50 to-secondary-100/50 dark:from-secondary-700/50 dark:to-secondary-600/50 border-secondary-200/50 dark:border-secondary-600/50 hover:shadow-lg">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex gap-3 items-center">
                                <div className="flex justify-center items-center w-8 h-8 text-sm font-bold text-white bg-gradient-to-br rounded-lg from-primary-500 to-highlight-600">
                                  {index + 1}
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-secondary-900 dark:text-white">
                                    {variable.name}
                                    {variable.required && (
                                      <span className="ml-1 text-lg text-danger-500">*</span>
                                    )}
                                  </label>
                                  {variable.description && (
                                    <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                                      {variable.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 items-center">
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
                                className="resize-none input"
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
                  <div className="flex gap-3 items-center mb-6">
                    <div className="p-2 bg-gradient-to-br rounded-lg from-highlight-500 to-accent-600">
                      <FiPlay className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                      Generated Prompt
                    </h3>
                  </div>

                  <div className="relative">
                    <div className="overflow-hidden bg-gradient-to-br rounded-xl border shadow-2xl from-secondary-900 to-secondary-800 dark:from-secondary-800 dark:to-secondary-900 border-primary-300 dark:border-primary-600">
                      {/* Code Header */}
                      <div className="flex justify-between items-center px-4 py-3 border-b bg-secondary-800/50 dark:bg-secondary-700/50 border-primary-600">
                        <div className="flex gap-3 items-center">
                          <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-danger-500"></div>
                            <div className="w-3 h-3 rounded-full bg-accent-500"></div>
                            <div className="w-3 h-3 rounded-full bg-success-500"></div>
                          </div>
                          <span className="text-sm font-medium text-secondary-300">prompt.txt</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCopyPrompt}
                            disabled={!generatedPrompt}
                            className={`flex gap-2 items-center px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${copySuccess
                              ? "text-white bg-success-500"
                              : !generatedPrompt
                                ? "cursor-not-allowed bg-secondary-600 text-secondary-400"
                                : "bg-secondary-600 text-secondary-200 hover:bg-secondary-500 hover:scale-105"
                              }`}
                          >
                            {copySuccess ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                            {copySuccess ? "Copied!" : "Copy"}
                          </button>
                          <button
                            onClick={handleTemplateUsage}
                            disabled={!generatedPrompt || usingTemplate}
                            className={`btn flex gap-2 items-center px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${!generatedPrompt
                              ? "cursor-not-allowed bg-secondary-600 text-secondary-400"
                              : usingTemplate
                                ? "text-white cursor-not-allowed bg-primary-400"
                                : "text-white shadow-lg bg-gradient-primary hover:bg-gradient-to-r hover:from-primary-600 hover:to-success-700 hover:scale-105"
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
                      <div className="overflow-y-auto p-6 max-h-96 scrollbar-thin scrollbar-thumb-secondary-600 scrollbar-track-secondary-800">
                        {generatedPrompt ? (
                          <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-secondary-100">
                            {generatedPrompt}
                          </pre>
                        ) : (
                          <div className="py-12 text-center">
                            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full bg-secondary-700">
                              <FiEdit3 className="w-8 h-8 text-secondary-400" />
                            </div>
                            <p className="mb-2 text-secondary-400">Generated prompt will appear here</p>
                            <p className="text-sm text-secondary-500">Fill in the variables above to see the result</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Character Count */}
                    {generatedPrompt && (
                      <div className="flex justify-between items-center px-1 mt-3">
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
              <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="py-12 text-center">
                  <div className="relative mb-8">
                    <div className="flex justify-center items-center mx-auto w-24 h-24 bg-gradient-to-br rounded-full from-primary-100 to-success-100 dark:from-primary-900/30 dark:to-success-900/30">
                      <FiEdit3 className="w-12 h-12 text-primary-400" />
                    </div>
                    <div className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-2">
                      <div className="w-6 h-6 rounded-full animate-pulse bg-accent-400"></div>
                    </div>
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-secondary-900 dark:text-white">
                    Ready to Create?
                  </h3>
                  <p className="mx-auto mb-6 max-w-md text-secondary-600 dark:text-secondary-400">
                    Select a template from the library to start customizing and generating your perfect prompt
                  </p>
                  <div className="grid grid-cols-1 gap-4 mx-auto max-w-2xl md:grid-cols-3">
                    <div className="p-4 bg-gradient-to-br rounded-xl border from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200/50 dark:border-primary-700/50">
                      <div className="mb-1 text-lg font-bold text-primary-600 dark:text-primary-400">1</div>
                      <div className="text-sm text-primary-600/80 dark:text-primary-400/80">Choose Template</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br rounded-xl border from-highlight-50 to-highlight-100 dark:from-highlight-900/20 dark:to-highlight-800/20 border-highlight-200/50 dark:border-highlight-700/50">
                      <div className="mb-1 text-lg font-bold text-highlight-600 dark:text-highlight-400">2</div>
                      <div className="text-sm text-highlight-600/80 dark:text-highlight-400/80">Fill Variables</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br rounded-xl border from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200/50 dark:border-success-700/50">
                      <div className="mb-1 text-lg font-bold text-success-600 dark:text-success-400">3</div>
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
