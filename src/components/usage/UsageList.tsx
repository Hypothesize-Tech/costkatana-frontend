import { useState } from 'react';
import { XMarkIcon, ClipboardIcon, CheckIcon, BeakerIcon, ChevronRightIcon, EyeIcon } from '@heroicons/react/24/outline';
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
import { WhatIfSimulationModal, HighCostSuggestions } from '../experimentation';
import { ServiceIcon } from '../common/ServiceIcon';
import { DetailBreakdownModal } from './DetailBreakdownModal';

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
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [usageForDetails, setUsageForDetails] = useState<Usage | null>(null);

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
      <div className="p-12 text-center rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="mx-auto w-24 h-24 text-secondary-500 dark:text-secondary-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold font-display gradient-text-primary">
          No usage data yet
        </h3>
        <p className="mt-2 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
          Start tracking your AI API usage to see it here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="px-6 py-3 border-b border-primary-200/30 dark:border-primary-700/30">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold text-secondary-900 dark:text-white">
              API Usage
            </h3>
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg border transition-all duration-300 border-primary-200/30 dark:border-primary-700/30 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white hover:border-primary-300/50 dark:hover:border-primary-600/50 hover:scale-105 active:scale-95"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary-200/30">
            <thead className="bg-gradient-to-r glass from-primary-50/30 to-secondary-50/30 dark:from-primary-900/20 dark:to-secondary-900/20">
              <tr>
                <th className="px-6 py-4 text-xs font-medium font-display tracking-wider text-left uppercase text-light-text-secondary dark:text-dark-text-secondary">
                  Service / Model
                </th>
                <th className="px-6 py-4 text-xs font-medium font-display tracking-wider text-left uppercase text-light-text-secondary dark:text-dark-text-secondary">
                  Project
                </th>
                <th className="px-6 py-4 text-xs font-medium font-display tracking-wider text-left uppercase text-light-text-secondary dark:text-dark-text-secondary">
                  Trace
                </th>
                <th className="px-6 py-4 text-xs font-medium font-display tracking-wider text-left uppercase text-light-text-secondary dark:text-dark-text-secondary">
                  Email Information
                </th>
                <th className="px-6 py-4 text-xs font-medium font-display tracking-wider text-left uppercase text-light-text-secondary dark:text-dark-text-secondary">
                  Request/Response
                </th>
                <th className="px-6 py-4 text-xs font-medium font-display tracking-wider text-left uppercase text-light-text-secondary dark:text-dark-text-secondary">
                  Properties
                </th>
                <th className="px-6 py-4 text-xs font-medium font-display tracking-wider text-left uppercase text-light-text-secondary dark:text-dark-text-secondary">
                  Token Breakdown
                </th>
                <th className="px-6 py-4 text-xs font-medium font-display tracking-wider text-left uppercase text-light-text-secondary dark:text-dark-text-secondary">
                  Cost
                </th>
                <th className="px-6 py-4 text-xs font-medium font-display tracking-wider text-left uppercase text-light-text-secondary dark:text-dark-text-secondary">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-medium font-display tracking-wider text-left uppercase text-light-text-secondary dark:text-dark-text-secondary">
                  Time
                </th>
                <th className="px-6 py-4 text-xs font-medium font-display tracking-wider text-right uppercase text-secondary-600 dark:text-secondary-400">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-200/30 dark:divide-primary-700/30">
              {usage.map((item) => {
                return (
                  <tr
                    key={item._id}
                    className="transition-all duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-primary-50/30 hover:to-secondary-50/30 dark:hover:from-primary-900/20 dark:hover:to-secondary-900/20 glass"
                    onClick={() => setSelectedUsage(item)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ServiceIcon service={item.service} size="md" className="shadow-lg" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                            {formatServiceName(item.service)}
                          </div>
                          <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                            {item.model}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">
                        {getProjectName(item.projectId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(item.traceId ?? item.workflowId) ? (
                        <div>
                          <div className="text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                            {item.traceName ?? item.workflowName ?? 'Unnamed Trace'}
                          </div>
                          <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            {(item.traceStep ?? item.workflowStep) && (
                              <span className="mr-2">{item.traceStep ?? item.workflowStep}</span>
                            )}
                            {(item.traceSequence ?? item.workflowSequence) != null && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium font-display text-primary-600 bg-gradient-to-r rounded-xl border glass border-primary-300/30 from-primary-400/20 to-primary-500/20 dark:text-primary-400">
                                #{item.traceSequence ?? item.workflowSequence}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                          No trace
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(item.userEmail || item.customerEmail) ? (
                        <div className="space-y-1">
                          {item.userEmail && (
                            <div className="text-xs">
                              <span className="font-medium font-display text-light-text-primary dark:text-dark-text-primary">User:</span>
                              <span className="block ml-1 font-body text-light-text-secondary truncate dark:text-dark-text-secondary max-w-32" title={item.userEmail}>
                                {item.userEmail}
                              </span>
                            </div>
                          )}
                          {item.customerEmail && (
                            <div className="text-xs">
                              <span className="font-medium font-display text-light-text-primary dark:text-dark-text-primary">Customer:</span>
                              <span className="block ml-1 font-body text-light-text-secondary truncate dark:text-dark-text-secondary max-w-32" title={item.customerEmail}>
                                {item.customerEmail}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                          No email data
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs text-sm font-body text-light-text-primary dark:text-dark-text-primary">
                        {/* Enhanced prompt display with request/response content */}
                        <div className="space-y-2">
                          {/* Request/Prompt Section */}
                          <div>
                            <div className="mb-1 text-xs font-medium font-display text-light-text-secondary dark:text-dark-text-secondary">
                              Request:
                            </div>
                            <div className="text-sm font-body">
                              {formatPrompt(
                                item.prompt ||
                                item.metadata?.prompt ||
                                item.metadata?.messages?.[0]?.content ||
                                item.metadata?.input ||
                                '', 80
                              )}
                            </div>
                          </div>

                          {/* Response/Completion Section */}
                          {item.completion && (
                            <div>
                              <div className="mb-1 text-xs font-medium font-display text-light-text-secondary dark:text-dark-text-secondary">
                                Response:
                              </div>
                              <div className="text-sm font-body">
                                {formatPrompt(item.completion, 80)}
                              </div>
                            </div>
                          )}

                          {/* Messages Section for Chat Models */}
                          {item.metadata?.messages && Array.isArray(item.metadata.messages) && item.metadata.messages.length > 0 && (
                            <div>
                              <div className="mb-1 text-xs font-medium font-display text-light-text-secondary dark:text-dark-text-secondary">
                                Messages:
                              </div>
                              <div className="space-y-1">
                                {item.metadata.messages.slice(0, 3).map((msg: any, idx: number) => (
                                  <div key={idx} className="text-xs font-body">
                                    <span className="font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                      {msg.role || 'user'}:
                                    </span>
                                    <span className="ml-1">
                                      {formatPrompt(msg.content || '', 60)}
                                    </span>
                                  </div>
                                ))}
                                {item.metadata.messages.length > 3 && (
                                  <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                                    +{item.metadata.messages.length - 3} more messages
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* System Message */}
                          {item.metadata?.system && (
                            <div>
                              <div className="mb-1 text-xs font-medium font-display text-light-text-secondary dark:text-dark-text-secondary">
                                System:
                              </div>
                              <div className="text-sm font-body">
                                {formatPrompt(item.metadata.system, 80)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tags section */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-display glass border border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel text-light-text-primary dark:text-dark-text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
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
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-display glass border border-primary-200/30 dark:border-primary-700/30 bg-gradient-primary/20 dark:bg-gradient-primary/10 text-primary-700 dark:text-primary-300"
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
                            <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
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
                      <div className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">
                        <div className="flex gap-2 items-center">
                          <span className="font-medium font-display">{formatNumber(item.totalTokens)}</span>
                          <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">total</span>
                        </div>
                      </div>
                      <div className="mt-1 space-y-1 text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                        <div className="flex justify-between">
                          <span>Input:</span>
                          <span className="font-medium font-display">{formatNumber(item.promptTokens || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Output:</span>
                          <span className="font-medium font-display">{formatNumber(item.completionTokens || 0)}</span>
                        </div>
                        {item.responseTime && (
                          <div className="flex justify-between pt-1 border-t border-primary-200/30 dark:border-primary-700/30">
                            <span>Time:</span>
                            <span>{formatResponseTime(item.responseTime)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium font-display gradient-text-success">
                        {formatCurrency(item.cost)}
                      </div>
                      {item.optimizationApplied && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-display glass border border-success-200/30 dark:border-success-700/30 bg-gradient-success/20 text-success-700 dark:text-success-300">
                          Optimized
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {item.errorOccurred ? (
                          <>
                            {item.httpStatusCode && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-display glass border
                                ${getStatusCodeColor(item.httpStatusCode) === 'red' ? 'border-danger-200/30 dark:border-danger-700/30 bg-gradient-danger/20 text-danger-700 dark:text-danger-300' :
                                  getStatusCodeColor(item.httpStatusCode) === 'yellow' ? 'border-warning-200/30 dark:border-warning-700/30 bg-gradient-warning/20 text-warning-700 dark:text-warning-300' :
                                    getStatusCodeColor(item.httpStatusCode) === 'green' ? 'border-success-200/30 dark:border-success-700/30 bg-gradient-success/20 text-success-700 dark:text-success-300' :
                                      'border-primary-200/30 dark:border-primary-700/30 bg-gradient-primary/20 text-primary-700 dark:text-primary-300'}
                              `}>
                                {item.httpStatusCode}
                              </span>
                            )}
                            {item.errorType && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-display glass border
                                ${getErrorTypeColor(item.errorType) === 'red' ? 'border-danger-200/30 dark:border-danger-700/30 bg-gradient-danger/20 text-danger-700 dark:text-danger-300' :
                                  getErrorTypeColor(item.errorType) === 'orange' ? 'border-warning-200/30 dark:border-warning-700/30 bg-gradient-warning/20 text-warning-700 dark:text-warning-300' :
                                    getErrorTypeColor(item.errorType) === 'yellow' ? 'border-warning-200/30 dark:border-warning-700/30 bg-gradient-warning/20 text-warning-700 dark:text-warning-300' :
                                      getErrorTypeColor(item.errorType) === 'blue' ? 'border-primary-200/30 dark:border-primary-700/30 bg-gradient-primary/20 text-primary-700 dark:text-primary-300' :
                                        'border-primary-200/30 dark:border-primary-700/30 bg-gradient-primary/20 text-primary-700 dark:text-primary-300'}
                              `}>
                                {formatErrorType(item.errorType)}
                              </span>
                            )}
                            {!item.httpStatusCode && !item.errorType && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-display glass border border-danger-200/30 dark:border-danger-700/30 bg-gradient-danger/20 text-danger-700 dark:text-danger-300">
                                Error
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-display glass border border-success-200/30 dark:border-success-700/30 bg-gradient-success/20 text-success-700 dark:text-success-300">
                            Success
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-body text-light-text-secondary whitespace-nowrap dark:text-dark-text-secondary">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUsageForDetails(item);
                            setDetailModalOpen(true);
                          }}
                          className="p-2 text-primary-500 rounded-xl border transition-all duration-300 glass border-primary-200/30 dark:border-primary-700/30 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 hover:border-primary-300/50 dark:hover:border-primary-600/50 hover:shadow-md hover:scale-105 active:scale-95"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {(item.cost > 0.01 || item.totalTokens > 500) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSimulate(item);
                            }}
                            className="p-2 text-primary-500 rounded-xl border transition-all duration-300 glass border-primary-200/30 dark:border-primary-700/30 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 hover:border-primary-300/50 dark:hover:border-primary-600/50 hover:shadow-md hover:scale-105 active:scale-95"
                            title="Try What-If Simulation"
                          >
                            <BeakerIcon className="w-4 h-4" />
                          </button>
                        )}
                        <ChevronRightIcon className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="px-6 py-4 border-t border-primary-200/30 dark:border-primary-700/30">
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
            <div className="fixed inset-0 backdrop-blur-sm transition-opacity bg-black/50" onClick={() => setSelectedUsage(null)} />

            <div className="inline-block overflow-hidden p-6 my-8 w-full max-w-2xl text-left align-middle rounded-xl border shadow-2xl backdrop-blur-xl transition-all transform glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold font-display gradient-text-primary">
                  Usage Details
                </h3>
                <button
                  onClick={() => setSelectedUsage(null)}
                  className="p-2 rounded-xl border transition-all duration-300 glass border-primary-200/30 dark:border-primary-700/30 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:border-primary-300/50 dark:hover:border-primary-600/50 hover:scale-105 active:scale-95"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Service & Model */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <ServiceIcon service={selectedUsage.service} size="lg" className="shadow-lg" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                      {formatServiceName(selectedUsage.service)}
                    </h4>
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                      {selectedUsage.model}
                    </p>
                  </div>
                </div>

                {/* Trace Information */}
                {(selectedUsage.traceId ?? selectedUsage.workflowId) && (
                  <div className="p-4 rounded-lg border glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-primary/10 dark:bg-gradient-primary/5">
                    <h5 className="mb-2 text-sm font-medium font-display gradient-text-primary">
                      Agent Trace Information
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Trace Name</p>
                        <p className="text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                          {selectedUsage.traceName ?? selectedUsage.workflowName ?? 'Unnamed Trace'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Trace ID</p>
                        <p className="font-mono text-sm text-light-text-primary dark:text-dark-text-primary">
                          {selectedUsage.traceId ?? selectedUsage.workflowId}
                        </p>
                      </div>
                      {(selectedUsage.traceStep ?? selectedUsage.workflowStep) && (
                        <div>
                          <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Step</p>
                          <p className="text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                            {selectedUsage.traceStep ?? selectedUsage.workflowStep}
                          </p>
                        </div>
                      )}
                      {(selectedUsage.traceSequence ?? selectedUsage.workflowSequence) != null && (
                        <div>
                          <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Sequence</p>
                          <p className="text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                            #{selectedUsage.traceSequence ?? selectedUsage.workflowSequence}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Enhanced Request/Response Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                      Request & Response
                    </h5>
                    <button
                      onClick={() => copyPromptToClipboard(selectedUsage.prompt)}
                      className="flex items-center px-2 py-1 space-x-1 text-xs transition-colors font-body text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
                      title="Copy prompt to clipboard"
                    >
                      {copiedPrompt ? (
                        <>
                          <CheckIcon className="w-4 h-4 text-success-500" />
                          <span className="text-success-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <ClipboardIcon className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Request/Prompt Section */}
                    <div>
                      <h6 className="mb-2 text-xs font-medium font-display text-light-text-secondary dark:text-dark-text-secondary">
                        Request:
                      </h6>
                      <div className="p-3 rounded-lg border glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <p className="text-sm font-body text-light-text-primary whitespace-pre-wrap dark:text-dark-text-primary">
                          {selectedUsage.prompt ||
                            selectedUsage.metadata?.prompt ||
                            selectedUsage.metadata?.messages?.[0]?.content ||
                            selectedUsage.metadata?.input ||
                            'No prompt available'}
                        </p>
                      </div>
                    </div>

                    {/* Response/Completion Section */}
                    {selectedUsage.completion && (
                      <div>
                        <h6 className="mb-2 text-xs font-medium font-display text-light-text-secondary dark:text-dark-text-secondary">
                          Response:
                        </h6>
                        <div className="p-3 rounded-lg border glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                          <p className="text-sm font-body text-light-text-primary whitespace-pre-wrap dark:text-dark-text-primary">
                            {selectedUsage.completion}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Messages Section for Chat Models */}
                    {selectedUsage.metadata?.messages && Array.isArray(selectedUsage.metadata.messages) && selectedUsage.metadata.messages.length > 0 && (
                      <div>
                        <h6 className="mb-2 text-xs font-medium font-display text-light-text-secondary dark:text-dark-text-secondary">
                          Conversation History:
                        </h6>
                        <div className="space-y-2">
                          {selectedUsage.metadata.messages.map((msg: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-lg border glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-medium font-display text-light-text-secondary capitalize dark:text-dark-text-secondary">
                                  {msg.role || 'user'}:
                                </span>
                                <button
                                  onClick={() => copyPromptToClipboard(msg.content || '')}
                                  className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
                                  title="Copy message to clipboard"
                                >
                                  <ClipboardIcon className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-sm font-body text-light-text-primary whitespace-pre-wrap dark:text-dark-text-primary">
                                {msg.content || 'No content'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* System Message */}
                    {selectedUsage.metadata?.system && (
                      <div>
                        <h6 className="mb-2 text-xs font-medium font-display text-light-text-secondary dark:text-dark-text-secondary">
                          System Instructions:
                        </h6>
                        <div className="p-3 rounded-lg border glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                          <p className="text-sm font-body text-light-text-primary whitespace-pre-wrap dark:text-dark-text-primary">
                            {selectedUsage.metadata.system}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Properties */}
                {selectedUsage.metadata && Object.keys(selectedUsage.metadata).length > 0 && (
                  <div>
                    <h5 className="mb-2 text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                      Custom Properties
                    </h5>
                    <div className="p-3 rounded-lg border glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
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
                              <span className="text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                                {item.key}:
                              </span>
                              <span className="max-w-xs text-sm text-right font-body text-light-text-primary dark:text-dark-text-primary">
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
                  <div className="p-4 rounded-lg border glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <h6 className="text-xs font-medium font-display tracking-wider text-light-text-secondary uppercase dark:text-dark-text-secondary">
                      Total Tokens
                    </h6>
                    <p className="mt-1 text-lg font-semibold font-display gradient-text-primary">
                      {formatNumber(selectedUsage.totalTokens)}
                    </p>
                    <div className="mt-1 text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                      {formatNumber(selectedUsage.promptTokens)} prompt + {formatNumber(selectedUsage.completionTokens)} completion
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <h6 className="text-xs font-medium font-display tracking-wider text-light-text-secondary uppercase dark:text-dark-text-secondary">
                      Cost
                    </h6>
                    <p className="mt-1 text-lg font-semibold font-display gradient-text-success">
                      {formatCurrency(selectedUsage.cost)}
                    </p>
                    {selectedUsage.optimizationApplied && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-display glass border border-success-200/30 dark:border-success-700/30 bg-gradient-success/20 text-success-700 dark:text-success-300 mt-1">
                        Optimized
                      </span>
                    )}
                  </div>

                  <div className="p-4 rounded-lg border glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <h6 className="text-xs font-medium font-display tracking-wider text-light-text-secondary uppercase dark:text-dark-text-secondary">
                      Response Time
                    </h6>
                    <p className="mt-1 text-lg font-semibold font-display text-light-text-primary dark:text-dark-text-primary">
                      {formatResponseTime(selectedUsage.responseTime)}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <h6 className="text-xs font-medium font-display tracking-wider text-light-text-secondary uppercase dark:text-dark-text-secondary">
                      Created At
                    </h6>
                    <p className="mt-1 text-lg font-semibold font-display text-light-text-primary dark:text-dark-text-primary">
                      {formatDateTime(selectedUsage.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {selectedUsage.tags && selectedUsage.tags.length > 0 && (
                  <div>
                    <h5 className="mb-2 text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                      Tags
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedUsage.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium font-display glass border border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel text-light-text-primary rounded-full dark:text-dark-text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error Details */}
                {selectedUsage.errorOccurred && (
                  <div className="p-4 rounded-lg border glass border-danger-200/30 dark:border-danger-700/30 bg-gradient-danger/10 dark:bg-gradient-danger/5">
                    <h5 className="mb-3 text-sm font-medium font-display gradient-text-danger">
                      Error Details
                    </h5>
                    <div className="space-y-3">
                      {selectedUsage.httpStatusCode && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">HTTP Status:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-display glass border
                            ${getStatusCodeColor(selectedUsage.httpStatusCode) === 'red' ? 'border-danger-200/30 dark:border-danger-700/30 bg-gradient-danger/20 text-danger-700 dark:text-danger-300' :
                              getStatusCodeColor(selectedUsage.httpStatusCode) === 'yellow' ? 'border-warning-200/30 dark:border-warning-700/30 bg-gradient-warning/20 text-warning-700 dark:text-warning-300' :
                                'border-primary-200/30 dark:border-primary-700/30 bg-gradient-primary/20 text-primary-700 dark:text-primary-300'}
                          `}>
                            {formatHttpStatusCode(selectedUsage.httpStatusCode)}
                          </span>
                        </div>
                      )}
                      {selectedUsage.errorType && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">Error Type:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-display glass border
                            ${getErrorTypeColor(selectedUsage.errorType) === 'red' ? 'border-danger-200/30 dark:border-danger-700/30 bg-gradient-danger/20 text-danger-700 dark:text-danger-300' :
                              getErrorTypeColor(selectedUsage.errorType) === 'orange' ? 'border-warning-200/30 dark:border-warning-700/30 bg-gradient-warning/20 text-warning-700 dark:text-warning-300' :
                                getErrorTypeColor(selectedUsage.errorType) === 'yellow' ? 'border-warning-200/30 dark:border-warning-700/30 bg-gradient-warning/20 text-warning-700 dark:text-warning-300' :
                                  'border-primary-200/30 dark:border-primary-700/30 bg-gradient-primary/20 text-primary-700 dark:text-primary-300'}
                          `}>
                            {formatErrorType(selectedUsage.errorType)}
                          </span>
                        </div>
                      )}
                      {selectedUsage.errorMessage && (
                        <div>
                          <span className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">Error Message:</span>
                          <p className="p-2 mt-1 text-sm font-body text-light-text-primary rounded border glass border-danger-200/30 dark:border-danger-700/30 bg-gradient-danger/10 dark:bg-gradient-danger/5 dark:text-dark-text-primary">
                            {selectedUsage.errorMessage}
                          </p>
                        </div>
                      )}
                      {selectedUsage.errorDetails && Object.keys(selectedUsage.errorDetails).length > 0 && (
                        <div>
                          <span className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">Additional Details:</span>
                          <div className="mt-1 space-y-1">
                            {Object.entries(selectedUsage.errorDetails)
                              .filter(([_, value]) => value !== null && value !== undefined && value !== '')
                              .map(([key, value]) => (
                                <div key={key} className="flex justify-between items-start text-xs font-body">
                                  <span className="text-light-text-secondary capitalize dark:text-dark-text-secondary">
                                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                                  </span>
                                  <span className="max-w-xs text-right text-light-text-primary dark:text-dark-text-primary">
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
                    <div className={`w-2 h-2 rounded-full mr-2 ${selectedUsage.errorOccurred ? 'bg-danger-500' : 'bg-success-500'}`} />
                    <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                      {selectedUsage.errorOccurred ? 'Error Occurred' : 'Successful'}
                    </span>
                  </div>
                  {selectedUsage.optimizationApplied && (
                    <div className="flex items-center">
                      <div className="mr-2 w-2 h-2 bg-primary-500 rounded-full" />
                      <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
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

      {/* Detail Breakdown Modal */}
      <DetailBreakdownModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setUsageForDetails(null);
        }}
        usage={usageForDetails}
      />
    </>
  );
};