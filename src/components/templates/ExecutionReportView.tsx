import React, { useState, useMemo } from "react";
import {
    FiX,
    FiCopy,
    FiCheck,
    FiClock,
    FiCheckCircle,
    FiTrendingUp,
    FiCode,
    FiZap,
    FiDollarSign,
} from "react-icons/fi";
import { Modal } from "../common/Modal";
import {
    TemplateExecutionResult,
    TemplateExecutionService,
} from "../../services/templateExecution.service";
import { PromptTemplate } from "../../types/promptTemplate.types";
import { CodePreview } from "../preview/CodePreview";

interface ExecutionReportViewProps {
    template: PromptTemplate;
    result: TemplateExecutionResult;
    onClose: () => void;
}

export const ExecutionReportView: React.FC<ExecutionReportViewProps> = ({
    template,
    result,
    onClose,
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopyResponse = async () => {
        try {
            await navigator.clipboard.writeText(result.aiResponse);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy response:", error);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString();
    };

    // Detect if response contains code and extract it
    const codeInfo = useMemo(() => {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
        const match = result.aiResponse.match(codeBlockRegex);

        if (match) {
            return {
                hasCode: true,
                language: match[1] || 'javascript',
                code: match[2].trim(),
                fullResponse: result.aiResponse
            };
        }

        // Check if entire response looks like code (common patterns)
        const looksLikeCode =
            result.aiResponse.includes('function ') ||
            result.aiResponse.includes('const ') ||
            result.aiResponse.includes('import ') ||
            result.aiResponse.includes('export ') ||
            result.aiResponse.includes('class ') ||
            result.aiResponse.includes('<!DOCTYPE') ||
            result.aiResponse.includes('<html') ||
            result.aiResponse.includes('def ') ||
            result.aiResponse.includes('public class');

        if (looksLikeCode) {
            // Try to detect language
            let detectedLanguage = 'javascript';
            if (result.aiResponse.includes('<!DOCTYPE') || result.aiResponse.includes('<html')) {
                detectedLanguage = 'html';
            } else if (result.aiResponse.includes('def ') || result.aiResponse.includes('import numpy')) {
                detectedLanguage = 'python';
            } else if (result.aiResponse.includes('public class') || result.aiResponse.includes('void main')) {
                detectedLanguage = 'java';
            }

            return {
                hasCode: true,
                language: detectedLanguage,
                code: result.aiResponse.trim(),
                fullResponse: result.aiResponse
            };
        }

        return {
            hasCode: false,
            language: '',
            code: '',
            fullResponse: result.aiResponse
        };
    }, [result.aiResponse]);

    return (
        <Modal isOpen={true} onClose={onClose} title="" maxWidth="6xl">
            <div className="space-y-6">
                {/* Header Section */}
                <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-700/30 shadow-xl backdrop-blur-xl 
          bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                            <h2 className="text-2xl font-display font-bold gradient-text-primary mb-2">
                                {template.name}
                            </h2>
                            <div className="flex items-center gap-4 text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                <div className="flex items-center gap-2">
                                    <FiClock className="w-4 h-4" />
                                    <span>{formatDate(result.executedAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-success flex items-center justify-center">
                                        <FiCheckCircle className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="font-medium text-success-600 dark:text-success-400">Success</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        >
                            <FiX className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                        </button>
                    </div>
                </div>

                {/* AI Response Section */}
                <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-700/30 shadow-xl backdrop-blur-xl 
          bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden">
                    {codeInfo.hasCode ? (
                        <CodePreview
                            code={codeInfo.code}
                            language={codeInfo.language}
                            title={`${template.name} - Generated Code`}
                            showPreview={true}
                            maxHeight="600px"
                            allowFullscreen={true}
                            allowDownload={true}
                            sandboxMode="moderate"
                            theme="auto"
                        />
                    ) : (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                                    AI Response
                                </h3>
                                <button
                                    onClick={handleCopyResponse}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-highlight text-white 
                    shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                >
                                    {copied ? (
                                        <>
                                            <FiCheck className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <FiCopy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="p-4 rounded-xl bg-light-card dark:bg-dark-card border border-primary-200/20 dark:border-primary-700/20">
                                <pre className="whitespace-pre-wrap font-mono text-sm text-light-text-primary dark:text-dark-text-primary">
                                    {result.aiResponse}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cost Analysis Card - HERO SECTION */}
                <div className="p-6 rounded-xl border-2 shadow-2xl backdrop-blur-xl 
          border-success-300 dark:border-success-500 
          bg-gradient-success/10 dark:bg-gradient-success/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-success flex items-center justify-center shadow-lg">
                            <FiTrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-display font-bold gradient-text-primary">Cost Analysis</h3>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary">Token usage & savings</p>
                        </div>
                    </div>

                    {/* BIG SAVINGS DISPLAY */}
                    <div className="text-center mb-6 p-6 rounded-xl bg-gradient-success/20 dark:bg-gradient-success/10 
            border border-success-300 dark:border-success-500">
                        <div className="text-5xl font-display font-bold gradient-text-primary mb-2">
                            {TemplateExecutionService.formatCurrency(result.savingsAmount)} Saved
                        </div>
                        <div className="text-2xl font-bold text-success-600 dark:text-success-400">
                            {TemplateExecutionService.formatPercentage(result.savingsPercentage)} Cost Reduction
                        </div>
                    </div>

                    {/* Token breakdown grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 rounded-xl glass border border-primary-200/30 dark:border-primary-700/30">
                            <div className="text-sm text-light-text-muted dark:text-dark-text-muted mb-1">Prompt Tokens</div>
                            <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                {TemplateExecutionService.formatNumber(result.promptTokens)}
                            </div>
                        </div>
                        <div className="text-center p-4 rounded-xl glass border border-primary-200/30 dark:border-primary-700/30">
                            <div className="text-sm text-light-text-muted dark:text-dark-text-muted mb-1">Completion Tokens</div>
                            <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                {TemplateExecutionService.formatNumber(result.completionTokens)}
                            </div>
                        </div>
                        <div className="text-center p-4 rounded-xl glass border border-primary-200/30 dark:border-primary-700/30">
                            <div className="text-sm text-light-text-muted dark:text-dark-text-muted mb-1">Total Tokens</div>
                            <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                {TemplateExecutionService.formatNumber(result.totalTokens)}
                            </div>
                        </div>
                    </div>

                    {/* Cost breakdown */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-light-bg dark:bg-dark-bg-300">
                            <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                Actual Cost:
                            </span>
                            <span className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                                {TemplateExecutionService.formatCurrency(result.actualCost)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-light-bg dark:bg-dark-bg-300">
                            <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                Baseline Cost (GPT-4):
                            </span>
                            <span className="text-lg font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                {TemplateExecutionService.formatCurrency(result.baselineCost)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-success-50 dark:bg-success-900/20 
              border border-success-200 dark:border-success-700">
                            <span className="text-sm font-bold text-success-700 dark:text-success-300">
                                Cost per Token:
                            </span>
                            <span className="text-lg font-bold text-success-700 dark:text-success-300">
                                {TemplateExecutionService.formatCurrency(result.actualCost / result.totalTokens)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Model Information Card */}
                <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass 
          border-highlight-200/30 dark:border-highlight-700/30 
          bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-highlight flex items-center justify-center">
                            <FiCode className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                            Model Information
                        </h4>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-light-text-muted dark:text-dark-text-muted mb-1">
                                    Model Used
                                </div>
                                <div className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                                    {result.modelUsed}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-light-text-muted dark:text-dark-text-muted mb-1">
                                    Provider
                                </div>
                                <div className="font-medium text-light-text-primary dark:text-dark-text-primary">
                                    {result.modelProvider}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-light-text-muted dark:text-dark-text-muted mb-1">
                                    Execution Time
                                </div>
                                <div className="font-medium text-light-text-primary dark:text-dark-text-primary">
                                    {(result.latencyMs / 1000).toFixed(2)}s
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-light-text-muted dark:text-dark-text-muted mb-1">
                                    Recommendation Followed
                                </div>
                                <div className="font-medium text-light-text-primary dark:text-dark-text-primary">
                                    {result.recommendationFollowed ? (
                                        <span className="text-success-600 dark:text-success-400 flex items-center gap-1">
                                            <FiCheckCircle className="w-4 h-4" />
                                            Yes
                                        </span>
                                    ) : (
                                        'No'
                                    )}
                                </div>
                            </div>
                        </div>

                        {result.recommendationReasoning && (
                            <div className="p-4 rounded-xl bg-highlight-50 dark:bg-highlight-900/20 
                border border-highlight-200 dark:border-highlight-700">
                                <div className="flex items-start gap-2">
                                    <FiZap className="w-4 h-4 text-highlight-600 dark:text-highlight-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="text-sm font-bold text-highlight-700 dark:text-highlight-300 mb-1">
                                            Why this model was recommended:
                                        </div>
                                        <p className="text-sm text-highlight-600 dark:text-highlight-400">
                                            {result.recommendationReasoning}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl glass border border-primary-200/30 dark:border-primary-700/30 
            shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center mx-auto mb-3">
                            <FiDollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-1">
                            {TemplateExecutionService.formatPercentage(result.savingsPercentage)}
                        </div>
                        <div className="text-xs text-light-text-muted dark:text-dark-text-muted">
                            Cost Savings
                        </div>
                    </div>

                    <div className="p-4 rounded-xl glass border border-primary-200/30 dark:border-primary-700/30 
            shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-highlight flex items-center justify-center mx-auto mb-3">
                            <FiZap className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-1">
                            {(result.latencyMs / 1000).toFixed(2)}s
                        </div>
                        <div className="text-xs text-light-text-muted dark:text-dark-text-muted">
                            Response Time
                        </div>
                    </div>

                    <div className="p-4 rounded-xl glass border border-primary-200/30 dark:border-primary-700/30 
            shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-success flex items-center justify-center mx-auto mb-3">
                            <FiTrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-1">
                            {TemplateExecutionService.formatNumber(result.totalTokens)}
                        </div>
                        <div className="text-xs text-light-text-muted dark:text-dark-text-muted">
                            Total Tokens
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-primary text-white shadow-lg hover:shadow-xl 
              rounded-xl font-display font-bold hover:scale-105 active:scale-95 
              transition-all duration-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

