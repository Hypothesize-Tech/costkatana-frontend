import React, { useState, useEffect } from "react";
import {
    FiX,
    FiPlay,
    FiDollarSign,
    FiZap,
    FiLoader,
    FiCheckCircle,
} from "react-icons/fi";
import { Modal } from "../common/Modal";
import { PromptTemplate } from "../../types/promptTemplate.types";
import {
    TemplateExecutionService,
    ModelRecommendation,
    TemplateExecutionRequest,
} from "../../services/templateExecution.service";
import { useNotification } from "../../contexts/NotificationContext";

interface TemplateExecutionModalProps {
    template: PromptTemplate;
    onClose: () => void;
    onExecutionComplete: (result: any) => void;
}

export const TemplateExecutionModal: React.FC<TemplateExecutionModalProps> = ({
    template,
    onClose,
    onExecutionComplete,
}) => {
    const { showNotification } = useNotification();

    // State
    const [variables, setVariables] = useState<Record<string, any>>({});
    const [executionMode, setExecutionMode] = useState<'single' | 'comparison' | 'recommended'>('recommended');
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [recommendation, setRecommendation] = useState<ModelRecommendation | null>(null);
    const [loadingRecommendation, setLoadingRecommendation] = useState(false);
    const [executing, setExecuting] = useState(false);

    // Initialize variables with defaults
    useEffect(() => {
        const initialVars: Record<string, any> = {};
        template.variables?.forEach((variable) => {
            if (variable.defaultValue) {
                initialVars[variable.name] = variable.defaultValue;
            }
        });
        setVariables(initialVars);
    }, [template]);

    // Load recommendation on mount
    useEffect(() => {
        loadRecommendation();
    }, [template._id]);

    const loadRecommendation = async () => {
        try {
            setLoadingRecommendation(true);
            const rec = await TemplateExecutionService.getModelRecommendation(template._id);
            setRecommendation(rec);
            if (executionMode === 'recommended') {
                setSelectedModel(rec.modelId);
            }
        } catch (error) {
            console.error('Failed to load recommendation:', error);
        } finally {
            setLoadingRecommendation(false);
        }
    };

    const handleVariableChange = (name: string, value: any) => {
        setVariables(prev => ({ ...prev, [name]: value }));
    };

    const handleExecute = async () => {
        try {
            setExecuting(true);

            const request: TemplateExecutionRequest = {
                variables,
                executionMode,
                modelId: executionMode === 'single' ? selectedModel : undefined,
            };

            const result = await TemplateExecutionService.executeTemplate(
                template._id,
                request
            );

            showNotification('Template executed successfully!', 'success');
            onExecutionComplete(result);
        } catch (error: any) {
            console.error('Error executing template:', error);
            showNotification(error.message || 'Failed to execute template', 'error');
        } finally {
            setExecuting(false);
        }
    };

    const estimatedCost = recommendation?.estimatedCost || 0;
    const baselineCost = estimatedCost * 2; // Rough baseline estimation

    return (
        <Modal isOpen={true} onClose={onClose} title="" maxWidth="4xl">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-display font-bold gradient-text-primary">
                            Execute Template
                        </h2>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            {template.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                        <FiX className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                    </button>
                </div>

                {/* Section 1: Template Variables */}
                {template.variables && template.variables.length > 0 && (
                    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-700/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                        <h3 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                            Template Variables
                        </h3>
                        <div className="space-y-4">
                            {template.variables.map((variable) => (
                                <div key={variable.name}>
                                    <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                                        {variable.name}
                                        {variable.required && (
                                            <span className="text-danger-500 ml-1">*</span>
                                        )}
                                    </label>
                                    {variable.description && (
                                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted mb-2">
                                            {variable.description}
                                        </p>
                                    )}
                                    <input
                                        type="text"
                                        value={variables[variable.name] || ''}
                                        onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                                        placeholder={variable.defaultValue || `Enter ${variable.name}`}
                                        className="w-full glass border border-primary-200/30 dark:border-primary-700/30 rounded-xl 
                      bg-light-bg dark:bg-dark-bg-300 text-light-text-primary dark:text-dark-text-primary 
                      px-4 py-3 focus:border-primary-500 dark:focus:border-primary-400 
                      focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section 2: Execution Settings */}
                <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-700/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                    <h3 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                        Execution Settings
                    </h3>

                    {/* Execution Mode */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                            Execution Mode
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setExecutionMode('recommended');
                                    if (recommendation) setSelectedModel(recommendation.modelId);
                                }}
                                className={`px-6 py-3 font-display font-medium rounded-xl border transition-all duration-200 ${executionMode === 'recommended'
                                    ? 'border-primary-500 dark:border-primary-400 bg-gradient-primary/20 text-primary-700 dark:text-primary-300 scale-105 shadow-lg'
                                    : 'glass border-primary-200/30 dark:border-primary-700/30 text-light-text-primary dark:text-dark-text-primary hover:border-primary-300/50 dark:hover:border-primary-600/50 hover:scale-105'
                                    }`}
                            >
                                <FiZap className="w-4 h-4 inline mr-2" />
                                Recommended
                            </button>
                            <button
                                onClick={() => setExecutionMode('single')}
                                className={`px-6 py-3 font-display font-medium rounded-xl border transition-all duration-200 ${executionMode === 'single'
                                    ? 'border-primary-500 dark:border-primary-400 bg-gradient-primary/20 text-primary-700 dark:text-primary-300 scale-105 shadow-lg'
                                    : 'glass border-primary-200/30 dark:border-primary-700/30 text-light-text-primary dark:text-dark-text-primary hover:border-primary-300/50 dark:hover:border-primary-600/50 hover:scale-105'
                                    }`}
                            >
                                Custom Model
                            </button>
                        </div>
                    </div>

                    {/* Model Selection (only for 'single' mode) */}
                    {executionMode === 'single' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                                Select Model
                            </label>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full glass border border-primary-200/30 dark:border-primary-700/30 rounded-xl 
                  bg-light-bg dark:bg-dark-bg-300 text-light-text-primary dark:text-dark-text-primary 
                  px-4 py-3 focus:border-primary-500 dark:focus:border-primary-400 
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                            >
                                <option value="">Select a model...</option>
                                <option value="gpt-4o-mini">GPT-4o Mini - Balanced</option>
                                <option value="amazon.nova-micro-v1:0">Nova Micro - Ultra Cheap</option>
                                <option value="amazon.nova-lite-v1:0">Nova Lite - Balanced</option>
                                <option value="anthropic.claude-3-5-haiku-20241022-v1:0">Claude 3.5 Haiku - Fast</option>
                                <option value="anthropic.claude-3-5-sonnet-20241022-v2:0">Claude 3.5 Sonnet - Premium</option>
                            </select>
                        </div>
                    )}

                    {/* Recommendation Display */}
                    {recommendation && executionMode === 'recommended' && (
                        <div className="mt-4 p-4 rounded-xl bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-success flex items-center justify-center flex-shrink-0">
                                    <FiCheckCircle className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-display font-bold text-success-700 dark:text-success-300 mb-1">
                                        Recommended Model
                                    </h4>
                                    <p className="text-sm text-success-600 dark:text-success-400 mb-2">
                                        <strong>{recommendation.modelId}</strong> ({recommendation.provider})
                                    </p>
                                    <p className="text-xs text-success-600 dark:text-success-400">
                                        {recommendation.reasoning}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 3: Cost Preview */}
                <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass 
          border-highlight-200/30 dark:border-highlight-700/30 
          bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-highlight flex items-center justify-center">
                            <FiDollarSign className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-lg font-display font-bold gradient-text-primary">Cost Preview</h4>
                    </div>

                    {loadingRecommendation ? (
                        <div className="flex items-center justify-center py-4">
                            <FiLoader className="w-5 h-5 animate-spin text-primary-500" />
                        </div>
                    ) : (
                        <div className="space-y-3 text-light-text-secondary dark:text-dark-text-secondary">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Estimated Cost:</span>
                                <span className="font-bold text-light-text-primary dark:text-dark-text-primary">
                                    {TemplateExecutionService.formatCurrency(estimatedCost)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Baseline Cost:</span>
                                <span className="font-medium">
                                    {TemplateExecutionService.formatCurrency(baselineCost)}
                                </span>
                            </div>
                            <div className="pt-3 border-t border-primary-200/30 dark:border-primary-700/30">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-success-600 dark:text-success-400">
                                        Projected Savings:
                                    </span>
                                    <div className="text-right">
                                        <div className="font-bold text-success-600 dark:text-success-400">
                                            {TemplateExecutionService.formatCurrency(baselineCost - estimatedCost)}
                                        </div>
                                        <div className="text-xs text-success-600 dark:text-success-400">
                                            ({TemplateExecutionService.formatPercentage(((baselineCost - estimatedCost) / baselineCost) * 100)})
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Execute Button */}
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 glass border-primary-200/30 dark:border-primary-700/30 rounded-xl 
              text-light-text-primary dark:text-dark-text-primary font-display font-medium
              hover:scale-105 transition-all duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExecute}
                        disabled={executing || (executionMode === 'single' && !selectedModel)}
                        className="px-6 py-3 bg-gradient-primary text-white shadow-lg hover:shadow-xl 
              rounded-xl font-display font-bold disabled:opacity-50 disabled:cursor-not-allowed
              hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
                    >
                        {executing ? (
                            <>
                                <FiLoader className="w-5 h-5 animate-spin" />
                                Executing...
                            </>
                        ) : (
                            <>
                                <FiPlay className="w-5 h-5" />
                                Execute Template
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

