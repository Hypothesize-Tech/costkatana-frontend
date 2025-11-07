import React, { useState } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { intelligenceService } from "../../services/intelligence.service";

export interface QualityData {
  originalScore?: number;
  optimizedScore: number;
  qualityRetention?: number;
  recommendation?: "accept" | "review" | "reject";
  costSavings: {
    amount: number;
    percentage: number;
  };
  criteria?: {
    accuracy: number;
    relevance: number;
    completeness: number;
    coherence: number;
    factuality: number;
  };
  confidence?: number;
  scoreId?: string;
}

interface QualityScoreProps {
  qualityData: QualityData;
  showDetails?: boolean;
  showFeedback?: boolean;
  onFeedback?: (feedback: {
    isAcceptable: boolean;
    rating?: number;
    comment?: string;
  }) => void;
}

export const QualityScore: React.FC<QualityScoreProps> = ({
  qualityData,
  showDetails = true,
  showFeedback = true,
  onFeedback,
}) => {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [userComment, setUserComment] = useState("");
  const [userRating, setUserRating] = useState<number>(0);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "gradient-text-success";
    if (score >= 75) return "gradient-text-warning";
    return "gradient-text-danger";
  };

  const getRecommendationIcon = () => {
    switch (qualityData.recommendation) {
      case "accept":
        return (
          <div className="p-2 rounded-lg shadow-lg bg-gradient-success glow-success">
            <CheckCircleIcon className="w-4 h-4 text-white" />
          </div>
        );
      case "review":
        return (
          <div className="p-2 rounded-lg shadow-lg bg-gradient-warning">
            <ExclamationCircleIcon className="w-4 h-4 text-white" />
          </div>
        );
      case "reject":
        return (
          <div className="p-2 rounded-lg shadow-lg bg-gradient-danger">
            <XCircleIcon className="w-4 h-4 text-white" />
          </div>
        );
      default:
        return null;
    }
  };

  const getRecommendationText = () => {
    switch (qualityData.recommendation) {
      case "accept":
        return "Quality maintained - Safe to use";
      case "review":
        return "Minor quality impact - Review recommended";
      case "reject":
        return "Significant quality loss - Not recommended";
      default:
        return "";
    }
  };

  const handleFeedback = async (isAcceptable: boolean) => {
    if (qualityData.scoreId) {
      await intelligenceService.updateQualityFeedback(qualityData.scoreId, {
        isAcceptable,
        rating: userRating || undefined,
        comment: userComment || undefined,
      });
    }

    if (onFeedback) {
      onFeedback({
        isAcceptable,
        rating: userRating || undefined,
        comment: userComment || undefined,
      });
    }

    setFeedbackGiven(true);
  };

  const renderCriteriaBar = (label: string, value: number) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">{label}</span>
        <span className={`font-display font-semibold ${value >= 90 ? 'gradient-text-success'
          : value >= 75 ? 'gradient-text-warning'
            : 'gradient-text-danger'
          }`}>{value}%</span>
      </div>
      <div className="overflow-hidden w-full h-3 rounded-full bg-light-bg-secondary dark:bg-dark-bg-secondary">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${value >= 90
            ? "bg-gradient-success shadow-lg"
            : value >= 75
              ? "bg-gradient-warning shadow-lg"
              : "bg-gradient-danger shadow-lg"
            }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      {/* Main Score Display */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="flex justify-center items-center mb-2 w-20 h-20 bg-gradient-to-br rounded-full border shadow-lg backdrop-blur-xl from-primary-50/50 to-primary-100/50 border-primary-200/30">
              <div
                className={`text-3xl font-display font-bold ${getScoreColor(qualityData.optimizedScore)}`}
              >
                {qualityData.optimizedScore}
              </div>
            </div>
            <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Quality Score</div>
          </div>

          {qualityData.originalScore && qualityData.qualityRetention && (
            <>
              <div className="flex justify-center items-center w-8 h-8 rounded-full bg-gradient-primary">
                <span className="text-white">→</span>
              </div>
              <div className="text-center">
                <div className="flex justify-center items-center mb-2 w-16 h-16 bg-gradient-to-br rounded-full border shadow-lg backdrop-blur-xl from-success-50/50 to-success-100/50 border-primary-200/30">
                  <div
                    className={`text-2xl font-display font-bold ${getScoreColor(qualityData.qualityRetention)}`}
                  >
                    {qualityData.qualityRetention.toFixed(1)}%
                  </div>
                </div>
                <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Retained</div>
              </div>
            </>
          )}
        </div>

        <div className="text-right">
          <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
            <div className="flex gap-2 items-center mb-1">
              <div className="bg-gradient-success p-1.5 rounded-lg glow-success shadow-lg">
                <CurrencyDollarIcon className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold font-display gradient-text-success">
                ${qualityData.costSavings.amount.toFixed(2)}
              </span>
            </div>
            <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
              {qualityData.costSavings.percentage}% saved
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      {qualityData.recommendation && (
        <div className={`glass p-4 rounded-xl border shadow-lg backdrop-blur-xl flex items-center gap-3 ${qualityData.recommendation === 'accept' ? 'border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel'
          : qualityData.recommendation === 'review' ? 'border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel'
            : 'border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel'
          }`}>
          {getRecommendationIcon()}
          <span className={`font-display font-semibold ${qualityData.recommendation === 'accept' ? 'gradient-text-success'
            : qualityData.recommendation === 'review' ? 'gradient-text-warning'
              : 'gradient-text-danger'
            }`}>{getRecommendationText()}</span>
        </div>
      )}

      {/* Detailed Criteria */}
      {showDetails && qualityData.criteria && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="p-2 bg-gradient-to-br rounded-lg shadow-lg from-primary-500 to-primary-600 glow-primary">
              <ChartBarIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold font-display gradient-text-primary">Quality Breakdown</span>
          </div>
          <div className="p-4 space-y-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
            {renderCriteriaBar("Accuracy", qualityData.criteria.accuracy)}
            {renderCriteriaBar("Relevance", qualityData.criteria.relevance)}
            {renderCriteriaBar(
              "Completeness",
              qualityData.criteria.completeness,
            )}
            {renderCriteriaBar("Coherence", qualityData.criteria.coherence)}
            {renderCriteriaBar("Factuality", qualityData.criteria.factuality)}
          </div>
          {qualityData.confidence && (
            <div className="text-right">
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300">
                Confidence: {(qualityData.confidence * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* User Feedback */}
      {showFeedback && !feedbackGiven && (
        <div className="p-6 space-y-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
          <div className="flex gap-3 items-center">
            <div className="p-2 bg-gradient-to-br rounded-lg shadow-lg from-accent-500 to-accent-600 glow-accent">
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold font-display gradient-text-primary">
              Was this optimization acceptable?
            </span>
          </div>

          <div className="flex gap-2 items-center">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setUserRating(rating)}
                className={`w-8 h-8 rounded-lg transition-all duration-300 hover:scale-110 ${userRating >= rating
                  ? "bg-gradient-warning text-white shadow-lg"
                  : "glass border border-primary-200/30 shadow-lg backdrop-blur-xl text-light-text-secondary dark:text-dark-text-secondary hover:border-warning-200/50"
                  }`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            placeholder="Any additional feedback? (optional)"
            className="w-full resize-none input"
            rows={3}
          />

          <div className="flex gap-3">
            <button
              onClick={() => handleFeedback(true)}
              className="flex flex-1 gap-2 justify-center items-center transition-transform duration-300 btn btn-primary hover:scale-105"
            >
              <HandThumbUpIcon className="w-4 h-4" />
              <span>Acceptable</span>
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="flex flex-1 gap-2 justify-center items-center transition-transform duration-300 btn btn-danger hover:scale-105"
            >
              <HandThumbDownIcon className="w-4 h-4" />
              <span>Not Acceptable</span>
            </button>
          </div>
        </div>
      )}

      {feedbackGiven && (
        <div className="p-4 text-center rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-2 justify-center items-center">
            <div className="bg-gradient-success p-1.5 rounded-full glow-success shadow-lg">
              <CheckIcon className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold font-display gradient-text-success">
              Thank you for your feedback!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
