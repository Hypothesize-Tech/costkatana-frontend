import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  XMarkIcon,
  ClockIcon,
  CircleStackIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  Squares2X2Icon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TagIcon,
  ServerStackIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { usageService } from '@/services/usage.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Usage } from '@/types';

type TabId = 'overview' | 'usage' | 'performance' | 'context' | 'traces' | 'network';

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  usage: Usage;
  onFetchNetworkDetails?: (usageId: string) => Promise<void>;
  onSimulate?: (usage: Usage) => void;
}

export function RequestDetailsModal({ isOpen, onClose, usage, onFetchNetworkDetails, onSimulate }: RequestDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [networkDetailsLoading, setNetworkDetailsLoading] = useState(false);

  const { data: detailedContext, isLoading: detailedContextLoading } = useQuery({
    queryKey: ['detailed-usage-context', usage?._id],
    queryFn: () =>
      usage
        ? usageService.getDetailedUsageContext(usage._id, {
          includeTemplateUsage: true,
          includeWorkflowTrace: true,
          includeAnalytics: true,
          includePerformanceMetrics: true
        })
        : null,
    enabled: isOpen && !!usage?._id,
    staleTime: 60000
  });

  // Backend sends full requestTracking (headers, payload, performance, etc.) - use permissive type for display
  const requestTracking = usage.requestTracking as {
    headers?: { request?: Record<string, string>; response?: Record<string, string> };
    payload?: { requestBody?: unknown; responseBody?: unknown; requestSize?: number; responseSize?: number; contentType?: string; compressionRatio?: number };
    performance?: { totalRoundTripTime?: number; networkTime?: number; serverProcessingTime?: number; dataTransferEfficiency?: number };
    clientInfo?: { ip?: string; userAgent?: string; geoLocation?: { city?: string; region?: string; country?: string }; environment?: string; sdkVersion?: string };
    networking?: { serverEndpoint?: string; serverFullUrl?: string; clientOrigin?: string; protocol?: string; secure?: boolean; dnsLookupTime?: number; tcpConnectTime?: number };
  } | undefined;

  // When user switches to Network Details tab, fetch if not loaded
  useEffect(() => {
    if (!isOpen || activeTab !== 'network' || !usage._id || requestTracking) return;
    if (!onFetchNetworkDetails) return;
    setNetworkDetailsLoading(true);
    onFetchNetworkDetails(usage._id)
      .finally(() => setNetworkDetailsLoading(false));
  }, [isOpen, activeTab, usage._id, onFetchNetworkDetails, requestTracking]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)} ms`;
    return `${(ms / 1000).toFixed(1)} s`;
  };

  const formatJsonOrString = (value: unknown): string => {
    if (value == null) return '—';
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return value;
      }
    }
    return JSON.stringify(value, null, 2);
  };

  const renderHeadersTable = (headers: Record<string, string> | undefined, label: string) => {
    if (!headers || Object.keys(headers).length === 0) return null;
    return (
      <div className="mt-2">
        <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300 mb-1">{label}</p>
        <div className="rounded-lg border border-primary-200/30 dark:border-primary-700 overflow-hidden glass">
          <table className="min-w-full divide-y divide-primary-200/30 dark:divide-primary-700 text-sm">
            <thead className="bg-primary-50/50 dark:bg-primary-900/30">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-secondary-600 dark:text-secondary-300">Header</th>
                <th className="px-3 py-2 text-left font-medium text-secondary-600 dark:text-secondary-300">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-200/30 dark:divide-primary-700 bg-white dark:bg-primary-900/10">
              {Object.entries(headers).map(([key, val]) => (
                <tr key={key}>
                  <td className="px-3 py-2 font-mono text-secondary-900 dark:text-white">{key}</td>
                  <td className="px-3 py-2 font-mono text-secondary-600 dark:text-secondary-300 break-all">{String(val)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBodyBlock = (body: unknown, label: string) => {
    const str = formatJsonOrString(body);
    if (str === '—') return null;
    return (
      <div className="mt-2">
        <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300 mb-1">{label}</p>
        <pre className="rounded-lg border border-primary-200/30 dark:border-primary-700 bg-primary-50/30 dark:bg-primary-900/20 p-3 text-xs font-mono text-secondary-900 dark:text-white overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap break-words glass">
          {str}
        </pre>
      </div>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl glass backdrop-blur-xl border border-primary-200/30 dark:border-primary-700 bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Dialog.Title as="h3" className="text-2xl font-bold font-display gradient-text-primary">
                      Usage & Request Details
                    </Dialog.Title>
                    <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-0.5">
                      {usage.service} • {usage.model}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {onSimulate && (usage.cost > 0.01 || usage.totalTokens > 500) && (
                      <button
                        type="button"
                        onClick={() => onSimulate(usage)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-lg transition-all"
                      >
                        <SparklesIcon className="w-4 h-4" />
                        Run Simulation
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg border border-primary-200/30 dark:border-primary-700 hover:bg-primary-500/10 transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6 text-secondary-600 dark:text-secondary-300" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-1 mb-6 border-b border-primary-200/30 dark:border-primary-700">
                  {(
                    [
                      { id: 'overview' as const, label: 'Overview', icon: Squares2X2Icon },
                      { id: 'usage' as const, label: 'Usage', icon: ChartBarIcon },
                      { id: 'performance' as const, label: 'Performance', icon: ClockIcon },
                      { id: 'context' as const, label: 'Context', icon: TagIcon },
                      { id: 'traces' as const, label: 'Traces', icon: ServerStackIcon },
                      { id: 'network' as const, label: 'Network Details', icon: GlobeAltIcon }
                    ] as const
                  ).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTab(id)}
                      className={`px-3 py-2.5 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-1.5 ${activeTab === id
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-b-2 border-primary-500'
                        : 'text-secondary-600 dark:text-secondary-400 hover:bg-primary-500/10'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="space-y-6">
                  {/* Overview tab: Basic Info only */}
                  {activeTab === 'overview' && (
                    <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-primary-50/30 dark:bg-primary-900/20">
                      <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white mb-3">Request Overview</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-secondary-600 dark:text-secondary-300">Service</p>
                          <p className="font-medium text-secondary-900 dark:text-white">{usage.service}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-600 dark:text-secondary-300">Model</p>
                          <p className="font-medium text-secondary-900 dark:text-white">{usage.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-600 dark:text-secondary-300">Cost</p>
                          <p className="font-medium text-secondary-900 dark:text-white">${usage.cost.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-600 dark:text-secondary-300">Tokens</p>
                          <p className="font-medium text-secondary-900 dark:text-white">{usage.totalTokens?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Usage tab: key metrics, token breakdown, request/response preview */}
                  {activeTab === 'usage' && (
                    <>
                      {detailedContextLoading ? (
                        <div className="flex justify-center py-12">
                          <LoadingSpinner />
                        </div>
                      ) : (
                        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                              <div className="flex items-center gap-3">
                                <CurrencyDollarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">${usage.cost.toFixed(6)}</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                              <div className="flex items-center gap-3">
                                <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {usage.responseTime > 1000 ? `${(usage.responseTime / 1000).toFixed(1)}s` : `${usage.responseTime}ms`}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                              <div className="flex items-center gap-3">
                                {usage.errorOccurred ? (
                                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                                ) : (
                                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                )}
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{usage.errorOccurred ? 'Error' : 'Success'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Token Usage</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Input Tokens</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{(usage.promptTokens ?? 0).toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Output Tokens</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{(usage.completionTokens ?? 0).toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tokens</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{(usage.totalTokens ?? 0).toLocaleString()}</p>
                              </div>
                            </div>
                            {detailedContext?.performanceAnalysis && (
                              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                Cost per token: ${(detailedContext.performanceAnalysis as { tokenBreakdown?: { costPerToken?: number } }).tokenBreakdown?.costPerToken?.toFixed(8) ?? '—'}
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Request</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-y-auto max-h-40">{usage.prompt || '—'}</p>
                            </div>
                            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Response</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-y-auto max-h-40">{usage.completion || '—'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Performance tab */}
                  {activeTab === 'performance' && (
                    <>
                      {detailedContextLoading ? (
                        <div className="flex justify-center py-12">
                          <LoadingSpinner />
                        </div>
                      ) : detailedContext?.performanceAnalysis ? (
                        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Cost Breakdown</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Input Cost</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    ${(detailedContext.performanceAnalysis as { costAnalysis?: { costBreakdown?: { inputCost?: number } } }).costAnalysis?.costBreakdown?.inputCost?.toFixed(6) ?? '0'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Output Cost</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    ${(detailedContext.performanceAnalysis as { costAnalysis?: { costBreakdown?: { outputCost?: number } } }).costAnalysis?.costBreakdown?.outputCost?.toFixed(6) ?? '0'}
                                  </span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between">
                                  <span className="font-medium text-gray-900 dark:text-white">Total</span>
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    ${(detailedContext.performanceAnalysis as { costAnalysis?: { totalCost?: number } }).costAnalysis?.totalCost?.toFixed(6) ?? usage.cost.toFixed(6)}
                                  </span>
                                </div>
                              </div>
                              {(detailedContext.performanceAnalysis as { costAnalysis?: { optimizationApplied?: boolean } }).costAnalysis?.optimizationApplied && (
                                <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-500/20">
                                  <div className="flex items-center gap-2">
                                    <SparklesIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Optimization Applied</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Response Metrics</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {(detailedContext.performanceAnalysis as { responseMetrics?: { responseTime?: number } }).responseMetrics?.responseTime ?? usage.responseTime}ms
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                                  <span
                                    className={`text-sm font-medium ${(detailedContext.performanceAnalysis as { responseMetrics?: { status?: string } }).responseMetrics?.status === 'success'
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-red-600 dark:text-red-400'
                                      }`}
                                  >
                                    {(detailedContext.performanceAnalysis as { responseMetrics?: { status?: string } }).responseMetrics?.status ?? (usage.errorOccurred ? 'error' : 'success')}
                                  </span>
                                </div>
                                {(detailedContext.performanceAnalysis as { responseMetrics?: { httpStatusCode?: number } }).responseMetrics?.httpStatusCode != null && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">HTTP Status</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {(detailedContext.performanceAnalysis as { responseMetrics?: { httpStatusCode?: number } }).responseMetrics?.httpStatusCode}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No performance analysis available for this request.</div>
                      )}
                    </>
                  )}

                  {/* Context tab */}
                  {activeTab === 'context' && (
                    <>
                      {detailedContextLoading ? (
                        <div className="flex justify-center py-12">
                          <LoadingSpinner />
                        </div>
                      ) : detailedContext?.businessContext ? (
                        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Business Context</h4>
                              <div className="space-y-3">
                                {(detailedContext.businessContext as { department?: string }).department && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Department</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{(detailedContext.businessContext as { department?: string }).department}</span>
                                  </div>
                                )}
                                {(detailedContext.businessContext as { team?: string }).team && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Team</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{(detailedContext.businessContext as { team?: string }).team}</span>
                                  </div>
                                )}
                                {(detailedContext.businessContext as { purpose?: string }).purpose && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Purpose</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{(detailedContext.businessContext as { purpose?: string }).purpose}</span>
                                  </div>
                                )}
                                {(detailedContext.businessContext as { userEmail?: string }).userEmail && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">User</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{(detailedContext.businessContext as { userEmail?: string }).userEmail}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Tags & Metadata</h4>
                              {usage.tags && usage.tags.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tags</p>
                                  <div className="flex flex-wrap gap-2">
                                    {usage.tags.map((tag, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-800/20 dark:text-emerald-400"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {usage.metadata && Object.keys(usage.metadata).length > 0 && (
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Metadata</p>
                                  <pre className="text-xs text-gray-800 dark:text-gray-200 bg-white/50 dark:bg-black/20 p-3 rounded max-h-48 overflow-auto">
                                    {JSON.stringify(usage.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {(!usage.tags || usage.tags.length === 0) && (!usage.metadata || Object.keys(usage.metadata).length === 0) && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No tags or metadata.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No business context available for this request.</div>
                      )}
                    </>
                  )}

                  {/* Traces tab */}
                  {activeTab === 'traces' && (
                    <>
                      {detailedContextLoading ? (
                        <div className="flex justify-center py-12">
                          <LoadingSpinner />
                        </div>
                      ) : detailedContext?.workflowTrace ? (
                        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Workflow Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {(detailedContext.workflowTrace as { traceName?: string }).traceName && (
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Trace Name</p>
                                  <p className="font-medium text-gray-900 dark:text-white">{(detailedContext.workflowTrace as { traceName?: string }).traceName}</p>
                                </div>
                              )}
                              {(detailedContext.workflowTrace as { traceStep?: string }).traceStep && (
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Step</p>
                                  <p className="font-medium text-gray-900 dark:text-white">{(detailedContext.workflowTrace as { traceStep?: string }).traceStep}</p>
                                </div>
                              )}
                              {(detailedContext.workflowTrace as { workflowName?: string }).workflowName && (
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Workflow</p>
                                  <p className="font-medium text-gray-900 dark:text-white">{(detailedContext.workflowTrace as { workflowName?: string }).workflowName}</p>
                                </div>
                              )}
                              {(detailedContext.workflowTrace as { traceSequence?: number }).traceSequence != null && (
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Sequence</p>
                                  <p className="font-medium text-gray-900 dark:text-white">#{(detailedContext.workflowTrace as { traceSequence?: number }).traceSequence}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          {detailedContext.relatedRequests && (detailedContext.relatedRequests as unknown[]).length > 0 && (
                            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Related Requests ({(detailedContext.relatedRequests as unknown[]).length})
                              </h4>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {(detailedContext.relatedRequests as Array<{ _id: string; model?: string; cost?: number; errorOccurred?: boolean }>)
                                  .slice(0, 5)
                                  .map((related) => (
                                    <div
                                      key={related._id}
                                      className="flex items-center justify-between p-2 rounded border border-gray-200/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/30"
                                    >
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <div
                                          className={`w-2 h-2 rounded-full flex-shrink-0 ${related.errorOccurred ? 'bg-red-400' : 'bg-emerald-400'}`}
                                        />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{related.model ?? '—'}</span>
                                      </div>
                                      <span className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">${(related.cost ?? 0).toFixed(4)}</span>
                                    </div>
                                  ))}
                                {(detailedContext.relatedRequests as unknown[]).length > 5 && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                    +{(detailedContext.relatedRequests as unknown[]).length - 5} more requests
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No workflow or trace information available for this request.</div>
                      )}
                    </>
                  )}

                  {/* Network Details tab content */}
                  {activeTab === 'network' && (
                    <>
                      {networkDetailsLoading && !requestTracking && (
                        <div className="rounded-xl p-6 text-center border border-primary-200/30 dark:border-primary-700 glass bg-primary-50/30 dark:bg-primary-900/20">
                          <p className="text-sm text-primary-700 dark:text-primary-300">Loading network details…</p>
                        </div>
                      )}

                      {/* Full URLs - Cost Katana (server) and Client/User endpoint - always show when we have networking or after fetch */}
                      <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-primary-50/30 dark:bg-primary-900/20">
                        <div className="flex items-center gap-2 mb-2">
                          <GlobeAltIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white">Full Endpoints</h4>
                        </div>
                        <p className="text-xs text-secondary-600 dark:text-secondary-300 mb-3">
                          <strong>Cost Katana</strong> = our API that received the request. <strong>Client / User</strong> = where the request came from (your app, browser, or script).
                        </p>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Cost Katana API (server) – full URL</p>
                            <p className="font-mono text-sm text-secondary-900 dark:text-white break-all mt-0.5">
                              {requestTracking?.networking?.serverFullUrl ?? 'Not recorded (use comprehensive tracking for new requests)'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Client / User endpoint (origin)</p>
                            <p className="font-mono text-sm text-secondary-900 dark:text-white break-all mt-0.5">
                              {requestTracking?.networking?.clientOrigin ?? 'Not available (direct or script request)'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* No comprehensive tracking message */}
                      {!requestTracking && (
                        <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-primary-50/30 dark:bg-primary-900/20">
                          <p className="text-sm text-secondary-700 dark:text-secondary-300">
                            No headers, request body, or response body were captured for this request. It was tracked via the simple usage API. Use comprehensive tracking (POST /usage/track-comprehensive) to capture full request/response and network details.
                          </p>
                        </div>
                      )}

                      {/* Request Headers */}
                      {requestTracking?.headers && (
                        <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-primary-50/30 dark:bg-primary-900/20">
                          <div className="flex items-center gap-2 mb-3">
                            <DocumentTextIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white">Headers</h4>
                          </div>
                          {renderHeadersTable(requestTracking.headers.request, 'Request headers')}
                          {renderHeadersTable(requestTracking.headers.response, 'Response headers')}
                          {(!requestTracking.headers.request || Object.keys(requestTracking.headers.request).length === 0) &&
                            (!requestTracking.headers.response || Object.keys(requestTracking.headers.response).length === 0) && (
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">No headers recorded.</p>
                            )}
                        </div>
                      )}

                      {/* Request & Response Body */}
                      {requestTracking?.payload && (requestTracking.payload.requestBody != null || requestTracking.payload.responseBody != null) && (
                        <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-secondary-50/30 dark:bg-secondary-900/20">
                          <div className="flex items-center gap-2 mb-3">
                            <ArrowRightIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                            <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white">Request & Response Body</h4>
                          </div>
                          {renderBodyBlock(requestTracking.payload.requestBody, 'Request body')}
                          {renderBodyBlock(requestTracking.payload.responseBody, 'Response body')}
                        </div>
                      )}

                      {/* Performance Metrics */}
                      {requestTracking?.performance && (
                        <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-accent-50/30 dark:bg-accent-900/20">
                          <div className="flex items-center gap-2 mb-3">
                            <ClockIcon className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                            <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white">Performance</h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">Total Time</p>
                              <p className="font-medium text-secondary-900 dark:text-white">
                                {formatTime(requestTracking.performance.totalRoundTripTime || usage.responseTime)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">Network Time</p>
                              <p className="font-medium text-secondary-900 dark:text-white">
                                {formatTime(requestTracking.performance.networkTime || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">Server Time</p>
                              <p className="font-medium text-secondary-900 dark:text-white">
                                {formatTime(requestTracking.performance.serverProcessingTime || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">Data Efficiency</p>
                              <p className="font-medium text-secondary-900 dark:text-white">
                                {formatBytes(requestTracking.performance.dataTransferEfficiency || 0)}/s
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Client Information */}
                      {requestTracking?.clientInfo && (
                        <div className="rounded-xl p-4 border border-success-200/30 dark:border-success-700 glass bg-success-50/30 dark:bg-success-900/20">
                          <div className="flex items-center gap-2 mb-3">
                            <ComputerDesktopIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
                            <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white">Client Information</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">IP Address</p>
                              <p className="font-medium text-secondary-900 dark:text-white font-mono">
                                {requestTracking.clientInfo.ip}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">User Agent</p>
                              <p className="font-medium text-secondary-900 dark:text-white text-sm truncate">
                                {requestTracking.clientInfo.userAgent || usage.userAgent || 'N/A'}
                              </p>
                            </div>
                            {requestTracking.clientInfo.geoLocation && (
                              <>
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-300">Location</p>
                                  <p className="font-medium text-secondary-900 dark:text-white">
                                    {requestTracking.clientInfo.geoLocation.city}, {requestTracking.clientInfo.geoLocation.region}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-300">Country</p>
                                  <p className="font-medium text-secondary-900 dark:text-white">
                                    {requestTracking.clientInfo.geoLocation.country}
                                  </p>
                                </div>
                              </>
                            )}
                            {requestTracking.clientInfo.environment && (
                              <div>
                                <p className="text-sm text-secondary-600 dark:text-secondary-300">Environment</p>
                                <p className="font-medium text-secondary-900 dark:text-white text-sm">
                                  {requestTracking.clientInfo.environment}
                                </p>
                              </div>
                            )}
                            {requestTracking.clientInfo.sdkVersion && (
                              <div>
                                <p className="text-sm text-secondary-600 dark:text-secondary-300">SDK Version</p>
                                <p className="font-medium text-secondary-900 dark:text-white">
                                  {requestTracking.clientInfo.sdkVersion}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Network Details */}
                      {requestTracking?.networking && (
                        <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-gradient-to-br from-primary-50/50 to-secondary-50/50 dark:from-primary-900/20 dark:to-secondary-900/20">
                          <div className="flex items-center gap-2 mb-2">
                            <GlobeAltIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white">Network Details</h4>
                          </div>
                          <p className="text-xs text-secondary-600 dark:text-secondary-300 mb-3">
                            <strong>Cost Katana</strong> = API that received this request. <strong>Client / User</strong> = where the request came from (browser, app, or script).
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                                Cost Katana server {requestTracking.networking.serverFullUrl ? '(full URL)' : '(path only)'}
                              </p>
                              <p className="font-medium text-secondary-900 dark:text-white font-mono text-sm break-all mt-0.5">
                                {requestTracking.networking.serverFullUrl ?? requestTracking.networking.serverEndpoint ?? '—'}
                              </p>
                              {!requestTracking.networking.serverFullUrl && requestTracking.networking.serverEndpoint && (
                                <p className="text-xs text-secondary-600 dark:text-secondary-300 mt-0.5">Path only; full URL is shown under Full Endpoints above.</p>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">Protocol</p>
                              <p className="font-medium text-secondary-900 dark:text-white">
                                {(requestTracking.networking.protocol ?? 'http').toUpperCase()} {requestTracking.networking.secure ? '(Secure)' : ''}
                              </p>
                            </div>
                            {requestTracking.networking.dnsLookupTime && (
                              <div>
                                <p className="text-sm text-secondary-600 dark:text-secondary-300">DNS Lookup</p>
                                <p className="font-medium text-secondary-900 dark:text-white">
                                  {formatTime(requestTracking.networking.dnsLookupTime)}
                                </p>
                              </div>
                            )}
                            {requestTracking.networking.tcpConnectTime && (
                              <div>
                                <p className="text-sm text-secondary-600 dark:text-secondary-300">TCP Connect</p>
                                <p className="font-medium text-secondary-900 dark:text-white">
                                  {formatTime(requestTracking.networking.tcpConnectTime)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Data Transfer */}
                      {requestTracking?.payload && (
                        <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-highlight-50/30 dark:bg-highlight-900/20">
                          <div className="flex items-center gap-2 mb-3">
                            <CircleStackIcon className="w-5 h-5 text-highlight-600 dark:text-highlight-400" />
                            <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white">Data Transfer</h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">Request Size</p>
                              <p className="font-medium text-secondary-900 dark:text-white">
                                {formatBytes(requestTracking.payload.requestSize || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">Response Size</p>
                              <p className="font-medium text-secondary-900 dark:text-white">
                                {formatBytes(requestTracking.payload.responseSize || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">Content Type</p>
                              <p className="font-medium text-secondary-900 dark:text-white text-sm">
                                {requestTracking.payload.contentType || 'N/A'}
                              </p>
                            </div>
                            {requestTracking.payload.compressionRatio && (
                              <div>
                                <p className="text-sm text-secondary-600 dark:text-secondary-300">Compression</p>
                                <p className="font-medium text-secondary-900 dark:text-white">
                                  {Math.round((1 - requestTracking.payload.compressionRatio) * 100)}% saved
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-primary-200/30 dark:border-primary-700 text-secondary-700 dark:text-secondary-300 hover:bg-primary-500/10 transition-colors glass"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}