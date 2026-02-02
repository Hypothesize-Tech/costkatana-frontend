import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, ClockIcon, CurrencyDollarIcon, ChartBarIcon, TagIcon, ServerStackIcon, ExclamationTriangleIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { usageService } from '@/services/usage.service';
import { Usage } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface DetailBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  usage: Usage | null;
  onSimulate?: (usage: Usage) => void;
}

export function DetailBreakdownModal({ isOpen, onClose, usage, onSimulate }: DetailBreakdownModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'context' | 'traces'>('overview');

  // Fetch detailed context when modal opens
  const { data: detailedContext, isLoading } = useQuery({
    queryKey: ['detailed-usage-context', usage?._id],
    queryFn: () => usage ? usageService.getDetailedUsageContext(usage._id, {
      includeTemplateUsage: true,
      includeWorkflowTrace: true,
      includeAnalytics: true,
      includePerformanceMetrics: true,
    }) : null,
    enabled: isOpen && !!usage,
    staleTime: 60000, // Cache for 1 minute
  });

  if (!usage) return null;

  const tabs = [
    { id: 'overview' as const, name: 'Overview', icon: ChartBarIcon },
    { id: 'performance' as const, name: 'Performance', icon: ClockIcon },
    { id: 'context' as const, name: 'Context', icon: TagIcon },
    { id: 'traces' as const, name: 'Traces', icon: ServerStackIcon },
  ];

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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-primary-200/20 dark:border-primary-600/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg">
                      <ChartBarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold font-display gradient-text-primary">
                        Usage Details
                      </Dialog.Title>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {usage.service} • {usage.model}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onSimulate && (usage.cost > 0.01 || usage.totalTokens > 500) && (
                      <button
                        onClick={() => onSimulate(usage)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                      >
                        <SparklesIcon className="w-4 h-4" />
                        Run Simulation
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800/50 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-primary-200/20 dark:border-primary-600/20">
                  <nav className="flex space-x-8 px-6">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === tab.id
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'border-transparent text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200 hover:border-secondary-300 dark:hover:border-secondary-600'
                            }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.name}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <>
                      {/* Overview Tab */}
                      {activeTab === 'overview' && (
                        <div className="space-y-6">
                          {/* Key Metrics */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg border border-primary-200/20 dark:border-primary-600/20 bg-white/30 dark:bg-dark-card/30">
                              <div className="flex items-center gap-3">
                                <CurrencyDollarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-400">Total Cost</p>
                                  <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                                    ${usage.cost.toFixed(6)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 rounded-lg border border-primary-200/20 dark:border-primary-600/20 bg-white/30 dark:bg-dark-card/30">
                              <div className="flex items-center gap-3">
                                <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-400">Response Time</p>
                                  <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                                    {usage.responseTime > 1000 ? `${(usage.responseTime / 1000).toFixed(1)}s` : `${usage.responseTime}ms`}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 rounded-lg border border-primary-200/20 dark:border-primary-600/20 bg-white/30 dark:bg-dark-card/30">
                              <div className="flex items-center gap-3">
                                {usage.errorOccurred ? (
                                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                                ) : (
                                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                )}
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-400">Status</p>
                                  <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                                    {usage.errorOccurred ? 'Error' : 'Success'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Token Breakdown */}
                          <div className="p-4 rounded-lg border border-primary-200/20 dark:border-primary-600/20 bg-white/30 dark:bg-dark-card/30">
                            <h4 className="font-semibold text-secondary-900 dark:text-white mb-3">Token Usage</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center">
                                <p className="text-sm text-secondary-600 dark:text-secondary-400">Input Tokens</p>
                                <p className="text-xl font-bold text-secondary-900 dark:text-white">{usage.promptTokens.toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-secondary-600 dark:text-secondary-400">Output Tokens</p>
                                <p className="text-xl font-bold text-secondary-900 dark:text-white">{usage.completionTokens.toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-secondary-600 dark:text-secondary-400">Total Tokens</p>
                                <p className="text-xl font-bold text-secondary-900 dark:text-white">{usage.totalTokens.toLocaleString()}</p>
                              </div>
                            </div>
                            {detailedContext?.performanceAnalysis && (
                              <div className="mt-3 text-sm text-secondary-600 dark:text-secondary-400">
                                Cost per token: ${detailedContext.performanceAnalysis.tokenBreakdown.costPerToken.toFixed(8)}
                              </div>
                            )}
                          </div>

                          {/* Request/Response Preview */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border border-primary-200/20 dark:border-primary-600/20 bg-white/30 dark:bg-dark-card/30">
                              <h4 className="font-semibold text-secondary-900 dark:text-white mb-3">Request</h4>
                              <div className="overflow-y-auto">
                                <p className="text-sm text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap">
                                  {usage.prompt}
                                </p>
                              </div>
                            </div>

                            <div className="p-4 rounded-lg border border-primary-200/20 dark:border-primary-600/20 bg-white/30 dark:bg-dark-card/30">
                              <h4 className="font-semibold text-secondary-900 dark:text-white mb-3">Response</h4>
                              <div className="overflow-y-auto">
                                <p className="text-sm text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap">
                                  {usage.completion}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Performance Tab */}
                      {activeTab === 'performance' && detailedContext?.performanceAnalysis && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Cost Analysis */}
                            <div className="p-4 rounded-lg border border-primary-200/20 dark:border-primary-600/20 bg-white/30 dark:bg-dark-card/30">
                              <h4 className="font-semibold text-secondary-900 dark:text-white mb-4">Cost Breakdown</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Input Cost</span>
                                  <span className="text-sm font-medium text-secondary-900 dark:text-white">
                                    ${detailedContext.performanceAnalysis.costAnalysis.costBreakdown.inputCost.toFixed(6)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Output Cost</span>
                                  <span className="text-sm font-medium text-secondary-900 dark:text-white">
                                    ${detailedContext.performanceAnalysis.costAnalysis.costBreakdown.outputCost.toFixed(6)}
                                  </span>
                                </div>
                                <div className="border-t border-primary-200/20 dark:border-primary-600/20 pt-3">
                                  <div className="flex justify-between">
                                    <span className="font-medium text-secondary-900 dark:text-white">Total</span>
                                    <span className="font-bold text-secondary-900 dark:text-white">
                                      ${detailedContext.performanceAnalysis.costAnalysis.totalCost.toFixed(6)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {detailedContext.performanceAnalysis.costAnalysis.optimizationApplied && (
                                <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-500/20">
                                  <div className="flex items-center gap-2">
                                    <SparklesIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                                      Optimization Applied
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Response Metrics */}
                            <div className="p-4 rounded-lg border border-primary-200/20 dark:border-primary-600/20 bg-white/30 dark:bg-dark-card/30">
                              <h4 className="font-semibold text-secondary-900 dark:text-white mb-4">Response Metrics</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Response Time</span>
                                  <span className="text-sm font-medium text-secondary-900 dark:text-white">
                                    {detailedContext.performanceAnalysis.responseMetrics.responseTime}ms
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Status</span>
                                  <span className={`text-sm font-medium ${detailedContext.performanceAnalysis.responseMetrics.status === 'success'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {detailedContext.performanceAnalysis.responseMetrics.status}
                                  </span>
                                </div>
                                {detailedContext.performanceAnalysis.responseMetrics.httpStatusCode && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-secondary-600 dark:text-secondary-400">HTTP Status</span>
                                    <span className="text-sm font-medium text-secondary-900 dark:text-white">
                                      {detailedContext.performanceAnalysis.responseMetrics.httpStatusCode}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Context Tab */}
                      {activeTab === 'context' && detailedContext?.businessContext && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Business Context */}
                            <div className="p-4 rounded-lg border border-primary-200/20 dark:border-primary-600/20 bg-white/30 dark:bg-dark-card/30">
                              <h4 className="font-semibold text-secondary-900 dark:text-white mb-4">Business Context</h4>
                              <div className="space-y-3">
                                {detailedContext.businessContext.department && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-secondary-600 dark:text-secondary-400">Department</span>
                                    <span className="text-sm font-medium text-secondary-900 dark:text-white">
                                      {detailedContext.businessContext.department}
                                    </span>
                                  </div>
                                )}
                                {detailedContext.businessContext.team && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-secondary-600 dark:text-secondary-400">Team</span>
                                    <span className="text-sm font-medium text-secondary-900 dark:text-white">
                                      {detailedContext.businessContext.team}
                                    </span>
                                  </div>
                                )}
                                {detailedContext.businessContext.purpose && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-secondary-600 dark:text-secondary-400">Purpose</span>
                                    <span className="text-sm font-medium text-secondary-900 dark:text-white">
                                      {detailedContext.businessContext.purpose}
                                    </span>
                                  </div>
                                )}
                                {detailedContext.businessContext.userEmail && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-secondary-600 dark:text-secondary-400">User</span>
                                    <span className="text-sm font-medium text-secondary-900 dark:text-white">
                                      {detailedContext.businessContext.userEmail}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Tags & Metadata */}
                            <div className="p-4 rounded-lg border border-primary-200/20 dark:border-primary-600/20 bg-white/30 dark:bg-dark-card/30">
                              <h4 className="font-semibold text-secondary-900 dark:text-white mb-4">Tags & Metadata</h4>
                              {usage.tags && usage.tags.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">Tags</p>
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
                                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">Metadata</p>
                                  <div className="space-y-3">
                                    {/* Model Parameters */}
                                    {(usage.metadata.temperature !== undefined ||
                                      usage.metadata.maxTokens !== undefined ||
                                      usage.metadata.topP !== undefined ||
                                      usage.metadata.frequencyPenalty !== undefined ||
                                      usage.metadata.presencePenalty !== undefined ||
                                      usage.metadata.stop !== undefined ||
                                      usage.metadata.seed !== undefined) && (
                                        <div className="bg-secondary-50/50 dark:bg-secondary-900/20 rounded-lg p-3">
                                          <p className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-2">Model Parameters</p>
                                          <div className="grid grid-cols-2 gap-2 text-xs">
                                            {usage.metadata.temperature !== undefined && (
                                              <div>
                                                <span className="text-secondary-600 dark:text-secondary-400">Temperature:</span>
                                                <span className="ml-2 font-mono text-secondary-800 dark:text-secondary-200">{usage.metadata.temperature}</span>
                                              </div>
                                            )}
                                            {usage.metadata.maxTokens !== undefined && (
                                              <div>
                                                <span className="text-secondary-600 dark:text-secondary-400">Max Tokens:</span>
                                                <span className="ml-2 font-mono text-secondary-800 dark:text-secondary-200">{usage.metadata.maxTokens}</span>
                                              </div>
                                            )}
                                            {usage.metadata.topP !== undefined && (
                                              <div>
                                                <span className="text-secondary-600 dark:text-secondary-400">Top P:</span>
                                                <span className="ml-2 font-mono text-secondary-800 dark:text-secondary-200">{usage.metadata.topP}</span>
                                              </div>
                                            )}
                                            {usage.metadata.frequencyPenalty !== undefined && (
                                              <div>
                                                <span className="text-secondary-600 dark:text-secondary-400">Frequency Penalty:</span>
                                                <span className="ml-2 font-mono text-secondary-800 dark:text-secondary-200">{usage.metadata.frequencyPenalty}</span>
                                              </div>
                                            )}
                                            {usage.metadata.presencePenalty !== undefined && (
                                              <div>
                                                <span className="text-secondary-600 dark:text-secondary-400">Presence Penalty:</span>
                                                <span className="ml-2 font-mono text-secondary-800 dark:text-secondary-200">{usage.metadata.presencePenalty}</span>
                                              </div>
                                            )}
                                            {usage.metadata.seed !== undefined && (
                                              <div>
                                                <span className="text-secondary-600 dark:text-secondary-400">Seed:</span>
                                                <span className="ml-2 font-mono text-secondary-800 dark:text-secondary-200">{usage.metadata.seed}</span>
                                              </div>
                                            )}
                                          </div>
                                          {usage.metadata.stop && (
                                            <div className="mt-2">
                                              <span className="text-secondary-600 dark:text-secondary-400">Stop Sequences:</span>
                                              <div className="mt-1 flex flex-wrap gap-1">
                                                {(Array.isArray(usage.metadata.stop) ? usage.metadata.stop : [usage.metadata.stop]).map((seq: string, idx: number) => (
                                                  <span key={idx} className="inline-block px-2 py-1 text-xs bg-secondary-100 dark:bg-secondary-800 rounded font-mono">
                                                    {seq}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                    {/* Input/Output Content */}
                                    {(usage.metadata.prompt || usage.metadata.input || usage.metadata.messages) && (
                                      <div className="bg-primary-50/50 dark:bg-primary-900/20 rounded-lg p-3">
                                        <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 mb-2">Input Content</p>
                                        {usage.metadata.prompt && (
                                          <div className="mb-2">
                                            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">Prompt:</span>
                                            <div className="mt-1 p-2 bg-white/50 dark:bg-black/20 rounded text-xs text-primary-800 dark:text-primary-200 max-h-32 overflow-y-auto">
                                              <pre className="whitespace-pre-wrap">{usage.metadata.prompt}</pre>
                                            </div>
                                          </div>
                                        )}
                                        {usage.metadata.input && usage.metadata.input !== usage.metadata.prompt && (
                                          <div className="mb-2">
                                            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">Input:</span>
                                            <div className="mt-1 p-2 bg-white/50 dark:bg-black/20 rounded text-xs text-primary-800 dark:text-primary-200 max-h-32 overflow-y-auto">
                                              <pre className="whitespace-pre-wrap">{usage.metadata.input}</pre>
                                            </div>
                                          </div>
                                        )}
                                        {usage.metadata.messages && (
                                          <div className="mb-2">
                                            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">Messages:</span>
                                            <div className="mt-1 p-2 bg-white/50 dark:bg-black/20 rounded text-xs text-primary-800 dark:text-primary-200 max-h-32 overflow-y-auto">
                                              {Array.isArray(usage.metadata.messages) ? (
                                                <div className="space-y-2">
                                                  {usage.metadata.messages.map((msg: any, idx: number) => (
                                                    <div key={idx} className="border-l-2 border-primary-300 dark:border-primary-600 pl-2">
                                                      <div className="text-xs font-semibold text-primary-600 dark:text-primary-400">{msg.role || 'message'}:</div>
                                                      <div className="text-xs">{msg.content || JSON.stringify(msg)}</div>
                                                    </div>
                                                  ))}
                                                </div>
                                              ) : (
                                                <pre className="whitespace-pre-wrap">{JSON.stringify(usage.metadata.messages, null, 2)}</pre>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Response/Output Content */}
                                    {(usage.metadata.response || usage.metadata.output || usage.metadata.completion) && (
                                      <div className="bg-success-50/50 dark:bg-success-900/20 rounded-lg p-3">
                                        <p className="text-xs font-semibold text-success-700 dark:text-success-300 mb-2">Output Content</p>
                                        {usage.metadata.response && (
                                          <div className="mb-2">
                                            <span className="text-xs text-success-600 dark:text-success-400 font-medium">Response:</span>
                                            <div className="mt-1 p-2 bg-white/50 dark:bg-black/20 rounded text-xs text-success-800 dark:text-success-200 max-h-32 overflow-y-auto">
                                              <pre className="whitespace-pre-wrap">{usage.metadata.response}</pre>
                                            </div>
                                          </div>
                                        )}
                                        {usage.metadata.output && usage.metadata.output !== usage.metadata.response && (
                                          <div className="mb-2">
                                            <span className="text-xs text-success-600 dark:text-success-400 font-medium">Output:</span>
                                            <div className="mt-1 p-2 bg-white/50 dark:bg-black/20 rounded text-xs text-success-800 dark:text-success-200 max-h-32 overflow-y-auto">
                                              <pre className="whitespace-pre-wrap">{usage.metadata.output}</pre>
                                            </div>
                                          </div>
                                        )}
                                        {usage.metadata.completion && usage.metadata.completion !== usage.metadata.response && usage.metadata.completion !== usage.metadata.output && (
                                          <div className="mb-2">
                                            <span className="text-xs text-success-600 dark:text-success-400 font-medium">Completion:</span>
                                            <div className="mt-1 p-2 bg-white/50 dark:bg-black/20 rounded text-xs text-success-800 dark:text-success-200 max-h-32 overflow-y-auto">
                                              <pre className="whitespace-pre-wrap">{usage.metadata.completion}</pre>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Workflow/Trace Information */}
                                    {(usage.metadata.workflowId || usage.metadata.workflowName || usage.metadata.workflowStep ||
                                      usage.metadata.traceId || usage.metadata.traceName || usage.metadata.traceStep ||
                                      usage.metadata.sessionId || usage.metadata.conversationId) && (
                                        <div className="bg-accent-50/50 dark:bg-accent-900/20 rounded-lg p-3">
                                          <p className="text-xs font-semibold text-accent-700 dark:text-accent-300 mb-2">Workflow & Tracing</p>
                                          <div className="grid grid-cols-1 gap-2 text-xs">
                                            {usage.metadata.workflowId && (
                                              <div>
                                                <span className="text-accent-600 dark:text-accent-400">Workflow ID:</span>
                                                <span className="ml-2 font-mono text-accent-800 dark:text-accent-200">{usage.metadata.workflowId}</span>
                                              </div>
                                            )}
                                            {usage.metadata.workflowName && (
                                              <div>
                                                <span className="text-accent-600 dark:text-accent-400">Workflow Name:</span>
                                                <span className="ml-2 font-mono text-accent-800 dark:text-accent-200">{usage.metadata.workflowName}</span>
                                              </div>
                                            )}
                                            {usage.metadata.workflowStep && (
                                              <div>
                                                <span className="text-accent-600 dark:text-accent-400">Workflow Step:</span>
                                                <span className="ml-2 font-mono text-accent-800 dark:text-accent-200">{usage.metadata.workflowStep}</span>
                                              </div>
                                            )}
                                            {usage.metadata.traceId && (
                                              <div>
                                                <span className="text-accent-600 dark:text-accent-400">Trace ID:</span>
                                                <span className="ml-2 font-mono text-accent-800 dark:text-accent-200">{usage.metadata.traceId}</span>
                                              </div>
                                            )}
                                            {usage.metadata.traceName && (
                                              <div>
                                                <span className="text-accent-600 dark:text-accent-400">Trace Name:</span>
                                                <span className="ml-2 font-mono text-accent-800 dark:text-accent-200">{usage.metadata.traceName}</span>
                                              </div>
                                            )}
                                            {usage.metadata.traceStep && (
                                              <div>
                                                <span className="text-accent-600 dark:text-accent-400">Trace Step:</span>
                                                <span className="ml-2 font-mono text-accent-800 dark:text-accent-200">{usage.metadata.traceStep}</span>
                                              </div>
                                            )}
                                            {usage.metadata.sessionId && (
                                              <div>
                                                <span className="text-accent-600 dark:text-accent-400">Session ID:</span>
                                                <span className="ml-2 font-mono text-accent-800 dark:text-accent-200">{usage.metadata.sessionId}</span>
                                              </div>
                                            )}
                                            {usage.metadata.conversationId && (
                                              <div>
                                                <span className="text-accent-600 dark:text-accent-400">Conversation ID:</span>
                                                <span className="ml-2 font-mono text-accent-800 dark:text-accent-200">{usage.metadata.conversationId}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {/* Tags */}
                                    {usage.metadata.tags && (
                                      <div className="bg-highlight-50/50 dark:bg-highlight-900/20 rounded-lg p-3">
                                        <p className="text-xs font-semibold text-highlight-700 dark:text-highlight-300 mb-2">Tags</p>
                                        <div className="flex flex-wrap gap-1">
                                          {(Array.isArray(usage.metadata.tags) ? usage.metadata.tags : [usage.metadata.tags]).map((tag: string, idx: number) => (
                                            <span key={idx} className="inline-block px-2 py-1 text-xs bg-highlight-100 dark:bg-highlight-800 text-highlight-800 dark:text-highlight-200 rounded-full">
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Performance Metrics */}
                                    {(usage.metadata.latency || usage.metadata.processingTime || usage.metadata.queueTime ||
                                      usage.metadata.retries || usage.metadata.cacheHit) && (
                                        <div className="bg-warning-50/50 dark:bg-warning-900/20 rounded-lg p-3">
                                          <p className="text-xs font-semibold text-warning-700 dark:text-warning-300 mb-2">Performance Metrics</p>
                                          <div className="grid grid-cols-2 gap-2 text-xs">
                                            {usage.metadata.latency !== undefined && (
                                              <div>
                                                <span className="text-warning-600 dark:text-warning-400">Latency:</span>
                                                <span className="ml-2 font-mono text-warning-800 dark:text-warning-200">{usage.metadata.latency}ms</span>
                                              </div>
                                            )}
                                            {usage.metadata.processingTime !== undefined && (
                                              <div>
                                                <span className="text-warning-600 dark:text-warning-400">Processing Time:</span>
                                                <span className="ml-2 font-mono text-warning-800 dark:text-warning-200">{usage.metadata.processingTime}ms</span>
                                              </div>
                                            )}
                                            {usage.metadata.queueTime !== undefined && (
                                              <div>
                                                <span className="text-warning-600 dark:text-warning-400">Queue Time:</span>
                                                <span className="ml-2 font-mono text-warning-800 dark:text-warning-200">{usage.metadata.queueTime}ms</span>
                                              </div>
                                            )}
                                            {usage.metadata.retries !== undefined && (
                                              <div>
                                                <span className="text-warning-600 dark:text-warning-400">Retries:</span>
                                                <span className="ml-2 font-mono text-warning-800 dark:text-warning-200">{usage.metadata.retries}</span>
                                              </div>
                                            )}
                                            {usage.metadata.cacheHit !== undefined && (
                                              <div>
                                                <span className="text-warning-600 dark:text-warning-400">Cache Hit:</span>
                                                <span className="ml-2 font-mono text-warning-800 dark:text-warning-200">{usage.metadata.cacheHit ? 'Yes' : 'No'}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {/* Custom Properties - Any other fields not handled above */}
                                    {(() => {
                                      const handledFields = new Set([
                                        'temperature', 'maxTokens', 'topP', 'frequencyPenalty', 'presencePenalty', 'stop', 'seed',
                                        'prompt', 'input', 'messages', 'response', 'output', 'completion',
                                        'workflowId', 'workflowName', 'workflowStep', 'traceId', 'traceName', 'traceStep', 'sessionId', 'conversationId',
                                        'tags', 'latency', 'processingTime', 'queueTime', 'retries', 'cacheHit'
                                      ]);
                                      const customFields = Object.entries(usage.metadata || {}).filter(([key]) => !handledFields.has(key));

                                      return customFields.length > 0 && (
                                        <div className="bg-secondary-50/50 dark:bg-secondary-900/20 rounded-lg p-3">
                                          <p className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-2">Custom Properties</p>
                                          <div className="space-y-2">
                                            {customFields.map(([key, value]) => (
                                              <div key={key}>
                                                <span className="text-xs text-secondary-600 dark:text-secondary-400 font-medium">{key}:</span>
                                                <div className="mt-1 p-2 bg-white/50 dark:bg-black/20 rounded text-xs text-secondary-800 dark:text-secondary-200">
                                                  {typeof value === 'object' && value !== null ? (
                                                    <pre className="whitespace-pre-wrap overflow-auto max-h-20">
                                                      {JSON.stringify(value, null, 2)}
                                                    </pre>
                                                  ) : (
                                                    <span className="font-mono">{String(value)}</span>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Traces Tab */}
                      {activeTab === 'traces' && detailedContext?.workflowTrace && (
                        <div className="space-y-6">
                          <div className="p-4 rounded-lg border border-primary-200/20 dark:border-primary-600/20 bg-white/30 dark:bg-dark-card/30">
                            <h4 className="font-semibold text-secondary-900 dark:text-white mb-4">Workflow Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {detailedContext.workflowTrace.traceName && (
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-400">Trace Name</p>
                                  <p className="font-medium text-secondary-900 dark:text-white">
                                    {detailedContext.workflowTrace.traceName}
                                  </p>
                                </div>
                              )}
                              {detailedContext.workflowTrace.traceStep && (
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-400">Step</p>
                                  <p className="font-medium text-secondary-900 dark:text-white">
                                    {detailedContext.workflowTrace.traceStep}
                                  </p>
                                </div>
                              )}
                              {detailedContext.workflowTrace.workflowName && (
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-400">Workflow</p>
                                  <p className="font-medium text-secondary-900 dark:text-white">
                                    {detailedContext.workflowTrace.workflowName}
                                  </p>
                                </div>
                              )}
                              {detailedContext.workflowTrace.traceSequence && (
                                <div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-400">Sequence</p>
                                  <p className="font-medium text-secondary-900 dark:text-white">
                                    #{detailedContext.workflowTrace.traceSequence}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Related Requests */}
                          {detailedContext.relatedRequests && detailedContext.relatedRequests.length > 0 && (
                            <div className="p-4 rounded-lg border border-primary-200/20 dark:border-primary-600/20 bg-white/30 dark:bg-dark-card/30">
                              <h4 className="font-semibold text-secondary-900 dark:text-white mb-4">
                                Related Requests ({detailedContext.relatedRequests.length})
                              </h4>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {detailedContext.relatedRequests.slice(0, 5).map((relatedUsage) => (
                                  <div
                                    key={relatedUsage._id}
                                    className="flex items-center justify-between p-2 rounded border border-primary-200/10 dark:border-primary-600/10 bg-white/20 dark:bg-dark-card/20"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${relatedUsage.errorOccurred ? 'bg-red-400' : 'bg-emerald-400'
                                        }`}></div>
                                      <span className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                                        {relatedUsage.model}
                                      </span>
                                    </div>
                                    <div className="text-xs text-secondary-600 dark:text-secondary-400 flex-shrink-0">
                                      ${relatedUsage.cost.toFixed(4)}
                                    </div>
                                  </div>
                                ))}
                                {detailedContext.relatedRequests.length > 5 && (
                                  <p className="text-xs text-secondary-600 dark:text-secondary-400 text-center">
                                    +{detailedContext.relatedRequests.length - 5} more requests
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-primary-200/20 dark:border-primary-600/20">
                  <div className="text-xs text-secondary-600 dark:text-secondary-400">
                    Created: {new Date(usage.createdAt).toLocaleString()}
                  </div>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-secondary-100 dark:bg-secondary-800/50 hover:bg-secondary-200 dark:hover:bg-secondary-700/50 rounded-lg transition-colors"
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