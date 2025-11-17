import React, { useState, useEffect } from 'react';
import { X, Sparkles, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';
import { PromptTemplate } from '@/types/promptTemplate.types';

interface TemplateVariableInputProps {
    template: PromptTemplate;
    onSubmit: (variables: Record<string, any>) => void;
    onCancel: () => void;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export const TemplateVariableInput: React.FC<TemplateVariableInputProps> = ({
    template,
    onSubmit,
    onCancel,
    conversationHistory = []
}) => {
    const [variables, setVariables] = useState<Record<string, any>>({});
    const [suggestions, setSuggestions] = useState<Record<string, { value: string; confidence: number }>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Generate suggestions from conversation history
    useEffect(() => {
        const newSuggestions: Record<string, { value: string; confidence: number }> = {};

        template.variables.forEach(variable => {
            // Simple keyword-based suggestion generation
            const recentMessages = conversationHistory.slice(-5).map(m => m.content).join(' ');

            // Try to find potential values based on variable name
            const lowerName = variable.name.toLowerCase();
            if (recentMessages.toLowerCase().includes(lowerName)) {
                // Extract surrounding context
                const regex = new RegExp(`${lowerName}[:\\s]+([^.!?\\n]+)`, 'i');
                const match = recentMessages.match(regex);
                if (match && match[1]) {
                    newSuggestions[variable.name] = {
                        value: match[1].trim(),
                        confidence: 0.7
                    };
                }
            }

            // Use default value if available
            if (!newSuggestions[variable.name] && variable.defaultValue) {
                newSuggestions[variable.name] = {
                    value: variable.defaultValue,
                    confidence: 0.5
                };
            }
        });

        setSuggestions(newSuggestions);
    }, [template.variables, conversationHistory]);

    const handleVariableChange = (name: string, value: any) => {
        setVariables(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleApplySuggestion = (variableName: string) => {
        if (suggestions[variableName]) {
            handleVariableChange(variableName, suggestions[variableName].value);
        }
    };

    const handleSubmit = () => {
        // Validate required variables
        const newErrors: Record<string, string> = {};
        template.variables.forEach(variable => {
            if (variable.required && !variables[variable.name]) {
                newErrors[variable.name] = `${variable.name} is required`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(variables);
    };

    const allRequiredFilled = template.variables
        .filter(v => v.required)
        .every(v => variables[v.name]);

    const getConfidenceBadge = (confidence: number) => {
        if (confidence >= 0.8) {
            return <span className="text-xs text-success-600 dark:text-success-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> High confidence</span>;
        } else if (confidence >= 0.6) {
            return <span className="text-xs text-accent-600 dark:text-accent-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Medium confidence</span>;
        } else if (confidence > 0) {
            return <span className="text-xs text-light-text-muted dark:text-dark-text-muted flex items-center gap-1"><Lightbulb className="w-3 h-3" /> Low confidence</span>;
        }
        return null;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-3xl max-h-[85vh] m-4 bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-secondary-200 dark:border-secondary-700 animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-gradient-primary rounded-lg shadow-lg">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                                    {template.name}
                                </h2>
                            </div>
                            {template.description && (
                                <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary ml-11">
                                    {template.description}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-all duration-300"
                        >
                            <X className="w-5 h-5 text-light-text-muted dark:text-dark-text-muted" />
                        </button>
                    </div>

                    {/* Info Banner */}
                    <div className="mt-4 p-3 bg-highlight-50 dark:bg-highlight-900/20 border border-highlight-200 dark:border-highlight-800 rounded-lg flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-highlight-600 dark:text-highlight-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-highlight-900 dark:text-highlight-100">
                                Smart Variable Detection
                            </p>
                            <p className="text-xs text-highlight-700 dark:text-highlight-300 mt-0.5">
                                We've analyzed your conversation and suggested values for some variables. Review and adjust as needed.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Variables Form */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                    {template.variables.length === 0 ? (
                        <div className="text-center py-8">
                            <Sparkles className="w-12 h-12 text-secondary-300 dark:text-secondary-600 mx-auto mb-3" />
                            <p className="text-light-text-secondary dark:text-dark-text-secondary font-body">
                                This template has no variables. Click "Use Template" to continue.
                            </p>
                        </div>
                    ) : (
                        template.variables.map((variable) => (
                            <div key={variable.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                        {variable.name}
                                        {variable.required && (
                                            <span className="text-danger-500 ml-1">*</span>
                                        )}
                                    </label>
                                    {suggestions[variable.name] && (
                                        <button
                                            onClick={() => handleApplySuggestion(variable.name)}
                                            className="text-xs flex items-center gap-1 px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all duration-300"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            Apply suggestion
                                        </button>
                                    )}
                                </div>

                                {variable.description && (
                                    <p className="text-xs font-body text-light-text-muted dark:text-dark-text-muted">
                                        {variable.description}
                                    </p>
                                )}

                                <input
                                    type="text"
                                    value={variables[variable.name] || ''}
                                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                                    placeholder={variable.defaultValue || `Enter ${variable.name}...`}
                                    className={`w-full px-4 py-3 bg-light-panel dark:bg-dark-bg-300 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted ${errors[variable.name]
                                        ? 'border-danger-500 focus:ring-danger-500'
                                        : 'border-secondary-200 dark:border-secondary-700 focus:ring-primary-500 dark:focus:ring-primary-400'
                                        }`}
                                />

                                {suggestions[variable.name] && !variables[variable.name] && (
                                    <div className="flex items-start gap-2 p-3 bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800 rounded-lg">
                                        <Lightbulb className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className="text-xs font-medium text-light-text-primary dark:text-dark-text-primary">
                                                    Suggested value:
                                                </p>
                                                {getConfidenceBadge(suggestions[variable.name].confidence)}
                                            </div>
                                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">
                                                "{suggestions[variable.name].value}"
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {errors[variable.name] && (
                                    <div className="flex items-center gap-2 text-danger-600 dark:text-danger-400">
                                        <AlertCircle className="w-4 h-4" />
                                        <p className="text-xs font-medium">{errors[variable.name]}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-secondary-200 dark:border-secondary-700 bg-light-panel dark:bg-dark-bg-300">
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-body text-light-text-muted dark:text-dark-text-muted">
                            {template.variables.filter(v => v.required).length > 0 && (
                                <>
                                    <span className="text-danger-500">*</span> Required fields
                                </>
                            )}
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-light-text-secondary dark:text-dark-text-secondary hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-all duration-300 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!allRequiredFilled}
                                className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Use Template
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateVariableInput;
