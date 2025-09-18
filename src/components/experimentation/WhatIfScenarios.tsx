import React, { useState, useEffect } from "react";
import {
  PlayIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BeakerIcon,
  LightBulbIcon,
  ShieldExclamationIcon,
  ArrowPathIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  ExperimentationService,
  WhatIfScenario,
  WhatIfResult,
} from "../../services/experimentation.service";
import { Modal } from "../common/Modal";

interface ScenarioChange {
  type:
  | "model_switch"
  | "volume_change"
  | "feature_addition"
  | "optimization_applied";
  currentValue: any;
  proposedValue: any;
  affectedMetrics: string[];
  description: string;
}

interface ScenarioTemplate {
  name: string;
  description: string;
  changes: ScenarioChange[];
  category: "optimization" | "scaling" | "model_switch" | "feature";
}

const WhatIfScenarios: React.FC = () => {
  const [scenarios, setScenarios] = useState<WhatIfScenario[]>([]);
  const [scenarioResults, setScenarioResults] = useState<{
    [key: string]: WhatIfResult;
  }>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedScenario, setSelectedScenario] =
    useState<WhatIfScenario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [newScenario, setNewScenario] = useState<Partial<WhatIfScenario>>({
    name: "",
    description: "",
    timeframe: "monthly",
    changes: [],
    baselineData: {
      cost: 0,
      volume: 0,
      performance: 0,
    },
  });

  const scenarioTemplates: ScenarioTemplate[] = [
    // 🚀 REAL-TIME COST SIMULATOR TEMPLATES
    {
      name: "🔥 Prompt Cost Optimizer",
      description: "Real-time cost optimization for your specific prompt - see instant savings!",
      category: "optimization",
      changes: [
        {
          type: "optimization_applied",
          currentValue: { prompt: "Your current prompt", model: "gpt-4" },
          proposedValue: { optimizedPrompt: "Optimized version", estimatedSavings: "30-50%" },
          affectedMetrics: ["cost", "efficiency", "quality"],
          description: "Optimize prompt structure and reduce token usage",
        },
      ],
    },
    {
      name: "✂️ Context Trimmer",
      description: "Smart context trimming - maintain quality while cutting costs by up to 60%",
      category: "optimization",
      changes: [
        {
          type: "optimization_applied",
          currentValue: { contextLength: "Full context", cost: "$0.24" },
          proposedValue: { contextLength: "Trimmed 30%", cost: "$0.17" },
          affectedMetrics: ["cost", "tokens", "latency"],
          description: "Intelligently trim context while preserving key information",
        },
      ],
    },
    {
      name: "⚡ Model Comparison Dashboard",
      description: "Compare your prompt across 5+ models simultaneously - find the best value",
      category: "model_switch",
      changes: [
        {
          type: "model_switch",
          currentValue: { model: "gpt-4", cost: "$0.24" },
          proposedValue: { bestModel: "claude-3-haiku", cost: "$0.012", savings: "95%" },
          affectedMetrics: ["cost", "quality", "speed"],
          description: "Real-time comparison across multiple AI models",
        },
      ],
    },
    {
      name: "🎯 Complete Optimization Suite",
      description: "The full treatment - prompt optimization + model switch + context trimming",
      category: "optimization",
      changes: [
        {
          type: "optimization_applied",
          currentValue: { cost: "$0.24", efficiency: "baseline" },
          proposedValue: { cost: "$0.05", efficiency: "optimized", savings: "79%" },
          affectedMetrics: ["cost", "speed", "quality", "efficiency"],
          description: "Complete optimization analysis with actionable recommendations",
        },
      ],
    },
    // ENHANCED STRATEGIC SCENARIOS
    {
      name: "GPT-4 to Claude Switch",
      description:
        "Analyze the impact of switching from GPT-4 to Claude for text generation tasks",
      category: "model_switch",
      changes: [
        {
          type: "model_switch",
          currentValue: { provider: "openai", model: "gpt-4" },
          proposedValue: { provider: "anthropic", model: "claude-3-sonnet" },
          affectedMetrics: ["cost", "quality", "latency"],
          description: "Switch primary model from GPT-4 to Claude",
        },
      ],
    },
    {
      name: "10x Volume Increase",
      description: "Simulate the cost impact of a 10x increase in usage volume",
      category: "scaling",
      changes: [
        {
          type: "volume_change",
          currentValue: { dailyRequests: 1000 },
          proposedValue: { dailyRequests: 10000 },
          affectedMetrics: ["cost", "infrastructure"],
          description: "Increase daily API requests by 10x",
        },
      ],
    },
    {
      name: "Add Response Caching",
      description: "Evaluate the savings from implementing response caching",
      category: "optimization",
      changes: [
        {
          type: "optimization_applied",
          currentValue: { cacheHitRate: 0 },
          proposedValue: { cacheHitRate: 0.3 },
          affectedMetrics: ["cost", "latency"],
          description: "Implement caching with 30% hit rate",
        },
      ],
    },
    {
      name: "Add Image Generation",
      description: "Cost impact of adding image generation capabilities",
      category: "feature",
      changes: [
        {
          type: "feature_addition",
          currentValue: { imageGeneration: false },
          proposedValue: { imageGeneration: true, dailyImages: 500 },
          affectedMetrics: ["cost", "infrastructure"],
          description: "Add DALL-E image generation feature",
        },
      ],
    },
  ];

  const changeTypeLabels = {
    model_switch: "Model Switch",
    volume_change: "Volume Change",
    feature_addition: "Feature Addition",
    optimization_applied: "Optimization Applied",
    prompt_optimization: "🔥 Prompt Optimization",
    context_trimming: "✂️ Context Trimming",
    model_comparison: "⚡ Model Comparison",
    real_time_analysis: "🎯 Real-time Analysis",
  };

  const riskLevelColors = {
    low: "bg-gradient-success/10 text-success-700 border-success-200/30",
    medium: "bg-gradient-accent/10 text-accent-700 border-accent-200/30",
    high: "bg-gradient-danger/10 text-danger-700 border-danger-200/30",
  };

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const scenarios = await ExperimentationService.getWhatIfScenarios();
      setScenarios(scenarios);
    } catch (error) {
      console.error("Error loading scenarios:", error);
      setError("Failed to load scenarios");
    }
  };

  const createScenario = async () => {
    // Enhanced validation
    if (!newScenario.name?.trim()) {
      setError("Please enter a scenario name");
      return;
    }

    if (!newScenario.description?.trim()) {
      setError("Please enter a scenario description");
      return;
    }

    if (!newScenario.changes?.length) {
      setError("Please add at least one change to the scenario");
      return;
    }

    // Validate that all changes have required fields
    const invalidChanges = newScenario.changes.filter(
      (change) => !change.description?.trim() || !change.type,
    );

    if (invalidChanges.length > 0) {
      setError("Please fill in all change descriptions and types");
      return;
    }

    setIsCreating(true);
    setError(null); // Clear any previous errors

    try {
      await ExperimentationService.createWhatIfScenario(
        newScenario as WhatIfScenario,
      );

      await loadScenarios();
      setShowCreateModal(false);
      resetNewScenario();

      // Show success message briefly
      setError(null);
    } catch (error: any) {
      console.error("Error creating scenario:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create scenario";
      setError(`Failed to create scenario: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const runAnalysis = async (scenario: WhatIfScenario) => {
    setIsAnalyzing({ ...isAnalyzing, [scenario.name]: true });
    try {
      const result = await ExperimentationService.runWhatIfAnalysis(
        scenario.name,
      );
      setScenarioResults({ ...scenarioResults, [scenario.name]: result });
    } catch (error) {
      console.error("Error running analysis:", error);
      setError("Failed to run analysis");
    } finally {
      setIsAnalyzing({ ...isAnalyzing, [scenario.name]: false });
    }
  };

  const deleteScenario = async (scenarioName: string) => {
    try {
      await ExperimentationService.deleteWhatIfScenario(scenarioName);
      await loadScenarios();
      delete scenarioResults[scenarioName];
      setScenarioResults({ ...scenarioResults });
    } catch (error) {
      console.error("Error deleting scenario:", error);
      setError("Failed to delete scenario");
    }
  };

  const resetNewScenario = () => {
    setNewScenario({
      name: "",
      description: "",
      changes: [],
      timeframe: "monthly",
      baselineData: {
        cost: 0,
        volume: 0,
        performance: 0,
      },
    });
  };

  const addChange = () => {
    if (!newScenario.changes) return;

    const newChange: ScenarioChange = {
      type: "model_switch",
      currentValue: {},
      proposedValue: {},
      affectedMetrics: ["cost"],
      description: "",
    };

    setNewScenario({
      ...newScenario,
      changes: [...newScenario.changes, newChange],
    });
  };

  const updateChange = (
    index: number,
    field: keyof ScenarioChange,
    value: any,
  ) => {
    if (!newScenario.changes) return;

    const updatedChanges = [...newScenario.changes];
    updatedChanges[index] = { ...updatedChanges[index], [field]: value };
    setNewScenario({ ...newScenario, changes: updatedChanges });
  };

  const removeChange = (index: number) => {
    if (!newScenario.changes) return;

    const updatedChanges = newScenario.changes.filter((_, i) => i !== index);
    setNewScenario({ ...newScenario, changes: updatedChanges });
  };

  const applyTemplate = (template: ScenarioTemplate) => {
    setNewScenario({
      ...newScenario,
      name: template.name,
      description: template.description,
      changes: template.changes,
    });
    setShowTemplatesModal(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return <InformationCircleIcon className="h-5 w-5 text-success-500 glow-success" />;
      case "medium":
        return <ExclamationTriangleIcon className="h-5 w-5 text-accent-500 glow-accent" />;
      case "high":
        return <ShieldExclamationIcon className="h-5 w-5 text-danger-500 glow-danger" />;
      default:
        return null;
    }
  };

  return (
    <div className="glass p-8 shadow-2xl backdrop-blur-xl animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <div className="bg-gradient-primary p-3 rounded-xl glow-primary shadow-lg mr-4">
            <BeakerIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold gradient-text">What-If Scenarios</h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTemplatesModal(true)}
            className="btn-secondary font-display font-medium hover:scale-105 transition-all duration-300"
          >
            <BeakerIcon className="h-4 w-4 mr-2" />
            Templates
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary font-display font-semibold hover:scale-105 transition-all duration-300"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Scenario
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 glass p-6 shadow-2xl backdrop-blur-xl border border-danger-200/30 animate-scale-in">
          <div className="flex items-center">
            <div className="bg-gradient-danger p-2 rounded-lg glow-danger shadow-lg mr-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-body text-danger-700 dark:text-danger-300">{error}</span>
          </div>
        </div>
      )}

      {/* Scenarios List */}
      <div className="space-y-6">
        {scenarios.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gradient-primary p-4 rounded-2xl shadow-2xl glow-primary w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <BeakerIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-display font-bold gradient-text mb-3">
              No Scenarios Yet
            </h3>
            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-6">
              Create your first what-if scenario to analyze potential changes.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary font-display font-semibold hover:scale-105 transition-all duration-300"
            >
              Create your first scenario
            </button>
          </div>
        ) : (
          scenarios.map((scenario) => (
            <div
              key={scenario.name}
              className="glass p-6 shadow-lg backdrop-blur-xl border border-primary-200/30 hover:scale-105 transition-all duration-300 animate-fade-in"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-display font-bold gradient-text">
                    {scenario.name}
                  </h3>
                  <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mt-2 leading-relaxed">
                    {scenario.description}
                  </p>
                  <div className="flex items-center mt-3 space-x-6">
                    <div className="glass p-2 rounded-lg border border-primary-200/30">
                      <span className="text-xs font-display font-semibold text-primary-600 dark:text-primary-400">
                        Timeframe: {scenario.timeframe}
                      </span>
                    </div>
                    <div className="glass p-2 rounded-lg border border-accent-200/30">
                      <span className="text-xs font-display font-semibold text-accent-600 dark:text-accent-400">
                        {scenario.changes.length} change
                        {scenario.changes.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => runAnalysis(scenario)}
                    disabled={isAnalyzing[scenario.name]}
                    className="btn-primary text-sm font-display font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isAnalyzing[scenario.name] ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-4 w-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deleteScenario(scenario.name)}
                    className="p-2 rounded-xl text-danger-500 hover:text-white hover:bg-gradient-danger transition-all duration-300 hover:scale-110 shadow-lg"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Changes Preview */}
              <div className="border-t border-primary-200/30 pt-4">
                <h4 className="text-sm font-display font-bold gradient-text mb-3">
                  Changes:
                </h4>
                <div className="space-y-3">
                  {scenario.changes.map((change, index) => (
                    <div
                      key={index}
                      className="glass p-3 rounded-xl border border-primary-200/30 hover:bg-primary-500/5 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 rounded-xl text-xs font-display font-bold bg-gradient-primary text-white shadow-lg">
                          {changeTypeLabels[change.type]}
                        </span>
                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                          {change.description || `${change.type} change`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Results */}
              {scenarioResults[scenario.name] && (
                <div className="border-t border-primary-200/30 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      Results:
                    </h4>
                    <button
                      onClick={() => {
                        setSelectedScenario(scenario);
                        setShowDetailsModal(true);
                      }}
                      className="text-primary-500 hover:text-primary-600 font-display font-medium hover:scale-105 transition-all duration-300"
                    >
                      View Details
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass rounded-xl p-6 text-center bg-gradient-primary/10 border-l-4 border-primary-500">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        {scenarioResults[scenario.name].projectedImpact
                          .costChange >= 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-danger-500 glow-danger" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-success-500 glow-success" />
                        )}
                        <span className="text-sm font-display font-semibold text-primary-600 dark:text-primary-400">Cost Impact</span>
                      </div>
                      <div
                        className={`text-3xl font-display font-bold gradient-text ${scenarioResults[scenario.name].projectedImpact.costChange >= 0 ? "text-danger-600" : "text-success-600"}`}
                      >
                        {formatCurrency(
                          scenarioResults[scenario.name].projectedImpact
                            .costChange,
                        )}
                      </div>
                      <div className="text-xs font-body text-light-text-muted dark:text-dark-text-muted">
                        {formatPercentage(
                          scenarioResults[scenario.name].projectedImpact
                            .costChangePercentage,
                        )}
                      </div>
                    </div>
                    <div className="glass rounded-xl p-6 text-center bg-gradient-accent/10 border-l-4 border-accent-500">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <LightBulbIcon className="h-4 w-4 text-accent-500 glow-accent" />
                        <span className="text-sm font-display font-semibold text-accent-600 dark:text-accent-400">Confidence</span>
                      </div>
                      <div className="text-3xl font-display font-bold gradient-text">
                        {formatPercentage(
                          scenarioResults[scenario.name].projectedImpact
                            .confidence,
                        )}
                      </div>
                    </div>
                    <div className="glass rounded-xl p-6 text-center bg-gradient-secondary/10 border-l-4 border-secondary-500">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        {getRiskIcon(
                          scenarioResults[scenario.name].projectedImpact
                            .riskLevel,
                        )}
                        <span className="text-sm font-display font-semibold text-secondary-600 dark:text-secondary-400">Risk Level</span>
                      </div>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-xl border text-xs font-display font-bold shadow-lg ${riskLevelColors[scenarioResults[scenario.name].projectedImpact.riskLevel]}`}
                      >
                        {scenarioResults[
                          scenario.name
                        ].projectedImpact.riskLevel.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  {(() => {
                    const aiInsights =
                      scenarioResults[scenario.name]?.aiInsights;
                    return aiInsights && aiInsights.length > 0 ? (
                      <div className="mt-6">
                        <h5 className="font-display font-semibold gradient-text mb-3 flex items-center">
                          <SparklesIcon className="h-5 w-5 mr-2 text-accent-500 glow-accent" />
                          AI Insights
                        </h5>
                        <div className="glass p-4 rounded-xl border border-accent-200/30 bg-accent-500/5">
                          <div className="space-y-3">
                            {aiInsights.map(
                              (insight: string, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-start space-x-3"
                                >
                                  <div className="w-2.5 h-2.5 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="font-body text-accent-800 dark:text-accent-200">
                                    {insight}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Recommendations and Warnings */}
                  {(scenarioResults[scenario.name].recommendations?.length >
                    0 ||
                    scenarioResults[scenario.name].warnings?.length > 0) && (
                      <div className="mt-6 space-y-4">
                        {scenarioResults[scenario.name].recommendations?.length >
                          0 && (
                            <div>
                              <h5 className="font-display font-semibold gradient-text mb-3 flex items-center">
                                <LightBulbIcon className="h-5 w-5 mr-2 text-success-500 glow-success" />
                                Recommendations
                              </h5>
                              <div className="glass p-4 rounded-xl border border-success-200/30 bg-success-500/5">
                                <div className="space-y-3">
                                  {scenarioResults[
                                    scenario.name
                                  ].recommendations.map(
                                    (rec: string, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-start space-x-3"
                                      >
                                        <div className="w-2.5 h-2.5 bg-success-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="font-body text-success-800 dark:text-success-200">
                                          {rec}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                        {scenarioResults[scenario.name].warnings?.length > 0 && (
                          <div>
                            <h5 className="font-display font-semibold gradient-text mb-3 flex items-center">
                              <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-warning-500 glow-warning" />
                              Warnings
                            </h5>
                            <div className="glass p-4 rounded-xl border border-warning-200/30 bg-warning-500/5">
                              <div className="space-y-3">
                                {scenarioResults[scenario.name].warnings.map(
                                  (warning: string, index: number) => (
                                    <div
                                      key={index}
                                      className="flex items-start space-x-3"
                                    >
                                      <div className="w-2.5 h-2.5 bg-warning-500 rounded-full mt-2 flex-shrink-0"></div>
                                      <span className="font-body text-warning-800 dark:text-warning-200">
                                        {warning}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Templates Modal */}
      {showTemplatesModal && (
        <Modal
          isOpen={showTemplatesModal}
          onClose={() => setShowTemplatesModal(false)}
          title="Scenario Templates"
        >
          <div className="space-y-4">
            {scenarioTemplates.map((template, index) => (
              <div
                key={index}
                className="glass p-6 shadow-lg backdrop-blur-xl border border-primary-200/30 hover:scale-105 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-display font-bold gradient-text">
                      {template.name}
                    </h3>
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                      {template.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-display font-semibold bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                    {template.category}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm font-body text-light-text-muted dark:text-dark-text-muted">
                    {template.changes.length} change
                    {template.changes.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => applyTemplate(template)}
                    className="text-primary-500 hover:text-primary-600 font-display font-medium hover:scale-105 transition-all duration-300"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Create Scenario Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create What-If Scenario"
        >
          <div className="space-y-6">
            <div>
              <label className="label mb-2">
                Scenario Name
              </label>
              <input
                type="text"
                value={newScenario.name || ""}
                onChange={(e) =>
                  setNewScenario({ ...newScenario, name: e.target.value })
                }
                className="input"
                placeholder="Enter scenario name..."
              />
            </div>

            <div>
              <label className="label mb-2">
                Description
              </label>
              <textarea
                value={newScenario.description || ""}
                onChange={(e) =>
                  setNewScenario({
                    ...newScenario,
                    description: e.target.value,
                  })
                }
                className="input"
                rows={3}
                placeholder="Describe what this scenario tests..."
              />
            </div>

            <div>
              <label className="label mb-2">
                Timeframe
              </label>
              <select
                value={newScenario.timeframe || "monthly"}
                onChange={(e) =>
                  setNewScenario({
                    ...newScenario,
                    timeframe: e.target.value as any,
                  })
                }
                className="input"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="label">
                  Changes
                </label>
                <button
                  onClick={addChange}
                  className="text-primary-500 hover:text-primary-600 font-display font-medium hover:scale-105 transition-all duration-300"
                >
                  Add Change
                </button>
              </div>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {newScenario.changes?.map((change, index) => (
                  <div
                    key={index}
                    className="glass p-4 rounded-xl border border-primary-200/30 bg-primary-500/5"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <select
                        value={change.type}
                        onChange={(e) =>
                          updateChange(index, "type", e.target.value)
                        }
                        className="input"
                      >
                        <option value="model_switch">Model Switch</option>
                        <option value="volume_change">Volume Change</option>
                        <option value="feature_addition">
                          Feature Addition
                        </option>
                        <option value="optimization_applied">
                          Optimization Applied
                        </option>
                      </select>
                      <button
                        onClick={() => removeChange(index)}
                        className="text-danger-500 hover:text-danger-700 hover:scale-110 transition-all duration-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={change.description}
                      onChange={(e) =>
                        updateChange(index, "description", e.target.value)
                      }
                      className="input"
                      placeholder="Description of the change..."
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary font-display font-medium hover:scale-105 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={createScenario}
                disabled={isCreating}
                className="btn-primary font-display font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isCreating ? "Creating..." : "Create Scenario"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Scenario Details Modal */}
      {showDetailsModal && selectedScenario && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={`Scenario Details: ${selectedScenario.name}`}
          size="lg"
        >
          <div className="space-y-8">
            {/* Scenario Information */}
            <div>
              <h4 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                Scenario Information
              </h4>
              <div className="glass p-6 rounded-xl border border-primary-200/30 bg-primary-500/5">
                <div className="space-y-4">
                  <div>
                    <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      Description:
                    </span>
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mt-2">
                      {selectedScenario.description}
                    </p>
                  </div>
                  <div>
                    <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      Timeframe:
                    </span>
                    <span className="font-body text-light-text-secondary dark:text-dark-text-secondary ml-2 capitalize">
                      {selectedScenario.timeframe}
                    </span>
                  </div>
                  <div>
                    <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      Created:
                    </span>
                    <span className="font-body text-light-text-secondary dark:text-dark-text-secondary ml-2">
                      {new Date(
                        selectedScenario.createdAt || Date.now(),
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Changes */}
            <div>
              <h4 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                Proposed Changes
              </h4>
              <div className="space-y-4">
                {selectedScenario.changes.map((change, index) => (
                  <div
                    key={index}
                    className="glass p-6 rounded-xl border border-primary-200/30 bg-primary-500/5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-display font-bold bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                        {changeTypeLabels[change.type]}
                      </span>
                    </div>
                    <p className="font-body text-light-text-primary dark:text-dark-text-primary mb-4">
                      {change.description}
                    </p>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                          Current:
                        </span>
                        <div className="font-body text-light-text-secondary dark:text-dark-text-secondary mt-2">
                          {typeof change.currentValue === "object"
                            ? Object.entries(change.currentValue).map(
                              ([key, value]) => (
                                <div key={key}>
                                  {key}: {String(value)}
                                </div>
                              ),
                            )
                            : String(change.currentValue)}
                        </div>
                      </div>
                      <div>
                        <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                          Proposed:
                        </span>
                        <div className="font-body text-light-text-secondary dark:text-dark-text-secondary mt-2">
                          {typeof change.proposedValue === "object"
                            ? Object.entries(change.proposedValue).map(
                              ([key, value]) => (
                                <div key={key}>
                                  {key}: {String(value)}
                                </div>
                              ),
                            )
                            : String(change.proposedValue)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                        Affected Metrics:
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {change.affectedMetrics.map((metric, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-xl text-xs bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis Results */}
            {scenarioResults[selectedScenario.name] && (
              <div>
                <h4 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                  Analysis Results
                </h4>
                <div className="space-y-6">
                  {/* Impact Summary */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="glass rounded-xl p-6 text-center bg-gradient-primary/10 border-l-4 border-primary-500">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <ArrowTrendingUpIcon className="h-5 w-5 text-primary-500 glow-primary" />
                        <span className="font-display font-semibold text-primary-600 dark:text-primary-400">
                          Cost Impact
                        </span>
                      </div>
                      <div
                        className={`text-4xl font-display font-bold gradient-text ${scenarioResults[selectedScenario.name]?.projectedImpact.costChange >= 0 ? "text-danger-600" : "text-success-600"}`}
                      >
                        {formatCurrency(
                          scenarioResults[selectedScenario.name]
                            ?.projectedImpact.costChange || 0,
                        )}
                      </div>
                      <div className="font-body text-primary-700 dark:text-primary-300">
                        {formatPercentage(
                          scenarioResults[selectedScenario.name]
                            ?.projectedImpact.costChangePercentage || 0,
                        )}{" "}
                        change
                      </div>
                    </div>
                    <div className="glass rounded-xl p-6 text-center bg-gradient-success/10 border-l-4 border-success-500">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <LightBulbIcon className="h-5 w-5 text-success-500 glow-success" />
                        <span className="font-display font-semibold text-success-600 dark:text-success-400">
                          Performance Impact
                        </span>
                      </div>
                      <div
                        className={`text-4xl font-display font-bold gradient-text ${scenarioResults[selectedScenario.name]?.projectedImpact.performanceChange >= 0 ? "text-success-600" : "text-danger-600"}`}
                      >
                        {formatPercentage(
                          scenarioResults[selectedScenario.name]
                            ?.projectedImpact.performanceChange || 0,
                        )}
                      </div>
                      <div className="font-body text-success-700 dark:text-success-300">
                        Risk Level:{" "}
                        {scenarioResults[selectedScenario.name]?.projectedImpact
                          .riskLevel || "unknown"}
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  {scenarioResults[selectedScenario.name]?.aiInsights &&
                    scenarioResults[selectedScenario.name]?.aiInsights!.length >
                    0 && (
                      <div>
                        <h5 className="font-display font-semibold gradient-text mb-3 flex items-center">
                          <SparklesIcon className="h-5 w-5 mr-2 text-accent-500 glow-accent" />
                          AI Insights
                        </h5>
                        <div className="glass p-4 rounded-xl border border-accent-200/30 bg-accent-500/5">
                          <div className="space-y-3">
                            {scenarioResults[
                              selectedScenario.name
                            ]?.aiInsights?.map(
                              (insight: string, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-start space-x-3"
                                >
                                  <div className="w-2.5 h-2.5 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="font-body text-accent-800 dark:text-accent-200">
                                    {insight}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Recommendations */}
                  {scenarioResults[selectedScenario.name]?.recommendations &&
                    scenarioResults[selectedScenario.name]?.recommendations
                      .length > 0 && (
                      <div>
                        <h5 className="font-display font-semibold gradient-text mb-3 flex items-center">
                          <LightBulbIcon className="h-5 w-5 mr-2 text-success-500 glow-success" />
                          Recommendations
                        </h5>
                        <div className="glass p-4 rounded-xl border border-success-200/30 bg-success-500/5">
                          <div className="space-y-3">
                            {scenarioResults[
                              selectedScenario.name
                            ]?.recommendations?.map(
                              (rec: string, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-start space-x-3"
                                >
                                  <div className="w-2.5 h-2.5 bg-success-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="font-body text-success-800 dark:text-success-200">
                                    {rec}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Warnings */}
                  {scenarioResults[selectedScenario.name]?.warnings &&
                    scenarioResults[selectedScenario.name]?.warnings.length >
                    0 && (
                      <div>
                        <h5 className="font-display font-semibold gradient-text mb-3 flex items-center">
                          <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-warning-500 glow-warning" />
                          Warnings
                        </h5>
                        <div className="glass p-4 rounded-xl border border-warning-200/30 bg-warning-500/5">
                          <div className="space-y-3">
                            {scenarioResults[
                              selectedScenario.name
                            ]?.warnings?.map(
                              (warning: string, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-start space-x-3"
                                >
                                  <div className="w-2.5 h-2.5 bg-warning-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="font-body text-warning-800 dark:text-warning-200">
                                    {warning}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WhatIfScenarios;
