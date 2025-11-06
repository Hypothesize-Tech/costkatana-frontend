import React, { useState } from "react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  CpuChipIcon,
  ClipboardIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Optimization } from "../../types";

interface OptimizationCardProps {
  optimization: Optimization;
  onApply?: (id: string) => void;
  onFeedback: (id: string, helpful: boolean, comment?: string) => void;
}

export const OptimizationCard: React.FC<OptimizationCardProps> = ({
  optimization,
  onApply: _onApply,
  onFeedback,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleFeedback = (helpful: boolean) => {
    onFeedback(optimization._id, helpful, feedbackComment);
    setShowFeedback(false);
    setFeedbackComment("");
  };

  // Copy code to clipboard
  const copyCode = async (code: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(codeId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Check if Cortex was actually used (not just enabled)
  const cortexActuallyUsed = optimization.metadata?.cortexEnabled &&
    optimization.cortexImpactMetrics &&
    !optimization.metadata?.cortex?.fallbackUsed;

  return (
    <div className="overflow-hidden glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-display font-medium border ${(optimization.applied || optimization.status === "applied" || optimization.status === "completed")
                  ? "bg-success-50/50 dark:bg-success-900/20 text-success-700 dark:text-success-300 border-success-200/50"
                  : "bg-warning-50/50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 border-warning-200/50"
                  }`}
              >
                {(optimization.applied || optimization.status === "applied" || optimization.status === "completed") ? "Applied" : "Completed"}
              </span>
              {cortexActuallyUsed && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium bg-secondary-50/50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300 border border-secondary-200/50">
                  <CpuChipIcon className="w-3.5 h-3.5" />
                  Cortex Optimized
                </span>
              )}
              {optimization.metadata?.cortexEnabled && optimization.metadata?.cortex?.fallbackUsed && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium bg-warning-50/50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 border border-warning-200/50">
                  <CpuChipIcon className="w-3.5 h-3.5" />
                  Fallback Mode
                </span>
              )}
              <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                {formatDate(optimization.createdAt)}
              </span>
            </div>

            <h3 className="mt-3 text-lg font-display font-semibold gradient-text-primary">
              {optimization?.improvementPercentage ? optimization.improvementPercentage.toFixed(1) : '0.0'}% Token Reduction
            </h3>

            <div className="grid grid-cols-2 gap-4 mt-4 text-sm md:grid-cols-4">
              <div className="glass rounded-lg p-3 border border-secondary-200/30 hover:scale-105 transition-transform duration-200">
                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary block mb-1">Tokens Saved</span>
                <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary text-lg">
                  {optimization.tokensSaved || optimization.cortexImpactMetrics?.tokenReduction?.absoluteSavings || 0}
                </span>
              </div>
              <div className="glass rounded-lg p-3 border border-success-200/30 hover:scale-105 transition-transform duration-200">
                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary block mb-1">Cost Saved</span>
                <span className="font-display font-semibold gradient-text-success text-lg">
                  {formatCurrency(optimization.costSaved || optimization.cortexImpactMetrics?.costImpact?.costSavings || 0)}
                </span>
              </div>
              <div className="glass rounded-lg p-3 border border-primary-200/30 hover:scale-105 transition-transform duration-200">
                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary block mb-1">Service</span>
                <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary capitalize">
                  {optimization.service || optimization.parameters?.model?.split('.')[0] || 'Unknown'}
                </span>
              </div>
              <div className="glass rounded-lg p-3 border border-primary-200/30 hover:scale-105 transition-transform duration-200">
                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary block mb-1">Improvement</span>
                <span className="font-display font-semibold gradient-text-accent text-lg">
                  {(optimization.improvementPercentage || optimization.cortexImpactMetrics?.tokenReduction?.percentageSavings || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 ml-4 glass rounded-lg border border-primary-200/30 hover:border-primary-300/50 transition-all duration-200 hover:scale-105"
          >
            {expanded ? (
              <ChevronUpIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            )}
          </button>
        </div>

        {expanded && (
          <div className="mt-6 space-y-6">
            {/* SECTION 1: Token & Cost Overview */}
            <div className="glass rounded-xl p-5 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-primary-100/20 dark:from-primary-900/10 dark:to-primary-800/10">
              <h4 className="text-base font-display font-bold gradient-text-primary mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                Optimization Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg glass border border-primary-200/20">
                  <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Original Tokens</div>
                  <div className="text-xl font-display font-bold text-danger-600 dark:text-danger-400">
                    {optimization.originalTokens || optimization.cortexImpactMetrics?.tokenReduction?.withoutCortex || 0}
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg glass border border-primary-200/20">
                  <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Optimized Tokens</div>
                  <div className="text-xl font-display font-bold text-success-600 dark:text-success-400">
                    {optimization.optimizedTokens || optimization.cortexImpactMetrics?.tokenReduction?.withCortex || 0}
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg glass border border-primary-200/20">
                  <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Original Cost</div>
                  <div className="text-xl font-display font-bold text-danger-600 dark:text-danger-400">
                    {formatCurrency(optimization.originalCost || optimization.cortexImpactMetrics?.costImpact?.estimatedCostWithoutCortex || 0)}
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg glass border border-primary-200/20">
                  <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Optimized Cost</div>
                  <div className="text-xl font-display font-bold text-success-600 dark:text-success-400">
                    {formatCurrency(optimization.optimizedCost || optimization.cortexImpactMetrics?.costImpact?.actualCostWithCortex || 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Cortex Configuration (if used) */}
            {cortexActuallyUsed && (
              <div className="glass rounded-xl p-5 border border-purple-200/30 backdrop-blur-xl bg-gradient-to-br from-purple-50/50 to-indigo-100/30 dark:from-purple-900/20 dark:to-indigo-800/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <CpuChipIcon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-base font-display font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Cortex Pipeline Configuration
                  </h4>
                </div>

                {/* Models Grid */}
                {optimization.metadata?.cortex?.cortexModel && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 rounded-lg bg-white/60 dark:bg-black/30 backdrop-blur-sm border border-purple-200/20">
                      <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Encoder</div>
                      <div className="text-xs font-semibold font-display text-purple-700 dark:text-purple-300 truncate">
                        {optimization.metadata.cortex.cortexModel.encoder?.split('.')[1]?.replace(/-/g, ' ') || 'N/A'}
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/60 dark:bg-black/30 backdrop-blur-sm border border-indigo-200/20">
                      <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Core Processor</div>
                      <div className="text-xs font-semibold font-display text-indigo-700 dark:text-indigo-300 truncate">
                        {(optimization.metadata.cortex.cortexModel.core || optimization.metadata.cortex.cortexModel.processor)?.split('.')[1]?.replace(/-/g, ' ') || 'N/A'}
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/60 dark:bg-black/30 backdrop-blur-sm border border-purple-200/20">
                      <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Decoder</div>
                      <div className="text-xs font-semibold font-display text-purple-700 dark:text-purple-300 truncate">
                        {optimization.metadata.cortex.cortexModel.decoder?.split('.')[1]?.replace(/-/g, ' ') || 'N/A'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Processing Metrics */}
                {optimization.metadata?.cortex && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {optimization.metadata.cortex.processingTime && (
                      <div className="text-center p-2.5 rounded-lg glass border border-purple-200/20">
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Processing</div>
                        <div className="text-sm font-semibold font-display text-light-text-primary dark:text-dark-text-primary">
                          {(optimization.metadata.cortex.processingTime / 1000).toFixed(2)}s
                        </div>
                      </div>
                    )}
                    {optimization.metadata.cortex.semanticIntegrity !== undefined && (
                      <div className="text-center p-2.5 rounded-lg glass border border-purple-200/20">
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Integrity</div>
                        <div className="text-sm font-semibold font-display text-success-600 dark:text-success-400">
                          {(optimization.metadata.cortex.semanticIntegrity * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                    {optimization.metadata.cortex.totalCost !== undefined && (
                      <div className="text-center p-2.5 rounded-lg glass border border-purple-200/20">
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Cortex Cost</div>
                        <div className="text-sm font-semibold font-display text-light-text-primary dark:text-dark-text-primary">
                          {formatCurrency(optimization.metadata.cortex.totalCost)}
                        </div>
                      </div>
                    )}
                    {optimization.metadata.cortex.streamingEnabled !== undefined && (
                      <div className="text-center p-2.5 rounded-lg glass border border-purple-200/20">
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Mode</div>
                        <div className="text-sm font-semibold font-display text-light-text-primary dark:text-dark-text-primary">
                          {optimization.metadata.cortex.streamingEnabled ? 'Streaming' : optimization.metadata.cortex.lightweightCortex ? 'Lightweight' : 'Standard'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: Quality Metrics (Cortex) */}
            {cortexActuallyUsed && optimization.cortexImpactMetrics?.qualityMetrics && (
              <div className="glass rounded-xl p-5 border border-success-200/30 backdrop-blur-xl bg-gradient-to-br from-success-50/30 to-success-100/20 dark:from-success-900/10 dark:to-success-800/10">
                <h4 className="text-base font-display font-bold gradient-text-success mb-4 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  Quality Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 rounded-lg glass border border-success-200/20">
                    <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Clarity</div>
                    <div className="text-xl font-display font-bold gradient-text-success">
                      {optimization.cortexImpactMetrics.qualityMetrics.clarityScore || 0}%
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg glass border border-success-200/20">
                    <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Completeness</div>
                    <div className="text-xl font-display font-bold gradient-text-success">
                      {optimization.cortexImpactMetrics.qualityMetrics.completenessScore || 0}%
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg glass border border-success-200/20">
                    <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Relevance</div>
                    <div className="text-xl font-display font-bold gradient-text-success">
                      {optimization.cortexImpactMetrics.qualityMetrics.relevanceScore || 0}%
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg glass border border-success-200/20">
                    <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Ambiguity↓</div>
                    <div className="text-xl font-display font-bold gradient-text-success">
                      {optimization.cortexImpactMetrics.qualityMetrics.ambiguityReduction || 0}%
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg glass border border-success-200/20">
                    <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Redundancy↓</div>
                    <div className="text-xl font-display font-bold gradient-text-success">
                      {optimization.cortexImpactMetrics.qualityMetrics.redundancyRemoval || 0}%
                    </div>
                  </div>
                </div>

                {/* Confidence Score */}
                {optimization.cortexImpactMetrics.justification?.confidenceScore !== undefined && (
                  <div className="mt-4 p-3 rounded-lg glass border border-success-200/20 text-center">
                    <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Overall Confidence</div>
                    <div className="text-2xl font-display font-bold gradient-text-accent">
                      {optimization.cortexImpactMetrics.justification.confidenceScore}%
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Original vs Optimized */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                  User Query
                </h4>
                <div className="glass rounded-lg p-4 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-primary-100/20 dark:from-primary-900/10 dark:to-primary-800/10">
                  <p className="text-sm font-body text-light-text-primary dark:text-dark-text-primary whitespace-pre-wrap">
                    {optimization.userQuery || optimization.originalPrompt || 'No query available'}
                  </p>
                  <div className="mt-3 pt-3 border-t border-primary-200/30">
                    <span className="text-xs font-display font-medium text-primary-600 dark:text-primary-400">
                      Original Tokens: {optimization.originalTokens || optimization.cortexImpactMetrics?.tokenReduction?.withoutCortex || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                  Generated Answer
                </h4>
                <div className="glass rounded-lg border border-success-200/30 backdrop-blur-xl bg-gradient-to-br from-success-50/30 to-success-100/20 dark:from-success-900/10 dark:to-success-800/10 overflow-hidden">
                  <div className="p-4 prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        code({ className, children, ...props }: { className?: string; children?: React.ReactNode;[key: string]: any }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const isInline = !match;
                          const codeContent = String(children).replace(/\n$/, '');
                          const language = match ? match[1] : 'text';
                          const codeId = `generated-${language}-${Math.random().toString(36).substr(2, 9)}`;

                          if (isInline) {
                            return (
                              <code className="bg-primary-100/50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-1.5 py-0.5 rounded text-xs font-mono border border-primary-200/30" {...props}>
                                {children}
                              </code>
                            );
                          }

                          return (
                            <div className="my-3 rounded-xl overflow-hidden border border-success-200/30 bg-dark-bg-primary">
                              <div className="flex items-center justify-between px-4 py-2 glass border-b border-success-200/30">
                                <span className="font-display font-semibold text-xs text-success-600 dark:text-success-400 uppercase tracking-wide">
                                  {language}
                                </span>
                                <button
                                  onClick={() => copyCode(codeContent, codeId)}
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass border border-success-200/30 hover:border-success-300/50 transition-all duration-200 hover:scale-105"
                                  title="Copy code"
                                >
                                  {copiedCode === codeId ? (
                                    <>
                                      <CheckIcon className="w-3.5 h-3.5 text-success-600 dark:text-success-400" />
                                      <span className="text-xs font-body text-success-600 dark:text-success-400">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <ClipboardIcon className="w-3.5 h-3.5 text-light-text-secondary dark:text-dark-text-secondary" />
                                      <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <SyntaxHighlighter
                                style={oneDark}
                                language={language}
                                PreTag="div"
                                className="!mt-0 !p-4 !bg-[#282c34] text-sm leading-relaxed overflow-x-auto"
                                showLineNumbers={true}
                                wrapLines={true}
                              >
                                {codeContent}
                              </SyntaxHighlighter>
                            </div>
                          );
                        },
                        p: ({ children }) => (
                          <p className="text-sm font-body text-light-text-primary dark:text-dark-text-primary leading-relaxed mb-3">
                            {children}
                          </p>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-xl font-display font-bold gradient-text-primary mb-3 mt-4">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-lg font-display font-bold gradient-text-secondary mb-2 mt-3">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 mt-2">
                            {children}
                          </h3>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-1 mb-3 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside space-y-1 mb-3 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                            {children}
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                            {children}
                          </strong>
                        ),
                      }}
                    >
                      {optimization.generatedAnswer || optimization.optimizedPrompt || 'No answer generated'}
                    </ReactMarkdown>
                  </div>
                  <div className="px-4 py-3 border-t border-success-200/30 bg-success-50/30 dark:bg-success-900/10">
                    <span className="text-xs font-display font-medium text-success-600 dark:text-success-400">
                      Optimized Tokens: {optimization.optimizedTokens || optimization.cortexImpactMetrics?.tokenReduction?.withCortex || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: Performance Metrics (Cortex) */}
            {cortexActuallyUsed && optimization.cortexImpactMetrics?.performanceMetrics && (
              <div className="glass rounded-xl p-5 border border-accent-200/30 backdrop-blur-xl bg-gradient-to-br from-accent-50/30 to-accent-100/20 dark:from-accent-900/10 dark:to-accent-800/10">
                <h4 className="text-base font-display font-bold gradient-text-accent mb-4">
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg glass border border-accent-200/20">
                    <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Compression Ratio</div>
                    <div className="text-xl font-display font-bold gradient-text-primary">
                      {(optimization.cortexImpactMetrics.performanceMetrics.compressionRatio || 0).toFixed(2)}x
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg glass border border-accent-200/20">
                    <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Processing Time</div>
                    <div className="text-xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                      {optimization.cortexImpactMetrics.performanceMetrics.processingTime || 0}ms
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg glass border border-accent-200/20">
                    <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Response Latency</div>
                    <div className="text-xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                      {optimization.cortexImpactMetrics.performanceMetrics.responseLatency || 0}ms
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: Optimization Details (Cortex) */}
            {cortexActuallyUsed && optimization.cortexImpactMetrics?.justification && (
              <div className="glass rounded-xl p-5 border border-secondary-200/30 backdrop-blur-xl bg-gradient-to-br from-secondary-50/30 to-secondary-100/20 dark:from-secondary-900/10 dark:to-secondary-800/10">
                <h4 className="text-base font-display font-bold gradient-text-secondary mb-4">
                  Optimization Details
                </h4>

                {/* Techniques */}
                {optimization.cortexImpactMetrics.justification.optimizationTechniques &&
                  optimization.cortexImpactMetrics.justification.optimizationTechniques.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                        Techniques Applied
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {optimization.cortexImpactMetrics.justification.optimizationTechniques.map((technique: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 rounded-full text-xs font-display font-medium bg-secondary-100/50 dark:bg-secondary-800/30 text-secondary-700 dark:text-secondary-300 border border-secondary-200/50"
                          >
                            {technique}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Key Improvements */}
                {optimization.cortexImpactMetrics.justification.keyImprovements &&
                  optimization.cortexImpactMetrics.justification.keyImprovements.length > 0 && (
                    <div>
                      <h5 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                        Key Improvements
                      </h5>
                      <ul className="space-y-2">
                        {optimization.cortexImpactMetrics.justification.keyImprovements.map((improvement: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                              {improvement}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            {/* Cortex Error Info - Only show if fallback was used */}
            {optimization.metadata?.cortexEnabled && optimization.metadata?.cortex?.fallbackUsed && optimization.metadata?.cortex?.error && (
              <div className="glass rounded-lg p-4 border border-warning-200/30 backdrop-blur-xl bg-gradient-to-br from-warning-50/30 to-warning-100/20 dark:from-warning-900/10 dark:to-warning-800/10">
                <h4 className="text-sm font-display font-semibold text-warning-700 dark:text-warning-300 mb-2">
                  Fallback Mode Applied
                </h4>
                <p className="text-xs font-body text-warning-600 dark:text-warning-400">
                  {optimization.metadata.cortex.error}
                </p>
              </div>
            )}

            {/* Additional Suggestions (if any) */}
            {optimization.suggestions &&
              optimization.suggestions.length > 0 && (
                <div>
                  <h4 className="mb-3 text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Additional Suggestions
                  </h4>
                  <ul className="space-y-3">
                    {optimization.suggestions.map((suggestion, index) => (
                      <li key={index} className="glass rounded-lg p-3 border border-success-200/30 backdrop-blur-xl">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <CheckCircleIcon className="h-5 w-5 text-success-600 dark:text-success-400" />
                          </div>
                          <div className="flex-1 text-sm font-body">
                            <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                              {suggestion.type}:
                            </span>{" "}
                            <span className="text-light-text-secondary dark:text-dark-text-secondary">
                              {suggestion.description}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-primary-200/30">
              <div className="flex items-center gap-4">
                {!showFeedback && (
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="btn btn-secondary"
                  >
                    Provide Feedback
                  </button>
                )}
              </div>

              {optimization.metadata?.confidence && (
                <div className="glass rounded-lg px-3 py-2 border border-accent-200/30">
                  <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Confidence: </span>
                  <span className="text-sm font-display font-semibold gradient-text-accent">
                    {((optimization.metadata.confidence || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>

            {/* Feedback Form */}
            {showFeedback && (
              <div className="glass rounded-xl p-5 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-primary-100/20 dark:from-primary-900/10 dark:to-primary-800/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                    <HandThumbUpIcon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-base font-display font-bold gradient-text-primary">
                    Share Your Feedback
                  </h4>
                </div>
                <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-4">
                  Help us improve by letting us know if this optimization was helpful
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-display font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                      Additional Comments (Optional)
                    </label>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Share your thoughts about this optimization..."
                      className="input resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => handleFeedback(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-semibold text-white bg-gradient-success shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
                    >
                      <HandThumbUpIcon className="w-5 h-5" />
                      Helpful
                    </button>
                    <button
                      onClick={() => handleFeedback(false)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-semibold text-white bg-gradient-danger shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
                    >
                      <HandThumbDownIcon className="w-5 h-5" />
                      Not Helpful
                    </button>
                    <button
                      onClick={() => setShowFeedback(false)}
                      className="btn btn-secondary ml-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
