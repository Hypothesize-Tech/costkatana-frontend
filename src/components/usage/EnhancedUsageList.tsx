import { useState } from 'react';
import { BeakerIcon, ChevronRightIcon, EyeIcon, ClockIcon, LightBulbIcon } from '@heroicons/react/24/outline';
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
  return projectId.name;
};

interface UsageListProps {
  usage: Usage[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onRefresh: () => void;
  onPageChange: (page: number) => void;
  showNetworkDetails?: boolean;
  showOptimizationSuggestions?: boolean;
  onViewDetails?: (usage: Usage) => void;
  onViewOptimizations?: (usage: Usage) => void;
}

export function EnhancedUsageList({
  usage,
  pagination,
  onRefresh,
  onPageChange,
  showNetworkDetails = false,
  showOptimizationSuggestions = false,
  onViewDetails,
  onViewOptimizations
}: UsageListProps) {
  const [usageForSimulation, setUsageForSimulation] = useState<Usage | null>(null);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [usageForDetails, setUsageForDetails] = useState<Usage | null>(null);


  const handleSimulate = (usage: Usage) => {
    setUsageForSimulation(usage);
    setSimulationModalOpen(true);
  };

  const openDetailModal = (usage: Usage) => {
    setUsageForDetails(usage);
    setDetailModalOpen(true);
  };

  if (!usage || usage.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex justify-center items-center w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30">
          <ChevronRightIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-lg font-semibold font-display text-secondary-900 dark:text-white">
          No usage data found
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
                  Request Summary
                </th>
                <th className="px-6 py-4 text-xs font-medium font-display tracking-wider text-right uppercase text-light-text-secondary dark:text-dark-text-secondary">
                  Cost
                </th>
                <th className="px-6 py-4 text-xs font-medium font-display tracking-wider text-center uppercase text-light-text-secondary dark:text-dark-text-secondary">
                  Tokens
                </th>
                <th className="px-6 py-4 text-xs font-medium font-display tracking-wider text-center uppercase text-light-text-secondary dark:text-dark-text-secondary">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-medium font-display tracking-wider text-left uppercase text-light-text-secondary dark:text-dark-text-secondary">
                  Time
                </th>
                <th className="px-6 py-4 text-xs font-medium font-display tracking-wider text-center uppercase text-light-text-secondary dark:text-dark-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y bg-gradient-light-panel dark:bg-gradient-dark-panel divide-primary-200/30 dark:divide-primary-700/30">
              {usage.map((item) => (
                <tr
                  key={item._id}
                  className="group transition-all duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-secondary-50/50 dark:hover:from-primary-900/30 dark:hover:to-secondary-900/30 hover:shadow-lg"
                  onClick={() => (onViewDetails ? onViewDetails(item) : openDetailModal(item))}
                >
                  {/* Service / Model Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <ServiceIcon service={item.service} className="w-6 h-6 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary truncate">
                          {formatServiceName(item.service)}
                        </div>
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary truncate">
                          {item.model}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Request Summary Column */}
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <div className="text-sm font-body text-light-text-primary dark:text-dark-text-primary line-clamp-2">
                        {formatPrompt(
                          item.prompt ||
                          item.metadata?.prompt ||
                          item.metadata?.messages?.[0]?.content ||
                          item.metadata?.input ||
                          'No request content', 120
                        )}
                      </div>
                      <div className="flex items-center mt-2 space-x-2">
                        {getProjectName(item.projectId) !== 'No Project' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {getProjectName(item.projectId)}
                          </span>
                        )}
                        {(item.traceId || item.workflowId) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                            🔗 Traced
                          </span>
                        )}
                        {showOptimizationSuggestions && item.optimizationOpportunities?.costOptimization?.potentialSavings && item.optimizationOpportunities.costOptimization.potentialSavings > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            💡 Optimizable
                          </span>
                        )}
                        {showNetworkDetails && item.requestTracking?.performance?.networkTime && item.requestTracking.performance.networkTime > 2000 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                            🐌 Slow Network
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Cost Column */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="text-sm font-semibold font-display text-light-text-primary dark:text-dark-text-primary">
                      {formatCurrency(item.cost)}
                    </div>
                    <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                      {item.responseTime && formatResponseTime(item.responseTime)}
                      {showNetworkDetails && item.requestTracking?.performance?.networkTime && (
                        <div className="flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {formatResponseTime(item.requestTracking.performance.networkTime)}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Tokens Column */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                      {formatNumber(item.totalTokens || 0)}
                    </div>
                    <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                      {item.promptTokens && item.completionTokens ?
                        `${formatNumber(item.promptTokens)} + ${formatNumber(item.completionTokens)}` :
                        'total'
                      }
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex justify-center">
                      {item.httpStatusCode && item.httpStatusCode >= 400 ? (
                        <>
                          {item.httpStatusCode && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-display glass border ${getStatusCodeColor(item.httpStatusCode)}`}>
                              {formatHttpStatusCode(item.httpStatusCode)}
                            </span>
                          )}
                          {item.errorType && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-display glass border ${getErrorTypeColor(item.errorType)}`}>
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

                  {/* Time Column */}
                  <td className="px-6 py-4 text-sm font-body text-light-text-secondary whitespace-nowrap dark:text-dark-text-secondary">
                    {formatDateTime(item.createdAt)}
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex justify-center items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewDetails) {
                            onViewDetails(item);
                          } else {
                            openDetailModal(item);
                          }
                        }}
                        className="p-2 text-primary-500 rounded-xl border transition-all duration-300 glass border-primary-200/30 dark:border-primary-700/30 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 hover:border-primary-300/50 dark:hover:border-primary-600/50 hover:shadow-md hover:scale-105 active:scale-95"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {showOptimizationSuggestions && onViewOptimizations && item.optimizationOpportunities && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewOptimizations(item);
                          }}
                          className="p-2 text-green-500 rounded-xl border transition-all duration-300 glass border-green-200/30 dark:border-green-700/30 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 hover:border-green-300/50 dark:hover:border-green-600/50 hover:shadow-md hover:scale-105 active:scale-95"
                          title="Optimization Suggestions"
                        >
                          <LightBulbIcon className="w-4 h-4" />
                        </button>
                      )}
                      {(item.cost > 0.01 || item.totalTokens > 500) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSimulate(item);
                          }}
                          className="p-2 text-primary-500 rounded-xl border transition-all duration-300 glass border-primary-200/30 dark:border-primary-700/30 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 hover:border-primary-300/50 dark:hover:border-primary-600/50 hover:shadow-md hover:scale-105 active:scale-95"
                          title="Run What-If Simulation"
                        >
                          <BeakerIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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

      {/* Combined Detail Modal */}
      <DetailBreakdownModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setUsageForDetails(null);
        }}
        usage={usageForDetails}
        onSimulate={(usage) => {
          setUsageForSimulation(usage);
          setSimulationModalOpen(true);
          setDetailModalOpen(false);
        }}
      />

      {/* What-If Simulation Modal */}
      <WhatIfSimulationModal
        isOpen={simulationModalOpen}
        onClose={() => {
          setSimulationModalOpen(false);
          setUsageForSimulation(null);
        }}
        usage={usageForSimulation}
      />

      {/* High Cost Suggestions */}
      <HighCostSuggestions
        usages={usage}
        onSimulate={handleSimulate}
        className="mt-6"
      />
    </>
  );
}