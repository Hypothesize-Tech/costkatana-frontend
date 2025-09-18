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
          <div className="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
            <FiDollarSign className="w-5 h-5 text-white" />
          </div>
        );
      case "optimization":
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
            <FiZap className="w-5 h-5 text-white" />
          </div>
        );
      case "feature":
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-lg">
            <FiSettings className="w-5 h-5 text-white" />
          </div>
        );
      case "best_practice":
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-warning flex items-center justify-center shadow-lg">
            <FiBookOpen className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-lg">
            <FiInfo className="w-5 h-5 text-white" />
          </div>
        );
    }
  };

  const getPriorityColor = () => {
    switch (tipData.tip.priority) {
      case "high":
        return "border-danger-200/30 bg-gradient-danger/10 shadow-lg backdrop-blur-xl";
      case "medium":
        return "border-warning-200/30 bg-gradient-warning/10 shadow-lg backdrop-blur-xl";
      case "low":
        return "border-primary-200/30 bg-gradient-primary/10 shadow-lg backdrop-blur-xl";
      default:
        return "border-secondary-200/30 bg-gradient-secondary/10 shadow-lg backdrop-blur-xl";
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
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1">
          <h4 className="mb-2 text-lg font-display font-bold gradient-text-primary">
            {tipData.tip.title}
          </h4>
          <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-4">{tipData.tip.message}</p>

          {isExpanded && tipData.context && (
            <div className="glass p-4 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl mb-4">
              <div className="space-y-3">
                {tipData.context.currentTokens && (
                  <div className="flex justify-between items-center">
                    <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Current tokens:</span>
                    <div className="text-right">
                      <span className="font-display font-semibold gradient-text-primary">
                        {tipData.context.currentTokens.toLocaleString()}
                      </span>
                      {tipData.context.threshold && (
                        <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
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
                        <div className="font-display font-semibold gradient-text-primary">
                          {tipData.context.currentModel}
                        </div>
                        <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                          → {tipData.context.suggestedModel}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {tipData.tip.potentialSavings && (
            <div className="glass p-4 rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                  <FiTrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-display font-semibold gradient-text-success">
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
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleAction}
                className="btn-primary flex items-center gap-2 hover:scale-105 transition-transform duration-300"
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
                  className="btn-ghost text-sm hover:scale-105 transition-transform duration-300"
                >
                  More details
                </button>
              )}

              {isExpanded && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="btn-ghost text-sm hover:scale-105 transition-transform duration-300"
                >
                  Less details
                </button>
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-8 h-8 rounded-lg glass border border-primary-200/30 shadow-lg backdrop-blur-xl flex items-center justify-center text-light-text-tertiary dark:text-dark-text-tertiary hover:text-danger-500 hover:border-danger-200/50 transition-all duration-300 hover:scale-110"
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
          className={`glass rounded-xl p-6 border-2 shadow-2xl backdrop-blur-xl animate-scale-in ${getPriorityColor()}`}
        >
          {renderContent()}
        </div>
      </div>
    );
  }

  if (position === "banner") {
    return (
      <div className={`glass rounded-xl p-6 w-full border-b-2 ${getPriorityColor()}`}>
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
