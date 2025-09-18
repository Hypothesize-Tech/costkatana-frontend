import React, { useState } from "react";
import { ChevronDownIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { ChevronUpIcon } from "@heroicons/react/24/solid";
import { Usage } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface UsageDetailsProps {
  usage: Usage;
  onOptimize?: (usage: Usage) => void;
}

export const UsageDetails: React.FC<UsageDetailsProps> = ({
  usage,
  onOptimize,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getServiceColor = (service: string) => {
    const colors: Record<string, string> = {
      openai: "badge-success",
      anthropic: "badge-purple",
      google: "badge-info",
      "aws-bedrock": "badge-secondary",
      azure: "badge-info",
      cohere: "badge-purple",
    };
    return colors[service] || "badge-secondary";
  };

  return (
    <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl overflow-hidden bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-display font-medium ${getServiceColor(usage.service)}`}
              >
                {usage.service}
              </span>
              <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{usage.model}</span>
              <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                {formatDate(usage.createdAt)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Cost:</span>
                <span className="ml-2 font-display font-medium gradient-text-primary">
                  {formatCurrency(usage.cost)}
                </span>
              </div>
              <div>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Tokens:</span>
                <span className="ml-2 font-display font-medium gradient-text-primary">
                  {usage.totalTokens.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Response Time:</span>
                <span className="ml-2 font-display font-medium gradient-text-primary">
                  {usage.responseTime}ms
                </span>
              </div>
              <div>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Prompt/Completion:</span>
                <span className="ml-2 font-display font-medium gradient-text-primary">
                  {usage.promptTokens}/{usage.completionTokens}
                </span>
              </div>
            </div>

            {usage.metadata &&
              (usage.metadata.project || usage.metadata.tags) && (
                <div className="mt-2 flex items-center space-x-2">
                  {usage.metadata.project && (
                    <span className="badge-secondary">
                      {usage.metadata.project}
                    </span>
                  )}
                  {usage.metadata.tags &&
                    usage.metadata.tags
                      .split(",")
                      .map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="badge-secondary"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                </div>
              )}
          </div>

          <div className="flex items-center space-x-2">
            {onOptimize && usage.promptTokens > 100 && (
              <button
                onClick={() => onOptimize(usage)}
                className="px-3 py-1 text-sm font-display font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                Optimize
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn-icon-secondary"
            >
              {expanded ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4 border-t border-primary-200/30 pt-4">
            {usage.prompt && (
              <div>
                <h4 className="text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-1 flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  Prompt
                </h4>
                <div className="p-3 glass rounded-lg border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300">
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap">
                    {usage.prompt}
                  </p>
                </div>
              </div>
            )}

            {usage.completion && (
              <div>
                <h4 className="text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-1 flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  Response
                </h4>
                <div className="p-3 glass rounded-lg border border-success-200/30 backdrop-blur-xl bg-gradient-to-br from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20">
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap">
                    {usage.completion}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">ID:</span>
                <span className="ml-2 font-mono text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  {usage._id}
                </span>
              </div>
              {usage.errorOccurred && usage.errorMessage && (
                <div>
                  <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Error:</span>
                  <span className="ml-2 text-danger-600 dark:text-danger-400">
                    {usage.errorMessage}
                  </span>
                </div>
              )}
              {usage.metadata?.requestId && (
                <div>
                  <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Request ID:</span>
                  <span className="ml-2 font-mono text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    {usage.metadata.requestId}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
