import React, { useState } from "react";
import {
  FiInfo,
  FiDollarSign,
  FiTrendingUp,
  FiX,
  FiChevronRight,
  FiZap,
  FiSettings,
  FiBookOpen,
} from "react-icons/fi";
import { intelligenceService } from "../../services/intelligence.service";

export interface TipData {
  tip: {
    tipId: string;
    title: string;
    message: string;
    type:
      | "optimization"
      | "feature"
      | "cost_saving"
      | "quality"
      | "best_practice";
    priority: "low" | "medium" | "high";
    action?: {
      type:
        | "enable_feature"
        | "optimize_prompt"
        | "change_model"
        | "view_guide"
        | "run_wizard";
      feature?: string;
      targetModel?: string;
      guideUrl?: string;
    };
    potentialSavings?: {
      percentage?: number;
      amount?: number;
      description: string;
    };
  };
  relevanceScore: number;
  context?: {
    estimatedSavings?: number;
    currentTokens?: number;
    threshold?: number;
    currentModel?: string;
    suggestedModel?: string;
  };
}

interface ProactiveTipProps {
  tipData: TipData;
  onAction?: (action: any) => void;
  onDismiss?: () => void;
  position?: "inline" | "floating" | "banner";
}

export const ProactiveTip: React.FC<ProactiveTipProps> = ({
  tipData,
  onAction,
  onDismiss,
  position = "inline",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const handleAction = async () => {
    await intelligenceService.trackTipInteraction(tipData.tip.tipId, "click");

    if (onAction && tipData.tip.action) {
      onAction(tipData.tip.action);
    }

    // Handle default actions
    switch (tipData.tip.action?.type) {
      case "view_guide":
        if (tipData.tip.action.guideUrl) {
          window.location.href = tipData.tip.action.guideUrl;
        }
        break;
      case "run_wizard":
        // Navigate to cost audit wizard
        window.location.href = "/optimizations/wizard";
        break;
    }
  };

  const handleDismiss = async () => {
    await intelligenceService.trackTipInteraction(tipData.tip.tipId, "dismiss");
    setIsHidden(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (isHidden) {
    return null;
  }

  const getIcon = () => {
    switch (tipData.tip.type) {
      case "cost_saving":
        return <FiDollarSign className="text-green-600" />;
      case "optimization":
        return <FiZap className="text-blue-600" />;
      case "feature":
        return <FiSettings className="text-purple-600" />;
      case "best_practice":
        return <FiBookOpen className="text-orange-600" />;
      default:
        return <FiInfo className="text-gray-600" />;
    }
  };

  const getPriorityColor = () => {
    switch (tipData.tip.priority) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "low":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const formatSavings = () => {
    if (tipData.context?.estimatedSavings) {
      return `$${tipData.context.estimatedSavings.toFixed(2)}`;
    }
    if (tipData.tip.potentialSavings?.percentage) {
      return `${tipData.tip.potentialSavings.percentage}%`;
    }
    if (tipData.tip.potentialSavings?.amount) {
      return `$${tipData.tip.potentialSavings.amount.toFixed(2)}`;
    }
    return null;
  };

  const renderContent = () => (
    <>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1">
          <h4 className="mb-1 text-sm font-semibold text-gray-900">
            {tipData.tip.title}
          </h4>
          <p className="text-sm text-gray-600">{tipData.tip.message}</p>

          {isExpanded && tipData.context && (
            <div className="mt-3 space-y-2 text-sm text-gray-500">
              {tipData.context.currentTokens && (
                <div>
                  Current tokens:{" "}
                  <span className="font-medium">
                    {tipData.context.currentTokens.toLocaleString()}
                  </span>
                  {tipData.context.threshold && (
                    <span>
                      {" "}
                      (threshold: {tipData.context.threshold.toLocaleString()})
                    </span>
                  )}
                </div>
              )}
              {tipData.context.currentModel &&
                tipData.context.suggestedModel && (
                  <div>
                    Switch from{" "}
                    <span className="font-medium">
                      {tipData.context.currentModel}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {tipData.context.suggestedModel}
                    </span>
                  </div>
                )}
            </div>
          )}

          {tipData.tip.potentialSavings && (
            <div className="flex items-center mt-3 space-x-4">
              <div className="flex items-center space-x-1">
                <FiTrendingUp className="text-green-500" size={16} />
                <span className="text-sm font-medium text-green-600">
                  Save {formatSavings()}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {tipData.tip.potentialSavings.description}
              </span>
            </div>
          )}

          {tipData.tip.action && (
            <div className="flex items-center mt-3 space-x-3">
              <button
                onClick={handleAction}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {tipData.tip.action.type === "enable_feature" &&
                  "Enable Feature"}
                {tipData.tip.action.type === "optimize_prompt" &&
                  "Optimize Now"}
                {tipData.tip.action.type === "change_model" && "Switch Model"}
                {tipData.tip.action.type === "view_guide" && "View Guide"}
                {tipData.tip.action.type === "run_wizard" && "Run Wizard"}
                <FiChevronRight className="ml-1" size={16} />
              </button>

              {!isExpanded && tipData.context && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  More details
                </button>
              )}

              {isExpanded && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Less details
                </button>
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <FiX size={16} />
        </button>
      </div>
    </>
  );

  if (position === "floating") {
    return (
      <div className="fixed right-4 bottom-4 z-50 max-w-md animate-slide-up">
        <div
          className={`p-4 rounded-lg border-2 shadow-lg ${getPriorityColor()}`}
        >
          {renderContent()}
        </div>
      </div>
    );
  }

  if (position === "banner") {
    return (
      <div className={`p-4 w-full border-b-2 ${getPriorityColor()}`}>
        <div className="mx-auto max-w-7xl">{renderContent()}</div>
      </div>
    );
  }

  // Default: inline
  return (
    <div className={`p-4 rounded-lg border ${getPriorityColor()}`}>
      {renderContent()}
    </div>
  );
};
