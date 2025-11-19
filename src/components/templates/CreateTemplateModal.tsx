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
  FiImage,
  FiDownload,
  FiX,
  FiInfo,
} from "react-icons/fi";
import { Modal } from "../common/Modal";
import { TemplateVariable, PromptTemplate } from "../../types/promptTemplate.types";
import { PromptTemplateService } from "../../services/promptTemplate.service";
import { toast } from "react-hot-toast";

interface CreateTemplateModalProps {
  onClose: () => void;
  onSubmit: (templateData: any) => void;
  existingTemplates?: PromptTemplate[];
}

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  onClose,
  onSubmit,
  existingTemplates = [],
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

  // Visual Compliance specific state
  const [isVisualCompliance, setIsVisualCompliance] = useState(false);
  const [visualComplianceData, setVisualComplianceData] = useState({
    industry: 'retail' as 'jewelry' | 'grooming' | 'retail' | 'fmcg' | 'documents',
    mode: 'optimized' as 'optimized' | 'standard',
    complianceCriteria: [''] as string[],
    imageVariables: [
      { name: 'referenceImage', imageRole: 'reference' as const, description: 'Reference image', required: true },
      { name: 'evidenceImage', imageRole: 'evidence' as const, description: 'Evidence image', required: true }
    ]
  });

  // Fetch Criteria state
  const [showFetchCriteria, setShowFetchCriteria] = useState(false);
  const [selectedTemplateForFetch, setSelectedTemplateForFetch] = useState<string | null>(null);
  const [fetchedFromTemplate, setFetchedFromTemplate] = useState<string | null>(null);

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
    { value: "visual-compliance", label: "Visual Compliance", icon: FiTarget, color: "bg-indigo-100 text-indigo-800" },
  ];

  const toneOptions = [
    { value: "formal", label: "Formal", icon: FiBookOpen },
    { value: "casual", label: "Casual", icon: FiStar },
    { value: "technical", label: "Technical", icon: FiSettings },
    { value: "creative", label: "Creative", icon: FiZap },
    { value: "professional", label: "Professional", icon: FiCpu },
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

  // Fetch Criteria Helper Functions
  const getVisualComplianceTemplates = () => {
    return existingTemplates.filter(t => t.isVisualCompliance && t.isActive);
  };

  const extractCriteriaFromTemplate = (template: PromptTemplate): string[] => {
    return template.variables
      .filter(v => v.type === 'text' && v.name.startsWith('criterion_'))
      .sort((a, b) => {
        const aNum = parseInt(a.name.split('_')[1] || '0');
        const bNum = parseInt(b.name.split('_')[1] || '0');
        return aNum - bNum;
      })
      .map(v => v.description || v.defaultValue || v.name);
  };

  const handleFetchCriteria = () => {
    setShowFetchCriteria(true);
  };

  const handleApplyCriteria = (templateId: string) => {
    const selectedTemplate = existingTemplates.find(t => t._id === templateId);
    if (!selectedTemplate) {
      toast.error("Template not found");
      return;
    }

    const criteria = extractCriteriaFromTemplate(selectedTemplate);
    if (criteria.length === 0) {
      toast.error("No compliance criteria found in this template");
      return;
    }

    setVisualComplianceData(prev => ({
      ...prev,
      complianceCriteria: criteria
    }));

    setFetchedFromTemplate(selectedTemplate.name);
    setShowFetchCriteria(false);
    setSelectedTemplateForFetch(null);
    toast.success(`Fetched ${criteria.length} criteria from "${selectedTemplate.name}"`);
  };

  const handleClearFetchedCriteria = () => {
    setVisualComplianceData(prev => ({
      ...prev,
      complianceCriteria: ['']
    }));
    setFetchedFromTemplate(null);
    toast.success("Compliance criteria cleared");
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

  // Watch for visual-compliance category selection
  useEffect(() => {
    setIsVisualCompliance(formData.category === 'visual-compliance');
  }, [formData.category]);

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

    if (!formData.name) {
      toast.error("Template name is required");
      return;
    }

    // Special handling for visual compliance templates
    if (isVisualCompliance) {
      const filledCriteria = visualComplianceData.complianceCriteria.filter(c => c.trim());
      if (filledCriteria.length === 0) {
        toast.error("At least one compliance criterion is required for visual compliance templates");
        return;
      }

      setLoading(true);
      try {
        // Import the service
        const { PromptTemplateService } = await import("../../services/promptTemplate.service");

        const newTemplate = await PromptTemplateService.createVisualComplianceTemplate({
          name: formData.name,
          description: formData.description,
          complianceCriteria: filledCriteria,
          imageVariables: visualComplianceData.imageVariables,
          industry: visualComplianceData.industry,
          mode: visualComplianceData.mode,
        });

        toast.success("Visual compliance template created successfully!");

        // Call onSubmit to refresh the templates list
        if (onSubmit && newTemplate) {
          await onSubmit(newTemplate);
        }

        onClose();
      } catch (error) {
        console.error("Error creating visual compliance template:", error);
        toast.error("Failed to create visual compliance template");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Regular template creation
    if (!formData.content) {
      toast.error("Template content is required");
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
    <Modal isOpen onClose={onClose} size="4xl" title="Create Template">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AI Mode Toggle */}
        <div className="glass flex items-center justify-between p-5 rounded-xl border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/50 to-accent-50/30 dark:from-primary-900/20 dark:to-accent-900/10 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <FiBrain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold gradient-text-primary">
                AI-Powered Template Creation
              </h3>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-body mt-0.5">
                Let AI generate your template from a simple description
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAiMode(!aiMode)}
            className={`px-5 py-2.5 rounded-xl font-display font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${aiMode
              ? "bg-gradient-primary text-white hover:shadow-xl"
              : "bg-white dark:bg-gray-800 text-secondary-700 dark:text-secondary-300 border-2 border-primary-200/30 dark:border-primary-700/30 hover:border-primary-300/50 dark:hover:border-primary-600/50"
              }`}
          >
            {aiMode ? "AI Mode On" : "AI Mode Off"}
          </button>
        </div>

        {/* AI Generation Panel */}
        {aiMode && (
          <div className="glass space-y-5 p-6 rounded-xl border border-primary-200/30 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel shadow-xl">
            <div>
              <label className="block text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3 flex items-center gap-2">
                <FiWand className="w-4 h-4 text-primary-500" />
                Describe Your Template
              </label>
              <textarea
                value={aiIntent}
                onChange={(e) => setAiIntent(e.target.value)}
                placeholder="E.g., 'Create a template for writing SEO-optimized blog posts with sections for keywords, meta description, and content outline'"
                className="input w-full font-body"
                rows={3}
              />
            </div>

            {/* AI Context Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
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
                <label className="block text-xs font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
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
              <label className="block text-xs font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                Tone
              </label>
              <div className="flex flex-wrap gap-2">
                {toneOptions.map((tone) => {
                  const ToneIcon = tone.icon;
                  return (
                    <button
                      key={tone.value}
                      type="button"
                      onClick={() =>
                        setSelectedContext({
                          ...selectedContext,
                          tone: tone.value as any,
                        })
                      }
                      className={`px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2 ${selectedContext.tone === tone.value
                        ? "bg-gradient-primary text-white hover:shadow-xl"
                        : "bg-white dark:bg-gray-800 text-secondary-700 dark:text-secondary-300 border-2 border-primary-200/30 dark:border-primary-700/30 hover:border-primary-300/50"
                        }`}
                    >
                      <ToneIcon className="w-4 h-4" />
                      {tone.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={generateFromIntent}
              disabled={aiGenerating || !aiIntent.trim()}
              className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiGenerating ? (
                <>
                  <FiRefreshCw className="animate-spin w-5 h-5" />
                  Generating Template...
                </>
              ) : (
                <>
                  <FiCpu className="w-5 h-5" />
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

        {/* Visual Compliance Specific Fields */}
        {isVisualCompliance && (
          <div className="glass p-6 rounded-xl border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/50 to-success-50/30 dark:from-primary-900/20 dark:to-success-900/10 shadow-xl space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                <FiTarget className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-display font-bold gradient-text-primary">
                Visual Compliance Configuration
              </h3>
            </div>

            {/* Industry Selection */}
            <div>
              <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Industry *
              </label>
              <select
                value={visualComplianceData.industry}
                onChange={(e) => setVisualComplianceData({ ...visualComplianceData, industry: e.target.value as any })}
                className="input"
              >
                <option value="jewelry">Jewelry</option>
                <option value="grooming">Grooming</option>
                <option value="retail">Retail</option>
                <option value="fmcg">FMCG</option>
                <option value="documents">Documents</option>
              </select>
            </div>

            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                Optimization Mode
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setVisualComplianceData({ ...visualComplianceData, mode: 'optimized' })}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${visualComplianceData.mode === 'optimized'
                    ? 'bg-gradient-primary text-white shadow-xl'
                    : 'glass border-2 border-primary-200/30 dark:border-primary-700/30 text-secondary-700 dark:text-secondary-300 hover:border-primary-300/50'
                    }`}
                >
                  Optimized (Lower Cost)
                </button>
                <button
                  type="button"
                  onClick={() => setVisualComplianceData({ ...visualComplianceData, mode: 'standard' })}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${visualComplianceData.mode === 'standard'
                    ? 'bg-gradient-primary text-white shadow-xl'
                    : 'glass border-2 border-primary-200/30 dark:border-primary-700/30 text-secondary-700 dark:text-secondary-300 hover:border-primary-300/50'
                    }`}
                >
                  Standard (Higher Quality)
                </button>
              </div>
            </div>

            {/* Compliance Criteria */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                  Compliance Criteria *
                </label>
                <button
                  type="button"
                  onClick={handleFetchCriteria}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-display font-semibold text-info-700 dark:text-info-300 glass border border-info-200/30 dark:border-info-700/30 hover:border-info-300/50 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                  Fetch from Template
                </button>
              </div>

              {/* Show source template if criteria were fetched */}
              {fetchedFromTemplate && (
                <div className="mb-3 glass p-3 rounded-lg border border-info-200/30 bg-gradient-to-r from-info-50/50 to-primary-50/30 dark:from-info-900/20 dark:to-primary-900/10 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiInfo className="w-4 h-4 text-info-600 dark:text-info-400" />
                      <p className="text-xs font-body text-info-800 dark:text-info-200">
                        <strong className="font-display font-semibold">Fetched from:</strong> {fetchedFromTemplate}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearFetchedCriteria}
                      className="text-xs text-danger-600 dark:text-danger-400 hover:text-danger-700 dark:hover:text-danger-300 font-display font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {visualComplianceData.complianceCriteria.map((criterion, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={criterion}
                      onChange={(e) => {
                        const newCriteria = [...visualComplianceData.complianceCriteria];
                        newCriteria[index] = e.target.value;
                        setVisualComplianceData({ ...visualComplianceData, complianceCriteria: newCriteria });
                      }}
                      placeholder="e.g., All products should be facing forward"
                      className="input flex-1"
                    />
                    {visualComplianceData.complianceCriteria.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newCriteria = visualComplianceData.complianceCriteria.filter((_, i) => i !== index);
                          setVisualComplianceData({ ...visualComplianceData, complianceCriteria: newCriteria });
                        }}
                        className="px-3 py-2 rounded-xl text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 border-2 border-danger-200/30 dark:border-danger-700/30 hover:border-danger-300/50 transition-all duration-300 hover:scale-105"
                      >
                        <FiMinus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setVisualComplianceData({
                      ...visualComplianceData,
                      complianceCriteria: [...visualComplianceData.complianceCriteria, '']
                    });
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-display font-semibold text-primary-700 dark:text-primary-300 glass border-2 border-primary-200/30 dark:border-primary-700/30 hover:border-primary-300/50 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Criterion
                </button>
              </div>
            </div>

            <div className="glass p-4 rounded-xl border border-success-200/30 bg-gradient-to-r from-success-50/50 to-primary-50/30 dark:from-success-900/20 dark:to-primary-900/10 shadow-lg">
              <div className="flex items-start gap-2">
                <FiImage className="w-4 h-4 text-success-600 dark:text-success-400 mt-0.5" />
                <p className="text-xs font-body text-success-800 dark:text-success-200">
                  <strong className="font-display font-semibold">Note:</strong> This template will automatically include reference and evidence image variables for visual compliance checks.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Template Content with AI Tools */}
        {!isVisualCompliance && (
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
        )}

        {/* Effectiveness Score Display */}
        {!isVisualCompliance && effectivenessScore && (
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
        {!isVisualCompliance && formData.variables.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
                <FiTag className="w-4 h-4 text-white" />
              </div>
              <label className="text-base font-display font-bold gradient-text-accent">
                Variables ({formData.variables.length})
              </label>
            </div>
            <div className="space-y-4">
              {formData.variables.map((variable, index) => (
                <div
                  key={index}
                  className="glass p-5 rounded-xl border border-accent-200/30 backdrop-blur-xl bg-gradient-to-br from-accent-50/30 to-highlight-50/20 dark:from-accent-900/20 dark:to-highlight-900/10 shadow-lg hover:scale-102 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-base font-display font-bold gradient-text-primary flex items-center gap-2">
                      <FiCode className="w-4 h-4" />
                      {`{{${variable.name}}}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariable(index)}
                      className="px-3 py-2 rounded-xl text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 border-2 border-danger-200/30 dark:border-danger-700/30 hover:border-danger-300/50 transition-all duration-300 hover:scale-105"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                        Type
                      </label>
                      <select
                        value={variable.type}
                        onChange={(e) =>
                          handleVariableChange(index, "type", e.target.value)
                        }
                        className="input text-sm font-body"
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
                      <label className="block text-xs font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                        Default Value
                      </label>
                      <input
                        type="text"
                        value={variable.defaultValue || ""}
                        onChange={(e) =>
                          handleVariableChange(index, "defaultValue", e.target.value)
                        }
                        placeholder="Optional"
                        className="input text-sm font-body"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={variable.description || ""}
                      onChange={(e) =>
                        handleVariableChange(index, "description", e.target.value)
                      }
                      placeholder="What is this variable for?"
                      className="input text-sm font-body"
                    />
                  </div>
                  <div className="mt-4 flex items-center glass px-4 py-3 rounded-lg border border-accent-200/30 bg-white dark:bg-gray-800">
                    <input
                      type="checkbox"
                      checked={variable.required}
                      onChange={(e) =>
                        handleVariableChange(index, "required", e.target.checked)
                      }
                      className="w-4 h-4 text-primary-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-2 mr-3"
                    />
                    <label className="text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                      Required variable
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
            disabled={
              loading ||
              !formData.name ||
              (isVisualCompliance
                ? visualComplianceData.complianceCriteria.filter(c => c.trim()).length === 0
                : !formData.content
              )
            }
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

      {/* Fetch Criteria Selection Modal */}
      {showFetchCriteria && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass max-w-2xl w-full max-h-[80vh] overflow-hidden rounded-2xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-200/30">
              <div>
                <h3 className="text-xl font-display font-bold gradient-text-primary">
                  Select Template
                </h3>
                <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mt-1">
                  Choose a visual compliance template to fetch criteria from
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowFetchCriteria(false);
                  setSelectedTemplateForFetch(null);
                }}
                className="btn-icon-sm btn-icon-secondary"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Template List */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
              {getVisualComplianceTemplates().length === 0 ? (
                <div className="text-center py-12">
                  <FiAlertCircle className="w-12 h-12 mx-auto text-secondary-400 dark:text-secondary-600 mb-4" />
                  <p className="font-display font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    No visual compliance templates found
                  </p>
                  <p className="text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-2">
                    Create a visual compliance template first to fetch criteria from it.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getVisualComplianceTemplates().map((template) => {
                    const criteria = extractCriteriaFromTemplate(template);
                    const isSelected = selectedTemplateForFetch === template._id;

                    return (
                      <button
                        key={template._id}
                        type="button"
                        onClick={() => setSelectedTemplateForFetch(template._id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${isSelected
                          ? 'border-primary-500 bg-gradient-to-r from-primary-50/50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/30 shadow-lg scale-[1.02]'
                          : 'border-primary-200/30 dark:border-primary-700/30 hover:border-primary-300/50 hover:scale-[1.01] glass'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate">
                              {template.name}
                            </h4>
                            {template.description && (
                              <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-1 line-clamp-2">
                                {template.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              {template.visualComplianceConfig?.industry && (
                                <span className="glass px-2 py-1 rounded-full border border-info-200/30 bg-gradient-info/20 text-info-700 dark:text-info-300 font-display font-semibold text-xs">
                                  {template.visualComplianceConfig.industry}
                                </span>
                              )}
                              <span className="glass px-2 py-1 rounded-full border border-success-200/30 bg-gradient-success/20 text-success-700 dark:text-success-300 font-display font-semibold text-xs">
                                {criteria.length} {criteria.length === 1 ? 'criterion' : 'criteria'}
                              </span>
                            </div>
                            {criteria.length > 0 && (
                              <div className="mt-3 space-y-1">
                                {criteria.slice(0, 3).map((criterion, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <span className="w-4 h-4 rounded-full bg-gradient-info/20 border border-info-200/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <span className="text-info-700 dark:text-info-300 font-display font-bold text-[10px]">
                                        {idx + 1}
                                      </span>
                                    </span>
                                    <p className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary line-clamp-1">
                                      {criterion}
                                    </p>
                                  </div>
                                ))}
                                {criteria.length > 3 && (
                                  <p className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary ml-6">
                                    +{criteria.length - 3} more...
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg flex-shrink-0">
                              <FiCheck className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-primary-200/30">
              <button
                type="button"
                onClick={() => {
                  setShowFetchCriteria(false);
                  setSelectedTemplateForFetch(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => selectedTemplateForFetch && handleApplyCriteria(selectedTemplateForFetch)}
                disabled={!selectedTemplateForFetch}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiDownload className="w-4 h-4" />
                Apply Criteria
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};