import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, LightBulbIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { usageService } from '@/services/usage.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/utils/formatters';
import type { Usage } from '@/types';

interface OptimizationSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  usage: Usage;
}

export default function OptimizationSuggestionsModal({
  isOpen,
  onClose,
  usage,
}: OptimizationSuggestionsModalProps) {
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['optimization-suggestions', usage?._id],
    queryFn: () => (usage?._id ? usageService.getOptimizationSuggestions(usage._id) : Promise.resolve({ generated: [], context: undefined })),
    enabled: isOpen && !!usage?._id,
    staleTime: 60000,
  });

  const generated = suggestions?.generated ?? [];
  const context = suggestions?.context;

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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl glass backdrop-blur-xl border border-primary-200/30 dark:border-primary-700 bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-primary-500/20">
                      <LightBulbIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-bold font-display gradient-text-primary">
                        Optimization Suggestions
                      </Dialog.Title>
                      <p className="text-sm text-secondary-600 dark:text-secondary-300">
                        {usage.service} • {usage.model}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-lg border border-primary-200/30 dark:border-primary-700 hover:bg-primary-500/10 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-300" />
                  </button>
                </div>

                {isLoading ? (
                  <div className="py-8 flex justify-center">
                    <LoadingSpinner size="small" />
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {context && (
                      <div className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-primary-50/30 dark:bg-primary-900/20">
                        <h4 className="text-sm font-semibold font-display text-secondary-900 dark:text-white mb-2 flex items-center gap-2">
                          <ChartBarIcon className="w-4 h-4" />
                          Request context
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-secondary-600 dark:text-secondary-300">Cost</span>
                            <span className="ml-2 font-medium text-secondary-900 dark:text-white">
                              {formatCurrency(context.cost ?? usage.cost ?? 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-secondary-600 dark:text-secondary-300">Tokens</span>
                            <span className="ml-2 font-medium text-secondary-900 dark:text-white">
                              {(context.tokens ?? usage.totalTokens ?? 0).toLocaleString()}
                            </span>
                          </div>
                          {context.responseTime != null && (
                            <div>
                              <span className="text-secondary-600 dark:text-secondary-300">Response time</span>
                              <span className="ml-2 font-medium text-secondary-900 dark:text-white">
                                {context.responseTime} ms
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {generated.length === 0 && !suggestions?.existing ? (
                      <p className="text-sm text-secondary-600 dark:text-secondary-300 py-4">
                        No optimization suggestions available for this request.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold font-display text-secondary-900 dark:text-white">
                          Suggestions
                        </h4>
                        {generated.map((s, i) => (
                          <div
                            key={i}
                            className="rounded-xl p-4 border border-primary-200/30 dark:border-primary-700 glass bg-primary-50/30 dark:bg-primary-900/20"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <p className="font-medium text-secondary-900 dark:text-white text-sm">
                                  {s.title ?? s.type ?? 'Suggestion'}
                                </p>
                                {s.description && (
                                  <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1">
                                    {s.description}
                                  </p>
                                )}
                              </div>
                              {s.potentialSavings != null && s.potentialSavings > 0 && (
                                <span className="text-sm font-medium text-success-600 dark:text-success-400 whitespace-nowrap">
                                  Save {formatCurrency(s.potentialSavings)}
                                </span>
                              )}
                            </div>
                            {s.priority && (
                              <span className="inline-block mt-2 text-xs text-secondary-500 dark:text-secondary-400 capitalize">
                                {s.priority}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

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
