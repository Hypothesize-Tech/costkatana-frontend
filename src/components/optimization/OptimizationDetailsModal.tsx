import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  XMarkIcon,
  ClockIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  Squares2X2Icon,
  ChartBarIcon,
  CircleStackIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import { optimizationService } from '@/services/optimization.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/utils/formatters';
import type { Optimization, OptimizationRequestTracking } from '@/types/optimization.types';

type TabId = 'overview' | 'network';

interface OptimizationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  optimization: Optimization;
}

export function OptimizationDetailsModal({ isOpen, onClose, optimization }: OptimizationDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [requestTracking, setRequestTracking] = useState<OptimizationRequestTracking | undefined>(optimization.requestTracking);
  const [networkDetailsLoading, setNetworkDetailsLoading] = useState(false);

  // Sync when optimization prop changes (e.g. from Quick Optimize result)
  useEffect(() => {
    if (optimization.requestTracking) {
      setRequestTracking(optimization.requestTracking);
    }
  }, [optimization._id, optimization.requestTracking]);

  // Lazy load network details when user switches to tab and we don't have them
  useEffect(() => {
    if (!isOpen || activeTab !== 'network' || !optimization._id || requestTracking) return;
    setNetworkDetailsLoading(true);
    optimizationService
      .getOptimizationNetworkDetails(optimization._id)
      .then((data) => {
        if (data.requestTracking) {
          setRequestTracking(data.requestTracking as OptimizationRequestTracking);
        }
      })
      .finally(() => setNetworkDetailsLoading(false));
  }, [isOpen, activeTab, optimization._id, requestTracking]);

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

  const rt = requestTracking;

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
                      Optimization Details
                    </Dialog.Title>
                    <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-0.5">
                      {optimization.service} • {optimization.model}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg border border-primary-200/30 dark:border-primary-700 hover:bg-primary-500/10 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-secondary-600 dark:text-secondary-300" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 mb-6 border-b border-primary-200/30 dark:border-primary-700">
                  {[
                    { id: 'overview' as const, label: 'Overview', icon: Squares2X2Icon },
                    { id: 'network' as const, label: 'Network Details', icon: GlobeAltIcon },
                  ].map(({ id, label, icon: Icon }) => (
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

                <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-primary-50/30 dark:bg-primary-900/20">
                        <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white mb-3">Summary</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300">Service</p>
                            <p className="font-medium text-secondary-900 dark:text-white">{optimization.service}</p>
                          </div>
                          <div>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300">Model</p>
                            <p className="font-medium text-secondary-900 dark:text-white">{optimization.model}</p>
                          </div>
                          <div>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300">Cost Saved</p>
                            <p className="font-medium text-success-600 dark:text-success-400">
                              {formatCurrency(optimization.costSaved ?? 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300">Tokens Saved</p>
                            <p className="font-medium text-secondary-900 dark:text-white">
                              {(optimization.tokensSaved ?? 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300">Improvement</p>
                            <p className="font-medium text-secondary-900 dark:text-white">
                              {(optimization.improvementPercentage ?? 0).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300">Original Tokens</p>
                            <p className="font-medium text-secondary-900 dark:text-white">
                              {(optimization.originalTokens ?? 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300">Optimized Tokens</p>
                            <p className="font-medium text-secondary-900 dark:text-white">
                              {(optimization.optimizedTokens ?? 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {optimization.suggestions && optimization.suggestions.length > 0 && (
                        <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-primary-50/30 dark:bg-primary-900/20">
                          <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white mb-3 flex items-center gap-2">
                            <ChartBarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            Applied Techniques
                          </h4>
                          <ul className="space-y-2">
                            {optimization.suggestions.map((s, i) => (
                              <li key={i} className="text-sm text-secondary-700 dark:text-secondary-300">
                                <span className="font-medium capitalize">{s.type?.replace(/_/g, ' ')}</span>
                                {s.description && ` — ${s.description}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {optimization.userQuery && (
                        <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-primary-50/30 dark:bg-primary-900/20">
                          <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white mb-2">Original Prompt</h4>
                          <pre className="text-sm text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap break-words max-h-32 overflow-y-auto font-mono">
                            {optimization.userQuery.length > 500 ? `${optimization.userQuery.slice(0, 500)}…` : optimization.userQuery}
                          </pre>
                        </div>
                      )}

                      {optimization.generatedAnswer && (
                        <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-primary-50/30 dark:bg-primary-900/20">
                          <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white mb-2">Optimized Result</h4>
                          <pre className="text-sm text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap break-words max-h-32 overflow-y-auto font-mono">
                            {optimization.generatedAnswer.length > 500
                              ? `${optimization.generatedAnswer.slice(0, 500)}…`
                              : optimization.generatedAnswer}
                          </pre>
                        </div>
                      )}

                      {optimization.metadata?.cortexEnabled && optimization.cortexImpactMetrics && (
                        <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-gradient-to-br from-primary-50/50 to-secondary-50/50 dark:from-primary-900/20 dark:to-secondary-900/20">
                          <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white mb-3 flex items-center gap-2">
                            <CpuChipIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            Cortex
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {optimization.cortexImpactMetrics.tokenReduction && (
                              <>
                                <div>
                                  <p className="text-secondary-600 dark:text-secondary-300">Token reduction</p>
                                  <p className="font-medium text-secondary-900 dark:text-white">
                                    {optimization.cortexImpactMetrics.tokenReduction.percentageSavings?.toFixed(1)}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-secondary-600 dark:text-secondary-300">Tokens saved</p>
                                  <p className="font-medium text-secondary-900 dark:text-white">
                                    {optimization.cortexImpactMetrics.tokenReduction.absoluteSavings?.toLocaleString()}
                                  </p>
                                </div>
                              </>
                            )}
                            {optimization.cortexImpactMetrics.costImpact && (
                              <div>
                                <p className="text-secondary-600 dark:text-secondary-300">Cost saved</p>
                                <p className="font-medium text-success-600 dark:text-success-400">
                                  {formatCurrency(optimization.cortexImpactMetrics.costImpact.costSavings ?? 0)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'network' && (
                    <>
                      {networkDetailsLoading && !rt && (
                        <div className="rounded-xl p-6 text-center border border-primary-200/30 dark:border-primary-700 glass bg-primary-50/30 dark:bg-primary-900/20">
                          <LoadingSpinner size="small" />
                          <p className="text-sm text-primary-700 dark:text-primary-300 mt-2">Loading network details…</p>
                        </div>
                      )}

                      {!rt && !networkDetailsLoading && (
                        <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-primary-50/30 dark:bg-primary-900/20">
                          <p className="text-sm text-secondary-700 dark:text-secondary-300">
                            No network details recorded for this optimization.
                          </p>
                        </div>
                      )}

                      {rt && (
                        <>
                          <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-primary-50/30 dark:bg-primary-900/20">
                            <div className="flex items-center gap-2 mb-2">
                              <GlobeAltIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                              <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white">Full Endpoints</h4>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Cost Katana API (server)</p>
                                <p className="font-mono text-sm text-secondary-900 dark:text-white break-all mt-0.5">
                                  {rt.networking?.serverFullUrl ?? rt.networking?.serverEndpoint ?? '—'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Client / User endpoint</p>
                                <p className="font-mono text-sm text-secondary-900 dark:text-white break-all mt-0.5">
                                  {rt.networking?.clientOrigin ?? '—'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {rt.headers && (
                            <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-primary-50/30 dark:bg-primary-900/20">
                              <div className="flex items-center gap-2 mb-3">
                                <DocumentTextIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white">Headers</h4>
                              </div>
                              {renderHeadersTable(rt.headers.request, 'Request headers')}
                              {renderHeadersTable(rt.headers.response, 'Response headers')}
                            </div>
                          )}

                          {rt.payload && (rt.payload.requestBody != null || rt.payload.responseBody != null) && (
                            <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-secondary-50/30 dark:bg-secondary-900/20">
                              <div className="flex items-center gap-2 mb-3">
                                <ArrowRightIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                                <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white">Request & Response Body</h4>
                              </div>
                              {renderBodyBlock(rt.payload.requestBody, 'Request body')}
                              {renderBodyBlock(rt.payload.responseBody, 'Response body')}
                            </div>
                          )}

                          {rt.performance && (
                            <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-accent-50/30 dark:bg-accent-900/20">
                              <div className="flex items-center gap-2 mb-3">
                                <ClockIcon className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                                <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white">Performance</h4>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-300">Total Time</p>
                                  <p className="font-medium text-secondary-900 dark:text-white">
                                    {formatTime(rt.performance.totalRoundTripTime ?? 0)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-300">Server Time</p>
                                  <p className="font-medium text-secondary-900 dark:text-white">
                                    {formatTime(rt.performance.serverProcessingTime ?? 0)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-300">Data Efficiency</p>
                                  <p className="font-medium text-secondary-900 dark:text-white">
                                    {formatBytes(rt.performance.dataTransferEfficiency ?? 0)}/s
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {rt.clientInfo && (
                            <div className="rounded-xl p-4 border border-success-200/30 dark:border-success-700 glass bg-success-50/30 dark:bg-success-900/20">
                              <div className="flex items-center gap-2 mb-3">
                                <ComputerDesktopIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
                                <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white">Client Information</h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-300">IP Address</p>
                                  <p className="font-medium text-secondary-900 dark:text-white font-mono">{rt.clientInfo.ip ?? '—'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-300">User Agent</p>
                                  <p className="font-medium text-secondary-900 dark:text-white text-sm truncate">
                                    {rt.clientInfo.userAgent ?? 'N/A'}
                                  </p>
                                </div>
                                {rt.clientInfo.geoLocation && (
                                  <>
                                    <div>
                                      <p className="text-sm text-secondary-600 dark:text-secondary-300">Location</p>
                                      <p className="font-medium text-secondary-900 dark:text-white">
                                        {rt.clientInfo.geoLocation.city}, {rt.clientInfo.geoLocation.region}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-secondary-600 dark:text-secondary-300">Country</p>
                                      <p className="font-medium text-secondary-900 dark:text-white">
                                        {rt.clientInfo.geoLocation.country}
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {rt.payload && (
                            <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-highlight-50/30 dark:bg-highlight-900/20">
                              <div className="flex items-center gap-2 mb-3">
                                <CircleStackIcon className="w-5 h-5 text-highlight-600 dark:text-highlight-400" />
                                <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white">Data Transfer</h4>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-300">Request Size</p>
                                  <p className="font-medium text-secondary-900 dark:text-white">
                                    {formatBytes(rt.payload.requestSize ?? 0)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-300">Response Size</p>
                                  <p className="font-medium text-secondary-900 dark:text-white">
                                    {formatBytes(rt.payload.responseSize ?? 0)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-300">Content Type</p>
                                  <p className="font-medium text-secondary-900 dark:text-white text-sm">
                                    {rt.payload.contentType ?? 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {rt.networking && (
                            <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-gradient-to-br from-primary-50/50 to-secondary-50/50 dark:from-primary-900/20 dark:to-secondary-900/20">
                              <div className="flex items-center gap-2 mb-2">
                                <GlobeAltIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                <h4 className="text-lg font-semibold font-display text-secondary-900 dark:text-white">Network</h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-300">Endpoint</p>
                                  <p className="font-mono text-sm text-secondary-900 dark:text-white break-all">
                                    {rt.networking.serverFullUrl ?? rt.networking.serverEndpoint ?? '—'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-300">Protocol</p>
                                  <p className="font-medium text-secondary-900 dark:text-white">
                                    {(rt.networking.protocol ?? 'http').toUpperCase()} {rt.networking.secure ? '(Secure)' : ''}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
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
