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
        return (
          <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-success">
            <FiDollarSign className="w-5 h-5 text-white" />
          </div>
        );
      case "optimization":
        return (
          <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-primary">
            <FiZap className="w-5 h-5 text-white" />
          </div>
        );
      case "feature":
        return (
          <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-accent">
            <FiSettings className="w-5 h-5 text-white" />
          </div>
        );
      case "best_practice":
        return (
          <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-warning">
            <FiBookOpen className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-secondary">
            <FiInfo className="w-5 h-5 text-white" />
          </div>
        );
    }
  };

  const getPriorityColor = () => {
    return "border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel";
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
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1">
          <h4 className="mb-2 text-lg font-bold font-display gradient-text-primary">
            {tipData.tip.title}
          </h4>
          <p className="mb-4 font-body text-light-text-secondary dark:text-dark-text-secondary">{tipData.tip.message}</p>

          {isExpanded && tipData.context && (
            <div className="p-4 mb-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="space-y-3">
                {tipData.context.currentTokens && (
                  <div className="flex justify-between items-center">
                    <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Current tokens:</span>
                    <div className="text-right">
                      <span className="font-semibold font-display gradient-text-primary">
                        {tipData.context.currentTokens.toLocaleString()}
                      </span>
                      {tipData.context.threshold && (
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                          threshold: {tipData.context.threshold.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {tipData.context.currentModel &&
                  tipData.context.suggestedModel && (
                    <div className="flex justify-between items-center">
                      <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Model switch:</span>
                      <div className="text-right">
                        <div className="font-semibold font-display gradient-text-primary">
                          {tipData.context.currentModel}
                        </div>
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                          → {tipData.context.suggestedModel}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {tipData.tip.potentialSavings && (
            <div className="p-4 mb-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-success-200/30">
              <div className="flex gap-3 items-center">
                <div className="flex justify-center items-center w-8 h-8 rounded-lg shadow-lg bg-gradient-success">
                  <FiTrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold font-display gradient-text-success">
                    Save {formatSavings()}
                  </div>
                  <div className="text-xs font-body text-success-600 dark:text-success-400">
                    {tipData.tip.potentialSavings.description}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tipData.tip.action && (
            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={handleAction}
                className="flex gap-2 items-center transition-transform duration-300 btn-primary hover:scale-105"
              >
                {tipData.tip.action.type === "enable_feature" &&
                  "✨ Enable Feature"}
                {tipData.tip.action.type === "optimize_prompt" &&
                  "⚡ Optimize Now"}
                {tipData.tip.action.type === "change_model" && "🔄 Switch Model"}
                {tipData.tip.action.type === "view_guide" && "📖 View Guide"}
                {tipData.tip.action.type === "run_wizard" && "🧙‍♂️ Run Wizard"}
                <FiChevronRight size={16} />
              </button>

              {!isExpanded && tipData.context && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-sm transition-transform duration-300 btn-ghost hover:scale-105"
                >
                  More details
                </button>
              )}

              {isExpanded && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-sm transition-transform duration-300 btn-ghost hover:scale-105"
                >
                  Less details
                </button>
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg border shadow-lg backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-danger-500 hover:border-danger-200/50 hover:scale-110"
        >
          <FiX size={16} />
        </button>
      </div>
    </>
  );

  if (position === "floating") {
    return (
      <div className="fixed right-6 bottom-6 z-50 max-w-md animate-slide-up">
        <div
          className={`p-6 rounded-xl border-2 shadow-2xl backdrop-blur-xl glass animate-scale-in ${getPriorityColor()}`}
        >
          {renderContent()}
        </div>
      </div>
    );
  }

  if (position === "banner") {
    return (
      <div className={`p-6 w-full rounded-xl border-b-2 glass ${getPriorityColor()}`}>
        <div className="mx-auto max-w-7xl">{renderContent()}</div>
      </div>
    );
  }

  // Default: inline
  return (
    <div className={`glass rounded-xl p-6 border ${getPriorityColor()} hover:scale-[1.02] transition-transform duration-300`}>
      {renderContent()}
    </div>
  );
};
