import React, { useState, useEffect } from 'react';
import { WorkflowService, WorkflowSummary, WorkflowAnalytics } from '../../services/workflow.service';

interface WorkflowDashboardProps {
  className?: string;
}

export const WorkflowDashboard: React.FC<WorkflowDashboardProps> = ({ className = '' }) => {
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [analytics, setAnalytics] = useState<WorkflowAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [workflowsResult, analyticsResult] = await Promise.all([
        WorkflowService.getUserWorkflows({ limit: 50 }),
        WorkflowService.getWorkflowAnalytics()
      ]);

      if (workflowsResult.success) {
        setWorkflows(workflowsResult.data);
      } else {
        setError('Failed to load workflows');
      }

      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data);
      }
    } catch (err) {
      setError('Failed to load workflow data');
      console.error('Error loading workflow data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflowExpansion = (workflowId: string) => {
    setExpandedWorkflow(expandedWorkflow === workflowId ? null : workflowId);
  };

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
        <div className="bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} text-center py-12`}>
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Workflows</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className={`${className} text-center py-12`}>
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Workflows Found</h3>
        <p className="text-gray-600 mb-4">
          Start using workflow headers in your API requests to see workflow analytics here.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg text-left max-w-md mx-auto">
          <h4 className="font-medium text-blue-900 mb-2">Quick Start:</h4>
          <p className="text-sm text-blue-800 mb-2">Add these headers to your API requests:</p>
          <code className="text-xs bg-blue-100 p-2 rounded block">
            CostKatana-Workflow-Id: your-workflow-id<br />
            CostKatana-Workflow-Name: WorkflowName<br />
            CostKatana-Workflow-Step: /step-name
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Workflows</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalWorkflows}</p>
              </div>
              <div className="text-blue-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  {WorkflowService.formatCurrency(analytics.totalCost)}
                </p>
              </div>
              <div className="text-green-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Workflow Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  {WorkflowService.formatCurrency(analytics.averageWorkflowCost)}
                </p>
              </div>
              <div className="text-purple-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflows List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Workflows</h2>
          <p className="text-sm text-gray-600">Click on a workflow to see detailed step breakdown</p>
        </div>

        <div className="divide-y divide-gray-200">
          {workflows.map((workflow) => {
            const isExpanded = expandedWorkflow === workflow.workflowId;
            const efficiency = WorkflowService.calculateEfficiencyMetrics(workflow);

            return (
              <div key={workflow.workflowId} className="hover:bg-gray-50">
                <div
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => toggleWorkflowExpansion(workflow.workflowId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {workflow.workflowName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {workflow.workflowId}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${efficiency.efficiency === 'High' ? 'bg-green-100 text-green-800' :
                          efficiency.efficiency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {efficiency.efficiency} Efficiency
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>{workflow.requestCount} steps</span>
                        <span>{WorkflowService.formatCurrency(workflow.totalCost)}</span>
                        <span>{workflow.totalTokens.toLocaleString()} tokens</span>
                        <span>{WorkflowService.formatDuration(workflow.duration)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">
                        {new Date(workflow.endTime).toLocaleDateString()}
                      </span>
                      <svg
                        className={`h-5 w-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''
                          }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Step Details */}
                {isExpanded && (
                  <div className="px-6 pb-4 bg-gray-50">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Workflow Steps</h4>
                      {workflow.steps.map((step, index) => (
                        <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                          <div className="flex items-center space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                              {step.sequence || index + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {WorkflowService.formatStepPath(step.step)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {step.service} • {step.model}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {WorkflowService.formatCurrency(step.cost)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {step.tokens.toLocaleString()} tokens • {step.responseTime}ms
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Workflow Types */}
      {analytics && analytics.topWorkflowTypes.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Top Workflow Types</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.topWorkflowTypes.slice(0, 5).map((workflowType, index) => (
                <div key={workflowType.workflowName} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{workflowType.workflowName}</p>
                      <p className="text-xs text-gray-500">{workflowType.count} workflows</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {WorkflowService.formatCurrency(workflowType.totalCost)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Avg: {WorkflowService.formatCurrency(workflowType.averageCost)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};