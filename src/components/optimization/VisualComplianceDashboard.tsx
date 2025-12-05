import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  PresentationChartLineIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { visualComplianceService } from '../../services/visualCompliance.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { CostComparisonData } from '../../types/visualCompliance.types';

export const VisualComplianceDashboard: React.FC = () => {
  const [comparison, setComparison] = useState<CostComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyRequests, setMonthlyRequests] = useState(1000);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const response = await visualComplianceService.getCostComparison();
        if (response.success) {
          setComparison(response.comparison);
        }
      } catch (error) {
        console.error('Failed to fetch cost comparison:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!comparison) {
    return (
      <div className="glass rounded-xl border border-danger-200/30 dark:border-danger-800/30 p-8 text-center">
        <p className="font-body text-light-text-primary dark:text-dark-text-primary">
          Failed to load cost comparison data
        </p>
      </div>
    );
  }

  // Calculate annual costs with processing costs
  const processingCostPerCheck = comparison.savings.processingCost || 0;
  const grossSavingsPerCheck = comparison.traditional.cost - comparison.optimized.cost;
  const netSavingsPerCheck = grossSavingsPerCheck - processingCostPerCheck;

  const annualTraditional = comparison.traditional.cost * monthlyRequests * 12;
  const annualOptimized = comparison.optimized.cost * monthlyRequests * 12;
  const annualProcessingCost = processingCostPerCheck * monthlyRequests * 12;
  const annualGrossSavings = grossSavingsPerCheck * monthlyRequests * 12;
  const annualNetSavings = netSavingsPerCheck * monthlyRequests * 12;

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div className="glass rounded-lg border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel sm:rounded-xl">
        <div className="bg-gradient-primary/10 p-4 rounded-t-lg border-b border-primary-200/30 sm:p-6 md:p-8 sm:rounded-t-xl">
          <div className="flex flex-col gap-3 items-start mb-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg sm:w-11 sm:h-11 md:w-12 md:h-12 md:rounded-xl">
              <PresentationChartLineIcon className="w-5 h-5 text-white sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <h2 className="text-xl font-display font-bold gradient-text-primary sm:text-2xl md:text-3xl">
                Cost Optimization Dashboard
              </h2>
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm mt-0.5 sm:text-base md:text-lg sm:mt-1">
                Compare traditional vs ultra-optimized visual compliance costs
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-4 sm:p-4 sm:space-y-5 md:p-8 md:space-y-6">
          {/* Side-by-side Comparison */}
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
            {/* Traditional */}
            <div className="glass rounded-lg p-4 border-2 border-danger-200/30 dark:border-danger-800/30 backdrop-blur-xl bg-gradient-to-br from-danger-50/30 to-transparent dark:from-danger-900/20 dark:to-transparent sm:p-5 md:p-6 md:rounded-xl">
              <div className="flex items-center gap-2 mb-3 sm:gap-3 sm:mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg sm:w-9 sm:h-9 md:w-10 md:h-10 md:rounded-xl">
                  <ChartBarIcon className="w-5 h-5 text-white sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
                </div>
                <h3 className="text-base font-display font-bold text-light-text-primary dark:text-dark-text-primary sm:text-lg">
                  Traditional Approach
                </h3>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between">
                  <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Input Tokens:</span>
                  <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">{comparison.traditional.inputTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Output Tokens:</span>
                  <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">{comparison.traditional.outputTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Total Tokens:</span>
                  <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">{comparison.traditional.totalTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-primary-200/30 dark:border-primary-700/30">
                  <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Cost per Check:</span>
                  <span className="font-display font-bold text-danger-600 dark:text-danger-400">
                    ${comparison.traditional.cost.toFixed(4)}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                {comparison.traditional.description}
              </p>
            </div>

            {/* Optimized */}
            <div className="glass rounded-lg p-4 border-2 border-success-200/30 dark:border-success-800/30 backdrop-blur-xl bg-gradient-to-br from-success-50/30 to-transparent dark:from-success-900/20 dark:to-transparent sm:p-5 md:p-6 md:rounded-xl">
              <div className="flex items-center gap-2 mb-3 sm:gap-3 sm:mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg sm:w-9 sm:h-9 md:w-10 md:h-10 md:rounded-xl">
                  <SparklesIcon className="w-5 h-5 text-white sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
                </div>
                <h3 className="text-base font-display font-bold text-light-text-primary dark:text-dark-text-primary sm:text-lg">
                  Ultra-Optimized
                </h3>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between">
                  <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Input Tokens:</span>
                  <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">{comparison.optimized.inputTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Output Tokens:</span>
                  <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">{comparison.optimized.outputTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Total Tokens:</span>
                  <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">{comparison.optimized.totalTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-primary-200/30 dark:border-primary-700/30">
                  <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Cost per Check:</span>
                  <span className="font-display font-bold gradient-text-success">
                    ${comparison.optimized.cost.toFixed(4)}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                {comparison.optimized.description}
              </p>
            </div>
          </div>

          {/* Savings Highlight */}
          <div className="glass rounded-lg p-4 border border-success-200/30 dark:border-success-800/30 backdrop-blur-xl bg-gradient-to-r from-success-50/30 to-primary-50/30 dark:from-success-900/20 dark:to-primary-900/20 sm:p-5 md:p-6 md:rounded-xl">
            <div className="flex items-center gap-2 mb-2 sm:gap-3 sm:mb-3">
              <ArrowTrendingDownIcon className="w-6 h-6 gradient-text-success sm:w-7 sm:h-7 md:w-8 md:h-8" />
              <h3 className="text-base font-display font-bold gradient-text-success sm:text-lg md:text-xl">
                {comparison.savings.tokenReduction.toFixed(1)}% Token Reduction
              </h3>
            </div>
            <div className="flex items-center gap-2 mb-2 sm:gap-3 sm:mb-3">
              <CurrencyDollarIcon className="w-6 h-6 gradient-text-success sm:w-7 sm:h-7 md:w-8 md:h-8" />
              <h3 className="text-base font-display font-bold gradient-text-success sm:text-lg md:text-xl">
                {comparison.savings.costReduction.toFixed(1)}% Gross Cost Reduction
              </h3>
            </div>
            {comparison.savings.netCostReduction !== undefined && (
              <div className="mt-4 pt-4 border-t border-success-200/30 dark:border-success-700/30">
                <div className="flex items-start gap-3">
                  <InformationCircleIcon className="w-6 h-6 text-accent-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-1">
                      Net Savings: {comparison.savings.netCostReduction.toFixed(1)}%
                    </div>
                    <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                      After accounting for processing costs
                      {comparison.savings.processingCost && (
                        <span className="ml-1 text-accent-600 dark:text-accent-400 font-semibold">
                          (${comparison.savings.processingCost.toFixed(4)} per check)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Projected Savings Calculator */}
          <div className="glass rounded-lg p-4 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent sm:p-5 md:p-6 md:rounded-xl">
            <h3 className="text-base font-display font-bold gradient-text-primary mb-3 sm:text-lg sm:mb-4">
              Projected Annual Savings
            </h3>
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2 sm:text-sm sm:mb-3">
                Monthly Requests
              </label>
              <input
                type="number"
                value={monthlyRequests}
                onChange={(e) => setMonthlyRequests(parseInt(e.target.value) || 0)}
                className="input"
                min="1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 sm:gap-3 sm:mb-4 md:grid-cols-4 md:gap-4">
              <div className="glass rounded-lg p-2 border border-danger-200/30 dark:border-danger-800/30 backdrop-blur-xl sm:p-3 md:p-4 md:rounded-xl">
                <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-0.5 sm:text-sm sm:mb-1">Traditional Annual</div>
                <div className="text-base font-display font-bold text-danger-600 dark:text-danger-400 sm:text-lg md:text-xl break-words">
                  ${annualTraditional.toFixed(2)}
                </div>
              </div>
              <div className="glass rounded-lg p-2 border border-success-200/30 dark:border-success-800/30 backdrop-blur-xl sm:p-3 md:p-4 md:rounded-xl">
                <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-0.5 sm:text-sm sm:mb-1">Optimized Annual</div>
                <div className="text-base font-display font-bold gradient-text-success sm:text-lg md:text-xl break-words">
                  ${annualOptimized.toFixed(2)}
                </div>
              </div>
              <div className="glass rounded-lg p-2 border border-accent-200/30 dark:border-accent-800/30 backdrop-blur-xl sm:p-3 md:p-4 md:rounded-xl">
                <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-0.5 sm:text-sm sm:mb-1">Processing Cost</div>
                <div className="text-base font-display font-bold text-accent-600 dark:text-accent-400 sm:text-lg md:text-xl break-words">
                  ${annualProcessingCost.toFixed(2)}
                </div>
              </div>
              <div className="glass rounded-lg p-2 border border-primary-200/30 backdrop-blur-xl sm:p-3 md:p-4 md:rounded-xl">
                <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-0.5 sm:text-sm sm:mb-1">Gross Savings</div>
                <div className="text-base font-display font-bold gradient-text-primary sm:text-lg md:text-xl break-words">
                  ${annualGrossSavings.toFixed(2)}
                </div>
              </div>
            </div>
            {processingCostPerCheck > 0 && (
              <div className="glass rounded-lg p-3 border-2 border-success-200/30 dark:border-success-800/30 backdrop-blur-xl bg-gradient-to-br from-success-50/20 to-transparent dark:from-success-900/10 dark:to-transparent sm:p-4 md:rounded-xl">
                <div className="flex flex-col gap-2 items-start justify-between sm:flex-row sm:items-center sm:gap-0">
                  <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                    Net Annual Savings (After Credits)
                  </div>
                  <div className="text-lg font-display font-bold gradient-text-success sm:text-xl md:text-2xl break-words">
                    ${annualNetSavings.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Optimization Breakdown */}
          <div className="glass rounded-lg p-4 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent sm:p-5 md:p-6 md:rounded-xl">
            <h3 className="text-base font-display font-bold gradient-text-primary mb-3 sm:text-lg sm:mb-4">
              Optimization Techniques
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col gap-2 items-start justify-between glass rounded-lg p-3 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent sm:flex-row sm:items-center sm:p-4 md:rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary sm:text-base">
                    Feature Extraction
                  </div>
                  <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                    {comparison.breakdown.featureExtraction.description}
                  </div>
                </div>
                <div className="text-lg font-display font-bold gradient-text-primary sm:text-xl md:text-2xl flex-shrink-0">
                  {comparison.breakdown.featureExtraction.reduction}%
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start justify-between glass rounded-lg p-3 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent sm:flex-row sm:items-center sm:p-4 md:rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary sm:text-base">
                    TOON Encoding
                  </div>
                  <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                    {comparison.breakdown.toonEncoding.description}
                  </div>
                </div>
                <div className="text-lg font-display font-bold gradient-text-primary sm:text-xl md:text-2xl flex-shrink-0">
                  {comparison.breakdown.toonEncoding.reduction}%
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start justify-between glass rounded-lg p-3 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent sm:flex-row sm:items-center sm:p-4 md:rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary sm:text-base">
                    Cortex Output
                  </div>
                  <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                    {comparison.breakdown.cortexOutput.description}
                  </div>
                </div>
                <div className="text-lg font-display font-bold gradient-text-primary sm:text-xl md:text-2xl flex-shrink-0">
                  {comparison.breakdown.cortexOutput.reduction}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
