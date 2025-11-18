import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  CpuChipIcon,
  ClipboardIcon,
  ChartBarIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Optimization } from "../../types";
import { CortexImpactDisplay } from "../cortex/CortexImpactDisplay";
import { CortexResultsDisplay } from "../cortex/CortexResultsDisplay";

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
  const [imageLoadError, setImageLoadError] = useState<{ reference: boolean; evidence: boolean }>({ reference: false, evidence: false });
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const costCardRef = useRef<HTMLDivElement>(null);

  // Helper to get image URL (use presigned URL if available, otherwise return null)
  const getImageUrl = (presignedUrl?: string) => {
    if (!presignedUrl) return null;
    // Presigned URLs are already viewable HTTP(S) URLs
    return presignedUrl;
  };

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

  const isVisualCompliance = optimization.optimizationType === 'visual_compliance';

  // Update tooltip position when showing
  useEffect(() => {
    if (showTooltip && costCardRef.current) {
      const rect = costCardRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8
      });
    }
  }, [showTooltip]);

  return (
    <div className="overflow-hidden glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Optimization Type Badge */}
              {isVisualCompliance ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Visual Compliance
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200/50">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Text Optimization
                </span>
              )}
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
              {optimization.improvementPercentage && optimization.improvementPercentage < 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium bg-danger-50/50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300 border border-danger-200/50">
                  ⚠️ Token Increase
                </span>
              )}
              <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                {formatDate(optimization.createdAt)}
              </span>
            </div>

            <h3 className="mt-3 text-lg font-display font-semibold gradient-text-primary">
              {optimization?.improvementPercentage
                ? `${Math.abs(optimization.improvementPercentage).toFixed(1)}% Token ${optimization.improvementPercentage < 0 ? 'Increase' : 'Reduction'}`
                : '0.0% Token Reduction'}
            </h3>

            <div className="grid grid-cols-2 gap-4 mt-4 text-sm md:grid-cols-4">
              <div className="glass rounded-lg p-3 border border-secondary-200/30 hover:scale-105 transition-transform duration-200">
                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary block mb-1">
                  {optimization.improvementPercentage && optimization.improvementPercentage < 0 ? 'Token Increase' : 'Tokens Saved'}
                </span>
                <span className={`font-display font-semibold text-lg ${optimization.improvementPercentage && optimization.improvementPercentage < 0
                  ? 'text-danger-600 dark:text-danger-400'
                  : 'text-success-600 dark:text-success-400'
                  }`}>
                  {optimization.tokensSaved || optimization.cortexImpactMetrics?.tokenReduction?.absoluteSavings || 0}
                </span>
              </div>
              <div
                ref={costCardRef}
                className="glass rounded-lg p-3 border border-success-200/30 hover:scale-105 transition-transform duration-200 cursor-help"
                onMouseEnter={() => isVisualCompliance && optimization.metadata?.costBreakdown && setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary block mb-1 flex items-center gap-1">
                  {optimization.improvementPercentage && optimization.improvementPercentage < 0 ? 'Cost Increase' : (isVisualCompliance && optimization.metadata?.costBreakdown?.netSavings ? 'Net Savings' : 'Cost Saved')}
                  {isVisualCompliance && optimization.metadata?.costBreakdown && (
                    <svg className="w-3.5 h-3.5 text-success-600 dark:text-success-400 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </span>
                <span className={`font-display font-semibold text-lg ${optimization.improvementPercentage && optimization.improvementPercentage < 0
                  ? 'text-danger-600 dark:text-danger-400'
                  : 'gradient-text-success'
                  }`}>
                  {isVisualCompliance && optimization.metadata?.costBreakdown?.netSavings
                    ? formatCurrency(optimization.metadata.costBreakdown.netSavings.amount)
                    : formatCurrency(optimization.costSaved || optimization.cortexImpactMetrics?.costImpact?.costSavings || 0)}
                </span>
                {isVisualCompliance && optimization.metadata?.costBreakdown?.internal?.isAdjusted && (
                  <span className="text-[10px] font-body text-success-600 dark:text-success-400 italic">Minimal fee</span>
                )}
              </div>

              {/* Portal-based Tooltip for Visual Compliance */}
              {showTooltip && isVisualCompliance && optimization.metadata?.costBreakdown && createPortal(
                <div
                  className="fixed z-[99999] w-64 pointer-events-none transition-opacity duration-200"
                  style={{
                    top: `${tooltipPosition.top}px`,
                    left: `${tooltipPosition.left}px`,
                    transform: 'translateY(-50%)'
                  }}
                >
                  <div className="glass rounded-lg p-3 border border-success-200/50 dark:border-success-700/50 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 shadow-2xl pointer-events-auto">
                    <div className="text-[10px] font-display font-semibold text-success-700 dark:text-success-300 mb-2">💰 Cost Breakdown</div>
                    <div className="text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary space-y-1">
                      <div className="flex justify-between">
                        <span>Gross Savings:</span>
                        <span className="font-semibold text-success-600 dark:text-success-400">{formatCurrency(optimization.metadata.costBreakdown.savings.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Cost:</span>
                        <span className="font-semibold text-accent-600 dark:text-accent-400">-{formatCurrency(optimization.metadata.costBreakdown.internal?.processingCost || 0)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-success-200/30">
                        <span className="font-bold">Net Savings:</span>
                        <span className="font-bold text-success-700 dark:text-success-300">{formatCurrency(optimization.metadata.costBreakdown.netSavings?.amount || 0)}</span>
                      </div>
                    </div>
                    {/* Arrow pointing left */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-px">
                      <div className="border-4 border-transparent border-r-white/95 dark:border-r-gray-900/95"></div>
                    </div>
                  </div>
                </div>,
                document.body
              )}
              <div className="glass rounded-lg p-3 border border-primary-200/30 hover:scale-105 transition-transform duration-200">
                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary block mb-1">Service</span>
                <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary capitalize">
                  {optimization.service || optimization.parameters?.model?.split('.')[0] || 'Unknown'}
                </span>
              </div>
              <div className="glass rounded-lg p-3 border border-primary-200/30 hover:scale-105 transition-transform duration-200">
                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary block mb-1">
                  {isVisualCompliance && optimization.metadata?.costBreakdown?.netSavings ? 'Net Benefit' : 'Improvement'}
                </span>
                <span className="font-display font-semibold gradient-text-accent text-lg">
                  {isVisualCompliance && optimization.metadata?.costBreakdown?.netSavings
                    ? (optimization.metadata.costBreakdown.netSavings.percentage || 0).toFixed(1)
                    : (optimization.improvementPercentage || optimization.cortexImpactMetrics?.tokenReduction?.percentageSavings || 0).toFixed(1)}%
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
            {/* Visual Compliance Section */}
            {isVisualCompliance && optimization.visualComplianceData && (
              <div className="space-y-5">
                {/* Main Compliance Result Card - Hero Section */}
                <div className="glass rounded-2xl p-6 border-2 border-emerald-200/40 backdrop-blur-xl bg-gradient-to-br from-emerald-50/40 to-teal-50/30 dark:from-emerald-900/20 dark:to-teal-900/15 shadow-2xl">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center shadow-xl shrink-0">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-2xl font-display font-bold bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">
                        Visual Compliance Analysis
                      </h4>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-semibold bg-white/80 dark:bg-black/30 border border-emerald-200/50 text-emerald-700 dark:text-emerald-300 shadow-sm">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="capitalize">{optimization.visualComplianceData.industry}</span>
                        </span>
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-bold shadow-lg transition-all ${optimization.visualComplianceData.passFail
                          ? 'bg-gradient-to-r from-success-500 to-success-600 text-white hover:shadow-success-500/30'
                          : 'bg-gradient-to-r from-danger-500 to-danger-600 text-white hover:shadow-danger-500/30'
                          }`}>
                          {optimization.visualComplianceData.passFail ? (
                            <>
                              <CheckCircleIcon className="w-5 h-5" />
                              <span>PASS</span>
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-5 h-5" />
                              <span>FAIL</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score and Feedback - Side by Side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                    {/* Compliance Score */}
                    <div className="glass rounded-xl p-6 border border-emerald-200/30 bg-gradient-to-br from-white/60 to-emerald-50/40 dark:from-black/30 dark:to-emerald-900/20 shadow-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h5 className="text-sm font-display font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                          Compliance Score
                        </h5>
                      </div>
                      <div className="flex items-end gap-3 mb-4">
                        <span className="text-6xl font-display font-black bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent leading-none">
                          {optimization.visualComplianceData.complianceScore}
                        </span>
                        <span className="text-3xl font-display font-bold text-emerald-400 dark:text-emerald-500 mb-2">%</span>
                      </div>
                      <div className="relative">
                        <div className="w-full h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 rounded-full transition-all duration-700 shadow-lg"
                            style={{ width: `${optimization.visualComplianceData.complianceScore}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-display font-medium text-light-text-secondary dark:text-dark-text-secondary">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Analysis */}
                    <div className="glass rounded-xl p-6 border border-accent-200/30 bg-gradient-to-br from-white/60 to-accent-50/40 dark:from-black/30 dark:to-accent-900/20 shadow-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                        </div>
                        <h5 className="text-sm font-display font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                          AI Feedback
                        </h5>
                      </div>
                      <div className="space-y-3">
                        <p className="text-base font-body text-light-text-primary dark:text-dark-text-primary leading-relaxed">
                          {optimization.visualComplianceData.feedbackMessage}
                        </p>
                        <div className="flex items-center gap-2 pt-3 border-t border-accent-200/30">
                          <svg className="w-4 h-4 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary italic">
                            Generated by AI visual analysis
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Criteria */}
                  {optimization.visualComplianceData.complianceCriteria && optimization.visualComplianceData.complianceCriteria.length > 0 && (
                    <div className="glass rounded-xl p-6 border border-emerald-200/30 bg-gradient-to-br from-white/60 to-emerald-50/40 dark:from-black/30 dark:to-emerald-900/20 shadow-lg">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-display font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                            Compliance Criteria
                          </h5>
                          <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                            {optimization.visualComplianceData.complianceCriteria.length} checks performed
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {optimization.visualComplianceData.complianceCriteria.map((criteria, idx) => (
                          <div key={idx} className="group flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/60 dark:from-emerald-900/30 dark:to-teal-900/20 border border-emerald-200/40 dark:border-emerald-700/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                              <CheckCircleIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-body text-light-text-primary dark:text-dark-text-primary leading-relaxed flex-1">
                              {criteria}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Images Display - Enhanced Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-display font-bold gradient-text-accent">Visual Evidence</h4>
                      <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Reference vs Evidence Comparison</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Reference Image */}
                    <div className="glass rounded-2xl p-5 border-2 border-emerald-200/40 backdrop-blur-xl bg-gradient-to-br from-emerald-50/30 to-teal-50/20 dark:from-emerald-900/20 dark:to-teal-900/15 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h5 className="text-sm font-display font-bold text-emerald-700 dark:text-emerald-300">
                            Reference Standard
                          </h5>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-display font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50">
                          Baseline
                        </span>
                      </div>
                      {optimization.visualComplianceData.referenceImageUrl ? (
                        <div className="relative group">
                          <div className="relative aspect-video bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-100 dark:from-emerald-900/30 dark:via-emerald-800/20 dark:to-teal-900/20 rounded-xl overflow-hidden border-2 border-emerald-300/50 dark:border-emerald-600/40 shadow-lg">
                            {!imageLoadError.reference && getImageUrl((optimization.visualComplianceData as any).referenceImagePresignedUrl) ? (
                              <img
                                src={getImageUrl((optimization.visualComplianceData as any).referenceImagePresignedUrl) || ''}
                                alt="Reference Standard"
                                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                onError={() => setImageLoadError(prev => ({ ...prev, reference: true }))}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
                                <div className="flex flex-col items-center gap-4 p-6 text-center">
                                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl">
                                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <div className="space-y-2">
                                    <span className="block text-sm font-display font-bold text-emerald-700 dark:text-emerald-300">
                                      Reference Image
                                    </span>
                                    <span className="block text-xs font-body text-light-text-secondary dark:text-dark-text-secondary px-4 py-2 rounded-lg bg-white/60 dark:bg-black/40">
                                      {imageLoadError.reference ? '⚠️ Image not accessible' : '☁️ Stored securely in S3'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                          <div className="text-center space-y-2">
                            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-body text-gray-500">No reference image</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Evidence Image */}
                    <div className="glass rounded-2xl p-5 border-2 border-emerald-200/40 backdrop-blur-xl bg-gradient-to-br from-emerald-50/30 to-teal-50/20 dark:from-emerald-900/20 dark:to-teal-900/15 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                          <h5 className="text-sm font-display font-bold text-emerald-700 dark:text-emerald-300">
                            Evidence Sample
                          </h5>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-display font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50">
                          Tested
                        </span>
                      </div>
                      {optimization.visualComplianceData.evidenceImageUrl ? (
                        <div className="relative group">
                          <div className="relative aspect-video bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-100 dark:from-emerald-900/30 dark:via-emerald-800/20 dark:to-teal-900/20 rounded-xl overflow-hidden border-2 border-emerald-300/50 dark:border-emerald-600/40 shadow-lg">
                            {!imageLoadError.evidence && getImageUrl((optimization.visualComplianceData as any).evidenceImagePresignedUrl) ? (
                              <img
                                src={getImageUrl((optimization.visualComplianceData as any).evidenceImagePresignedUrl) || ''}
                                alt="Evidence Sample"
                                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                onError={() => setImageLoadError(prev => ({ ...prev, evidence: true }))}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
                                <div className="flex flex-col items-center gap-4 p-6 text-center">
                                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl">
                                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <div className="space-y-2">
                                    <span className="block text-sm font-display font-bold text-emerald-700 dark:text-emerald-300">
                                      Evidence Image
                                    </span>
                                    <span className="block text-xs font-body text-light-text-secondary dark:text-dark-text-secondary px-4 py-2 rounded-lg bg-white/60 dark:bg-black/40">
                                      {imageLoadError.evidence ? '⚠️ Image not accessible' : '☁️ Stored securely in S3'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                          <div className="text-center space-y-2">
                            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-body text-gray-500">No evidence image</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Optimization Techniques Used */}
                {optimization.optimizationTechniques && optimization.optimizationTechniques.length > 0 && (
                  <div className="glass rounded-xl p-5 border border-secondary-200/30 backdrop-blur-xl bg-gradient-to-br from-secondary-50/30 to-transparent dark:from-secondary-900/10 dark:to-transparent">
                    <h5 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2">
                      <CpuChipIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                      Visual Optimization Techniques Applied
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {optimization.optimizationTechniques.map((technique, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-2 rounded-lg text-xs font-display font-medium bg-secondary-100/80 dark:bg-secondary-800/40 text-secondary-700 dark:text-secondary-300 border border-secondary-200/50 shadow-sm"
                        >
                          {technique.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Processing Metadata */}
                {optimization.metadata && (
                  <div className="glass rounded-xl p-5 border border-accent-200/30 backdrop-blur-xl bg-gradient-to-br from-accent-50/30 to-transparent dark:from-accent-900/10 dark:to-transparent">
                    <h5 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2">
                      <ChartBarIcon className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                      Processing Metrics
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {optimization.metadata.latency && (
                        <div className="text-center p-3 rounded-lg glass border border-accent-200/20">
                          <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Latency</div>
                          <div className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                            {optimization.metadata.latency}ms
                          </div>
                        </div>
                      )}
                      {optimization.metadata.compressionRatio && (
                        <div className="text-center p-3 rounded-lg glass border border-accent-200/20">
                          <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Compression</div>
                          <div className="text-lg font-display font-bold gradient-text-success">
                            {optimization.metadata.compressionRatio.toFixed(1)}%
                          </div>
                        </div>
                      )}
                      {optimization.metadata.inputTokens && (
                        <div className="text-center p-3 rounded-lg glass border border-accent-200/20">
                          <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Input Tokens</div>
                          <div className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                            {optimization.metadata.inputTokens}
                          </div>
                        </div>
                      )}
                      {optimization.metadata.outputTokens && (
                        <div className="text-center p-3 rounded-lg glass border border-accent-200/20">
                          <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Output Tokens</div>
                          <div className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                            {optimization.metadata.outputTokens}
                          </div>
                        </div>
                      )}
                    </div>
                    {optimization.metadata.technique && (
                      <div className="mt-4 p-3 rounded-lg bg-white/50 dark:bg-black/30 border border-accent-200/20">
                        <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Technique: </span>
                        <span className="text-xs font-display font-semibold text-accent-600 dark:text-accent-400">
                          {optimization.metadata.technique.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Cost Breakdown for Visual Compliance - Net Savings Card */}
                {isVisualCompliance && optimization.metadata?.costBreakdown && (
                  <div>
                    {/* Savings Summary - Large Card (Only show if positive or adjusted) */}
                    {optimization.metadata.costBreakdown.netSavings &&
                      (optimization.metadata.costBreakdown.netSavings.amount >= 0 || optimization.metadata.costBreakdown.internal?.isAdjusted) && (
                        <div className="glass rounded-xl p-6 border-2 border-success-200/40 dark:border-success-800/40 backdrop-blur-xl bg-gradient-to-r from-success-50/40 to-primary-50/30 dark:from-success-900/30 dark:to-primary-900/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                          <div className="flex items-center justify-between gap-6 flex-wrap">
                            {/* Net Savings - Main Display */}
                            <div className="flex-1 min-w-[250px]">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center shadow-lg">
                                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-body text-success-700 dark:text-success-300 font-semibold">
                                      Net Savings
                                    </div>
                                    <div className="group relative">
                                      <div className="w-6 h-6 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center cursor-help hover:scale-110 hover:bg-success-200 dark:hover:bg-success-800/50 transition-all duration-200 animate-pulse hover:animate-none">
                                        <svg className="w-4 h-4 text-success-600 dark:text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                      {/* Calculation Info Tooltip */}
                                      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-[9999] w-80">
                                        <div className="glass rounded-lg p-4 border border-success-200/50 dark:border-success-700/50 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 shadow-2xl">
                                          <div className="text-xs font-display font-semibold text-success-700 dark:text-success-300 mb-3">💰 Cost Calculation</div>
                                          <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary space-y-2">
                                            <div className="flex justify-between items-center p-2 rounded bg-danger-50/50 dark:bg-danger-900/20">
                                              <span>Traditional Cost:</span>
                                              <span className="font-semibold text-danger-600 dark:text-danger-400">${optimization.metadata.costBreakdown.baseline.totalCost.toFixed(4)}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-2 rounded bg-primary-50/50 dark:bg-primary-900/20">
                                              <span>Optimized Cost:</span>
                                              <span className="font-semibold text-primary-600 dark:text-primary-400">-${optimization.metadata.costBreakdown.optimized.totalCost.toFixed(4)}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-2 rounded bg-success-50/50 dark:bg-success-900/20 border-t border-success-200/30">
                                              <span className="font-semibold">Gross Savings:</span>
                                              <span className="font-semibold text-success-600 dark:text-success-400">${optimization.metadata.costBreakdown.savings.amount.toFixed(4)}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-2 rounded bg-accent-50/50 dark:bg-accent-900/20">
                                              <span>Processing Cost:</span>
                                              <span className="font-semibold text-accent-600 dark:text-accent-400">-${optimization.metadata.costBreakdown.internal?.processingCost.toFixed(4)}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-2 rounded bg-success-100/80 dark:bg-success-900/40 border-2 border-success-300/50">
                                              <span className="font-bold">Net Savings:</span>
                                              <span className="font-bold text-success-700 dark:text-success-300">${optimization.metadata.costBreakdown.netSavings.amount.toFixed(4)}</span>
                                            </div>
                                            {optimization.metadata.costBreakdown.internal?.isAdjusted && (
                                              <p className="mt-2 pt-2 border-t border-success-200/30 text-success-600 dark:text-success-400 italic text-[10px]">
                                                ✓ Minimal processing fee applied for your benefit
                                              </p>
                                            )}
                                          </div>
                                          {/* Arrow */}
                                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                                            <div className="border-8 border-transparent border-t-white/95 dark:border-t-gray-900/95"></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                                    After Processing Cost
                                  </div>
                                  {optimization.metadata.costBreakdown.internal?.isAdjusted && (
                                    <div className="text-xs font-body text-success-600 dark:text-success-400 mt-1 italic">
                                      Minimal processing fee applied
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-baseline gap-3 mt-3">
                                <div className="text-4xl font-display font-black bg-gradient-to-r from-success-600 via-success-700 to-emerald-600 dark:from-success-400 dark:to-emerald-400 bg-clip-text text-transparent">
                                  ${optimization.metadata.costBreakdown.netSavings.amount.toFixed(4)}
                                </div>
                                <div className="text-2xl font-display font-bold bg-gradient-to-r from-success-600 to-success-700 dark:from-success-400 dark:to-success-500 bg-clip-text text-transparent">
                                  ({optimization.metadata.costBreakdown.netSavings.percentage.toFixed(1)}%)
                                </div>
                              </div>
                            </div>

                            {/* Gross Savings - Side Display */}
                            <div className="glass rounded-lg p-4 border border-success-200/30 min-w-[200px]">
                              <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                Gross Cost Reduction
                              </div>
                              <div className="text-xl font-display font-bold text-success-600 dark:text-success-400 mb-1">
                                ${optimization.metadata.costBreakdown.savings.amount.toFixed(4)}
                              </div>
                              <div className="text-xs font-body text-success-700 dark:text-success-300">
                                ({optimization.metadata.costBreakdown.savings.percentage.toFixed(1)}% saved)
                              </div>
                              <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-2 italic">
                                Before processing costs
                              </div>
                            </div>
                          </div>

                          {/* Info Note */}
                          <div className="mt-4 pt-4 border-t border-success-200/30 flex items-start gap-2">
                            <svg className="w-4 h-4 text-success-600 dark:text-success-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary italic">
                              Net savings represent your actual cost benefit after accounting for processing costs. This is your true savings.
                              {optimization.metadata.costBreakdown.internal?.isAdjusted && " A minimal processing fee has been applied for this check."}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Cortex Impact - With vs Without Comparison (Only for text optimization) */}
                {!isVisualCompliance && optimization.cortexImpactMetrics && (
                  <div className="glass rounded-xl p-6 border border-secondary-200/30 backdrop-blur-xl bg-gradient-to-br from-secondary-50/30 to-indigo-50/30 dark:from-secondary-900/10 dark:to-indigo-900/10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <CpuChipIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-lg font-display font-bold bg-gradient-to-r from-secondary-600 to-indigo-600 dark:from-secondary-400 dark:to-indigo-400 bg-clip-text text-transparent">
                          Cortex Optimization Impact
                        </h5>
                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-1">
                          With vs Without Cortex Comparison
                        </p>
                      </div>
                    </div>

                    {/* Token Reduction Comparison */}
                    {optimization.cortexImpactMetrics.tokenReduction && (
                      <div className="mb-6">
                        <h6 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                          Token Reduction Analysis
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="glass rounded-xl p-4 border border-danger-200/30 bg-gradient-to-br from-danger-50/50 to-transparent dark:from-danger-900/20 dark:to-transparent">
                            <div className="text-xs font-display font-medium text-danger-600 dark:text-danger-400 mb-2 uppercase tracking-wide">Without Cortex</div>
                            <div className="text-3xl font-display font-bold text-danger-600 dark:text-danger-400 mb-1">
                              {optimization.cortexImpactMetrics.tokenReduction.withoutCortex.toLocaleString()}
                            </div>
                            <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">tokens</div>
                          </div>
                          <div className="glass rounded-xl p-4 border border-success-200/30 bg-gradient-to-br from-success-50/50 to-transparent dark:from-success-900/20 dark:to-transparent">
                            <div className="text-xs font-display font-medium text-success-600 dark:text-success-400 mb-2 uppercase tracking-wide">With Cortex</div>
                            <div className="text-3xl font-display font-bold text-success-600 dark:text-success-400 mb-1">
                              {optimization.cortexImpactMetrics.tokenReduction.withCortex.toLocaleString()}
                            </div>
                            <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">tokens</div>
                          </div>
                          <div className="glass rounded-xl p-4 border border-secondary-200/30 bg-gradient-to-br from-secondary-50/50 to-transparent dark:from-secondary-900/20 dark:to-transparent">
                            <div className="text-xs font-display font-medium text-secondary-600 dark:text-secondary-400 mb-2 uppercase tracking-wide">Savings</div>
                            <div className="text-3xl font-display font-bold gradient-text-success mb-1">
                              {optimization.cortexImpactMetrics.tokenReduction.absoluteSavings.toLocaleString()}
                            </div>
                            <div className="text-xs font-body text-success-600 dark:text-success-400 font-semibold">
                              {optimization.cortexImpactMetrics.tokenReduction.percentageSavings.toFixed(1)}% reduction
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cost Impact Comparison */}
                    {optimization.cortexImpactMetrics.costImpact && (
                      <div className="mb-6">
                        <h6 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                          Cost Impact Analysis
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="glass rounded-xl p-4 border border-danger-200/30 bg-gradient-to-br from-danger-50/50 to-transparent dark:from-danger-900/20 dark:to-transparent">
                            <div className="text-xs font-display font-medium text-danger-600 dark:text-danger-400 mb-2 uppercase tracking-wide">Without Cortex</div>
                            <div className="text-2xl font-display font-bold text-danger-600 dark:text-danger-400 mb-1">
                              {formatCurrency(optimization.cortexImpactMetrics.costImpact.estimatedCostWithoutCortex)}
                            </div>
                            <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">estimated cost</div>
                          </div>
                          <div className="glass rounded-xl p-4 border border-success-200/30 bg-gradient-to-br from-success-50/50 to-transparent dark:from-success-900/20 dark:to-transparent">
                            <div className="text-xs font-display font-medium text-success-600 dark:text-success-400 mb-2 uppercase tracking-wide">With Cortex</div>
                            <div className="text-2xl font-display font-bold text-success-600 dark:text-success-400 mb-1">
                              {formatCurrency(optimization.cortexImpactMetrics.costImpact.actualCostWithCortex)}
                            </div>
                            <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">actual cost</div>
                          </div>
                          <div className="glass rounded-xl p-4 border border-secondary-200/30 bg-gradient-to-br from-secondary-50/50 to-transparent dark:from-secondary-900/20 dark:to-transparent">
                            <div className="text-xs font-display font-medium text-secondary-600 dark:text-secondary-400 mb-2 uppercase tracking-wide">Savings</div>
                            <div className="text-2xl font-display font-bold gradient-text-success mb-1">
                              {formatCurrency(optimization.cortexImpactMetrics.costImpact.costSavings)}
                            </div>
                            <div className="text-xs font-body text-success-600 dark:text-success-400 font-semibold">
                              {optimization.cortexImpactMetrics.costImpact.savingsPercentage.toFixed(1)}% reduction
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quality Metrics */}
                    {optimization.cortexImpactMetrics.qualityMetrics && (
                      <div className="mb-6">
                        <h6 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                          Quality Metrics
                        </h6>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          <div className="text-center p-3 rounded-lg glass border border-primary-200/20">
                            <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-2">Clarity</div>
                            <div className="text-xl font-display font-bold gradient-text-primary">
                              {(optimization.cortexImpactMetrics.qualityMetrics.clarityScore * 100).toFixed(0)}%
                            </div>
                          </div>
                          <div className="text-center p-3 rounded-lg glass border border-success-200/20">
                            <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-2">Completeness</div>
                            <div className="text-xl font-display font-bold gradient-text-success">
                              {(optimization.cortexImpactMetrics.qualityMetrics.completenessScore * 100).toFixed(0)}%
                            </div>
                          </div>
                          <div className="text-center p-3 rounded-lg glass border border-accent-200/20">
                            <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-2">Relevance</div>
                            <div className="text-xl font-display font-bold gradient-text-accent">
                              {(optimization.cortexImpactMetrics.qualityMetrics.relevanceScore * 100).toFixed(0)}%
                            </div>
                          </div>
                          <div className="text-center p-3 rounded-lg glass border border-secondary-200/20">
                            <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-2">Ambiguity ↓</div>
                            <div className="text-xl font-display font-bold text-secondary-600 dark:text-secondary-400">
                              {(optimization.cortexImpactMetrics.qualityMetrics.ambiguityReduction * 100).toFixed(0)}%
                            </div>
                          </div>
                          <div className="text-center p-3 rounded-lg glass border border-emerald-200/20">
                            <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-2">Redundancy ↓</div>
                            <div className="text-xl font-display font-bold text-emerald-600 dark:text-emerald-400">
                              {(optimization.cortexImpactMetrics.qualityMetrics.redundancyRemoval * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Performance Metrics */}
                    {optimization.cortexImpactMetrics.performanceMetrics && (
                      <div className="mb-6">
                        <h6 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                          Performance Metrics
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="glass rounded-xl p-4 border border-accent-200/20">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs font-display font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">Processing Time</span>
                            </div>
                            <div className="text-2xl font-display font-bold text-accent-600 dark:text-accent-400">
                              {optimization.cortexImpactMetrics.performanceMetrics.processingTime}ms
                            </div>
                          </div>
                          <div className="glass rounded-xl p-4 border border-primary-200/20">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span className="text-xs font-display font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">Response Latency</span>
                            </div>
                            <div className="text-2xl font-display font-bold text-primary-600 dark:text-primary-400">
                              {optimization.cortexImpactMetrics.performanceMetrics.responseLatency}ms
                            </div>
                          </div>
                          <div className="glass rounded-xl p-4 border border-success-200/20">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-success-600 dark:text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-xs font-display font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">Compression Ratio</span>
                            </div>
                            <div className="text-2xl font-display font-bold gradient-text-success">
                              {optimization.cortexImpactMetrics.performanceMetrics.compressionRatio.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Justification */}
                    {optimization.cortexImpactMetrics.justification && (
                      <div>
                        <h6 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                          Key Improvements & Confidence
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="glass rounded-xl p-4 border border-secondary-200/20">
                            <h6 className="text-xs font-display font-semibold text-secondary-600 dark:text-secondary-400 mb-3 uppercase tracking-wide">
                              Optimization Techniques
                            </h6>
                            <div className="space-y-2">
                              {optimization.cortexImpactMetrics.justification.optimizationTechniques?.map((tech: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <CheckCircleIcon className="w-4 h-4 text-secondary-600 dark:text-secondary-400 flex-shrink-0" />
                                  <span className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">{tech}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="glass rounded-xl p-4 border border-success-200/20">
                            <h6 className="text-xs font-display font-semibold text-success-600 dark:text-success-400 mb-3 uppercase tracking-wide">
                              Key Improvements
                            </h6>
                            <div className="space-y-2">
                              {optimization.cortexImpactMetrics.justification.keyImprovements?.map((improvement: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <CheckCircleIcon className="w-4 h-4 text-success-600 dark:text-success-400 flex-shrink-0" />
                                  <span className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">{improvement}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        {optimization.cortexImpactMetrics.justification.confidenceScore && (
                          <div className="mt-4 glass rounded-xl p-4 border border-accent-200/20 bg-gradient-to-r from-accent-50/50 to-transparent dark:from-accent-900/20 dark:to-transparent">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">Confidence Score</span>
                              <span className="text-2xl font-display font-bold gradient-text-accent">
                                {(optimization.cortexImpactMetrics.justification.confidenceScore * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="mt-2">
                              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-accent-500 to-accent-600 rounded-full transition-all duration-500"
                                  style={{ width: `${(optimization.cortexImpactMetrics.justification.confidenceScore * 100).toFixed(0)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
            }

            {/* SECTION 1: Request & Response - PRIMARY CONTENT (Only for text optimization) */}
            {
              !isVisualCompliance && (
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
              )
            }

            {/* SECTION 2: Token & Cost Overview */}
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

            {/* SECTION 3: Additional Suggestions (if any) */}
            {
              optimization.suggestions &&
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
              )
            }

            {/* ========== CORTEX SECTIONS (AT THE BOTTOM) ========== */}

            {/* Cortex Configuration (if used) */}
            {
              cortexActuallyUsed && (
                <div className="glass rounded-xl p-5 border border-secondary-200/30 backdrop-blur-xl bg-gradient-to-br from-secondary-50/50 to-indigo-100/30 dark:from-secondary-900/20 dark:to-indigo-800/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <CpuChipIcon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-base font-display font-bold bg-gradient-to-r from-secondary-600 to-indigo-600 dark:from-secondary-400 dark:to-indigo-400 bg-clip-text text-transparent">
                      Cortex Pipeline Configuration
                    </h4>
                  </div>

                  {/* Models Grid */}
                  {optimization.metadata?.cortex?.cortexModel && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-3 rounded-lg bg-white/60 dark:bg-black/30 backdrop-blur-sm border border-secondary-200/20">
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Encoder</div>
                        <div className="text-xs font-semibold font-display text-secondary-700 dark:text-secondary-300 truncate">
                          {optimization.metadata.cortex.cortexModel.encoder?.split('.')[1]?.replace(/-/g, ' ') || 'N/A'}
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/60 dark:bg-black/30 backdrop-blur-sm border border-indigo-200/20">
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Core Processor</div>
                        <div className="text-xs font-semibold font-display text-indigo-700 dark:text-indigo-300 truncate">
                          {(optimization.metadata.cortex.cortexModel.core || optimization.metadata.cortex.cortexModel.processor)?.split('.')[1]?.replace(/-/g, ' ') || 'N/A'}
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/60 dark:bg-black/30 backdrop-blur-sm border border-secondary-200/20">
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Decoder</div>
                        <div className="text-xs font-semibold font-display text-secondary-700 dark:text-secondary-300 truncate">
                          {optimization.metadata.cortex.cortexModel.decoder?.split('.')[1]?.replace(/-/g, ' ') || 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Processing Metrics */}
                  {optimization.metadata?.cortex && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {optimization.metadata.cortex.processingTime && (
                        <div className="text-center p-2.5 rounded-lg glass border border-secondary-200/20">
                          <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Processing</div>
                          <div className="text-sm font-semibold font-display text-light-text-primary dark:text-dark-text-primary">
                            {(optimization.metadata.cortex.processingTime / 1000).toFixed(2)}s
                          </div>
                        </div>
                      )}
                      {optimization.metadata.cortex.semanticIntegrity !== undefined && (
                        <div className="text-center p-2.5 rounded-lg glass border border-secondary-200/20">
                          <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Integrity</div>
                          <div className="text-sm font-semibold font-display text-success-600 dark:text-success-400">
                            {(optimization.metadata.cortex.semanticIntegrity * 100).toFixed(0)}%
                          </div>
                        </div>
                      )}
                      {optimization.metadata.cortex.totalCost !== undefined && (
                        <div className="text-center p-2.5 rounded-lg glass border border-secondary-200/20">
                          <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Cortex Cost</div>
                          <div className="text-sm font-semibold font-display text-light-text-primary dark:text-dark-text-primary">
                            {formatCurrency(optimization.metadata.cortex.totalCost)}
                          </div>
                        </div>
                      )}
                      {optimization.metadata.cortex.streamingEnabled !== undefined && (
                        <div className="text-center p-2.5 rounded-lg glass border border-secondary-200/20">
                          <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Mode</div>
                          <div className="text-sm font-semibold font-display text-light-text-primary dark:text-dark-text-primary">
                            {optimization.metadata.cortex.streamingEnabled ? 'Streaming' : optimization.metadata.cortex.lightweightCortex ? 'Lightweight' : 'Standard'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            }

            {/* Cortex Impact Display - Full Detailed Metrics */}
            {
              cortexActuallyUsed && optimization.cortexImpactMetrics && optimization.cortexImpactMetrics.tokenReduction && (
                <CortexImpactDisplay
                  metrics={optimization.cortexImpactMetrics as any}
                  className="mb-6"
                />
              )
            }

            {/* Cortex Results Display - Metadata & Processing Info */}
            {
              cortexActuallyUsed && optimization.metadata?.cortex && (
                <CortexResultsDisplay
                  metadata={optimization.metadata.cortex}
                  loading={false}
                />
              )
            }

            {/* Cortex Performance Metrics */}
            {
              cortexActuallyUsed && optimization.cortexImpactMetrics?.performanceMetrics && (
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
              )
            }

            {/* Cortex Optimization Details */}
            {
              cortexActuallyUsed && optimization.cortexImpactMetrics?.justification && (
                <div className="glass rounded-xl p-5 border border-secondary-200/30 backdrop-blur-xl bg-gradient-to-br from-secondary-50/30 to-secondary-100/20 dark:from-secondary-900/10 dark:to-secondary-800/10">
                  <h4 className="text-base font-display font-bold gradient-text-secondary mb-4">
                    Cortex Optimization Details
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
              )
            }

            {/* Cortex Error Info - Only show if fallback was used */}
            {
              optimization.metadata?.cortexEnabled && optimization.metadata?.cortex?.fallbackUsed && optimization.metadata?.cortex?.error && (
                <div className="glass rounded-lg p-4 border border-warning-200/30 backdrop-blur-xl bg-gradient-to-br from-warning-50/30 to-warning-100/20 dark:from-warning-900/10 dark:to-warning-800/10">
                  <h4 className="text-sm font-display font-semibold text-warning-700 dark:text-warning-300 mb-2">
                    Fallback Mode Applied
                  </h4>
                  <p className="text-xs font-body text-warning-600 dark:text-warning-400">
                    {optimization.metadata.cortex.error}
                  </p>
                </div>
              )
            }

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
            {
              showFeedback && (
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
              )
            }
          </div >
        )}
      </div >
    </div >
  );
};
