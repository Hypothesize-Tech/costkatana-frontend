import React, { useState } from "react";
import {
    FiZap,
    FiDollarSign,
    FiAward,
    FiTarget,
    FiRefreshCw,
    FiCheckCircle,
    FiAlertCircle,
    FiTrendingUp,
    FiBarChart,
    FiCpu,
    FiActivity as FiBrain,
} from "react-icons/fi";
import { useNotification } from "../../contexts/NotificationContext";
import { PromptTemplateService } from "../../services/promptTemplate.service";

interface AITemplateOptimizerProps {
    templateId: string;
    onOptimizationApplied: (optimizedContent: string, metadata: any) => void;
}

export const AITemplateOptimizer: React.FC<AITemplateOptimizerProps> = ({
    templateId,
    onOptimizationApplied,
}) => {
    const { showNotification } = useNotification();
    const [optimizing, setOptimizing] = useState(false);
    const [optimizationType, setOptimizationType] = useState<
        "token" | "cost" | "quality" | "model-specific"
    >("token");
    const [targetModel, setTargetModel] = useState("");
    const [optimizationResult, setOptimizationResult] = useState<any>(null);
    const [showComparison, setShowComparison] = useState(false);
    const [insights, setInsights] = useState<any>(null);
    const [loadingInsights, setLoadingInsights] = useState(false);

    const optimizationTypes = [
        {
            type: "token" as const,
            label: "Token Reduction",
            icon: FiZap,
            description: "Minimize token usage while maintaining intent",
            color: "blue",
        },
        {
            type: "cost" as const,
            label: "Cost Optimization",
            icon: FiDollarSign,
            description: "Reduce API costs with efficient prompting",
            color: "green",
        },
        {
            type: "quality" as const,
            label: "Quality Enhancement",
            icon: FiAward,
            description: "Improve clarity and response quality",
            color: "purple",
        },
        {
            type: "model-specific" as const,
            label: "Model-Specific",
            icon: FiTarget,
            description: "Optimize for a specific AI model",
            color: "orange",
        },
    ];

    const models = [
        { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
        { value: "gpt-4", label: "GPT-4" },
        { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
        { value: "nova-pro", label: "Amazon Nova Pro" },
        { value: "nova-lite", label: "Amazon Nova Lite" },
    ];

    const optimizeTemplate = async () => {
        setOptimizing(true);
        try {
            const result = await PromptTemplateService.optimizeTemplate(templateId, {
                optimizationType,
                targetModel: optimizationType === "model-specific" ? targetModel : undefined,
                preserveIntent: true,
            });

            if (result) {
                setOptimizationResult(result);
                setShowComparison(true);

                // Show success message with metrics
                const { tokenReduction, costSaving } = result.metrics;
                showNotification(
                    `Optimization complete! ${tokenReduction}% token reduction, $${costSaving.toFixed(4)} saved per use`,
                    "success"
                );
            } else {
                showNotification("Failed to optimize template", "error");
            }
        } catch (error) {
            showNotification("Error optimizing template", "error");
            console.error(error);
        } finally {
            setOptimizing(false);
        }
    };

    const applyOptimization = async () => {
        if (!optimizationResult) return;

        try {
            const result = await PromptTemplateService.applyOptimization(templateId, {
                optimizedContent: optimizationResult.optimized.content,
                metadata: {
                    optimizationType,
                    tokenReduction: optimizationResult.metrics.tokenReduction,
                    costSaving: optimizationResult.metrics.costSaving,
                    qualityScore: optimizationResult.metrics.qualityScore,
                },
            });

            if (result) {
                onOptimizationApplied(
                    optimizationResult.optimized.content,
                    optimizationResult.metrics
                );
                showNotification("Optimization applied successfully!", "success");
                setOptimizationResult(null);
                setShowComparison(false);
            } else {
                showNotification("Failed to apply optimization", "error");
            }
        } catch (error) {
            showNotification("Error applying optimization", "error");
            console.error(error);
        }
    };

    const fetchInsights = async () => {
        setLoadingInsights(true);
        try {
            const result = await PromptTemplateService.getInsights(templateId);

            if (result) {
                setInsights(result);
            } else {
                showNotification("Failed to get insights", "error");
            }
        } catch (error) {
            showNotification("Error fetching insights", "error");
            console.error(error);
        } finally {
            setLoadingInsights(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* AI Optimization Header */}
            <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-primary rounded-xl shadow-lg">
                            <FiBrain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                                AI Template Optimizer
                            </h3>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                                Enhance your template with AI-powered optimization
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchInsights}
                        disabled={loadingInsights}
                        className="px-4 py-2 bg-gradient-highlight text-white rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg flex items-center font-display font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingInsights ? (
                            <>
                                <FiRefreshCw className="animate-spin mr-2" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <FiBarChart className="mr-2" />
                                Get Insights
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Insights Display */}
            {insights && (
                <div className="glass rounded-xl p-6 border border-highlight-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <h4 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-4 flex items-center">
                        <FiTrendingUp className="mr-2 text-highlight-500" />
                        Template Performance Insights
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass rounded-xl p-4 border border-primary-200/30 text-center">
                            <p className="text-2xl font-display font-bold text-primary-500">
                                {insights.usagePatterns?.successRate || 0}%
                            </p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">Success Rate</p>
                        </div>
                        <div className="glass rounded-xl p-4 border border-success-200/30 text-center">
                            <p className="text-2xl font-display font-bold text-success-500">
                                ${insights.performance?.costPerUse?.toFixed(4) || 0}
                            </p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">Cost per Use</p>
                        </div>
                        <div className="glass rounded-xl p-4 border border-highlight-200/30 text-center">
                            <p className="text-2xl font-display font-bold text-highlight-500">
                                {insights.performance?.outputQuality || 0}%
                            </p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">Output Quality</p>
                        </div>
                        <div className="glass rounded-xl p-4 border border-accent-200/30 text-center">
                            <p className="text-2xl font-display font-bold text-accent-500">
                                {insights.usagePatterns?.averageTokensUsed || 0}
                            </p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">Avg Tokens</p>
                        </div>
                    </div>

                    {insights.recommendations && (
                        <div className="mt-6 pt-4 border-t border-primary-200/30">
                            <p className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                                AI Recommendations:
                            </p>
                            <ul className="space-y-2">
                                {insights.recommendations.optimizations?.slice(0, 3).map((rec: string, idx: number) => (
                                    <li key={idx} className="text-sm text-light-text-secondary dark:text-dark-text-secondary flex items-start font-body">
                                        <FiCheckCircle className="w-4 h-4 mr-2 mt-0.5 text-success-500 flex-shrink-0" />
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Optimization Type Selection */}
            <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <label className="block text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                    Select Optimization Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {optimizationTypes.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = optimizationType === opt.type;
                        return (
                            <button
                                key={opt.type}
                                onClick={() => setOptimizationType(opt.type)}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${isSelected
                                    ? "border-primary-500 bg-gradient-primary/20 shadow-lg"
                                    : "glass border-primary-200/30 hover:border-primary-300/50"
                                    }`}
                            >
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className={`p-2 rounded-lg ${isSelected ? "bg-gradient-primary text-white" : "bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                                        }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <p className={`text-sm font-display font-semibold ${isSelected ? "text-primary-700 dark:text-primary-300" : "text-light-text-primary dark:text-dark-text-primary"
                                        }`}>
                                        {opt.label}
                                    </p>
                                </div>
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-body text-left">
                                    {opt.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Model Selection for Model-Specific Optimization */}
            {optimizationType === "model-specific" && (
                <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <label className="block text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                        Target Model
                    </label>
                    <select
                        value={targetModel}
                        onChange={(e) => setTargetModel(e.target.value)}
                        className="w-full px-4 py-3 glass border border-primary-200/30 rounded-xl text-light-text-primary dark:text-dark-text-primary font-body focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                        <option value="">Select a model</option>
                        {models.map((model) => (
                            <option key={model.value} value={model.value}>
                                {model.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Optimize Button */}
            <button
                onClick={optimizeTemplate}
                disabled={
                    optimizing ||
                    (optimizationType === "model-specific" && !targetModel)
                }
                className="w-full px-6 py-4 bg-gradient-primary text-white rounded-xl font-display font-bold hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center shadow-lg"
            >
                {optimizing ? (
                    <>
                        <FiRefreshCw className="animate-spin mr-3" />
                        Optimizing with AI...
                    </>
                ) : (
                    <>
                        <FiCpu className="mr-3" />
                        Optimize Template
                    </>
                )}
            </button>

            {/* Optimization Result Comparison */}
            {showComparison && optimizationResult && (
                <div className="space-y-6">
                    <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <h4 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-4 flex items-center">
                            <FiCheckCircle className="mr-2 text-success-500" />
                            Optimization Results
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="glass rounded-xl p-4 border border-success-200/30 text-center">
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-body mb-1">Token Reduction</p>
                                <p className="text-2xl font-display font-bold text-success-500">
                                    {optimizationResult.metrics.tokenReduction}%
                                </p>
                            </div>
                            <div className="glass rounded-xl p-4 border border-primary-200/30 text-center">
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-body mb-1">Cost Saving</p>
                                <p className="text-2xl font-display font-bold text-primary-500">
                                    ${optimizationResult.metrics.costSaving.toFixed(4)}
                                </p>
                            </div>
                            <div className="glass rounded-xl p-4 border border-highlight-200/30 text-center">
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-body mb-1">Quality Score</p>
                                <p className="text-2xl font-display font-bold text-highlight-500">
                                    {optimizationResult.metrics.qualityScore}%
                                </p>
                            </div>
                        </div>

                        {/* Recommendations */}
                        {optimizationResult.metrics.recommendations && (
                            <div className="mt-6 pt-4 border-t border-primary-200/30">
                                <p className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                                    Additional Recommendations:
                                </p>
                                <ul className="space-y-2">
                                    {optimizationResult.metrics.recommendations.map((rec: string, idx: number) => (
                                        <li key={idx} className="text-sm text-light-text-secondary dark:text-dark-text-secondary flex items-start font-body">
                                            <FiAlertCircle className="w-4 h-4 mr-2 mt-0.5 text-accent-500 flex-shrink-0" />
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Before/After Comparison */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <h5 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                                Original Template
                            </h5>
                            <div className="glass rounded-lg p-4 border border-secondary-200/30">
                                <pre className="text-sm text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap font-mono leading-relaxed">
                                    {optimizationResult.original.content}
                                </pre>
                                <div className="mt-4 pt-3 border-t border-secondary-200/30">
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
                                        Estimated tokens: <span className="font-semibold">{optimizationResult.original.metadata?.estimatedTokens || "N/A"}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <h5 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                                Optimized Template
                            </h5>
                            <div className="glass rounded-lg p-4 border border-success-200/30">
                                <pre className="text-sm text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap font-mono leading-relaxed">
                                    {optimizationResult.optimized.content}
                                </pre>
                                <div className="mt-4 pt-3 border-t border-success-200/30">
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
                                        Estimated tokens: <span className="font-semibold text-success-500">{optimizationResult.optimized.metadata?.estimatedTokens || "N/A"}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Apply/Cancel Buttons */}
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => {
                                setOptimizationResult(null);
                                setShowComparison(false);
                            }}
                            className="px-6 py-3 glass border border-secondary-200/30 text-light-text-primary dark:text-dark-text-primary rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 font-display font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={applyOptimization}
                            className="px-6 py-3 bg-gradient-success text-white rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center font-display font-semibold shadow-lg"
                        >
                            <FiCheckCircle className="mr-2" />
                            Apply Optimization
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
