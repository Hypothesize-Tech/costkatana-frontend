import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  trainingService,
  CreateDatasetData,
} from "../../services/training.service";

interface CreateDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetCreated: (dataset: any) => void;
}

const POPULAR_USE_CASES = [
  "support-ticket-classifier",
  "content-generator",
  "code-assistant",
  "email-responder",
  "document-summarizer",
  "sentiment-analyzer",
  "chatbot-responses",
  "product-descriptions",
];

const POPULAR_MODELS = [
  // GPT-5 Models (Latest)
  "gpt-5",
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-5-chat-latest",
  // GPT-4.1 Series (Latest)
  "gpt-4.1-2025-04-14",
  "gpt-4.1-mini-2025-04-14",
  "gpt-4.1-nano-2025-04-14",
  "gpt-4.5-preview-2025-02-27",
  // GPT-4o Series
  "gpt-4o-2024-08-06",
  "gpt-4o-audio-preview-2024-12-17",
  "gpt-4o-realtime-preview-2025-06-03",
  "gpt-4o-mini-2024-07-18",
  "gpt-4o-mini-audio-preview-2024-12-17",
  "gpt-4o-mini-realtime-preview-2024-12-17",
  // Claude Models
  "claude-3.5-sonnet-20241022",
  "claude-3.5-haiku-20241022",
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
  "claude-3-haiku-20240307",
  // Gemini Models
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-1.0-pro",
  // DeepSeek Models
  "deepseek-chat",
  "deepseek-chat-cached",
  "deepseek-reasoner",
  "deepseek-reasoner-cached",
  // Mistral Models
  "mistral-medium-2508",
  "mistral-medium-latest",
  "codestral-2508",
  "codestral-latest",
  "mistral-large-2411",
  // Cohere Models
  "command-r-plus-08-2024",
  "command-r-08-2024",
  "command-r7b-12-2024",
  "command-light",
  // Meta Llama Models
  "llama-3.3-70b-instruct",
  "llama-3.2-90b-text-preview",
  "llama-3.2-11b-vision-instruct",
  "llama-3.1-405b-instruct",
  "llama-3.1-70b-instruct",
  "llama-3.1-8b-instruct",
];

export const CreateDatasetModal: React.FC<CreateDatasetModalProps> = ({
  isOpen,
  onClose,
  onDatasetCreated,
}) => {
  const [formData, setFormData] = useState<CreateDatasetData>({
    name: "",
    description: "",
    targetUseCase: "",
    targetModel: "",
    minScore: 4,
    maxTokens: undefined,
    maxCost: undefined,
    filters: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.targetUseCase || !formData.targetModel) {
      return;
    }

    setIsSubmitting(true);
    try {
      const dataset = await trainingService.datasets.createDataset(formData);
      onDatasetCreated(dataset);
      onClose();

      // Reset form
      setFormData({
        name: "",
        description: "",
        targetUseCase: "",
        targetModel: "",
        minScore: 4,
        maxTokens: undefined,
        maxCost: undefined,
        filters: {},
      });
      setShowAdvanced(false);
    } catch (error) {
      console.error("Failed to create dataset:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateDatasetData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-3xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-primary-200/30 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
        {/* Header */}
        <div className="glass flex items-center justify-between p-8 border-b border-primary-200/30 backdrop-blur-xl rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">📊</span>
            </div>
            <h2 className="text-2xl font-display font-bold gradient-text-primary">
              Create Training Dataset
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-icon-secondary"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Information */}
          <div className="glass rounded-xl p-6 border border-info-200/30 shadow-lg backdrop-blur-xl space-y-6">
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
                Dataset Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Support-Classifier-V1"
                className="input"
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
                placeholder="Describe what this dataset will be used for..."
                rows={3}
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">
                  Target Use Case *
                </label>
                <select
                  value={formData.targetUseCase}
                  onChange={(e) =>
                    handleInputChange("targetUseCase", e.target.value)
                  }
                  className="select"
                  required
                >
                  <option value="">Select use case...</option>
                  {POPULAR_USE_CASES.map((useCase) => (
                    <option key={useCase} value={useCase}>
                      {useCase
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                  <option value="custom">Custom (enter below)</option>
                </select>

                {formData.targetUseCase === "custom" && (
                  <input
                    type="text"
                    placeholder="Enter custom use case"
                    className="input mt-3"
                    onChange={(e) =>
                      handleInputChange("targetUseCase", e.target.value)
                    }
                  />
                )}
              </div>

              <div>
                <label className="form-label">
                  Target Model *
                </label>
                <select
                  value={formData.targetModel}
                  onChange={(e) =>
                    handleInputChange("targetModel", e.target.value)
                  }
                  className="select"
                  required
                >
                  <option value="">Select model...</option>
                  {POPULAR_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                  <option value="custom">Custom (enter below)</option>
                </select>

                {formData.targetModel === "custom" && (
                  <input
                    type="text"
                    placeholder="Enter custom model name"
                    className="input mt-3"
                    onChange={(e) =>
                      handleInputChange("targetModel", e.target.value)
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {/* Quality Criteria */}
          <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center glow-success">
                <span className="text-white text-sm">⭐</span>
              </div>
              <h3 className="text-xl font-display font-bold gradient-text-success">
                Quality Criteria
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">
                  Minimum Score
                </label>
                <select
                  value={formData.minScore}
                  onChange={(e) =>
                    handleInputChange("minScore", parseInt(e.target.value))
                  }
                  className="select"
                >
                  <option value={4}>4+ Stars (Good)</option>
                  <option value={5}>5 Stars (Excellent)</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Max Tokens (Optional)
                </label>
                <input
                  type="number"
                  value={formData.maxTokens || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "maxTokens",
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  placeholder="No limit"
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">
                  Max Cost $ (Optional)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.maxCost || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "maxCost",
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                  placeholder="No limit"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="btn-secondary text-sm inline-flex items-center gap-2"
            >
              <span>{showAdvanced ? "Hide" : "Show"} Advanced Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">🔍</span>
                </div>
                <h3 className="text-xl font-display font-bold gradient-text-secondary">
                  Advanced Filters
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">
                    Providers (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., OpenAI, Anthropic"
                    className="input"
                    onChange={(e) => {
                      const providers = e.target.value
                        .split(",")
                        .map((p) => p.trim())
                        .filter(Boolean);
                      handleInputChange("filters", {
                        ...formData.filters,
                        providers: providers.length > 0 ? providers : undefined,
                      });
                    }}
                  />
                </div>

                <div>
                  <label className="form-label">
                    Features (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., support-bot, content-gen"
                    className="input"
                    onChange={(e) => {
                      const features = e.target.value
                        .split(",")
                        .map((f) => f.trim())
                        .filter(Boolean);
                      handleInputChange("filters", {
                        ...formData.filters,
                        features: features.length > 0 ? features : undefined,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  isSubmitting ||
                  !formData.name ||
                  !formData.targetUseCase ||
                  !formData.targetModel
                }
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="text-white text-sm">📊</span>
                    Create Dataset
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
