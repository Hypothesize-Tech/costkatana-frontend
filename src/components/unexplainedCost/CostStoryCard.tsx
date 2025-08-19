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
    if (percentage <= 5) return 'text-green-600';
    if (percentage <= 20) return 'text-yellow-600';
    if (percentage <= 50) return 'text-orange-600';
    return 'text-red-600';
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
    <div className="p-6 bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Cost Story</h2>
          <p className="mt-1 text-gray-600">Why your costs changed on {report.date}</p>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(report.total_cost)}
          </div>
          <div className={`text-lg font-semibold ${getCostChangeColor(report.cost_increase_percentage)}`}>
            {getCostChangeIcon(report.cost_increase_percentage)} {formatPercentage(report.cost_increase_percentage)}
          </div>
          <div className="text-sm text-gray-500">vs. baseline</div>
        </div>
      </div>

      {/* Cost Story */}
      <div className="p-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="mb-2 text-lg font-semibold text-blue-900">Cost Explanation</h3>
            <div className="prose prose-sm max-w-none text-blue-800">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h4: ({children}) => <h4 className="text-lg font-semibold mt-4 mb-2 text-blue-900">{children}</h4>,
                  strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                  li: ({children}) => <li className="ml-4 mb-1">{children}</li>,
                  p: ({children}) => <p className="mb-2 leading-relaxed">{children}</p>
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
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Cost Drivers</h3>
          <div className="space-y-3">
            {report.top_cost_drivers.map((driver, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="mr-3 w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {driver.driver_type.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-600">{driver.explanation}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(driver.cost_impact)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {driver.percentage_of_total.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Summary */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Cost Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Total Cost</span>
              <span className="font-semibold text-gray-900">{formatCurrency(report.total_cost)}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Baseline Cost</span>
              <span className="font-semibold text-gray-900">{formatCurrency(report.baseline_cost)}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Cost Increase</span>
              <span className={`font-semibold ${getCostChangeColor(report.cost_increase_percentage)}`}>
                {formatCurrency(report.cost_increase)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Percentage Change</span>
              <span className={`font-semibold ${getCostChangeColor(report.cost_increase_percentage)}`}>
                {formatPercentage(report.cost_increase_percentage)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-6 mt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md border border-transparent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            {showDetailedAnalysis ? 'Hide' : 'View'} Detailed Analysis
          </button>
          
          <button 
            onClick={handleExportReport}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Export Report
          </button>
          
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Detailed Cost Analysis for {report.date}</h3>
              <button 
                onClick={() => setShowDetailedAnalysis(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Cost Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <span className="font-semibold">{formatCurrency(report.total_cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Baseline Cost:</span>
                      <span className="font-semibold">{formatCurrency(report.baseline_cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost Increase:</span>
                      <span className="font-semibold">{formatCurrency(report.cost_increase)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Percentage Change:</span>
                      <span className="font-semibold">{formatPercentage(report.cost_increase_percentage)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Top Cost Drivers</h4>
                  <div className="space-y-2 text-sm">
                    {report.top_cost_drivers.map((driver, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="capitalize">{driver.driver_type.replace('_', ' ')}:</span>
                        <span className="font-semibold">{formatCurrency(driver.cost_impact)} ({driver.percentage_of_total.toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Full Cost Story</h4>
                <div className="prose prose-sm max-w-none">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Cost Analysis Help</h3>
              <button 
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Understanding Your Cost Story</h4>
                <p className="text-gray-600 mb-2">
                  The Daily Cost Story explains why your AI costs changed compared to your baseline. 
                  It analyzes cost drivers and provides actionable insights.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Cost Drivers Explained</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li><strong>System Prompt:</strong> Initial instructions given to AI models</li>
                  <li><strong>Tool Calls:</strong> External API calls and function executions</li>
                  <li><strong>Context Window:</strong> Amount of information processed by AI</li>
                  <li><strong>Retries:</strong> Failed request attempts and error handling</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">How to Use This Information</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Review cost drivers to identify optimization opportunities</li>
                  <li>Compare current costs with baseline to understand trends</li>
                  <li>Export data for further analysis and reporting</li>
                  <li>Use insights to adjust AI usage patterns</li>
                </ul>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
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



