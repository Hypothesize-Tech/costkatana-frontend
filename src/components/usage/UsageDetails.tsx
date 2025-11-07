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
    <div className="overflow-hidden rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-2 space-x-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-display font-medium ${getServiceColor(usage.service)}`}
              >
                {usage.service}
              </span>
              <span className="text-sm text-secondary-600 dark:text-secondary-300">{usage.model}</span>
              <span className="text-xs text-secondary-500 dark:text-secondary-400">
                {formatDate(usage.createdAt)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">Cost:</span>
                <span className="ml-2 font-medium font-display gradient-text-primary">
                  {formatCurrency(usage.cost)}
                </span>
              </div>
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">Tokens:</span>
                <span className="ml-2 font-medium font-display gradient-text-primary">
                  {usage.totalTokens.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">Response Time:</span>
                <span className="ml-2 font-medium font-display gradient-text-primary">
                  {usage.responseTime}ms
                </span>
              </div>
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">Prompt/Completion:</span>
                <span className="ml-2 font-medium font-display gradient-text-primary">
                  {usage.promptTokens}/{usage.completionTokens}
                </span>
              </div>
            </div>

            {usage.metadata &&
              (usage.metadata.project || usage.metadata.tags) && (
                <div className="flex items-center mt-2 space-x-2">
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
                className="px-3 py-1 text-sm font-medium btn font-display text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                Optimize
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn btn-icon-secondary"
            >
              {expanded ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="pt-4 mt-4 space-y-4 border-t border-primary-200/30">
            {usage.prompt && (
              <div>
                <h4 className="flex items-center mb-1 text-sm font-medium font-display text-secondary-900 dark:text-white">
                  <DocumentTextIcon className="mr-1 w-4 h-4" />
                  Prompt
                </h4>
                <div className="p-3 rounded-lg border backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel glass border-primary-200/30">
                  <p className="text-sm whitespace-pre-wrap text-secondary-600 dark:text-secondary-300">
                    {usage.prompt}
                  </p>
                </div>
              </div>
            )}

            {usage.completion && (
              <div>
                <h4 className="flex items-center mb-1 text-sm font-medium font-display text-secondary-900 dark:text-white">
                  <DocumentTextIcon className="mr-1 w-4 h-4" />
                  Response
                </h4>
                <div className="p-3 bg-gradient-to-br rounded-lg border backdrop-blur-xl glass border-success-200/30 from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20">
                  <p className="text-sm whitespace-pre-wrap text-secondary-600 dark:text-secondary-300">
                    {usage.completion}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">ID:</span>
                <span className="ml-2 font-mono text-xs text-secondary-600 dark:text-secondary-300">
                  {usage._id}
                </span>
              </div>
              {usage.errorOccurred && usage.errorMessage && (
                <div>
                  <span className="text-secondary-500 dark:text-secondary-400">Error:</span>
                  <span className="ml-2 text-danger-600 dark:text-danger-400">
                    {usage.errorMessage}
                  </span>
                </div>
              )}
              {usage.metadata?.requestId && (
                <div>
                  <span className="text-secondary-500 dark:text-secondary-400">Request ID:</span>
                  <span className="ml-2 font-mono text-xs text-secondary-600 dark:text-secondary-300">
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
