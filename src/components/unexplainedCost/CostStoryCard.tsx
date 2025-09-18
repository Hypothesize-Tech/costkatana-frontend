import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DailyCostReport } from '../../services/unexplainedCost.service';

interface CostStoryCardProps {
  report: DailyCostReport;
}

export const CostStoryCard: React.FC<CostStoryCardProps> = ({ report }) => {
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  const getCostChangeColor = (percentage: number) => {
    if (percentage <= 5) return 'text-success-600 dark:text-success-400';
    if (percentage <= 20) return 'text-warning-600 dark:text-warning-400';
    if (percentage <= 50) return 'text-secondary-600 dark:text-secondary-400';
    return 'text-danger-600 dark:text-danger-400';
  };

  const getCostChangeIcon = (percentage: number) => {
    if (percentage <= 0) return '📉';
    if (percentage <= 5) return '📊';
    if (percentage <= 20) return '⚠️';
    if (percentage <= 50) return '🚨';
    return '💥';
  };

  const handleExportReport = () => {
    const csvContent = `data:text/csv;charset=utf-8,Date,Total Cost,Baseline Cost,Cost Increase,Percentage Change\n${report.date},${report.total_cost},${report.baseline_cost},${report.cost_increase},${report.cost_increase_percentage}%\n\nCost Drivers,Cost Impact,Percentage\n${report.top_cost_drivers.map(d => `${d.driver_type.replace('_', ' ')},${d.cost_impact},${d.percentage_of_total}%`).join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cost-report-${report.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold gradient-text-primary">Daily Cost Story</h2>
          <p className="mt-1 text-secondary-600 dark:text-secondary-300">Why your costs changed on {report.date}</p>
        </div>

        <div className="text-right">
          <div className="text-3xl font-display font-bold gradient-text-primary">
            {formatCurrency(report.total_cost)}
          </div>
          <div className={`text-lg font-display font-bold ${getCostChangeColor(report.cost_increase_percentage)}`}>
            {getCostChangeIcon(report.cost_increase_percentage)} {formatPercentage(report.cost_increase_percentage)}
          </div>
          <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">vs. baseline</div>
        </div>
      </div>

      {/* Cost Story */}
      <div className="p-4 mb-6 glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-r from-primary-50/50 to-highlight-50/50 dark:from-primary-900/20 dark:to-highlight-900/20">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="mb-2 text-lg font-display font-bold text-primary-900 dark:text-primary-300">Cost Explanation</h3>
            <div className="prose prose-sm max-w-none text-primary-800 dark:text-primary-300">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h4: ({ children }) => <h4 className="text-lg font-display font-bold mt-4 mb-2 text-primary-900 dark:text-primary-300">{children}</h4>,
                  strong: ({ children }) => <strong className="font-display font-bold">{children}</strong>,
                  li: ({ children }) => <li className="ml-4 mb-1">{children}</li>,
                  p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>
                }}
              >
                {report.cost_story}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Top Cost Drivers */}
        <div>
          <h3 className="mb-4 text-lg font-display font-bold gradient-text-primary">Top Cost Drivers</h3>
          <div className="space-y-3">
            {report.top_cost_drivers.map((driver, index) => (
              <div key={index} className="flex justify-between items-center p-3 glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex items-center">
                  <div className="mr-3 w-3 h-3 bg-gradient-primary rounded-full glow-primary"></div>
                  <div>
                    <div className="font-display font-medium gradient-text-primary capitalize">
                      {driver.driver_type.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{driver.explanation}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold gradient-text-primary">
                    {formatCurrency(driver.cost_impact)}
                  </div>
                  <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                    {driver.percentage_of_total.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Summary */}
        <div>
          <h3 className="mb-4 text-lg font-display font-bold gradient-text-primary">Cost Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <span className="text-light-text-secondary dark:text-dark-text-secondary">Total Cost</span>
              <span className="font-display font-bold gradient-text-primary">{formatCurrency(report.total_cost)}</span>
            </div>

            <div className="flex justify-between items-center p-3 glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <span className="text-light-text-secondary dark:text-dark-text-secondary">Baseline Cost</span>
              <span className="font-display font-bold gradient-text-primary">{formatCurrency(report.baseline_cost)}</span>
            </div>

            <div className="flex justify-between items-center p-3 glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <span className="text-light-text-secondary dark:text-dark-text-secondary">Cost Increase</span>
              <span className={`font-display font-bold ${getCostChangeColor(report.cost_increase_percentage)}`}>
                {formatCurrency(report.cost_increase)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <span className="text-light-text-secondary dark:text-dark-text-secondary">Percentage Change</span>
              <span className={`font-display font-bold ${getCostChangeColor(report.cost_increase_percentage)}`}>
                {formatPercentage(report.cost_increase_percentage)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-6 mt-6 border-t border-primary-200/30">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
            className="btn-primary inline-flex items-center"
          >
            <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            {showDetailedAnalysis ? 'Hide' : 'View'} Detailed Analysis
          </button>

          <button
            onClick={handleExportReport}
            className="btn-secondary inline-flex items-center"
          >
            <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Export Report
          </button>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="btn-secondary inline-flex items-center"
          >
            <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {showHelp ? 'Hide' : 'Get'} Help
          </button>
        </div>
      </div>

      {/* Detailed Analysis Modal */}
      {showDetailedAnalysis && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl p-6 max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-display font-bold gradient-text-primary">Detailed Cost Analysis for {report.date}</h3>
              <button
                onClick={() => setShowDetailedAnalysis(false)}
                className="btn-icon-secondary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20">
                  <h4 className="font-display font-bold text-primary-900 dark:text-primary-300 mb-2">Cost Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-light-text-secondary dark:text-dark-text-secondary">Total Cost:</span>
                      <span className="font-display font-bold gradient-text-primary">{formatCurrency(report.total_cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-light-text-secondary dark:text-dark-text-secondary">Baseline Cost:</span>
                      <span className="font-display font-bold gradient-text-primary">{formatCurrency(report.baseline_cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-light-text-secondary dark:text-dark-text-secondary">Cost Increase:</span>
                      <span className="font-display font-bold gradient-text-primary">{formatCurrency(report.cost_increase)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-light-text-secondary dark:text-dark-text-secondary">Percentage Change:</span>
                      <span className="font-display font-bold gradient-text-primary">{formatPercentage(report.cost_increase_percentage)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 glass rounded-lg border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-success-50/50 to-success-100/50 dark:from-success-900/20 dark:to-success-800/20">
                  <h4 className="font-display font-bold text-success-900 dark:text-success-300 mb-2">Top Cost Drivers</h4>
                  <div className="space-y-2 text-sm">
                    {report.top_cost_drivers.map((driver, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="capitalize text-light-text-secondary dark:text-dark-text-secondary">{driver.driver_type.replace('_', ' ')}:</span>
                        <span className="font-display font-bold text-success-800 dark:text-success-300">{formatCurrency(driver.cost_impact)} ({driver.percentage_of_total.toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <h4 className="font-display font-bold gradient-text-primary mb-2">Full Cost Story</h4>
                <div className="prose prose-sm max-w-none text-light-text-primary dark:text-dark-text-primary">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {report.cost_story}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-display font-bold gradient-text-primary">Cost Analysis Help</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="btn-icon-secondary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-display font-bold gradient-text-primary mb-2">Understanding Your Cost Story</h4>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  The Daily Cost Story explains why your AI costs changed compared to your baseline.
                  It analyzes cost drivers and provides actionable insights.
                </p>
              </div>

              <div>
                <h4 className="font-display font-bold gradient-text-primary mb-2">Cost Drivers Explained</h4>
                <ul className="list-disc list-inside space-y-1 text-light-text-secondary dark:text-dark-text-secondary">
                  <li><strong>System Prompt:</strong> Initial instructions given to AI models</li>
                  <li><strong>Tool Calls:</strong> External API calls and function executions</li>
                  <li><strong>Context Window:</strong> Amount of information processed by AI</li>
                  <li><strong>Retries:</strong> Failed request attempts and error handling</li>
                </ul>
              </div>

              <div>
                <h4 className="font-display font-bold gradient-text-primary mb-2">How to Use This Information</h4>
                <ul className="list-disc list-inside space-y-1 text-light-text-secondary dark:text-dark-text-secondary">
                  <li>Review cost drivers to identify optimization opportunities</li>
                  <li>Compare current costs with baseline to understand trends</li>
                  <li>Export data for further analysis and reporting</li>
                  <li>Use insights to adjust AI usage patterns</li>
                </ul>
              </div>

              <div className="p-3 glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20">
                <p className="text-primary-800 dark:text-primary-300 text-sm">
                  <strong>Need more help?</strong> Contact our support team for personalized assistance
                  with cost optimization strategies.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



