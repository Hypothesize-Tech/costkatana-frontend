import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  PresentationChartLineIcon
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

  const annualSavings = (comparison.traditional.cost - comparison.optimized.cost) * monthlyRequests * 12;
  const annualTraditional = comparison.traditional.cost * monthlyRequests * 12;
  const annualOptimized = comparison.optimized.cost * monthlyRequests * 12;

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="bg-gradient-primary/10 p-8 rounded-t-xl border-b border-primary-200/30">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <PresentationChartLineIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-display font-bold gradient-text-primary">
                Cost Optimization Dashboard
              </h2>
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-lg mt-1">
                Compare traditional vs ultra-optimized visual compliance costs
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Side-by-side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional */}
            <div className="glass rounded-xl p-6 border-2 border-danger-200/30 dark:border-danger-800/30 backdrop-blur-xl bg-gradient-to-br from-danger-50/30 to-transparent dark:from-danger-900/20 dark:to-transparent">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-danger flex items-center justify-center shadow-lg">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                  Traditional Approach
                </h3>
              </div>
              <div className="space-y-2">
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
            <div className="glass rounded-xl p-6 border-2 border-success-200/30 dark:border-success-800/30 backdrop-blur-xl bg-gradient-to-br from-success-50/30 to-transparent dark:from-success-900/20 dark:to-transparent">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                  Ultra-Optimized
                </h3>
              </div>
              <div className="space-y-2">
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
          <div className="glass rounded-xl p-6 border border-success-200/30 dark:border-success-800/30 backdrop-blur-xl bg-gradient-to-r from-success-50/30 to-primary-50/30 dark:from-success-900/20 dark:to-primary-900/20">
            <div className="flex items-center gap-3 mb-3">
              <ArrowTrendingDownIcon className="w-8 h-8 gradient-text-success" />
              <h3 className="text-xl font-display font-bold gradient-text-success">
                {comparison.savings.tokenReduction.toFixed(1)}% Token Reduction
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <CurrencyDollarIcon className="w-8 h-8 gradient-text-success" />
              <h3 className="text-xl font-display font-bold gradient-text-success">
                {comparison.savings.costReduction.toFixed(1)}% Cost Reduction
              </h3>
            </div>
          </div>

          {/* Projected Savings Calculator */}
          <div className="glass rounded-xl p-6 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent">
            <h3 className="text-lg font-display font-bold gradient-text-primary mb-4">
              Projected Annual Savings
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
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
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-xl p-4 border border-danger-200/30 dark:border-danger-800/30 backdrop-blur-xl">
                <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Traditional Annual</div>
                <div className="text-xl font-display font-bold text-danger-600 dark:text-danger-400">
                  ${annualTraditional.toFixed(2)}
                </div>
              </div>
              <div className="glass rounded-xl p-4 border border-success-200/30 dark:border-success-800/30 backdrop-blur-xl">
                <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Optimized Annual</div>
                <div className="text-xl font-display font-bold gradient-text-success">
                  ${annualOptimized.toFixed(2)}
                </div>
              </div>
              <div className="glass rounded-xl p-4 border border-primary-200/30 backdrop-blur-xl">
                <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Annual Savings</div>
                <div className="text-xl font-display font-bold gradient-text-primary">
                  ${annualSavings.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Optimization Breakdown */}
          <div className="glass rounded-xl p-6 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent">
            <h3 className="text-lg font-display font-bold gradient-text-primary mb-4">
              Optimization Techniques
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between glass rounded-xl p-4 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent">
                <div>
                  <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Feature Extraction
                  </div>
                  <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                    {comparison.breakdown.featureExtraction.description}
                  </div>
                </div>
                <div className="text-2xl font-display font-bold gradient-text-primary">
                  {comparison.breakdown.featureExtraction.reduction}%
                </div>
              </div>
              <div className="flex items-center justify-between glass rounded-xl p-4 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent">
                <div>
                  <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                    TOON Encoding
                  </div>
                  <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                    {comparison.breakdown.toonEncoding.description}
                  </div>
                </div>
                <div className="text-2xl font-display font-bold gradient-text-primary">
                  {comparison.breakdown.toonEncoding.reduction}%
                </div>
              </div>
              <div className="flex items-center justify-between glass rounded-xl p-4 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent">
                <div>
                  <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Cortex Output
                  </div>
                  <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                    {comparison.breakdown.cortexOutput.description}
                  </div>
                </div>
                <div className="text-2xl font-display font-bold gradient-text-primary">
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
