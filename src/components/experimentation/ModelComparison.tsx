import React, { useState, useEffect } from "react";
import {
  Play,
  Plus,
  Trash2,
  DollarSign,
  RotateCw,
  Download,
  AlertTriangle,
  Beaker,
  Rocket,
  Check,
} from "lucide-react";
import { ExperimentationService } from "../../services/experimentation.service";
import { Modal } from "../common/Modal";
import { useDebounce } from "../../hooks/useDebounce";

interface ModelConfig {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

interface AvailableModel {
  provider: string;
  model: string;
  modelName?: string;
  modelId?: string;
  pricing: {
    input: number;
    output: number;
    unit: string;
  };
  capabilities: string[];
  contextWindow: number;
  category?: string;
  isLatest?: boolean;
  notes?: string;
}

interface ComparisonResult {
  model: string;
  provider: string;
  actualUsage?: {
    totalCalls: number;
    avgCost: number;
    avgTokens: number;
    avgResponseTime: number;
    errorRate: number;
    totalCost: number;
  };
  noUsageData?: boolean;
  estimatedCostPer1K?: number;
  recommendation: string;
  analysis?: {
    strengths: string[];
    considerations: string[];
  };
  pricing?: {
    inputCost: number;
    outputCost: number;
    contextWindow: number;
  };
}

const ModelComparison: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedModels, setSelectedModels] = useState<ModelConfig[]>([]);
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [evaluationCriteria, setEvaluationCriteria] = useState<string[]>([
    "accuracy",
    "relevance",
    "completeness",
  ]);
  const [iterations, setIterations] = useState(1);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [currentExperiment, setCurrentExperiment] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ComparisonResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [progressData, setProgressData] = useState<any>(null);
  const [comparisonMode, setComparisonMode] = useState<
    "quality" | "cost" | "speed" | "comprehensive"
  >("comprehensive");
  const [executeOnBedrock, setExecuteOnBedrock] = useState(true);

  // Add debouncing for prompt to prevent API calls on every keystroke
  const debouncedPrompt = useDebounce(prompt, 800); // Wait 800ms after user stops typing

  const criteriaOptions = [
    "accuracy",
    "relevance",
    "completeness",
    "coherence",
    "creativity",
    "factual_accuracy",
    "safety",
    "bias_detection",
    "language_quality",
  ];

  useEffect(() => {
    loadAvailableModels();
  }, []);

  // Only trigger cost estimation with debounced prompt to avoid API spam
  useEffect(() => {
    if (selectedModels.length > 0 && debouncedPrompt.trim()) {
      console.log("Triggering cost estimation with debounced prompt...");
      estimateComparisonCost();
    } else if (!debouncedPrompt.trim()) {
      setEstimatedCost(0);
    }
  }, [selectedModels, debouncedPrompt, iterations]);

  useEffect(() => {
    if (selectedModels.length > 0 && prompt.trim()) {
      estimateComparisonCost();
    }
  }, [selectedModels, prompt, iterations]);

  const loadAvailableModels = async () => {
    try {
      const response = await ExperimentationService.getAvailableModels();
      console.log("Available models response:", response); // Debug log

      // Normalize the response data structure
      const normalizedModels = (Array.isArray(response) ? response : []).map(
        (model: any) => ({
          provider: model.provider || "Unknown",
          model: model.model || model.modelId || model.modelName || "",
          modelName: model.modelName || model.model || "",
          pricing: {
            input: model.pricing?.input || 0,
            output: model.pricing?.output || 0,
            unit: model.pricing?.unit || "Per 1M tokens",
          },
          capabilities: model.capabilities || ["text"],
          contextWindow: model.contextWindow || 8192,
          category: model.category || "general",
          isLatest: model.isLatest !== false,
          notes: model.notes || "",
        }),
      );

      console.log("Normalized models:", normalizedModels);
      console.log("Sample model pricing:", normalizedModels[0]?.pricing);
      setAvailableModels(normalizedModels);

      if (normalizedModels.length === 0) {
        setError(
          "No models available from the backend. Please check your AWS Bedrock configuration.",
        );
      } else {
        setError(null); // Clear any previous errors
        // Trigger initial cost estimation if we have selected models
        if (selectedModels.length > 0) {
          setTimeout(estimateComparisonCost, 200);
        }
      }
    } catch (error: any) {
      console.error("Error loading available models:", error);
      setError(
        "Failed to load available models: " +
        (error.message || "Unknown error"),
      );
      setAvailableModels([]); // Set empty array instead of fallback models
    }
  };

  const estimateComparisonCost = async () => {
    try {
      // Calculate cost estimate based on prompt length and selected models
      if (!debouncedPrompt.trim() || selectedModels.length === 0) {
        setEstimatedCost(0);
        return;
      }

      const promptTokens = Math.ceil(debouncedPrompt.length / 4); // Rough token estimate
      const outputTokens = 500; // Estimated response length
      let totalCost = 0;

      selectedModels.forEach((selectedModel) => {
        const modelPricing = getModelPricing(
          selectedModel.provider,
          selectedModel.model,
        );
        if (modelPricing) {
          const inputCost = (promptTokens / 1000000) * modelPricing.input;
          const outputCost = (outputTokens / 1000000) * modelPricing.output;
          totalCost += (inputCost + outputCost) * iterations;
        }
      });

      setEstimatedCost(totalCost);

      // Also try backend estimation as fallback
      try {
        const estimate = await ExperimentationService.estimateExperimentCost({
          type: "model_comparison",
          parameters: {
            prompt: debouncedPrompt,
            models: selectedModels,
            iterations,
          },
        });

        if (estimate.estimatedCost > 0) {
          setEstimatedCost(estimate.estimatedCost);
        }
      } catch {
        console.log(
          "Backend cost estimation unavailable, using frontend calculation:",
          totalCost,
        );
      }
    } catch (error) {
      console.error("Error estimating cost:", error);
      setEstimatedCost(0);
    }
  };

  const addModel = () => {
    console.log(
      "addModel called. Available models:",
      availableModels.length,
      "Selected models:",
      selectedModels.length,
    );

    if (availableModels.length === 0) {
      setError("No models available to add. Please wait for models to load.");
      return;
    }

    // Find a model that hasn't been selected yet
    const usedModels = new Set(
      selectedModels.map((m) => `${m.provider}:${m.model}`),
    );
    console.log("Used models:", Array.from(usedModels));

    const availableModel = availableModels.find(
      (m) => !usedModels.has(`${m.provider}:${m.model}`),
    );
    console.log("Found available model:", availableModel);

    if (availableModel) {
      const newModel = {
        provider: availableModel.provider,
        model: availableModel.model,
        temperature: 0.7,
        maxTokens: 1000,
      };
      console.log("Adding new model:", newModel);

      setSelectedModels([...selectedModels, newModel]);
      setError(null); // Clear any previous errors

      // Trigger cost recalculation with new model
      setTimeout(estimateComparisonCost, 100);
    } else {
      const message =
        availableModels.length === selectedModels.length
          ? "All available models have been selected."
          : "No more models available to add.";
      setError(message);
    }
  };

  const removeModel = (index: number) => {
    setSelectedModels(selectedModels.filter((_, i) => i !== index));
  };

  const updateModel = (index: number, field: keyof ModelConfig, value: any) => {
    console.log("updateModel called:", { index, field, value });
    const updated = [...selectedModels];

    if (field === "provider" || field === "model") {
      // When changing provider or model, find the corresponding model data
      if (field === "provider") {
        updated[index] = { ...updated[index], [field]: value };
        // Find first available model for this provider
        const availableForProvider = availableModels.find(
          (m) => m.provider === value,
        );
        if (availableForProvider) {
          updated[index].model = availableForProvider.model;
        }
      } else if (field === "model") {
        updated[index] = { ...updated[index], [field]: value };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    console.log("Updated model:", updated[index]);
    setSelectedModels(updated);
  };

  const runComparison = async () => {
    if (!prompt.trim() || selectedModels.length === 0) {
      setError("Please provide a prompt and select at least one model");
      return;
    }

    // Check for duplicate models
    const modelKeys = selectedModels.map((m) => `${m.provider}:${m.model}`);
    const uniqueModelKeys = new Set(modelKeys);
    if (modelKeys.length !== uniqueModelKeys.size) {
      setError(
        "You have selected duplicate models. Please remove duplicates before running the comparison.",
      );
      return;
    }

    setIsRunning(true);
    setError(null);
    setResults([]);
    setProgressData(null);

    try {
      if (realTimeMode) {
        await runRealTimeComparison();
      } else {
        await runStaticComparison();
      }
    } catch (error: any) {
      console.error("Error running comparison:", error);
      setIsRunning(false);
      setError(
        "Failed to run comparison: " + (error.message || "Unknown error"),
      );
    }
  };

  const runStaticComparison = async () => {
    const request = {
      prompt,
      models: selectedModels,
      evaluationCriteria,
      iterations,
    };

    console.log("Sending comparison request:", request);

    const experiment = await ExperimentationService.runModelComparison(request);
    console.log("Received experiment result:", experiment);

    setCurrentExperiment(experiment);

    // Extract results from the experiment
    if (experiment.results && experiment.results.modelComparisons) {
      setResults(experiment.results.modelComparisons);
      console.log(
        "Model comparison results:",
        experiment.results.modelComparisons,
      );
    } else {
      setError("No comparison results returned from the experiment");
    }

    setIsRunning(false);
  };

  const runRealTimeComparison = async () => {
    const request = {
      prompt,
      models: selectedModels,
      evaluationCriteria,
      iterations,
      executeOnBedrock,
      comparisonMode,
    };

    try {
      // Start the real-time comparison
      const response =
        await ExperimentationService.startRealTimeComparison(request);
      const { sessionId } = response.data;

      // Connect to SSE for progress updates
      connectToProgressStream(sessionId);
    } catch (error: any) {
      console.error("Error starting real-time comparison:", error);
      setError(
        "Failed to start real-time comparison: " +
        (error.message || "Unknown error"),
      );
      setIsRunning(false);
    }
  };

  const connectToProgressStream = (sessionId: string) => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const eventSource = new EventSource(
      `${API_URL}/api/experimentation/comparison-progress/${sessionId}`,
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("SSE Progress:", data);

        switch (data.type) {
          case "connection":
            setProgressData({
              stage: "connected",
              progress: 0,
              message: "Connected to comparison stream",
            });
            break;

          case "progress":
            setProgressData(data);

            if (data.stage === "completed" && data.results) {
              setResults(data.results);
              setIsRunning(false);
            } else if (data.stage === "failed") {
              setError(data.error || "Comparison failed");
              setIsRunning(false);
            }
            break;

          case "close":
            eventSource.close();
            if (!progressData || progressData.stage !== "completed") {
              setIsRunning(false);
            }
            break;

          case "heartbeat":
            // Keep connection alive
            break;
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      setError("Lost connection to comparison stream");
      setIsRunning(false);
      eventSource.close();
    };

    // Clean up on unmount
    return () => {
      eventSource.close();
    };
  };

  const exportResults = async () => {
    if (!currentExperiment || !results.length) return;

    try {
      const dataToExport = {
        experiment: currentExperiment,
        results: results,
        timestamp: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `model-comparison-${currentExperiment.id}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting results:", error);
      setError("Failed to export results");
    }
  };

  const getModelPricing = (provider: string, model: string) => {
    const modelData = availableModels.find(
      (m) => m.provider === provider && m.model === model,
    );
    if (
      modelData?.pricing &&
      modelData.pricing.input &&
      modelData.pricing.output
    ) {
      return modelData.pricing;
    }

    // Fallback pricing data for common models
    const fallbackPricing: Record<
      string,
      { input: number; output: number; unit: string }
    > = {
      // === OpenAI GPT-5 Models (Latest) ===
      "gpt-5": {
        input: 1.25,
        output: 10.0,
        unit: "Per 1M tokens",
      },
      "gpt-5-mini": {
        input: 0.25,
        output: 2.0,
        unit: "Per 1M tokens",
      },
      "gpt-5-nano": {
        input: 0.05,
        output: 0.4,
        unit: "Per 1M tokens",
      },
      "gpt-5-chat-latest": {
        input: 1.25,
        output: 10.0,
        unit: "Per 1M tokens",
      },
      "gpt-5-chat": {
        input: 1.25,
        output: 10.0,
        unit: "Per 1M tokens",
      },

      // === AWS Models ===
      "amazon.nova-micro-v1:0": {
        input: 0.035,
        output: 0.14,
        unit: "Per 1M tokens",
      },
      "amazon.nova-lite-v1:0": {
        input: 0.06,
        output: 0.24,
        unit: "Per 1M tokens",
      },
      "amazon.nova-pro-v1:0": {
        input: 0.8,
        output: 3.2,
        unit: "Per 1M tokens",
      },
      "amazon.titan-text-lite-v1": {
        input: 0.3,
        output: 0.4,
        unit: "Per 1M tokens",
      },
      "amazon.titan-text-express-v1": {
        input: 0.8,
        output: 1.6,
        unit: "Per 1M tokens",
      },
      "anthropic.claude-sonnet-4-20250514-v1:0": {
        input: 3.0,
        output: 15.0,
        unit: "Per 1M tokens",
      },
      "anthropic.claude-3-5-haiku-20241022-v1:0": {
        input: 0.8,
        output: 4.0,
        unit: "Per 1M tokens",
      },
      "anthropic.claude-opus-4-6-v1": {
        input: 5.0,
        output: 25.0,
        unit: "Per 1M tokens",
      },
      "anthropic.claude-opus-4-1-20250805-v1:0": {
        input: 15.0,
        output: 75.0,
        unit: "Per 1M tokens",
      },
      "meta.llama3-70b-instruct-v1:0": {
        input: 0.59,
        output: 0.79,
        unit: "Per 1M tokens",
      },
      "meta.llama3-8b-instruct-v1:0": {
        input: 0.05,
        output: 0.10,
        unit: "Per 1M tokens",
      },
      "anthropic.claude-3-haiku-20240307-v1:0": {
        input: 0.25,
        output: 1.25,
        unit: "Per 1M tokens",
      },
      "anthropic.claude-3-sonnet-20240229-v1:0": {
        input: 3.0,
        output: 15.0,
        unit: "Per 1M tokens",
      },
      "meta.llama3-2-1b-instruct-v1:0": {
        input: 0.1,
        output: 0.1,
        unit: "Per 1M tokens",
      },
      "meta.llama3-2-3b-instruct-v1:0": {
        input: 0.15,
        output: 0.15,
        unit: "Per 1M tokens",
      },
      "meta.llama3-1-8b-instruct-v1:0": {
        input: 0.22,
        output: 0.22,
        unit: "Per 1M tokens",
      },
      "meta.llama3-1-70b-instruct-v1:0": {
        input: 0.99,
        output: 0.99,
        unit: "Per 1M tokens",
      },
      "command-a-03-2025": {
        input: 2.5,
        output: 10.0,
        unit: "Per 1M tokens",
      },
      "command-r7b-12-2024": {
        input: 0.0375,
        output: 0.15,
        unit: "Per 1M tokens",
      },
      "command-a-reasoning-08-2025": {
        input: 2.5,
        output: 10.0,
        unit: "Per 1M tokens",
      },
      "command-a-vision-07-2025": {
        input: 2.5,
        output: 10.0,
        unit: "Per 1M tokens",
      },
      "command-r-plus-04-2024": {
        input: 2.5,
        output: 10.0,
        unit: "Per 1M tokens",
      },
      "command-r-08-2024": {
        input: 0.15,
        output: 0.6,
        unit: "Per 1M tokens",
      },
      // === Google AI Models ===
      "gemini-2.5-pro": {
        input: 1.25,
        output: 10.0,
        unit: "Per 1M tokens",
      },
      "gemini-2.5-flash": {
        input: 0.3,
        output: 2.5,
        unit: "Per 1M tokens",
      },
      "gemini-2.5-flash-lite-preview": {
        input: 0.1,
        output: 0.4,
        unit: "Per 1M tokens",
      },
      "gemini-2.5-flash-audio": {
        input: 1.0,
        output: 2.5,
        unit: "Per 1M tokens",
      },
      "gemini-2.5-flash-lite-audio-preview": {
        input: 0.5,
        output: 0.4,
        unit: "Per 1M tokens",
      },
      "gemini-2.5-flash-native-audio": {
        input: 0.5,
        output: 2.0,
        unit: "Per 1M tokens",
      },
      "gemini-2.5-flash-native-audio-output": {
        input: 3.0,
        output: 12.0,
        unit: "Per 1M tokens",
      },
      "gemini-2.5-flash-preview-tts": {
        input: 0.5,
        output: 10.0,
        unit: "Per 1M tokens",
      },
      "gemini-2.5-pro-preview-tts": {
        input: 1.0,
        output: 20.0,
        unit: "Per 1M tokens",
      },
      "gemini-2.0-flash": {
        input: 0.1,
        output: 0.4,
        unit: "Per 1M tokens",
      },
      "gemini-2.0-flash-lite": {
        input: 0.075,
        output: 0.3,
        unit: "Per 1M tokens",
      },
      "gemini-2.0-flash-audio": {
        input: 0.7,
        output: 0.4,
        unit: "Per 1M tokens",
      },
      "gemini-1.5-pro": {
        input: 1.25,
        output: 5.0,
        unit: "Per 1M tokens",
      },
      "gemini-1.5-flash": {
        input: 0.075,
        output: 0.3,
        unit: "Per 1M tokens",
      },
      "gemini-1.0-pro": {
        input: 1.0,
        output: 2.0,
        unit: "Per 1M tokens",
      },
      "gemini-1.0-pro-vision": {
        input: 1.0,
        output: 2.0,
        unit: "Per 1M tokens",
      },
      // === Mistral AI Models ===
      // Premier Models
      "mistral-medium-2508": {
        input: 0.4,
        output: 2.0,
        unit: "Per 1M tokens",
      },
      "mistral-medium-latest": {
        input: 0.4,
        output: 2.0,
        unit: "Per 1M tokens",
      },
      "magistral-medium-2507": {
        input: 2.0,
        output: 5.0,
        unit: "Per 1M tokens",
      },
      "magistral-medium-latest": {
        input: 2.0,
        output: 5.0,
        unit: "Per 1M tokens",
      },
      "codestral-2508": {
        input: 0.3,
        output: 0.9,
        unit: "Per 1M tokens",
      },
      "codestral-latest": {
        input: 0.3,
        output: 0.9,
        unit: "Per 1M tokens",
      },
      "voxtral-mini-2507": {
        input: 0.1,
        output: 0.1,
        unit: "Per 1M tokens",
      },
      "voxtral-mini-latest": {
        input: 0.1,
        output: 0.1,
        unit: "Per 1M tokens",
      },
      "devstral-medium-2507": {
        input: 0.4,
        output: 2.0,
        unit: "Per 1M tokens",
      },
      "devstral-medium-latest": {
        input: 0.4,
        output: 2.0,
        unit: "Per 1M tokens",
      },
      "mistral-ocr-2505": {
        input: 1.0,
        output: 3.0,
        unit: "Per 1M tokens",
      },
      "mistral-ocr-latest": {
        input: 1.0,
        output: 3.0,
        unit: "Per 1M tokens",
      },
      "mistral-large-2411": {
        input: 2.0,
        output: 6.0,
        unit: "Per 1M tokens",
      },
      "mistral-large-latest": {
        input: 2.0,
        output: 6.0,
        unit: "Per 1M tokens",
      },
      "pixtral-large-2411": {
        input: 2.0,
        output: 6.0,
        unit: "Per 1M tokens",
      },
      "pixtral-large-latest": {
        input: 2.0,
        output: 6.0,
        unit: "Per 1M tokens",
      },
      "mistral-small-2407": {
        input: 0.1,
        output: 0.3,
        unit: "Per 1M tokens",
      },
      "mistral-embed": {
        input: 0.1,
        output: 0.1,
        unit: "Per 1M tokens",
      },
      "codestral-embed-2505": {
        input: 0.15,
        output: 0.15,
        unit: "Per 1M tokens",
      },
      "mistral-moderation-2411": {
        input: 0.1,
        output: 0.1,
        unit: "Per 1M tokens",
      },
      "mistral-moderation-latest": {
        input: 0.1,
        output: 0.1,
        unit: "Per 1M tokens",
      },

      // Open Models
      "magistral-small-2507": {
        input: 0.5,
        output: 1.5,
        unit: "Per 1M tokens",
      },
      "magistral-small-latest": {
        input: 0.5,
        output: 1.5,
        unit: "Per 1M tokens",
      },
      "voxtral-small-2507": {
        input: 0.1,
        output: 0.1,
        unit: "Per 1M tokens",
      },
      "voxtral-small-latest": {
        input: 0.1,
        output: 0.1,
        unit: "Per 1M tokens",
      },
      "mistral-small-2506": {
        input: 0.1,
        output: 0.3,
        unit: "Per 1M tokens",
      },
      "devstral-small-2507": {
        input: 0.1,
        output: 0.3,
        unit: "Per 1M tokens",
      },
      "devstral-small-latest": {
        input: 0.1,
        output: 0.3,
        unit: "Per 1M tokens",
      },
      "mistral-small-2503": {
        input: 0.1,
        output: 0.3,
        unit: "Per 1M tokens",
      },
      "mistral-small-2501": {
        input: 0.1,
        output: 0.3,
        unit: "Per 1M tokens",
      },
      "devstral-small-2505": {
        input: 0.1,
        output: 0.3,
        unit: "Per 1M tokens",
      },
      "pixtral-12b-2409": {
        input: 0.15,
        output: 0.15,
        unit: "Per 1M tokens",
      },
      "pixtral-12b": {
        input: 0.15,
        output: 0.15,
        unit: "Per 1M tokens",
      },
      "open-mistral-nemo-2407": {
        input: 0.15,
        output: 0.15,
        unit: "Per 1M tokens",
      },
      "open-mistral-nemo": {
        input: 0.15,
        output: 0.15,
        unit: "Per 1M tokens",
      },
      "mistral-nemo": {
        input: 0.15,
        output: 0.15,
        unit: "Per 1M tokens",
      },
      "open-mistral-7b": {
        input: 0.25,
        output: 0.25,
        unit: "Per 1M tokens",
      },
      "open-mixtral-8x7b": {
        input: 0.7,
        output: 0.7,
        unit: "Per 1M tokens",
      },
      "open-mixtral-8x22b": {
        input: 2.0,
        output: 6.0,
        unit: "Per 1M tokens",
      },
      // === Grok AI Models ===
      "grok-4-0709": {
        input: 3.0,
        output: 15.0,
        unit: "Per 1M tokens",
      },
      "grok-3": {
        input: 3.0,
        output: 15.0,
        unit: "Per 1M tokens",
      },
      "grok-3-mini": {
        input: 0.3,
        output: 0.5,
        unit: "Per 1M tokens",
      },
      "grok-2-image-1212": {
        input: 0.07,
        output: 0.07,
        unit: "Per image",
      },
      // === Meta Llama 4 Models ===
      "llama-4-scout": {
        input: 0.19,
        output: 0.49,
        unit: "Per 1M tokens",
      },
      "llama-4-maverick": {
        input: 0.19,
        output: 0.49,
        unit: "Per 1M tokens",
      },
      "llama-4-behemoth-preview": {
        input: 0.19,
        output: 0.49,
        unit: "Per 1M tokens",
      },
    };

    const modelKey =
      `${provider.toLowerCase()}:${model}` in fallbackPricing
        ? `${provider.toLowerCase()}:${model}`
        : model;

    return fallbackPricing[modelKey] || fallbackPricing[model] || null;
  };

  return (
    <div className="glass p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 md:mb-8 gap-4 sm:gap-0">
        <div className="flex items-center">
          <div className="bg-gradient-primary p-2 sm:p-3 rounded-xl glow-primary shadow-lg mr-3 sm:mr-4">
            <Beaker className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold gradient-text">Model Comparison</h2>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          {results.length > 0 && (
            <button
              onClick={exportResults}
              className="btn btn-secondary flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Results</span>
              <span className="sm:hidden">Export</span>
            </button>
          )}
          <button
            onClick={runComparison}
            disabled={
              isRunning || !prompt.trim() || selectedModels.length === 0
            }
            className="btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          >
            {isRunning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">{realTimeMode ? "Executing Models..." : "Running..."}</span>
                <span className="sm:hidden">Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">{realTimeMode ? "Run Real-time Comparison" : "Run Comparison"}</span>
                <span className="sm:hidden">Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="glass p-6 mb-6 shadow-2xl backdrop-blur-xl border border-danger-200/30 dark:border-danger-500/30 animate-scale-in">
          <div className="flex items-center">
            <div className="bg-gradient-danger p-2 rounded-lg glow-danger shadow-lg mr-3">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-body text-danger-700 dark:text-danger-300">{error}</span>
          </div>
        </div>
      )}

      {/* Configuration Section */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8 lg:grid-cols-2">
        {/* Prompt Input */}
        <div className="lg:col-span-2">
          <label className="label mb-2 sm:mb-3 text-xs sm:text-sm">
            Test Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter the prompt you want to test across different models..."
            className="input min-h-[100px] sm:min-h-[120px] resize-y text-sm"
            rows={3}
          />
        </div>

        {/* Real-time Comparison Settings */}
        <div className="lg:col-span-2">
          <div className="glass p-4 sm:p-5 md:p-6 shadow-lg backdrop-blur-xl border border-primary-200/30 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <label className="flex items-start sm:items-center gap-2 sm:gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={realTimeMode}
                  onChange={(e) => setRealTimeMode(e.target.checked)}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 rounded border-primary-300 focus:ring-primary-500 mt-0.5 sm:mt-0 flex-shrink-0"
                />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary flex items-center gap-1.5">
                    <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-primary-400" />
                    Real-time Bedrock Execution
                  </span>
                  <span className="text-xs font-body text-light-text-muted dark:text-dark-text-muted">
                    (Actually runs models for authentic comparison)
                  </span>
                </div>
              </label>
            </div>

            {realTimeMode && (
              <div className="space-y-3 sm:space-y-4 pl-4 sm:pl-6 border-l-4 border-primary-500/30 glass p-3 sm:p-4 rounded-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                  <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={executeOnBedrock}
                      onChange={(e) => setExecuteOnBedrock(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded border-primary-300 focus:ring-primary-500 flex-shrink-0"
                    />
                    <span className="text-xs sm:text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">Execute on AWS Bedrock</span>
                  </label>

                  <select
                    value={comparisonMode}
                    onChange={(e) => setComparisonMode(e.target.value as any)}
                    className="input text-xs sm:text-sm w-full sm:w-auto"
                  >
                    <option value="comprehensive">
                      Comprehensive Analysis
                    </option>
                    <option value="quality">Quality Focus</option>
                    <option value="cost">Cost Focus</option>
                    <option value="speed">Speed Focus</option>
                  </select>
                </div>

                <div className="glass p-3 rounded-xl border border-accent-200/30 bg-accent-500/5">
                  <div className="text-xs font-body text-accent-700 dark:text-accent-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                    <span>Real-time mode will take longer but provides authentic
                      model responses and AI-driven evaluation</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress indicator for real-time mode */}
          {isRunning && realTimeMode && progressData && (
            <div className="glass p-6 mt-6 shadow-lg backdrop-blur-xl border border-primary-200/30 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="spinner"></div>
                <span className="text-sm font-display font-semibold text-primary-700 dark:text-primary-300">
                  {progressData.message}
                </span>
              </div>
              <div className="w-full bg-primary-200/30 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-primary h-3 rounded-full transition-all duration-500 shadow-lg progress-bar"
                  style={{ width: `${progressData.progress || 0}%` }}
                ></div>
              </div>
              <div className="text-xs font-body text-primary-600 dark:text-primary-400 mt-2">
                <span className="font-display font-semibold">{progressData.stage}</span> - {progressData.progress || 0}%
                {progressData.currentModel && (
                  <span className="ml-2 px-2 py-1 bg-primary-100/50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-lg font-display font-medium border border-primary-200/30">
                    {progressData.currentModel}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Model Selection */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-0">
            <label className="label text-xs sm:text-sm">
              Selected Models ({selectedModels.length})
            </label>
            <button
              onClick={addModel}
              disabled={selectedModels.length >= availableModels.length}
              className="btn btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Model</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
          <div className="overflow-y-auto space-y-3 sm:space-y-4 max-h-60 sm:max-h-80">
            {selectedModels.map((model, index) => (
              <div
                key={index}
                className="glass p-3 sm:p-4 shadow-lg backdrop-blur-xl border border-primary-200/30 sm:hover:scale-105 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-3 sm:gap-0">
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <select
                      value={`${model.provider}:${model.model}`}
                      onChange={(e) => {
                        console.log(
                          "Dropdown selection changed to:",
                          e.target.value,
                        );
                        const [provider, ...modelParts] =
                          e.target.value.split(":");
                        const selectedModel = modelParts.join(":"); // Handle model names with colons

                        console.log("Parsed selection:", {
                          provider,
                          model: selectedModel,
                        });

                        // Update both provider and model at once to avoid conflicts
                        const updated = [...selectedModels];
                        updated[index] = {
                          ...updated[index],
                          provider: provider,
                          model: selectedModel,
                        };
                        setSelectedModels(updated);
                      }}
                      className="input text-xs sm:text-sm w-full"
                    >
                      {availableModels.map((m) => (
                        <option
                          key={`${m.provider}:${m.model}`}
                          value={`${m.provider}:${m.model}`}
                        >
                          {m.provider} - {m.modelName || m.model}
                        </option>
                      ))}
                    </select>
                    {/* Show duplicate warning */}
                    {selectedModels.filter(
                      (m) =>
                        m.provider === model.provider &&
                        m.model === model.model,
                    ).length > 1 && (
                        <div className="glass p-2 rounded-lg border border-accent-200/30 bg-accent-500/10 dark:bg-accent-500/20 mt-2">
                          <div className="text-xs font-body text-accent-700 dark:text-accent-300 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-2" />
                            Duplicate model selected
                          </div>
                        </div>
                      )}
                    {(() => {
                      const pricing = getModelPricing(
                        model.provider,
                        model.model,
                      );
                      return (
                        pricing && (
                          <div className="glass p-2 rounded-lg border border-primary-200/30 mt-2">
                            <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                              <span className="font-display font-semibold text-success-600">Input:</span> ${pricing.input.toFixed(2)}/1M •
                              <span className="font-display font-semibold text-primary-600">Output:</span> ${pricing.output.toFixed(2)}/1M
                            </div>
                          </div>
                        )
                      );
                    })()}
                  </div>
                  <button
                    onClick={() => removeModel(index)}
                    className="btn btn-ghost sm:ml-3 p-2 text-danger-500 hover:text-white hover:bg-gradient-danger self-start sm:self-auto"
                    title="Remove this model"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block mb-1 sm:mb-2 text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      Temperature
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={model.temperature}
                      onChange={(e) =>
                        updateModel(
                          index,
                          "temperature",
                          parseFloat(e.target.value),
                        )
                      }
                      className="input text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 sm:mb-2 text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="4000"
                      value={model.maxTokens}
                      onChange={(e) =>
                        updateModel(
                          index,
                          "maxTokens",
                          parseInt(e.target.value),
                        )
                      }
                      className="input text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            {selectedModels.length === 0 && (
              <div className="text-center py-8">
                <div className="bg-gradient-primary p-4 rounded-2xl shadow-2xl glow-primary w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Beaker className="h-8 w-8 text-white" />
                </div>
                <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                  No models selected. Click <span className="font-display font-semibold text-primary-500">"Add Model"</span> to get started.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Criteria */}
        <div>
          <label className="label mb-3 sm:mb-4 text-xs sm:text-sm">
            Evaluation Criteria
          </label>
          <div className="overflow-y-auto space-y-2 sm:space-y-3 max-h-60 sm:max-h-80">
            {criteriaOptions.map((criterion) => (
              <label key={criterion} className="flex items-center glass p-2 sm:p-3 rounded-xl border border-primary-200/30 hover:bg-primary-500/5 transition-all duration-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={evaluationCriteria.includes(criterion)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEvaluationCriteria([...evaluationCriteria, criterion]);
                    } else {
                      setEvaluationCriteria(
                        evaluationCriteria.filter((c) => c !== criterion),
                      );
                    }
                  }}
                  className="mr-2 sm:mr-3 w-4 h-4 text-primary-600 rounded border-primary-300 focus:ring-primary-500 flex-shrink-0"
                />
                <span className="text-xs sm:text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary capitalize">
                  {criterion.replace("_", " ")}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Settings */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 lg:col-span-2">
          <div>
            <label className="label mb-2 text-xs sm:text-sm">
              Iterations
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={iterations}
              onChange={(e) => setIterations(parseInt(e.target.value))}
              className="input w-full sm:w-24 text-xs sm:text-sm"
            />
          </div>
          {estimatedCost !== null && (
            <div className="glass p-3 sm:p-4 rounded-xl border border-success-200/30 bg-success-500/5 dark:bg-success-500/20 w-full sm:w-auto">
              <div className="flex items-center text-xs sm:text-sm">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-success-500 dark:text-success-400 flex-shrink-0" />
                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary mr-2">Estimated Cost:</span>
                <span className="font-display font-bold gradient-text text-base sm:text-lg">
                  ${estimatedCost < 0.001
                    ? estimatedCost.toFixed(6)
                    : estimatedCost.toFixed(4)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {(isRunning || results.length > 0) && (
        <div className="pt-4 sm:pt-6 md:pt-8 border-t border-primary-200/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
            <h3 className="text-xl sm:text-2xl font-display font-bold gradient-text">Results</h3>
            {currentExperiment && (
              <div className="glass p-2 sm:p-3 rounded-xl border border-primary-200/30 w-full sm:w-auto">
                <div className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                  <span className="font-display font-semibold">Experiment ID:</span> <span className="break-all">{currentExperiment.id}</span>
                </div>
              </div>
            )}
          </div>

          {isRunning && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="spinner-lg mb-4"></div>
                <span className="font-display font-semibold text-primary-600 dark:text-primary-400">Running comparison...</span>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="glass p-4 sm:p-5 md:p-6 shadow-lg backdrop-blur-xl border border-primary-200/30 sm:hover:scale-105 transition-all duration-300 animate-fade-in"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3 sm:gap-0">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg sm:text-xl font-display font-bold gradient-text break-words">
                        {result.provider} - {result.model}
                      </h4>
                      <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mt-2 leading-relaxed">
                        {result.recommendation}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedResult(result);
                        setShowResultsModal(true);
                      }}
                      className="btn btn-secondary flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center"
                    >
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">Details</span>
                    </button>
                  </div>

                  {result.actualUsage ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                      <div className="glass rounded-xl p-3 sm:p-4 bg-gradient-primary/10 border-l-4 border-primary-500">
                        <div className="text-xs sm:text-sm font-display font-semibold text-primary-700 dark:text-primary-300">
                          Total Calls
                        </div>
                        <div className="text-lg sm:text-xl md:text-2xl font-display font-bold gradient-text">
                          {result.actualUsage.totalCalls.toLocaleString()}
                        </div>
                      </div>
                      <div className="glass rounded-xl p-3 sm:p-4 bg-gradient-success/10 border-l-4 border-success-500">
                        <div className="text-xs sm:text-sm font-display font-semibold text-success-700 dark:text-success-300">
                          Avg Cost
                        </div>
                        <div className="text-lg sm:text-xl md:text-2xl font-display font-bold text-success-600 dark:text-success-400">
                          ${result.actualUsage.avgCost.toFixed(4)}
                        </div>
                      </div>
                      <div className="glass rounded-xl p-3 sm:p-4 bg-gradient-accent/10 border-l-4 border-accent-500">
                        <div className="text-xs sm:text-sm font-display font-semibold text-accent-700 dark:text-accent-300">
                          Avg Response Time
                        </div>
                        <div className="text-lg sm:text-xl md:text-2xl font-display font-bold text-accent-600 dark:text-accent-400">
                          {result.actualUsage.avgResponseTime.toFixed(0)}ms
                        </div>
                      </div>
                      <div className="glass rounded-xl p-3 sm:p-4 bg-gradient-danger/10 border-l-4 border-danger-500">
                        <div className="text-xs sm:text-sm font-display font-semibold text-danger-700 dark:text-danger-300">
                          Error Rate
                        </div>
                        <div className="text-lg sm:text-xl md:text-2xl font-display font-bold text-danger-600 dark:text-danger-400">
                          {result.actualUsage.errorRate.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Pricing Information */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                        <div className="glass rounded-xl p-4 bg-gradient-primary/10 border-l-4 border-primary-500">
                          <div className="text-sm font-display font-semibold text-primary-700 dark:text-primary-300">
                            Input Cost
                          </div>
                          <div className="text-lg font-display font-bold gradient-text">
                            $
                            {(() => {
                              const pricing = result.pricing?.inputCost
                                ? {
                                  input: result.pricing.inputCost * 1000000,
                                  output: result.pricing.outputCost || 0,
                                }
                                : getModelPricing(
                                  result.provider,
                                  result.model,
                                );
                              return pricing?.input
                                ? pricing.input.toFixed(2)
                                : "N/A";
                            })()}
                            <span className="text-xs font-body text-light-text-muted dark:text-dark-text-muted">/1M tokens</span>
                          </div>
                        </div>
                        <div className="glass rounded-xl p-4 bg-gradient-success/10 border-l-4 border-success-500">
                          <div className="text-sm font-display font-semibold text-success-700 dark:text-success-300">
                            Output Cost
                          </div>
                          <div className="text-lg font-display font-bold text-success-600 dark:text-success-400">
                            $
                            {(() => {
                              const pricing = result.pricing?.outputCost
                                ? {
                                  input: result.pricing.inputCost || 0,
                                  output: result.pricing.outputCost * 1000000,
                                }
                                : getModelPricing(
                                  result.provider,
                                  result.model,
                                );
                              return pricing?.output
                                ? pricing.output.toFixed(2)
                                : "N/A";
                            })()}
                            <span className="text-xs font-body text-light-text-muted dark:text-dark-text-muted">/1M tokens</span>
                          </div>
                        </div>
                        <div className="glass rounded-xl p-4 bg-gradient-accent/10 border-l-4 border-accent-500">
                          <div className="text-sm font-display font-semibold text-accent-700 dark:text-accent-300">
                            Est. Cost/1K
                          </div>
                          <div className="text-lg font-display font-bold text-accent-600 dark:text-accent-400">
                            ${result.estimatedCostPer1K?.toFixed(4) || "N/A"}
                          </div>
                        </div>
                        <div className="glass rounded-xl p-4 bg-gradient-secondary/10 border-l-4 border-secondary-500">
                          <div className="text-sm font-display font-semibold text-secondary-700 dark:text-secondary-300">
                            Context Window
                          </div>
                          <div className="text-lg font-display font-bold text-secondary-600 dark:text-secondary-400">
                            {result.pricing?.contextWindow?.toLocaleString() ||
                              "N/A"}{" "}
                            <span className="text-xs font-body text-light-text-muted dark:text-dark-text-muted">tokens</span>
                          </div>
                        </div>
                      </div>

                      {/* Analysis Strengths and Considerations */}
                      {result.analysis &&
                        (result.analysis.strengths?.length > 0 ||
                          result.analysis.considerations?.length > 0) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {result.analysis.strengths?.length > 0 && (
                              <div className="glass p-4 bg-gradient-success/10 border-l-4 border-success-500">
                                <div className="text-sm font-display font-semibold text-success-700 dark:text-success-300 mb-3">
                                  Strengths
                                </div>
                                <ul className="text-sm font-body text-success-600 dark:text-success-400 space-y-2">
                                  {result.analysis.strengths.map(
                                    (strength: string, i: number) => (
                                      <li key={i} className="flex items-start">
                                        <Check className="w-4 h-4 text-success-500 mr-2 flex-shrink-0 mt-0.5" />
                                        {strength}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                            {result.analysis.considerations?.length > 0 && (
                              <div className="glass p-4 bg-gradient-accent/10 border-l-4 border-accent-500">
                                <div className="text-sm font-display font-semibold text-accent-700 dark:text-accent-300 mb-3">
                                  Considerations
                                </div>
                                <ul className="text-sm font-body text-accent-600 dark:text-accent-400 space-y-2">
                                  {result.analysis.considerations.map(
                                    (consideration: string, i: number) => (
                                      <li key={i} className="flex items-start">
                                        <AlertTriangle className="w-4 h-4 text-accent-500 dark:text-accent-400 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>{consideration}</span>
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ))}

              {currentExperiment && currentExperiment.results && (
                <div className="mt-8 glass p-6 shadow-2xl backdrop-blur-xl border border-primary-200/30 animate-fade-in">
                  <h4 className="text-lg font-display font-bold gradient-text mb-4">
                    Overall Analysis
                  </h4>
                  <p className="text-sm font-body text-light-text-primary dark:text-dark-text-primary mb-4 leading-relaxed">
                    {currentExperiment.results.recommendation}
                  </p>

                  {currentExperiment.results.costComparison && (
                    <div className="glass p-3 rounded-xl border border-success-200/30 bg-success-500/5 mb-3">
                      <div className="text-sm font-body text-success-700 dark:text-success-300">
                        <span className="font-display font-semibold">Cost Comparison:</span>{" "}
                        {currentExperiment.results.costComparison}
                      </div>
                    </div>
                  )}

                  {currentExperiment.results.useCaseAnalysis && (
                    <div className="glass p-3 rounded-xl border border-primary-200/30 bg-primary-500/5 mb-3">
                      <div className="text-sm font-body text-primary-700 dark:text-primary-300">
                        <span className="font-display font-semibold">Use Case Analysis:</span>{" "}
                        {currentExperiment.results.useCaseAnalysis}
                      </div>
                    </div>
                  )}

                  <div className="glass p-3 rounded-xl border border-accent-200/30 bg-accent-500/5">
                    <div className="text-xs font-body text-accent-700 dark:text-accent-300">
                      <span className="font-display font-semibold">Confidence:</span>{" "}
                      <span className="gradient-text font-display font-bold">
                        {(
                          (currentExperiment.metadata.confidence || 0) * 100
                        ).toFixed(1)}%
                      </span>
                      {" "} • Based on{" "}
                      <span className="font-display font-semibold">
                        {currentExperiment.results.basedOnActualUsage || 0}
                      </span>{" "}
                      models with usage data
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Detail Modal */}
      {showResultsModal && selectedResult && (
        <Modal
          isOpen={showResultsModal}
          onClose={() => setShowResultsModal(false)}
          title={`${selectedResult.provider} - ${selectedResult.model}`}
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Recommendation
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-800">
                  {selectedResult.recommendation}
                </p>
              </div>
            </div>

            {selectedResult.actualUsage ? (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Usage Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-blue-900 mb-2">
                      Call Statistics
                    </div>
                    <div className="space-y-1 text-sm text-blue-800">
                      <div>
                        Total Calls:{" "}
                        {selectedResult.actualUsage.totalCalls.toLocaleString()}
                      </div>
                      <div>
                        Total Cost: $
                        {selectedResult.actualUsage.totalCost.toFixed(2)}
                      </div>
                      <div>
                        Avg Cost: $
                        {selectedResult.actualUsage.avgCost.toFixed(4)}
                      </div>
                      <div>
                        Avg Tokens:{" "}
                        {selectedResult.actualUsage.avgTokens.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-green-900 mb-2">
                      Performance
                    </div>
                    <div className="space-y-1 text-sm text-green-800">
                      <div>
                        Avg Response Time:{" "}
                        {selectedResult.actualUsage.avgResponseTime.toFixed(0)}
                        ms
                      </div>
                      <div>
                        Error Rate:{" "}
                        {selectedResult.actualUsage.errorRate.toFixed(2)}%
                      </div>
                      <div>
                        Success Rate:{" "}
                        {(100 - selectedResult.actualUsage.errorRate).toFixed(
                          2,
                        )}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Pricing Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-blue-900 mb-2">
                        Token Costs
                      </div>
                      <div className="space-y-1 text-sm text-blue-800">
                        <div>
                          Input: $
                          {(() => {
                            const pricing = selectedResult.pricing?.inputCost
                              ? {
                                input:
                                  selectedResult.pricing.inputCost * 1000000,
                                output:
                                  selectedResult.pricing.outputCost || 0,
                              }
                              : getModelPricing(
                                selectedResult.provider,
                                selectedResult.model,
                              );
                            return pricing?.input
                              ? pricing.input.toFixed(2)
                              : "N/A";
                          })()}
                          /1M tokens
                        </div>
                        <div>
                          Output: $
                          {(() => {
                            const pricing = selectedResult.pricing?.outputCost
                              ? {
                                input: selectedResult.pricing.inputCost || 0,
                                output:
                                  selectedResult.pricing.outputCost * 1000000,
                              }
                              : getModelPricing(
                                selectedResult.provider,
                                selectedResult.model,
                              );
                            return pricing?.output
                              ? pricing.output.toFixed(2)
                              : "N/A";
                          })()}
                          /1M tokens
                        </div>
                        <div className="font-medium">
                          Est. Cost per 1K: $
                          {(() => {
                            if (selectedResult.estimatedCostPer1K)
                              return selectedResult.estimatedCostPer1K.toFixed(
                                4,
                              );
                            const pricing = getModelPricing(
                              selectedResult.provider,
                              selectedResult.model,
                            );
                            if (pricing) {
                              // Calculate estimated cost per 1K tokens (assume 50% input, 50% output)
                              const cost1K =
                                (pricing.input * 0.5 + pricing.output * 0.5) /
                                1000;
                              return cost1K.toFixed(4);
                            }
                            return "N/A";
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-purple-900 mb-2">
                        Model Specs
                      </div>
                      <div className="space-y-1 text-sm text-purple-800">
                        <div>
                          Context Window:{" "}
                          {selectedResult.pricing?.contextWindow?.toLocaleString() ||
                            "N/A"}{" "}
                          tokens
                        </div>
                        <div>Provider: {selectedResult.provider}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedResult.analysis && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedResult.analysis.strengths?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Strengths
                        </h4>
                        <div className="bg-green-50 rounded-lg p-4">
                          <ul className="text-sm text-green-800 space-y-2">
                            {selectedResult.analysis.strengths.map(
                              (strength: string, i: number) => (
                                <li key={i} className="flex items-start">
                                  <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                                  <span>{strength}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                    {selectedResult.analysis.considerations?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Considerations
                        </h4>
                        <div className="bg-amber-50 rounded-lg p-4">
                          <ul className="text-sm text-amber-800 space-y-2">
                            {selectedResult.analysis.considerations.map(
                              (consideration: string, i: number) => (
                                <li key={i} className="flex items-start">
                                  <AlertTriangle className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                                  <span>{consideration}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedResult.estimatedCostPer1K === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>No pricing data available</strong> - This model
                      may not be included in our pricing database. Please check
                      with the provider for current pricing information.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ModelComparison;
