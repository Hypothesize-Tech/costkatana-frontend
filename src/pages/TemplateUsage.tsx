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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate("/templates")}
                className="flex gap-2 items-center px-4 py-2 text-gray-600 bg-gray-100/50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-105 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to Templates
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <FiEdit3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Template Workshop
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Select and customize prompt templates to match your exact needs
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          {/* Enhanced Template Selection */}
          <div className="xl:col-span-4">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <FiTag className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
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
                  className="w-full px-4 py-3 pl-10 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:text-white placeholder-gray-500"
                />
                <div className="absolute left-3 top-3.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Template Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredTemplates.length}</div>
                  <div className="text-xs text-blue-600/80 dark:text-blue-400/80">Available</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{templates.filter(t => t.isFavorite).length}</div>
                  <div className="text-xs text-purple-600/80 dark:text-purple-400/80">Favorites</div>
                </div>
              </div>

              {/* Template List */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {filteredTemplates.length > 0 ? filteredTemplates.map((template) => (
                  <div
                    key={template._id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 ${selectedTemplate?._id === template._id
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-lg scale-102"
                      : "border-gray-200/50 hover:border-gray-300 dark:border-gray-600/50 dark:hover:border-gray-500 bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700"
                      }`}
                  >
                    {selectedTemplate?._id === template._id && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <FiCheck className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between pr-8">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {template.name}
                          </h3>
                          {template.isFavorite && (
                            <FiStar className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                            {template.category}
                          </span>
                          {template.variables && template.variables.length > 0 && (
                            <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-700 dark:text-green-300 rounded-full">
                              {template.variables.length} variables
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <FiTag className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">No templates found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Template Customization */}
          <div className="xl:col-span-8">
            {selectedTemplate ? (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl">
                {/* Template Header */}
                <div className="border-b border-gray-200/50 dark:border-gray-600/50 pb-6 mb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedTemplate.name}
                        </h2>
                        {selectedTemplate.isFavorite && (
                          <FiStar className="w-5 h-5 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {selectedTemplate.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 rounded-full">
                          {selectedTemplate.category}
                        </span>
                        {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                          <span className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-700 dark:text-green-300 rounded-full">
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
                      <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                        <FiEdit3 className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Template Variables
                      </h3>
                    </div>
                    <div className="grid gap-6">
                      {selectedTemplate.variables.map((variable, index) => (
                        <div key={variable.name} className="group">
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 transition-all duration-200 hover:shadow-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                                    {variable.name}
                                    {variable.required && (
                                      <span className="text-red-500 ml-1 text-lg">*</span>
                                    )}
                                  </label>
                                  {variable.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {variable.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${variable.required
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
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
                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:text-white placeholder-gray-500 resize-none"
                              />
                            ) : (
                              <input
                                type="text"
                                value={variables[variable.name] || ""}
                                onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                                placeholder={variable.defaultValue || `Enter ${variable.name}...`}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:text-white placeholder-gray-500"
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
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                      <FiPlay className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Generated Prompt
                    </h3>
                  </div>

                  <div className="relative">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-300 dark:border-gray-600 overflow-hidden shadow-2xl">
                      {/* Code Header */}
                      <div className="flex items-center justify-between bg-gray-800/50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-600">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-sm text-gray-300 font-medium">prompt.txt</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCopyPrompt}
                            disabled={!generatedPrompt}
                            className={`flex gap-2 items-center px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${copySuccess
                              ? "bg-green-500 text-white"
                              : !generatedPrompt
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : "bg-gray-600 text-gray-200 hover:bg-gray-500 hover:scale-105"
                              }`}
                          >
                            {copySuccess ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                            {copySuccess ? "Copied!" : "Copy"}
                          </button>
                          <button
                            onClick={handleTemplateUsage}
                            disabled={!generatedPrompt || usingTemplate}
                            className={`flex gap-2 items-center px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${!generatedPrompt
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : usingTemplate
                                ? "bg-blue-400 text-white cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:scale-105 shadow-lg"
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
                      <div className="p-6 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                        {generatedPrompt ? (
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-100 font-mono">
                            {generatedPrompt}
                          </pre>
                        ) : (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                              <FiEdit3 className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-400 mb-2">Generated prompt will appear here</p>
                            <p className="text-sm text-gray-500">Fill in the variables above to see the result</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Character Count */}
                    {generatedPrompt && (
                      <div className="flex items-center justify-between mt-3 px-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {generatedPrompt.length} characters • {generatedPrompt.split(' ').length} words
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Ready to use
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Enhanced Empty State */
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-xl">
                <div className="text-center py-12">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                      <FiEdit3 className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-2">
                      <div className="w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Ready to Create?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Select a template from the library to start customizing and generating your perfect prompt
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                      <div className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-1">1</div>
                      <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Choose Template</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                      <div className="text-purple-600 dark:text-purple-400 font-bold text-lg mb-1">2</div>
                      <div className="text-sm text-purple-600/80 dark:text-purple-400/80">Fill Variables</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                      <div className="text-green-600 dark:text-green-400 font-bold text-lg mb-1">3</div>
                      <div className="text-sm text-green-600/80 dark:text-green-400/80">Generate & Use</div>
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
