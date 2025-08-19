import { useState } from 'react';
import { ChevronRightIcon, XMarkIcon, ClipboardIcon, CheckIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Usage } from '@/types';
import { Pagination } from '@/components/common/Pagination';
import {
  formatCurrency,
  formatNumber,
  formatDateTime,
  formatServiceName,
  formatPrompt,
  formatResponseTime,
  formatHttpStatusCode,
  formatErrorType,
  getStatusCodeColor,
  getErrorTypeColor
} from '@/utils/formatters';
import { AI_SERVICES } from '@/utils/constant';
import { WhatIfSimulationModal, HighCostSuggestions } from '../experimentation';

// Helper function to get project name
const getProjectName = (projectId: string | { _id: string; name: string } | undefined): string => {
  if (!projectId) return 'No Project';
  if (typeof projectId === 'string') return projectId;
  return projectId.name || 'Unknown Project';
};

interface UsageListProps {
  usage: Usage[];
  pagination: any;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export const UsageList = ({ usage, pagination, onPageChange, onRefresh }: UsageListProps) => {
  const [selectedUsage, setSelectedUsage] = useState<Usage | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [usageForSimulation, setUsageForSimulation] = useState<Usage | null>(null);

  const copyPromptToClipboard = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const handleSimulate = (usageItem: Usage) => {
    setUsageForSimulation(usageItem);
    setSimulationModalOpen(true);
  };

  if (usage.length === 0) {
    return (
      <div className="p-12 text-center card">
        <div className="mx-auto w-24 h-24 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          No usage data yet
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Start tracking your AI API usage to see it here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden card">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Usage History
            </h3>
            <button
              onClick={onRefresh}
              className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Service / Model
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Project
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Workflow
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Prompt
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Properties
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Token Breakdown
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Cost
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Time
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {usage.map((item) => {
                const service = AI_SERVICES[item.service as keyof typeof AI_SERVICES];

                return (
                  <tr
                    key={item._id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setSelectedUsage(item)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <div
                            className="flex justify-center items-center w-10 h-10 text-lg text-white rounded-lg"
                            style={{ backgroundColor: service?.color || '#999' }}
                          >
                            {service?.icon || '?'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatServiceName(item.service)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.model}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {getProjectName(item.projectId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.workflowId ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.workflowName || 'Unnamed Workflow'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.workflowStep && (
                              <span className="mr-2">{item.workflowStep}</span>
                            )}
                            {item.workflowSequence && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                #{item.workflowSequence}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 dark:text-gray-500">
                          No workflow
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs text-sm text-gray-900 truncate dark:text-white">
                        {formatPrompt(
                          item.prompt ||
                          item.metadata?.prompt ||
                          item.metadata?.messages?.[0]?.content ||
                          item.metadata?.input ||
                          '', 60
                        )}
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.metadata && Object.entries(item.metadata)
                          .filter(([key, value]) =>
                            key !== 'workspace' &&
                            key !== 'requestType' &&
                            key !== 'executionTime' &&
                            key !== 'contextFiles' &&
                            key !== 'generatedFiles' &&
                            key !== 'service' &&
                            key !== 'model' &&
                            key !== 'endpoint' &&
                            value !== null &&
                            value !== undefined &&
                            value !== ''
                          )
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <span
                              key={key}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              title={`${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`}
                            >
                              {key}: {typeof value === 'object' ?
                                (Array.isArray(value) ? value.slice(0, 2).join(', ') + (value.length > 2 ? '...' : '') :
                                  Object.keys(value).slice(0, 2).join(', ') + (Object.keys(value).length > 2 ? '...' : ''))
                                : (String(value).length > 8 ? String(value).substring(0, 8) + '...' : String(value))
                              }
                            </span>
                          ))
                        }
                        {item.metadata && Object.entries(item.metadata)
                          .filter(([key, value]) =>
                            key !== 'workspace' &&
                            key !== 'requestType' &&
                            key !== 'executionTime' &&
                            key !== 'contextFiles' &&
                            key !== 'generatedFiles' &&
                            key !== 'service' &&
                            key !== 'model' &&
                            key !== 'endpoint' &&
                            value !== null &&
                            value !== undefined &&
                            value !== ''
                          ).length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{Object.entries(item.metadata)
                                .filter(([key, value]) =>
                                  key !== 'workspace' &&
                                  key !== 'requestType' &&
                                  key !== 'executionTime' &&
                                  key !== 'contextFiles' &&
                                  key !== 'generatedFiles' &&
                                  key !== 'service' &&
                                  key !== 'model' &&
                                  key !== 'endpoint' &&
                                  value !== null &&
                                  value !== undefined &&
                                  value !== ''
                                ).length - 3}
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatNumber(item.totalTokens)}</span>
                          <span className="text-xs text-gray-500">total</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-1">
                        <div className="flex justify-between">
                          <span>Input:</span>
                          <span className="font-medium">{formatNumber(item.promptTokens || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Output:</span>
                          <span className="font-medium">{formatNumber(item.completionTokens || 0)}</span>
                        </div>
                        {item.responseTime && (
                          <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-600">
                            <span>Time:</span>
                            <span>{formatResponseTime(item.responseTime)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.cost)}
                      </div>
                      {item.optimizationApplied && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200">
                          Optimized
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {item.errorOccurred ? (
                          <>
                            {item.httpStatusCode && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                ${getStatusCodeColor(item.httpStatusCode) === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                  getStatusCodeColor(item.httpStatusCode) === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    getStatusCodeColor(item.httpStatusCode) === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}
                              `}>
                                {item.httpStatusCode}
                              </span>
                            )}
                            {item.errorType && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                ${getErrorTypeColor(item.errorType) === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                  getErrorTypeColor(item.errorType) === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                    getErrorTypeColor(item.errorType) === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                      getErrorTypeColor(item.errorType) === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}
                              `}>
                                {formatErrorType(item.errorType)}
                              </span>
                            )}
                            {!item.httpStatusCode && !item.errorType && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Error
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Success
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        {(item.cost > 0.01 || item.totalTokens > 500) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSimulate(item);
                            }}
                            className="text-purple-600 hover:text-purple-900"
                            title="Try What-If Simulation"
                          >
                            <BeakerIcon className="w-4 h-4" />
                          </button>
                        )}
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>

      {/* High Cost Suggestions */}
      <HighCostSuggestions
        usages={usage}
        onSimulate={handleSimulate}
        className="mb-6"
      />

      {/* Usage Details Modal */}
      {selectedUsage && (
        <div className="overflow-y-auto fixed inset-0 z-50">
          <div className="flex justify-center items-center px-4 pt-4 pb-20 min-h-screen text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedUsage(null)} />

            <div className="inline-block overflow-hidden p-6 my-8 w-full max-w-2xl text-left align-middle bg-white rounded-lg shadow-xl transition-all transform dark:bg-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Usage Details
                </h3>
                <button
                  onClick={() => setSelectedUsage(null)}
                  className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Service & Model */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div
                      className="flex justify-center items-center w-12 h-12 text-xl text-white rounded-lg"
                      style={{ backgroundColor: AI_SERVICES[selectedUsage.service as keyof typeof AI_SERVICES]?.color || '#999' }}
                    >
                      {AI_SERVICES[selectedUsage.service as keyof typeof AI_SERVICES]?.icon || '?'}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {formatServiceName(selectedUsage.service)}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedUsage.model}
                    </p>
                  </div>
                </div>

                {/* Workflow Information */}
                {selectedUsage.workflowId && (
                  <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                    <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Workflow Information
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Workflow Name</p>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          {selectedUsage.workflowName || 'Unnamed Workflow'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Workflow ID</p>
                        <p className="text-sm font-mono text-blue-900 dark:text-blue-100">
                          {selectedUsage.workflowId}
                        </p>
                      </div>
                      {selectedUsage.workflowStep && (
                        <div>
                          <p className="text-xs text-blue-700 dark:text-blue-300">Step</p>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            {selectedUsage.workflowStep}
                          </p>
                        </div>
                      )}
                      {selectedUsage.workflowSequence && (
                        <div>
                          <p className="text-xs text-blue-700 dark:text-blue-300">Sequence</p>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            #{selectedUsage.workflowSequence}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Prompt */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                      Prompt
                    </h5>
                    <button
                      onClick={() => copyPromptToClipboard(selectedUsage.prompt)}
                      className="flex items-center px-2 py-1 space-x-1 text-xs text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      title="Copy prompt to clipboard"
                    >
                      {copiedPrompt ? (
                        <>
                          <CheckIcon className="w-4 h-4 text-green-500" />
                          <span className="text-green-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <ClipboardIcon className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap dark:text-white">
                      {selectedUsage.prompt ||
                        selectedUsage.metadata?.prompt ||
                        selectedUsage.metadata?.messages?.[0]?.content ||
                        selectedUsage.metadata?.input ||
                        'No prompt available'}
                    </p>
                  </div>
                </div>

                {/* Completion */}
                {selectedUsage.completion && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        Completion
                      </h5>
                      <button
                        onClick={() => copyPromptToClipboard(selectedUsage.completion || '')}
                        className="flex items-center px-2 py-1 space-x-1 text-xs text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="Copy completion to clipboard"
                      >
                        <ClipboardIcon className="w-4 h-4" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap dark:text-white">
                        {selectedUsage.completion}
                      </p>
                    </div>
                  </div>
                )}

                {/* Custom Properties */}
                {selectedUsage.metadata && Object.keys(selectedUsage.metadata).length > 0 && (
                  <div>
                    <h5 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Custom Properties
                    </h5>
                    <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                      <div className="space-y-2">
                        {Object.entries(selectedUsage.metadata)
                          .filter(([key, value]) =>
                            key !== 'workspace' &&
                            key !== 'requestType' &&
                            key !== 'executionTime' &&
                            key !== 'contextFiles' &&
                            key !== 'generatedFiles' &&
                            key !== 'service' &&
                            key !== 'model' &&
                            key !== 'endpoint' &&
                            value !== null &&
                            value !== undefined &&
                            value !== '' &&
                            // Filter out empty arrays and objects
                            !(Array.isArray(value) && value.length === 0) &&
                            !(typeof value === 'object' && Object.keys(value).length === 0)
                          )
                          .map(([key, value]) => {
                            // Pre-calculate the display value to filter out empty results
                            let displayValue = null;
                            if (value === null || value === undefined) displayValue = 'N/A';
                            else if (typeof value === 'string') displayValue = value;
                            else if (typeof value === 'number' || typeof value === 'boolean') displayValue = String(value);
                            else if (Array.isArray(value)) {
                              displayValue = value.length > 0 ? value.join(', ') : null;
                            }
                            else if (typeof value === 'object') {
                              const entries = Object.entries(value);
                              if (entries.length === 0) displayValue = null;
                              else {
                                const formatted = entries.map(([k, v]) => {
                                  if (Array.isArray(v)) {
                                    return v.length > 0 ? `${k}: ${v.join(', ')}` : null;
                                  } else if (typeof v === 'object' && v !== null) {
                                    const subEntries = Object.entries(v);
                                    if (subEntries.length === 0) return null;
                                    const subDisplay = subEntries.map(([sk, sv]) => `${sk}: ${sv}`).join(', ');
                                    return `${k}: {${subDisplay}}`;
                                  } else {
                                    return `${k}: ${String(v)}`;
                                  }
                                }).filter(Boolean);
                                displayValue = formatted.length > 0 ? formatted.join(', ') : null;
                              }
                            }
                            else displayValue = String(value);

                            return displayValue ? { key, value, displayValue } : null;
                          })
                          .filter(Boolean)
                          .map((item: any) => (
                            <div key={item.key} className="flex justify-between items-start">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {item.key}:
                              </span>
                              <span className="text-sm text-gray-900 dark:text-white max-w-xs text-right">
                                {item.displayValue}
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                    <h6 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Total Tokens
                    </h6>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {formatNumber(selectedUsage.totalTokens)}
                    </p>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(selectedUsage.promptTokens)} prompt + {formatNumber(selectedUsage.completionTokens)} completion
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                    <h6 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Cost
                    </h6>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(selectedUsage.cost)}
                    </p>
                    {selectedUsage.optimizationApplied && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200 mt-1">
                        Optimized
                      </span>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                    <h6 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Response Time
                    </h6>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {formatResponseTime(selectedUsage.responseTime)}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                    <h6 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Created At
                    </h6>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDateTime(selectedUsage.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {selectedUsage.tags && selectedUsage.tags.length > 0 && (
                  <div>
                    <h5 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Tags
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedUsage.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error Details */}
                {selectedUsage.errorOccurred && (
                  <div className="p-4 bg-red-50 rounded-lg dark:bg-red-900/20">
                    <h5 className="text-sm font-medium text-red-900 dark:text-red-100 mb-3">
                      Error Details
                    </h5>
                    <div className="space-y-3">
                      {selectedUsage.httpStatusCode && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-red-700 dark:text-red-300">HTTP Status:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                            ${getStatusCodeColor(selectedUsage.httpStatusCode) === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200' :
                              getStatusCodeColor(selectedUsage.httpStatusCode) === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}
                          `}>
                            {formatHttpStatusCode(selectedUsage.httpStatusCode)}
                          </span>
                        </div>
                      )}
                      {selectedUsage.errorType && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-red-700 dark:text-red-300">Error Type:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                            ${getErrorTypeColor(selectedUsage.errorType) === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200' :
                              getErrorTypeColor(selectedUsage.errorType) === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200' :
                                getErrorTypeColor(selectedUsage.errorType) === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}
                          `}>
                            {formatErrorType(selectedUsage.errorType)}
                          </span>
                        </div>
                      )}
                      {selectedUsage.errorMessage && (
                        <div>
                          <span className="text-sm text-red-700 dark:text-red-300">Error Message:</span>
                          <p className="text-sm text-red-900 dark:text-red-100 mt-1 p-2 bg-red-100 dark:bg-red-900/30 rounded">
                            {selectedUsage.errorMessage}
                          </p>
                        </div>
                      )}
                      {selectedUsage.errorDetails && Object.keys(selectedUsage.errorDetails).length > 0 && (
                        <div>
                          <span className="text-sm text-red-700 dark:text-red-300">Additional Details:</span>
                          <div className="mt-1 space-y-1">
                            {Object.entries(selectedUsage.errorDetails)
                              .filter(([_, value]) => value !== null && value !== undefined && value !== '')
                              .map(([key, value]) => (
                                <div key={key} className="flex justify-between items-start text-xs">
                                  <span className="text-red-600 dark:text-red-400 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                                  </span>
                                  <span className="text-red-900 dark:text-red-100 max-w-xs text-right">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Indicators */}
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${selectedUsage.errorOccurred ? 'bg-red-500' : 'bg-green-500'}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedUsage.errorOccurred ? 'Error Occurred' : 'Successful'}
                    </span>
                  </div>
                  {selectedUsage.optimizationApplied && (
                    <div className="flex items-center">
                      <div className="mr-2 w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Optimization Applied
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* What-If Simulation Modal */}
      <WhatIfSimulationModal
        isOpen={simulationModalOpen}
        onClose={() => {
          setSimulationModalOpen(false);
          setUsageForSimulation(null);
        }}
        usage={usageForSimulation}
      />
    </>
  );
};