import React, { useState, useEffect } from "react";
import {
  CheckIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CpuChipIcon,
  HashtagIcon,
  LightBulbIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { optimizationService } from "../../services/optimization.service";
import { intelligenceService } from "../../services/intelligence.service";
import { ProactiveTip } from "./ProactiveTip";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon, TargetIcon } from "lucide-react";

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface CostAuditWizardProps {
  projectId?: string;
}

const wizardSteps: WizardStep[] = [
  {
    id: "analyze",
    title: "Analyze Usage",
    description: "We'll analyze your recent AI usage patterns",
    icon: <ArrowTrendingUpIcon className="w-5 h-5" />,
  },
  {
    id: "identify",
    title: "Identify Opportunities",
    description: "Find potential areas for cost optimization",
    icon: <ExclamationCircleIcon className="w-5 h-5" />,
  },
  {
    id: "configure",
    title: "Configure Optimizations",
    description: "Select and configure optimization strategies",
    icon: <Cog6ToothIcon className="w-5 h-5" />,
  },
  {
    id: "review",
    title: "Review & Apply",
    description: "Review recommendations and apply changes",
    icon: <CheckIcon className="w-5 h-5" />,
  },
];

export const CostAuditWizard: React.FC<CostAuditWizardProps> = ({
  projectId,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedOptimizations, setSelectedOptimizations] = useState<
    Set<string>
  >(new Set());
  const [potentialSavings, setPotentialSavings] = useState(0);

  useEffect(() => {
    if (currentStep === 0) {
      analyzeUsage();
    }
  }, [currentStep, projectId]);

  const analyzeUsage = async () => {
    setLoading(true);
    try {
      // Get recent usage data - use instance method instead of static
      const usageService = new (
        await import("../../services/usage.service")
      ).UsageService();
      const usageResponse = await usageService.getUsage({
        limit: 100,
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString(), // Last 30 days
        endDate: new Date().toISOString(),
        projectId: projectId && projectId !== "all" ? projectId : undefined,
      });

      const usageData = usageResponse.usage || [];

      // Get optimization suggestions
      const suggestions = await optimizationService.getOptimizations({});

      // Get personalized tips
      const tips = await intelligenceService.getPersonalizedTips(10);
      console.log("Tips data structure:", tips);

      // Calculate statistics with proper null/zero checks
      const totalCost =
        usageData.length > 0
          ? usageData.reduce(
            (sum: number, usage: any) => sum + (usage.cost || 0),
            0,
          )
          : 0;

      const totalTokens =
        usageData.length > 0
          ? usageData.reduce(
            (sum: number, usage: any) => sum + (usage.totalTokens || 0),
            0,
          )
          : 0;

      const avgTokens =
        usageData.length > 0 ? totalTokens / usageData.length : 0;

      const modelUsage = usageData.reduce((acc: any, usage: any) => {
        if (usage.model) {
          acc[usage.model] = (acc[usage.model] || 0) + 1;
        }
        return acc;
      }, {});

      const analysisResult = {
        totalCost,
        avgTokens,
        totalTokens,
        modelUsage,
        usageCount: usageData.length,
        suggestions: suggestions.data || [],
        tips: Array.isArray(tips) ? tips : [],
      };

      setAnalysisResults(analysisResult);

      // Generate recommendations based on analysis
      generateRecommendations(analysisResult);
    } catch (error) {
      console.error("Error analyzing usage:", error);
      // Set default values when there's an error
      const defaultResult = {
        totalCost: 0,
        avgTokens: 0,
        totalTokens: 0,
        modelUsage: {},
        usageCount: 0,
        suggestions: [],
        tips: [],
      };
      setAnalysisResults(defaultResult);
      generateRecommendations(defaultResult);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (analysis: any) => {
    const recs = [];

    // Convert existing suggestions to recommendations
    if (
      Array.isArray(analysis.suggestions) &&
      analysis.suggestions.length > 0
    ) {
      const unappliedSuggestions = analysis.suggestions.filter(
        (s: any) => !s.applied,
      );

      if (unappliedSuggestions.length > 0) {
        // Group suggestions by type
        const promptOptimizations = unappliedSuggestions.filter(
          (s: any) => s.category === "prompt_reduction",
        );
        const modelOptimizations = unappliedSuggestions.filter(
          (s: any) => s.category === "model_selection",
        );

        if (promptOptimizations.length > 0) {
          const totalSavings = promptOptimizations.reduce(
            (sum: number, s: any) => sum + (s.costSaved || 0),
            0,
          );
          recs.push({
            id: "apply-prompt-optimizations",
            title: "Apply Prompt Optimizations",
            description: `You have ${promptOptimizations.length} prompt optimization${promptOptimizations.length > 1 ? "s" : ""} available that can reduce your costs.`,
            savings: totalSavings,
            type: "prompt",
            config: { enablePromptOptimization: true },
            suggestions: promptOptimizations,
          });
        }

        if (modelOptimizations.length > 0) {
          const totalSavings = modelOptimizations.reduce(
            (sum: number, s: any) => sum + (s.costSaved || 0),
            0,
          );
          recs.push({
            id: "apply-model-optimizations",
            title: "Apply Model Optimizations",
            description: `You have ${modelOptimizations.length} model optimization${modelOptimizations.length > 1 ? "s" : ""} available.`,
            savings: totalSavings,
            type: "model",
            config: { enableModelOptimization: true },
            suggestions: modelOptimizations,
          });
        }

        // If we have multiple types, add a comprehensive option
        if (unappliedSuggestions.length > 2) {
          const totalSavings = unappliedSuggestions.reduce(
            (sum: number, s: any) => sum + (s.costSaved || 0),
            0,
          );
          recs.push({
            id: "apply-all-optimizations",
            title: "Apply All Available Optimizations",
            description: `Apply all ${unappliedSuggestions.length} optimization suggestions for maximum savings.`,
            savings: totalSavings,
            type: "comprehensive",
            config: {
              enableCaching: true,
              enableBatching: true,
              enableModelOptimization: true,
              promptCompression: { enabled: true },
              contextTrimming: { enabled: true },
              requestFusion: { enabled: true },
            },
            suggestions: unappliedSuggestions,
          });
        }
      }
    }

    // Fallback recommendations based on usage patterns
    if (recs.length === 0) {
      // High token usage recommendation
      if (analysis.avgTokens > 2000) {
        recs.push({
          id: "enable-context-trimming",
          title: "Enable Context Trimming",
          description:
            "Your average token usage is high. Enable context trimming to reduce tokens by up to 50%.",
          savings: analysis.totalCost * 0.3,
          type: "optimization",
          config: { contextTrimming: { enabled: true } },
        });
      }

      // Expensive model usage
      const expensiveModels = ["gpt-4", "claude-2", "claude-3-opus"];
      const hasExpensiveModels = Object.keys(analysis.modelUsage).some(
        (model) =>
          expensiveModels.some((expensive) => model.includes(expensive)),
      );

      if (hasExpensiveModels) {
        recs.push({
          id: "model-switching",
          title: "Switch to Cheaper Models",
          description:
            "You're using expensive models. Consider switching to cheaper alternatives for simple tasks.",
          savings: analysis.totalCost * 0.4,
          type: "model",
          config: { enableModelOptimization: true },
        });
      }

      // If no specific recommendations, suggest general optimization
      if (recs.length === 0 && analysis.usageCount > 0) {
        recs.push({
          id: "enable-general-optimizations",
          title: "Enable General Optimizations",
          description:
            "Start optimizing your AI usage with our built-in optimization features.",
          savings: analysis.totalCost * 0.2,
          type: "general",
          config: {
            enableCaching: true,
            enableBatching: true,
            promptCompression: { enabled: true },
          },
        });
      }
    }

    setRecommendations(recs);
    calculatePotentialSavings(recs);
  };

  const calculatePotentialSavings = (recs: any[]) => {
    const selected = Array.from(selectedOptimizations);
    const savings = recs
      .filter((rec) => selected.includes(rec.id))
      .reduce((sum, rec) => sum + rec.savings, 0);
    setPotentialSavings(savings);
  };

  const toggleOptimization = (id: string) => {
    const newSelected = new Set(selectedOptimizations);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedOptimizations(newSelected);
    calculatePotentialSavings(recommendations);
  };

  const applyOptimizations = async () => {
    setLoading(true);
    try {
      const selected = recommendations.filter((rec) =>
        selectedOptimizations.has(rec.id),
      );

      for (const optimization of selected) {
        // Apply configuration changes
        await optimizationService.updateOptimizationConfig(optimization.config);

        // Track success
        if (optimization.id.includes("enable-")) {
          await intelligenceService.trackTipInteraction(
            optimization.id,
            "success",
          );
        }
      }

      // Navigate to optimization page to see results
      window.location.href = "/optimizations";
    } catch (error) {
      console.error("Error applying optimizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Analyze
        return (
          <div className="space-y-6">
            {loading ? (
              <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center animate-pulse shadow-lg">
                  <LoadingSpinner size="large" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CpuChipIcon className="w-5 h-5 text-primary-500" />
                  <p className="text-xl font-display font-semibold gradient-text-primary">
                    Analyzing Usage Patterns
                  </p>
                </div>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Generating intelligent cost optimization recommendations...
                </p>
              </div>
            ) : analysisResults ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-gradient-to-br from-success-500 to-success-600 p-2.5 rounded-lg glow-success shadow-lg">
                        <CurrencyDollarIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="font-body text-sm text-success-600 dark:text-success-400">
                        Total Cost (30 days)
                      </div>
                    </div>
                    <div className="text-3xl font-display font-bold gradient-text-success">
                      ${(analysisResults.totalCost || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-lg glow-primary shadow-lg">
                        <HashtagIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="font-body text-sm text-primary-600 dark:text-primary-400">Average Tokens</div>
                    </div>
                    <div className="text-3xl font-display font-bold gradient-text-primary">
                      {isNaN(analysisResults.avgTokens) ||
                        !analysisResults.avgTokens
                        ? "0"
                        : Math.round(
                          analysisResults.avgTokens,
                        ).toLocaleString()}
                    </div>
                  </div>
                  <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 p-2.5 rounded-lg shadow-lg">
                        <ChartBarIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="font-body text-sm text-secondary-600 dark:text-secondary-400">API Calls</div>
                    </div>
                    <div className="text-3xl font-display font-bold gradient-text-secondary">
                      {(analysisResults.usageCount || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {analysisResults.usageCount === 0 ? (
                  <div className="glass backdrop-blur-xl rounded-xl border border-warning-200/30 shadow-xl bg-gradient-to-br from-yellow-50/50 to-yellow-100/30 dark:from-yellow-900/10 p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-2.5 rounded-xl shadow-lg">
                        <ChartBarIcon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-xl font-display font-bold gradient-text-warning">
                        No Usage Data Found
                      </h4>
                    </div>
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-4">
                      We couldn't find any AI usage data in the last 30 days. To
                      get optimization recommendations, start using the AI Cost
                      Tracker to track your API calls, or upload your existing
                      usage data.
                    </p>
                    <a
                      href="/usage"
                      className="btn-warning inline-flex items-center gap-2 hover:scale-105 transition-transform duration-300"
                    >
                      <span>Go to Usage Tracking</span>
                      <span>→</span>
                    </a>
                  </div>
                ) : (
                  <div className="glass backdrop-blur-xl rounded-xl border border-success-200/30 shadow-xl bg-gradient-to-br from-success-50/50 to-success-100/30 dark:from-success-900/10 p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-success-500 to-success-600 p-2.5 rounded-xl shadow-lg">
                        <CheckIcon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-xl font-display font-bold gradient-text-success">
                        Analysis Complete
                      </h4>
                    </div>
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                      We've analyzed your usage patterns and identified several
                      opportunities to reduce costs. Click "Next" to see our
                      recommendations.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        );

      case 1: // Identify
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl mx-auto mb-3 inline-flex items-center justify-center glow-primary shadow-lg">
                <TargetIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold gradient-text-primary mb-2">
                Optimization Opportunities Found
              </h3>
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                AI-powered recommendations to reduce your costs
              </p>
            </div>

            {Array.isArray(analysisResults?.tips) &&
              analysisResults.tips.length > 0 ? (
              analysisResults.tips
                .slice(0, 3)
                .map((tipData: any, index: number) => (
                  <ProactiveTip
                    key={index}
                    tipData={tipData}
                    position="inline"
                  />
                ))
            ) : Array.isArray(analysisResults?.suggestions) &&
              analysisResults.suggestions.length > 0 ? (
              analysisResults.suggestions
                .slice(0, 3)
                .map((suggestion: any, index: number) => (
                  <div
                    key={index}
                    className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 hover:scale-[1.02] transition-transform duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl glow-primary shadow-lg">
                        <BoltIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-display font-bold gradient-text-primary">
                            Optimization Available
                          </h4>
                        </div>
                        <p className="font-body text-light-text-primary dark:text-dark-text-primary mb-3">
                          {suggestion.applied ? (
                            <>
                              <CheckIcon className="w-4 h-4 inline text-success-500 mr-1" />
                              Applied:{" "}
                            </>
                          ) : (
                            <>
                              <LightBulbIcon className="w-4 h-4 inline text-primary-500 mr-1" />
                              Available:{" "}
                            </>
                          )}
                          Save <span className="font-semibold gradient-text-success">${(suggestion.costSaved || 0).toFixed(2)}</span>
                          <span className="ml-2 px-2 py-1 rounded-full bg-gradient-success/20 text-success-700 dark:text-success-300 text-sm font-medium">
                            {(suggestion.improvementPercentage || 0).toFixed(1)}% improvement
                          </span>
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-full bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 text-xs font-medium">
                            {suggestion.service}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-gradient-accent/20 text-accent-700 dark:text-accent-300 text-xs font-medium">
                            {suggestion.model}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 text-xs font-medium">
                            {suggestion.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-8 text-center">
                <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 p-3 rounded-xl mx-auto mb-4 inline-flex items-center justify-center shadow-lg">
                  <ExclamationCircleIcon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-display font-bold gradient-text-secondary mb-2">
                  No Opportunities Found
                </h4>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Start using AI services to get personalized recommendations.
                </p>
              </div>
            )}

            <div className="glass backdrop-blur-xl rounded-xl border border-success-200/30 shadow-xl bg-gradient-to-br from-success-50/50 to-success-100/30 dark:from-success-900/10 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-success-500 to-success-600 p-2.5 rounded-xl glow-success shadow-lg">
                  <CurrencyDollarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-display font-bold gradient-text-success">
                    Potential Monthly Savings
                  </h4>
                  <div className="text-3xl font-display font-bold gradient-text-success">
                    $
                    {(() => {
                      if (
                        Array.isArray(analysisResults?.suggestions) &&
                        analysisResults.suggestions.length > 0
                      ) {
                        const totalSavings = analysisResults.suggestions
                          .filter((s: any) => !s.applied)
                          .reduce(
                            (sum: number, s: any) => sum + (s.costSaved || 0),
                            0,
                          );
                        return totalSavings.toFixed(2);
                      }
                      return potentialSavings.toFixed(2);
                    })()}
                  </div>
                </div>
              </div>
              {Array.isArray(analysisResults?.suggestions) &&
                analysisResults.suggestions.filter((s: any) => !s.applied)
                  .length > 0 && (
                  <div className="glass p-4 rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl">
                    <p className="font-body text-success-700 dark:text-success-300">
                      <LightBulbIcon className="w-4 h-4 inline mr-1" />
                      From{" "}
                      <span className="font-semibold">
                        {
                          analysisResults.suggestions.filter((s: any) => !s.applied)
                            .length
                        }
                      </span>{" "}
                      available optimization
                      {analysisResults.suggestions.filter((s: any) => !s.applied)
                        .length > 1
                        ? "s"
                        : ""}
                    </p>
                  </div>
                )}
            </div>
          </div>
        );

      case 2: // Configure
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl mx-auto mb-3 inline-flex items-center justify-center glow-primary shadow-lg">
                <Cog6ToothIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold gradient-text-primary mb-2">
                Select Optimizations to Apply
              </h3>
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                Choose which optimizations you'd like to implement
              </p>
            </div>

            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`glass rounded-xl border p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${selectedOptimizations.has(rec.id)
                  ? "border-primary-500 bg-gradient-to-br from-primary-50/50 to-primary-100/50 shadow-2xl backdrop-blur-xl"
                  : "border-primary-200/30 hover:border-primary-300/50 shadow-lg backdrop-blur-xl"
                  }`}
                onClick={() => toggleOptimization(rec.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${selectedOptimizations.has(rec.id)
                    ? "bg-gradient-primary border-primary-500 shadow-lg"
                    : "border-primary-200 hover:border-primary-400"
                    }`}>
                    {selectedOptimizations.has(rec.id) && (
                      <CheckIcon className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-display font-bold gradient-text-primary mb-2">{rec.title}</h4>
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-3">
                      {rec.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-br from-success-500 to-success-600 p-1.5 rounded-lg glow-success shadow-lg">
                        <ArrowTrendingUpIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-display font-semibold gradient-text-success">
                        Save ${rec.savings.toFixed(2)}/month
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="glass backdrop-blur-xl rounded-xl border border-success-200/30 shadow-xl bg-gradient-to-br from-success-50/50 to-success-100/30 dark:from-success-900/10 p-4 text-center">
              <div className="bg-gradient-to-br from-success-500 to-success-600 p-3 rounded-xl mx-auto mb-4 inline-flex items-center justify-center glow-success shadow-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="font-body text-success-600 dark:text-success-400 mb-2">
                Total Estimated Savings
              </div>
              <div className="text-4xl font-display font-bold gradient-text-success">
                ${potentialSavings.toFixed(2)}/month
              </div>
            </div>
          </div>
        );

      case 3: // Review
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-success-500 to-success-600 p-3 rounded-xl mx-auto mb-3 inline-flex items-center justify-center glow-success shadow-lg">
                <ClipboardDocumentCheckIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold gradient-text-primary mb-2">
                Review Your Selections
              </h3>
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                Confirm the optimizations you want to apply
              </p>
            </div>

            <div className="space-y-4">
              {recommendations
                .filter((rec) => selectedOptimizations.has(rec.id))
                .map((rec) => (
                  <div key={rec.id} className="glass p-4 rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-success-500 to-success-600 p-1.5 rounded-lg glow-success shadow-lg">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-display font-semibold gradient-text-primary">{rec.title}</span>
                  </div>
                ))}
            </div>

            <div className="glass backdrop-blur-xl rounded-xl border border-success-200/30 shadow-xl bg-gradient-to-br from-success-50/50 to-success-100/30 dark:from-success-900/10 p-6 text-center">
              <div className="bg-gradient-to-br from-success-500 to-success-600 p-4 rounded-xl mx-auto mb-4 inline-flex items-center justify-center glow-success shadow-lg">
                <BoltIcon className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-display font-bold gradient-text-success mb-3">
                Ready to Optimize!
              </h4>
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-6">
                You'll save approximately <span className="font-semibold gradient-text-success">${potentialSavings.toFixed(2)}</span> per
                month with these optimizations.
              </p>
              <button
                onClick={applyOptimizations}
                disabled={loading}
                className="btn-success px-8 py-4 text-lg font-display font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Applying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <BoltIcon className="w-4 h-4" />
                    Apply Optimizations
                  </span>
                )}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 mb-8">
        <div className="text-center">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-4 rounded-2xl mx-auto mb-4 inline-flex items-center justify-center glow-primary shadow-lg">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold gradient-text-primary mb-2">
            Cost Audit Wizard
          </h1>
          <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
            AI-powered cost optimization recommendations
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {wizardSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 ${index < wizardSteps.length - 1 ? "pr-4" : ""}`}
            >
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${index <= currentStep
                    ? "bg-gradient-primary text-white shadow-2xl"
                    : "bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-tertiary dark:text-dark-text-tertiary border border-primary-200/30"
                    }`}
                >
                  {index < currentStep ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <span className="font-display font-bold">{index + 1}</span>
                  )}
                </div>
                {index < wizardSteps.length - 1 && (
                  <div
                    className={`absolute top-6 left-12 w-full h-1 rounded-full transition-all duration-300 ${index < currentStep ? "bg-gradient-primary shadow-lg" : "bg-light-bg-secondary dark:bg-dark-bg-secondary"
                      }`}
                  />
                )}
              </div>
              <div className="mt-3">
                <div className={`font-display font-semibold ${index <= currentStep ? "gradient-text-primary" : "text-light-text-secondary dark:text-dark-text-secondary"
                  }`}>
                  {step.title}
                </div>
                <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 min-h-[500px]">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0 || loading}
          className="btn-ghost flex items-center gap-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {currentStep < wizardSteps.length - 1 && (
          <button
            onClick={() =>
              setCurrentStep(Math.min(wizardSteps.length - 1, currentStep + 1))
            }
            disabled={loading || (currentStep === 0 && !analysisResults)}
            className="btn btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300"
          >
            <span>Next</span>
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
