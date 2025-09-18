import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiMinus,
  FiCheck,
  FiCode,
  FiTag,
  FiSettings,
  FiZap,
  FiBookOpen,
  FiStar,
  FiCpu,
  FiZap as FiWand,
  FiSearch,
  FiTrendingUp,
  FiCpu as FiBrain,
  FiRefreshCw,
  FiTarget,
  FiAlertCircle,
} from "react-icons/fi";
import { Modal } from "../common/Modal";
import { TemplateVariable } from "../../types/promptTemplate.types";
import { PromptTemplateService } from "../../services/promptTemplate.service";
import { toast } from "react-hot-toast";

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

  // AI Feature States
  const [aiMode, setAiMode] = useState(false);
  const [aiIntent, setAiIntent] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDetecting, setAiDetecting] = useState(false);
  const [effectivenessScore, setEffectivenessScore] = useState<any>(null);
  const [predictingEffectiveness, setPredictingEffectiveness] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [selectedContext, setSelectedContext] = useState({
    projectType: "",
    industry: "",
    targetAudience: "",
    tone: "professional" as "formal" | "casual" | "technical" | "creative" | "professional",
  });

  const categories = [
    { value: "general", label: "General", icon: FiBookOpen, color: "bg-gray-100 text-gray-800" },
    { value: "coding", label: "Coding", icon: FiCode, color: "bg-blue-100 text-blue-800" },
    { value: "writing", label: "Writing", icon: FiBookOpen, color: "bg-green-100 text-green-800" },
    { value: "analysis", label: "Analysis", icon: FiZap, color: "bg-purple-100 text-purple-800" },
    { value: "creative", label: "Creative", icon: FiStar, color: "bg-pink-100 text-pink-800" },
    { value: "business", label: "Business", icon: FiSettings, color: "bg-yellow-100 text-yellow-800" },
  ];

  const toneOptions = [
    { value: "formal", label: "Formal", icon: "👔" },
    { value: "casual", label: "Casual", icon: "😊" },
    { value: "technical", label: "Technical", icon: "🔧" },
    { value: "creative", label: "Creative", icon: "🎨" },
    { value: "professional", label: "Professional", icon: "💼" },
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

  // AI: Generate template from intent
  const generateFromIntent = async () => {
    if (!aiIntent.trim()) {
      toast.error("Please describe what template you want to create");
      return;
    }

    setAiGenerating(true);
    try {
      const result = await PromptTemplateService.generateFromIntent({
        intent: aiIntent,
        category: formData.category,
        context: selectedContext,
      });

      if (result) {
        const { template, metadata } = result;

        setFormData({
          ...formData,
          name: template.name || "",
          description: template.description || "",
          content: template.content,
          category: template.category,
          variables: template.variables || [],
          metadata: {
            ...formData.metadata,
            tags: template.metadata?.tags || [""],
          },
        });

        // Show alternatives if available
        if (metadata.alternativeVersions?.length > 0) {
          setAiSuggestions(metadata.alternativeVersions);
          setShowAiSuggestions(true);
        }

        toast.success(`Template generated with ${metadata.confidence}% confidence!`);
        setAiMode(false);
      } else {
        toast.error("Failed to generate template");
      }
    } catch (error) {
      toast.error("Error generating template from AI");
      console.error(error);
    } finally {
      setAiGenerating(false);
    }
  };

  // AI: Detect variables automatically
  const detectVariablesWithAI = async () => {
    if (!formData.content.trim()) {
      toast.error("Please enter template content first");
      return;
    }

    setAiDetecting(true);
    try {
      const result = await PromptTemplateService.detectVariables({
        content: formData.content,
        autoFillDefaults: true,
        validateTypes: true,
      });

      if (result) {
        const { variables, suggestions } = result;

        setFormData((prev) => ({
          ...prev,
          variables: variables,
        }));

        if (suggestions?.length > 0) {
          toast.success(
            `Detected ${variables.length} variables. ${suggestions.length} additional suggestions available.`,
            { duration: 5000 }
          );
        } else {
          toast.success(`Detected ${variables.length} variables with smart type detection!`);
        }
      } else {
        toast.error("Failed to detect variables");
      }
    } catch (error) {
      toast.error("Error detecting variables");
      console.error(error);
    } finally {
      setAiDetecting(false);
    }
  };

  // AI: Predict template effectiveness
  const predictEffectiveness = async () => {
    if (!formData.content.trim()) {
      toast.error("Please enter template content first");
      return;
    }

    setPredictingEffectiveness(true);
    try {
      // Create a temporary template to test
      const template = await PromptTemplateService.createTemplate({
        ...formData,
        name: formData.name || "Temporary Test",
      } as any);

      if (!template) {
        toast.error("Failed to analyze template");
        return;
      }

      const templateId = template._id;

      // Predict effectiveness
      const effectivenessResult = await PromptTemplateService.predictEffectiveness(
        templateId,
        {}
      );

      if (effectivenessResult) {
        setEffectivenessScore(effectivenessResult);

        // Clean up temporary template
        await PromptTemplateService.deleteTemplate(templateId);
      } else {
        toast.error("Failed to predict effectiveness");
      }
    } catch (error) {
      toast.error("Error predicting effectiveness");
      console.error(error);
    } finally {
      setPredictingEffectiveness(false);
    }
  };

  // Auto-detect variables when content changes (fallback if AI not used)
  useEffect(() => {
    if (!aiDetecting) {
      const variableRegex = /\{\{([^}]+)\}\}/g;
      const matches = formData.content.match(variableRegex);

      if (matches) {
        const existingVarNames = formData.variables.map(v => v.name);
        const newVariables = matches
          .map((match) => {
            const name = match.replace(/\{\{|\}\}/g, "").trim();
            return name;
          })
          .filter((name, index, self) => self.indexOf(name) === index)
          .filter(name => !existingVarNames.includes(name))
          .map(name => ({
            name,
            type: "text" as const,
            description: "",
            required: false,
            defaultValue: "",
          }));

        if (newVariables.length > 0) {
          setFormData((prev) => ({
            ...prev,
            variables: [...prev.variables, ...newVariables],
          }));
        }
      }
    }
  }, [formData.content, aiDetecting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.content) {
      toast.error("Template name and content are required");
      return;
    }

    setLoading(true);
    try {
      const cleanTags = formData.metadata.tags.filter((tag) => tag.trim() !== "");

      await onSubmit({
        ...formData,
        metadata: {
          ...formData.metadata,
          tags: cleanTags.length > 0 ? cleanTags : undefined,
          aiGenerated: aiMode,
        },
      });

      onClose();
    } catch (error) {
      console.error("Error creating template:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="xl" title="Create Template">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AI Mode Toggle */}
        <div className="glass flex items-center justify-between p-4 rounded-xl border border-primary-200/30 backdrop-blur-xl bg-gradient-primary/5 shadow-lg">
          <div className="flex items-center space-x-3">
            <FiBrain className="w-6 h-6 text-primary-500" />
            <div>
              <h3 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                AI-Powered Template Creation
              </h3>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
                Let AI generate your template from a simple description
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAiMode(!aiMode)}
            className={`px-4 py-2 rounded-xl font-display font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${aiMode
              ? "bg-gradient-primary text-white hover:shadow-xl"
              : "glass bg-gradient-secondary text-white hover:shadow-xl"
              }`}
          >
            {aiMode ? "AI Mode On" : "AI Mode Off"}
          </button>
        </div>

        {/* AI Generation Panel */}
        {aiMode && (
          <div className="glass space-y-4 p-4 rounded-xl border border-primary-200/30 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel shadow-lg">
            <div>
              <label className="block text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                <FiWand className="inline w-4 h-4 mr-1 text-primary-500" />
                Describe Your Template
              </label>
              <textarea
                value={aiIntent}
                onChange={(e) => setAiIntent(e.target.value)}
                placeholder="E.g., 'Create a template for writing SEO-optimized blog posts with sections for keywords, meta description, and content outline'"
                className="input w-full"
                rows={3}
              />
            </div>

            {/* AI Context Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label text-xs">
                  Industry
                </label>
                <input
                  type="text"
                  value={selectedContext.industry}
                  onChange={(e) =>
                    setSelectedContext({ ...selectedContext, industry: e.target.value })
                  }
                  placeholder="e.g., Technology, Healthcare"
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="label text-xs">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={selectedContext.targetAudience}
                  onChange={(e) =>
                    setSelectedContext({ ...selectedContext, targetAudience: e.target.value })
                  }
                  placeholder="e.g., Developers, Marketers"
                  className="input text-sm"
                />
              </div>
            </div>

            {/* Tone Selection */}
            <div>
              <label className="label text-xs mb-2">
                Tone
              </label>
              <div className="flex space-x-2">
                {toneOptions.map((tone) => (
                  <button
                    key={tone.value}
                    type="button"
                    onClick={() =>
                      setSelectedContext({
                        ...selectedContext,
                        tone: tone.value as any,
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl text-sm font-display font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${selectedContext.tone === tone.value
                      ? "bg-gradient-primary text-white hover:shadow-xl"
                      : "glass bg-gradient-secondary text-white hover:shadow-xl"
                      }`}
                  >
                    <span className="mr-1">{tone.icon}</span>
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={generateFromIntent}
              disabled={aiGenerating || !aiIntent.trim()}
              className="w-full px-4 py-3 bg-gradient-primary text-white rounded-xl font-display font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center justify-center shadow-lg"
            >
              {aiGenerating ? (
                <>
                  <FiRefreshCw className="animate-spin mr-2" />
                  Generating Template...
                </>
              ) : (
                <>
                  <FiCpu className="mr-2" />
                  Generate with AI
                </>
              )}
            </button>
          </div>
        )}

        {/* Alternative Suggestions */}
        {showAiSuggestions && aiSuggestions.length > 0 && (
          <div className="glass p-4 rounded-xl border border-primary-200/30 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel shadow-lg">
            <h4 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
              Alternative Versions Available
            </h4>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      content: suggestion.content,
                    });
                    setShowAiSuggestions(false);
                  }}
                  className="w-full text-left p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Version {index + 1}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {suggestion.content.substring(0, 100)}...
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div>
          <label className="label">
            Template Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter template name"
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe what this template does"
            className="input"
            rows={2}
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className="label">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleInputChange("category", cat.value)}
                  className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-lg font-display font-semibold ${formData.category === cat.value
                    ? "border-primary-500 bg-gradient-primary/10 text-primary-600 dark:text-primary-400 hover:shadow-xl"
                    : "border-primary-200/30 glass backdrop-blur-xl hover:border-primary-300/40 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Template Content with AI Tools */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label">
              Template Content *
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={detectVariablesWithAI}
                disabled={aiDetecting || !formData.content}
                className="px-3 py-1 text-xs font-display font-semibold bg-gradient-highlight text-white rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center shadow-lg"
              >
                {aiDetecting ? (
                  <>
                    <FiRefreshCw className="animate-spin mr-1 w-3 h-3" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <FiSearch className="mr-1 w-3 h-3" />
                    AI Detect Variables
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={predictEffectiveness}
                disabled={predictingEffectiveness || !formData.content}
                className="px-3 py-1 text-xs font-display font-semibold bg-gradient-success text-white rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center shadow-lg"
              >
                {predictingEffectiveness ? (
                  <>
                    <FiRefreshCw className="animate-spin mr-1 w-3 h-3" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FiTrendingUp className="mr-1 w-3 h-3" />
                    Predict Effectiveness
                  </>
                )}
              </button>
            </div>
          </div>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            placeholder="Enter your template content. Use {{variableName}} for variables."
            className="input font-mono text-sm"
            rows={8}
            required
          />
          <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
            Tip: Use {"{{variableName}}"} syntax to create variables that users can fill in
          </p>
        </div>

        {/* Effectiveness Score Display */}
        {effectivenessScore && (
          <div className="glass p-4 rounded-xl border border-primary-200/30 backdrop-blur-xl bg-gradient-success/5 shadow-lg">
            <h4 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3 flex items-center">
              <FiTarget className="mr-2 text-success-500" />
              AI Effectiveness Analysis
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Overall Score</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {effectivenessScore.overall}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                    style={{ width: `${effectivenessScore.overall}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Clarity</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {effectivenessScore.clarity}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                    style={{ width: `${effectivenessScore.clarity}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Specificity</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {effectivenessScore.specificity}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                    style={{ width: `${effectivenessScore.specificity}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Token Efficiency</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {effectivenessScore.tokenEfficiency}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full"
                    style={{ width: `${effectivenessScore.tokenEfficiency}%` }}
                  />
                </div>
              </div>
            </div>
            {effectivenessScore.suggestions && effectivenessScore.suggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  AI Suggestions:
                </p>
                <ul className="space-y-1">
                  {effectivenessScore.suggestions.slice(0, 3).map((suggestion: string, idx: number) => (
                    <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                      <FiAlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0 text-yellow-500" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Variables Section */}
        {formData.variables.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Variables ({formData.variables.length})
              </label>
            </div>
            <div className="space-y-3">
              {formData.variables.map((variable, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {`{{${variable.name}}}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariable(index)}
                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Type
                      </label>
                      <select
                        value={variable.type}
                        onChange={(e) =>
                          handleVariableChange(index, "type", e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                        <option value="code">Code</option>
                        <option value="json">JSON</option>
                        <option value="url">URL</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Default Value
                      </label>
                      <input
                        type="text"
                        value={variable.defaultValue || ""}
                        onChange={(e) =>
                          handleVariableChange(index, "defaultValue", e.target.value)
                        }
                        placeholder="Optional"
                        className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={variable.description || ""}
                      onChange={(e) =>
                        handleVariableChange(index, "description", e.target.value)
                      }
                      placeholder="What is this variable for?"
                      className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <div className="mt-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={variable.required}
                      onChange={(e) =>
                        handleVariableChange(index, "required", e.target.checked)
                      }
                      className="mr-2"
                    />
                    <label className="text-xs text-gray-600 dark:text-gray-400">
                      Required
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            <FiTag className="inline w-4 h-4 mr-1 text-primary-500" />
            Tags
          </label>
          <div className="space-y-2">
            {formData.metadata.tags.map((tag, index) => (
              <div key={index} className="glass flex items-center space-x-2 p-3 rounded-xl border border-primary-200/30 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel shadow-lg">
                <FiTag className="w-4 h-4 text-primary-500" />
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => handleTagChange(index, e.target.value)}
                  placeholder="Enter tag"
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="p-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTag}
              className="glass flex items-center space-x-2 p-3 rounded-xl border border-primary-200/30 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              <FiPlus className="w-4 h-4" />
              <span className="text-sm font-display font-semibold">Add Tag</span>
            </button>
          </div>
        </div>

        {/* Advanced Settings */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="glass flex items-center space-x-2 p-3 rounded-xl border border-primary-200/30 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-light-text-primary dark:text-dark-text-primary"
          >
            <FiSettings className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-display font-semibold">Advanced Settings</span>
          </button>

          {showAdvanced && (
            <div className="glass mt-4 space-y-4 p-4 rounded-xl border border-primary-200/30 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel shadow-lg">
              <div>
                <label className="block text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Visibility
                </label>
                <select
                  value={formData.sharing.visibility}
                  onChange={(e) =>
                    handleNestedInputChange(["sharing", "visibility"], e.target.value)
                  }
                  className="input w-full"
                >
                  <option value="private">Private</option>
                  <option value="project">Project</option>
                  <option value="organization">Organization</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <div className="glass flex items-center space-x-3 p-3 rounded-xl border border-primary-200/30 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel shadow-lg">
                <input
                  type="checkbox"
                  checked={formData.sharing.allowFork}
                  onChange={(e) =>
                    handleNestedInputChange(["sharing", "allowFork"], e.target.checked)
                  }
                  className="w-4 h-4 text-primary-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-2"
                />
                <label className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">
                  Allow others to fork this template
                </label>
              </div>

              <div>
                <label className="block text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Language
                </label>
                <select
                  value={formData.metadata.language}
                  onChange={(e) =>
                    handleNestedInputChange(["metadata", "language"], e.target.value)
                  }
                  className="input w-full"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-primary-200/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 dark:text-dark-text-secondary glass bg-gradient-secondary text-white rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 font-display font-semibold shadow-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.name || !formData.content}
            className="px-6 py-2 bg-gradient-primary text-white rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-300 hover:scale-105 font-display font-semibold shadow-lg"
          >
            {loading ? (
              <>
                <FiRefreshCw className="animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <FiCheck className="mr-2" />
                Create Template
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};